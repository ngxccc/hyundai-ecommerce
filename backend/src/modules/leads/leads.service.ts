import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import {
  buildPaginationMeta,
  type PaginationMetaDto,
} from "@/common/dto/pagination-meta.dto";
import { CODE_PREFIX } from "@/common/constants/business.constant";
import { generateDocumentCode } from "@/common/utils/code.util";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { leads, leadItems, products, users } from "@/database/schemas";
import type {
  CreateLeadDto,
  LeadQueryDto,
  LeadResponseDto,
  UpdateLeadStatusDto,
} from "./dto";

@Injectable()
export class LeadsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Submits a public Request for Quote (RFQ) from Storefront visitors without requiring login.
   *
   * @param dto - Contact details and list of interested products
   * @returns Created lead and snapshot of requested items
   */
  async submitRfq(dto: CreateLeadDto): Promise<LeadResponseDto> {
    const productIds = dto.items.map((i) => i.productId);

    // Verify all requested products exist and retrieve snapshot data
    const existingProducts = await this.db
      .select({
        id: products.id,
        nameVi: products.nameVi,
        nameEn: products.nameEn,
        slug: products.slug,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    if (existingProducts.length !== productIds.length) {
      const foundIds = new Set(existingProducts.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Products not found for IDs: ${missingIds.join(", ")}`,
      );
    }

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));
    const leadCode = generateDocumentCode(CODE_PREFIX.LEAD);

    return this.db.transaction(async (tx) => {
      const [newLead] = await tx
        .insert(leads)
        .values({
          leadCode,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email ?? null,
          companyName: dto.companyName ?? null,
          city: dto.city,
          ward: dto.ward,
          streetAddress: dto.streetAddress ?? null,
          notes: dto.notes ?? null,
          status: "NEW",
        })
        .returning();

      if (!newLead) {
        throw new BadRequestException("Failed to create Lead record");
      }

      const itemsToInsert = dto.items.map((item) => {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        return {
          leadId: newLead.id,
          productId: item.productId,
          quantity: item.quantity,
          productNameVi: prod.nameVi,
          productNameEn: prod.nameEn ?? null,
          productModel: prod.slug,
          productSku: prod.slug,
        };
      });

      const insertedItems = await tx
        .insert(leadItems)
        .values(itemsToInsert)
        .returning();

      return this.mapLeadToResponseDto(newLead, insertedItems);
    });
  }

  /**
   * Retrieves paginated leads for CMS Admin & Sales staff, ordered by latest creation date.
   */
  async findAll(query?: LeadQueryDto): Promise<{
    items: LeadResponseDto[];
    meta: PaginationMetaDto;
  }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query?.status) {
      conditions.push(eq(leads.status, query.status));
    }

    if (query?.search?.trim()) {
      const pattern = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(leads.fullName, pattern),
          ilike(leads.phoneNumber, pattern),
          ilike(leads.companyName, pattern),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult, allLeads] = await Promise.all([
      this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(leads)
        .where(whereClause),
      this.db
        .select()
        .from(leads)
        .where(whereClause)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalCountResult[0]?.count ?? 0;

    if (allLeads.length === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(total, page, limit),
      };
    }

    const leadIds = allLeads.map((l) => l.id);
    const allItems = await this.db
      .select()
      .from(leadItems)
      .where(inArray(leadItems.leadId, leadIds));

    const itemsByLeadId = new Map<string, (typeof leadItems.$inferSelect)[]>();
    for (const item of allItems) {
      const list = itemsByLeadId.get(item.leadId) ?? [];
      list.push(item);
      itemsByLeadId.set(item.leadId, list);
    }

    return {
      items: allLeads.map((l) =>
        this.mapLeadToResponseDto(l, itemsByLeadId.get(l.id) ?? []),
      ),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves a single lead by unique UUID with all snapshot items.
   */
  async findById(id: string): Promise<LeadResponseDto> {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    if (!lead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }

    const items = await this.db
      .select()
      .from(leadItems)
      .where(eq(leadItems.leadId, id));

    return this.mapLeadToResponseDto(lead, items);
  }

  /**
   * Updates pipeline status of a lead (e.g. CONTACTING, SURVEY_SCHEDULED, QUOTED, LOST).
   */
  async updateStatus(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Promise<LeadResponseDto> {
    const [updatedLead] = await this.db
      .update(leads)
      .set({
        status: dto.status,
        lostReason: dto.lostReason ?? null,
      })
      .where(eq(leads.id, id))
      .returning();

    if (!updatedLead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }

    const items = await this.db
      .select()
      .from(leadItems)
      .where(eq(leadItems.leadId, id));

    return this.mapLeadToResponseDto(updatedLead, items);
  }

  /**
   * Assigns a sales representative to take charge of this lead.
   */
  async assignSales(id: string, salesId: string): Promise<LeadResponseDto> {
    const [salesUser] = await this.db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, salesId))
      .limit(1);

    if (!salesUser) {
      throw new NotFoundException(`Sales user with ID "${salesId}" not found`);
    }

    const [updatedLead] = await this.db
      .update(leads)
      .set({
        assignedSalesId: salesId,
        status: "CONTACTING",
      })
      .where(eq(leads.id, id))
      .returning();

    if (!updatedLead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }

    const items = await this.db
      .select()
      .from(leadItems)
      .where(eq(leadItems.leadId, id));

    return this.mapLeadToResponseDto(updatedLead, items);
  }

  private mapLeadToResponseDto(
    lead: typeof leads.$inferSelect,
    items: (typeof leadItems.$inferSelect)[],
  ): LeadResponseDto {
    return {
      id: lead.id,
      leadCode: lead.leadCode,
      fullName: lead.fullName,
      phoneNumber: lead.phoneNumber,
      email: lead.email,
      companyName: lead.companyName,
      city: lead.city,
      ward: lead.ward,
      streetAddress: lead.streetAddress,
      notes: lead.notes,
      status: lead.status,
      assignedSalesId: lead.assignedSalesId,
      lostReason: lead.lostReason,
      createdAt: lead.createdAt,
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        productNameVi: i.productNameVi,
        productNameEn: i.productNameEn,
        productModel: i.productModel,
        productSku: i.productSku,
      })),
    };
  }
}
