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
  categories,
  categoryTranslations,
  type Category,
  type CategoryTranslation,
} from "@/database/schemas";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { UpdateCategoryDto } from "./dto/update-category.dto";
import type { CategoryResponseDto } from "./dto/category-response.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves all active categories ordered by slug with in-memory locale fallback.
   */
  async findAll(locale = "vi"): Promise<CategoryResponseDto[]> {
    const records = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.slug));

    if (records.length === 0) return [];

    const categoryIds = records.map((r) => r.id);
    const translationRows = await this.db
      .select()
      .from(categoryTranslations)
      .where(inArray(categoryTranslations.categoryId, categoryIds));

    const transMap = new Map<string, Map<string, CategoryTranslation>>();
    const allTransMap = new Map<string, CategoryTranslation[]>();
    for (const row of translationRows) {
      let catMap = transMap.get(row.categoryId);
      let catList = allTransMap.get(row.categoryId);
      if (!catMap) {
        catMap = new Map();
        transMap.set(row.categoryId, catMap);
      }
      if (!catList) {
        catList = [];
        allTransMap.set(row.categoryId, catList);
      }
      catMap.set(row.locale, row);
      catList.push(row);
    }

    return records.map((r) =>
      this.mapCategoryToDto(
        r,
        transMap.get(r.id),
        allTransMap.get(r.id),
        locale,
      ),
    );
  }

  /**
   * Builds and returns a recursive hierarchical category tree.
   */
  async getTree(locale = "vi"): Promise<CategoryResponseDto[]> {
    const categoryDtos = await this.findAll(locale);

    const categoryMap = new Map<string, CategoryResponseDto>();
    for (const dto of categoryDtos) {
      dto.children = [];
      categoryMap.set(dto.id, dto);
    }

    const roots: CategoryResponseDto[] = [];
    for (const dto of categoryDtos) {
      const node = categoryMap.get(dto.id);
      if (!node) continue;

      if (dto.parentId) {
        const parent = categoryMap.get(dto.parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Retrieves a single category by its UUID with localized fallback.
   */
  async findById(id: string, locale = "vi"): Promise<CategoryResponseDto> {
    const [record] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!record) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    const translationRows = await this.db
      .select()
      .from(categoryTranslations)
      .where(eq(categoryTranslations.categoryId, id));

    const transMap = new Map<string, CategoryTranslation>();
    for (const row of translationRows) {
      transMap.set(row.locale, row);
    }

    return this.mapCategoryToDto(record, transMap, translationRows, locale);
  }

  /**
   * Creates a new category along with its localized translations.
   */
  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const [existingSlug] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, dto.slug))
      .limit(1);

    if (existingSlug) {
      throw new I18nConflictException("catalog.CATEGORY_SLUG_EXISTS", {
        slug: dto.slug,
      });
    }

    if (dto.parentId) {
      const [parent] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.parentId))
        .limit(1);

      if (!parent) {
        throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
          id: dto.parentId,
        });
      }
    }

    const viTranslation = dto.translations?.find(
      (t) => t.locale === "vi" && t.name.trim().length > 0,
    );
    const primaryNameVi = viTranslation?.name ?? dto.nameVi ?? "";
    const primaryDescVi =
      viTranslation?.description ?? dto.descriptionVi ?? null;

    const enTranslation = dto.translations?.find(
      (t) => t.locale === "en" && t.name.trim().length > 0,
    );
    const primaryNameEn = enTranslation?.name ?? dto.nameEn ?? null;
    const primaryDescEn =
      enTranslation?.description ?? dto.descriptionEn ?? null;

    return await this.db.transaction(async (tx) => {
      const [newCategory] = await tx
        .insert(categories)
        .values({
          nameVi: primaryNameVi,
          nameEn: primaryNameEn,
          slug: dto.slug,
          parentId: dto.parentId ?? null,
          descriptionVi: primaryDescVi,
          descriptionEn: primaryDescEn,
          image: dto.image ?? null,
          isActive: dto.isActive,
        })
        .returning();

      if (!newCategory) {
        throw new I18nBadRequestException("catalog.CATEGORY_CREATE_FAILED");
      }

      const rowsToInsert: (typeof categoryTranslations.$inferInsert)[] = [];

      if (dto.translations && dto.translations.length > 0) {
        for (const t of dto.translations) {
          if (t.name && t.name.trim().length > 0) {
            rowsToInsert.push({
              categoryId: newCategory.id,
              locale: t.locale,
              name: t.name.trim(),
              description: t.description ?? null,
            });
          }
        }
      } else {
        if (dto.nameVi) {
          rowsToInsert.push({
            categoryId: newCategory.id,
            locale: "vi",
            name: dto.nameVi,
            description: dto.descriptionVi ?? null,
          });
        }
        if (dto.nameEn) {
          rowsToInsert.push({
            categoryId: newCategory.id,
            locale: "en",
            name: dto.nameEn,
            description: dto.descriptionEn ?? null,
          });
        }
      }

      let createdTranslations: CategoryTranslation[] = [];
      if (rowsToInsert.length > 0) {
        createdTranslations = await tx
          .insert(categoryTranslations)
          .values(rowsToInsert)
          .returning();
      }

      const transMap = new Map<string, CategoryTranslation>();
      for (const t of createdTranslations) {
        transMap.set(t.locale, t);
      }

      return this.mapCategoryToDto(
        newCategory,
        transMap,
        createdTranslations,
        "vi",
      );
    });
  }

  /**
   * Updates an existing category along with full-sync translation upsert and prune.
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const [existing] = await this.db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!existing) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, dto.slug))
        .limit(1);

      if (slugConflict) {
        throw new I18nConflictException("catalog.CATEGORY_SLUG_EXISTS", {
          slug: dto.slug,
        });
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new I18nBadRequestException("catalog.CATEGORY_SELF_PARENT");
      }
      if (dto.parentId !== null) {
        const [parent] = await this.db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, dto.parentId))
          .limit(1);

        if (!parent) {
          throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
            id: dto.parentId,
          });
        }
      }
    }

    return await this.db.transaction(async (tx) => {
      const viTranslation = dto.translations?.find(
        (t) => t.locale === "vi" && t.name.trim().length > 0,
      );
      const enTranslation = dto.translations?.find(
        (t) => t.locale === "en" && t.name.trim().length > 0,
      );

      const [updated] = await tx
        .update(categories)
        .set({
          ...(viTranslation
            ? { nameVi: viTranslation.name }
            : dto.nameVi !== undefined
              ? { nameVi: dto.nameVi }
              : {}),
          ...(enTranslation
            ? { nameEn: enTranslation.name }
            : dto.nameEn !== undefined
              ? { nameEn: dto.nameEn }
              : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
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
          ...(dto.image !== undefined ? { image: dto.image } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        })
        .where(eq(categories.id, id))
        .returning();

      if (!updated) {
        throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
      }

      if (dto.translations) {
        const validTranslations = dto.translations.filter(
          (t) => t.name && t.name.trim().length > 0,
        );
        const activeLocales = validTranslations.map((t) => t.locale);

        for (const t of validTranslations) {
          await tx
            .insert(categoryTranslations)
            .values({
              categoryId: id,
              locale: t.locale,
              name: t.name.trim(),
              description: t.description ?? null,
            })
            .onConflictDoUpdate({
              target: [
                categoryTranslations.categoryId,
                categoryTranslations.locale,
              ],
              set: {
                name: t.name.trim(),
                description: t.description ?? null,
              },
            });
        }

        if (activeLocales.length > 0) {
          await tx.delete(categoryTranslations).where(
            and(
              eq(categoryTranslations.categoryId, id),
              sql`${categoryTranslations.locale} NOT IN (${sql.join(
                activeLocales.map((l) => sql`${l}`),
                sql`, `,
              )})`,
            ),
          );
        }
      }

      const allTrans = await tx
        .select()
        .from(categoryTranslations)
        .where(eq(categoryTranslations.categoryId, id));

      const transMap = new Map<string, CategoryTranslation>();
      for (const t of allTrans) {
        transMap.set(t.locale, t);
      }

      return this.mapCategoryToDto(updated, transMap, allTrans, "vi");
    });
  }

  /**
   * Deletes a category by ID.
   */
  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.CATEGORY_NOT_FOUND", { id });
    }

    await this.db.delete(categories).where(eq(categories.id, id));
  }

  private mapCategoryToDto(
    record: Category,
    translationsMap?: Map<string, CategoryTranslation>,
    allTranslations?: CategoryTranslation[],
    requestedLocale = "vi",
  ): CategoryResponseDto {
    const translation =
      translationsMap?.get(requestedLocale) ??
      translationsMap?.get("vi") ??
      null;

    const name = translation?.name ?? record.nameVi;
    const description =
      translation?.description ?? record.descriptionVi ?? null;

    return {
      id: record.id,
      slug: record.slug,
      parentId: record.parentId,
      image: record.image,
      isActive: record.isActive,
      name,
      description,
      translations: allTranslations?.map((t) => ({
        locale: t.locale,
        name: t.name,
        description: t.description,
      })),
      nameVi: record.nameVi,
      nameEn: record.nameEn,
      descriptionVi: record.descriptionVi,
      descriptionEn: record.descriptionEn,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
