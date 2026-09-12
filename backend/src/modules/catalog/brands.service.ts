import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nConflictException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  brands,
  brandTranslations,
  type Brand,
  type BrandTranslation,
} from "@/database/schemas";
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
   * Retrieves all active brands ordered by name with localized fallback.
   */
  async findAll(locale = "vi"): Promise<BrandResponseDto[]> {
    const records = await this.db
      .select()
      .from(brands)
      .orderBy(asc(brands.name));

    if (records.length === 0) return [];

    const brandIds = records.map((r) => r.id);
    const translationRows = await this.db
      .select()
      .from(brandTranslations)
      .where(inArray(brandTranslations.brandId, brandIds));

    const transMap = new Map<string, Map<string, BrandTranslation>>();
    const allTransMap = new Map<string, BrandTranslation[]>();
    for (const row of translationRows) {
      let brandMap = transMap.get(row.brandId);
      let brandList = allTransMap.get(row.brandId);
      if (!brandMap) {
        brandMap = new Map();
        transMap.set(row.brandId, brandMap);
      }
      if (!brandList) {
        brandList = [];
        allTransMap.set(row.brandId, brandList);
      }
      brandMap.set(row.locale, row);
      brandList.push(row);
    }

    return records.map((r) =>
      this.mapBrandToDto(r, transMap.get(r.id), allTransMap.get(r.id), locale),
    );
  }

  /**
   * Retrieves a single brand by unique UUID with localized fallback.
   */
  async findById(id: string, locale = "vi"): Promise<BrandResponseDto> {
    const [record] = await this.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    if (!record) {
      throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
    }

    const translationRows = await this.db
      .select()
      .from(brandTranslations)
      .where(eq(brandTranslations.brandId, id));

    const transMap = new Map<string, BrandTranslation>();
    for (const row of translationRows) {
      transMap.set(row.locale, row);
    }

    return this.mapBrandToDto(record, transMap, translationRows, locale);
  }

  /**
   * Creates a new brand with localized translations.
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

    return await this.db.transaction(async (tx) => {
      const [newBrand] = await tx
        .insert(brands)
        .values({
          name: dto.name,
          slug: dto.slug,
          logo: dto.logo ?? null,
          isActive: dto.isActive,
        })
        .returning();

      if (!newBrand) {
        throw new I18nBadRequestException("catalog.BRAND_CREATE_FAILED");
      }

      const rowsToInsert: (typeof brandTranslations.$inferInsert)[] = [];

      if (dto.translations && dto.translations.length > 0) {
        for (const t of dto.translations) {
          if (t.description !== undefined) {
            rowsToInsert.push({
              brandId: newBrand.id,
              locale: t.locale,
              description: t.description ?? null,
            });
          }
        }
      } else {
        if (dto.descriptionVi !== undefined) {
          rowsToInsert.push({
            brandId: newBrand.id,
            locale: "vi",
            description: dto.descriptionVi ?? null,
          });
        }
        if (dto.descriptionEn !== undefined) {
          rowsToInsert.push({
            brandId: newBrand.id,
            locale: "en",
            description: dto.descriptionEn ?? null,
          });
        }
      }

      let createdTranslations: BrandTranslation[] = [];
      if (rowsToInsert.length > 0) {
        createdTranslations = await tx
          .insert(brandTranslations)
          .values(rowsToInsert)
          .returning();
      }

      const transMap = new Map<string, BrandTranslation>();
      for (const t of createdTranslations) {
        transMap.set(t.locale, t);
      }

      return this.mapBrandToDto(newBrand, transMap, createdTranslations, "vi");
    });
  }

  /**
   * Updates an existing brand with full-sync translation upsert and prune.
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

    return await this.db.transaction(async (tx) => {
      const viTranslation = dto.translations?.find((t) => t.locale === "vi");
      const enTranslation = dto.translations?.find((t) => t.locale === "en");

      const [updated] = await tx
        .update(brands)
        .set({
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
          ...(viTranslation
            ? { descriptionVi: viTranslation.description ?? null }
            : dto.descriptionVi !== undefined
              ? { descriptionVi: dto.descriptionVi }
              : {}),
          ...(enTranslation
            ? { descriptionEn: enTranslation.description ?? null }
            : dto.descriptionEn !== undefined
              ? { descriptionEn: dto.descriptionEn }
              : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        })
        .where(eq(brands.id, id))
        .returning();

      if (!updated) {
        throw new I18nNotFoundException("catalog.BRAND_NOT_FOUND", { id });
      }

      if (dto.translations) {
        const activeLocales = dto.translations.map((t) => t.locale);

        for (const t of dto.translations) {
          await tx
            .insert(brandTranslations)
            .values({
              brandId: id,
              locale: t.locale,
              description: t.description ?? null,
            })
            .onConflictDoUpdate({
              target: [brandTranslations.brandId, brandTranslations.locale],
              set: {
                description: t.description ?? null,
              },
            });
        }

        if (activeLocales.length > 0) {
          await tx.delete(brandTranslations).where(
            and(
              eq(brandTranslations.brandId, id),
              sql`${brandTranslations.locale} NOT IN (${sql.join(
                activeLocales.map((l) => sql`${l}`),
                sql`, `,
              )})`,
            ),
          );
        }
      }

      const allTrans = await tx
        .select()
        .from(brandTranslations)
        .where(eq(brandTranslations.brandId, id));

      const transMap = new Map<string, BrandTranslation>();
      for (const t of allTrans) {
        transMap.set(t.locale, t);
      }

      return this.mapBrandToDto(updated, transMap, allTrans, "vi");
    });
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

  private mapBrandToDto(
    record: Brand,
    translationsMap?: Map<string, BrandTranslation>,
    allTranslations?: BrandTranslation[],
    requestedLocale = "vi",
  ): BrandResponseDto {
    const translation =
      translationsMap?.get(requestedLocale) ??
      translationsMap?.get("vi") ??
      null;

    const description = translation?.description ?? null;

    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      logo: record.logo,
      description,
      translations: allTranslations?.map((t) => ({
        locale: t.locale,
        description: t.description,
      })),
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
