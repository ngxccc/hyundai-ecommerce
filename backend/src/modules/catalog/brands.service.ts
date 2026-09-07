import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nConflictException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { asc, eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { brands, type Brand } from "@/database/schemas";
import type { CreateBrandDto } from "./dto/create-brand.dto";
import type { UpdateBrandDto } from "./dto/update-brand.dto";
import type { BrandResponseDto } from "./dto/brand-response.dto";

@Injectable()
export class BrandsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}
  /**
   * Retrieves all active brands ordered by name ascending.
   */
  async findAll(): Promise<BrandResponseDto[]> {
    const records = await this.db
      .select()
      .from(brands)
      .orderBy(asc(brands.name));

    return records.map((r) => this.mapBrandToDto(r));
  }

  /**
   * Retrieves a single brand by its unique UUID.
   */
  async findById(id: string): Promise<BrandResponseDto> {
    const [record] = await this.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    if (!record) {
      throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
    }

    return this.mapBrandToDto(record);
  }

  /**
   * Creates a new brand in the catalog.
   */
  async create(dto: CreateBrandDto): Promise<BrandResponseDto> {
    const [existingSlug] = await this.db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.slug, dto.slug))
      .limit(1);

    if (existingSlug) {
      throw new I18nConflictException("catalog.BRAND_SLUG_EXISTS", {
        slug: dto.slug,
      });
    }

    const [existingName] = await this.db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.name, dto.name))
      .limit(1);

    if (existingName) {
      throw new I18nConflictException("catalog.BRAND_NAME_EXISTS", {
        name: dto.name,
      });
    }

    const [newBrand] = await this.db
      .insert(brands)
      .values({
        name: dto.name,
        slug: dto.slug,
        logo: dto.logo ?? null,
        descriptionVi: dto.descriptionVi ?? null,
        descriptionEn: dto.descriptionEn ?? null,
        isActive: dto.isActive,
      })
      .returning();

    if (!newBrand) {
      throw new I18nBadRequestException("catalog.BRAND_CREATE_FAILED");
    }

    return this.mapBrandToDto(newBrand);
  }

  /**
   * Updates an existing brand by ID.
   */
  async update(id: string, dto: UpdateBrandDto): Promise<BrandResponseDto> {
    const [existing] = await this.db
      .select({ id: brands.id, slug: brands.slug, name: brands.name })
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.slug, dto.slug))
        .limit(1);

      if (slugConflict) {
        throw new I18nConflictException("catalog.BRAND_SLUG_EXISTS", {
          slug: dto.slug,
        });
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const [nameConflict] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.name, dto.name))
        .limit(1);

      if (nameConflict) {
        throw new I18nConflictException("catalog.BRAND_NAME_EXISTS", {
          name: dto.name,
        });
      }
    }

    const [updated] = await this.db
      .update(brands)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
        ...(dto.descriptionVi !== undefined
          ? { descriptionVi: dto.descriptionVi }
          : {}),
        ...(dto.descriptionEn !== undefined
          ? { descriptionEn: dto.descriptionEn }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      })
      .where(eq(brands.id, id))
      .returning();

    if (!updated) {
      throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
    }

    return this.mapBrandToDto(updated);
  }

  /**
   * Deletes a brand by ID.
   */
  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
    }

    await this.db.delete(brands).where(eq(brands.id, id));
  }

  private mapBrandToDto(record: Brand): BrandResponseDto {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      logo: record.logo,
      descriptionVi: record.descriptionVi,
      descriptionEn: record.descriptionEn,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
