import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nConflictException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  brands,
  categories,
  categoryTranslations,
  products,
  productTranslations,
  type Brand,
  type Category,
  type Product,
  type ProductTranslation,
} from "@/database/schemas";
import {
  buildPaginationMeta,
  type PaginationMetaDto,
} from "@/common/dto/pagination-meta.dto";
import type {
  CreateProductDto,
  ProductMetadataResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from "./dto";
import type {
  BrandFacetItem,
  CategoryFacetItem,
  ValueCountFacetItem,
} from "./dto/product-metadata-response.dto";
import { productFilters } from "./filters";

/**
 * Maps incoming CreateProductDto values into Drizzle database insert values.
 */
function toProductInsertValues(
  dto: CreateProductDto,
): typeof products.$inferInsert {
  return {
    slug: dto.slug,
    price: String(dto.price),
    images: dto.images,
    brandId: dto.brandId ?? null,
    categoryId: dto.categoryId ?? null,
    productType: dto.productType,
    powerKva: dto.powerKva != null ? String(dto.powerKva) : null,
    powerKw: dto.powerKw != null ? String(dto.powerKw) : null,
    standbyPowerKva:
      dto.standbyPowerKva != null ? String(dto.standbyPowerKva) : null,
    standbyPowerKw:
      dto.standbyPowerKw != null ? String(dto.standbyPowerKw) : null,
    phase: dto.phase ?? null,
    voltage: dto.voltage ?? null,
    frequency: dto.frequency,
    fuelType: dto.fuelType ?? null,
    canopyType: dto.canopyType ?? null,
    startMethod: dto.startMethod ?? null,
    engineBrand: dto.engineBrand ?? null,
    alternatorBrand: dto.alternatorBrand ?? null,
    upsTopology: dto.upsTopology ?? null,
    upsBatteryType: dto.upsBatteryType ?? null,
    specSheet: dto.specSheet,
    specs: dto.specs,
    totalStockCache: dto.totalStockCache,
    isQuoteOnly: dto.isQuoteOnly,
    isActive: dto.isActive,
  };
}

/**
 * Maps incoming UpdateProductDto values into Drizzle database update values.
 */
function toProductUpdateValues(
  dto: UpdateProductDto,
): Partial<typeof products.$inferInsert> {
  const updateValues: Partial<typeof products.$inferInsert> = {};

  if (dto.slug !== undefined) updateValues.slug = dto.slug;
  if (dto.price !== undefined) {
    updateValues.price = String(dto.price);
  }
  if (dto.images !== undefined) updateValues.images = dto.images;
  if (dto.brandId !== undefined) updateValues.brandId = dto.brandId;
  if (dto.categoryId !== undefined) updateValues.categoryId = dto.categoryId;
  if (dto.productType !== undefined) updateValues.productType = dto.productType;
  if (dto.powerKva !== undefined)
    updateValues.powerKva = dto.powerKva != null ? String(dto.powerKva) : null;
  if (dto.powerKw !== undefined)
    updateValues.powerKw = dto.powerKw != null ? String(dto.powerKw) : null;
  if (dto.standbyPowerKva !== undefined)
    updateValues.standbyPowerKva =
      dto.standbyPowerKva != null ? String(dto.standbyPowerKva) : null;
  if (dto.standbyPowerKw !== undefined)
    updateValues.standbyPowerKw =
      dto.standbyPowerKw != null ? String(dto.standbyPowerKw) : null;
  if (dto.phase !== undefined) updateValues.phase = dto.phase;
  if (dto.voltage !== undefined) updateValues.voltage = dto.voltage;
  if (dto.frequency !== undefined) updateValues.frequency = dto.frequency;
  if (dto.fuelType !== undefined) updateValues.fuelType = dto.fuelType;
  if (dto.canopyType !== undefined) updateValues.canopyType = dto.canopyType;
  if (dto.startMethod !== undefined) updateValues.startMethod = dto.startMethod;
  if (dto.engineBrand !== undefined) updateValues.engineBrand = dto.engineBrand;
  if (dto.alternatorBrand !== undefined)
    updateValues.alternatorBrand = dto.alternatorBrand;
  if (dto.upsTopology !== undefined) updateValues.upsTopology = dto.upsTopology;
  if (dto.upsBatteryType !== undefined)
    updateValues.upsBatteryType = dto.upsBatteryType;
  if (dto.specSheet !== undefined) updateValues.specSheet = dto.specSheet;
  if (dto.specs !== undefined) updateValues.specs = dto.specs;
  if (dto.totalStockCache !== undefined)
    updateValues.totalStockCache = dto.totalStockCache;
  if (dto.isQuoteOnly !== undefined) updateValues.isQuoteOnly = dto.isQuoteOnly;
  if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;
  return updateValues;
}

/**
 * Transforms Drizzle database product record and joined entities into ProductResponseDto.
 */
function mapProductRow(
  product: Product,
  brand?: Brand | null,
  category?: Category | null,
  translationsMap?: Map<string, ProductTranslation>,
  allTranslations?: ProductTranslation[],
  requestedLocale = "vi",
): ProductResponseDto {
  const t =
    translationsMap?.get(requestedLocale) ?? translationsMap?.get("vi") ?? null;

  const name = t?.name ?? "";
  const shortDescription = t?.shortDescription ?? null;
  const description = t?.description ?? null;
  const seoTitle = t?.seoTitle ?? null;
  const seoDescription = t?.seoDescription ?? null;

  return {
    ...product,
    name,
    shortDescription,
    description,
    seoTitle,
    seoDescription,
    translations: allTranslations?.map((tr) => ({
      locale: tr.locale,
      name: tr.name,
      shortDescription: tr.shortDescription,
      description: tr.description,
      seoTitle: tr.seoTitle,
      seoDescription: tr.seoDescription,
    })),
    isQuoteOnly: product.isQuoteOnly,
    productType: product.productType ?? "generator",
    powerKva: product.powerKva ?? null,
    powerKw: product.powerKw ?? null,
    standbyPowerKva: product.standbyPowerKva ?? null,
    standbyPowerKw: product.standbyPowerKw ?? null,
    phase: product.phase ?? null,
    voltage: product.voltage ?? null,
    frequency: product.frequency ?? null,
    fuelType: product.fuelType ?? null,
    canopyType: product.canopyType ?? null,
    startMethod: product.startMethod ?? null,
    engineBrand: product.engineBrand ?? null,
    alternatorBrand: product.alternatorBrand ?? null,
    upsTopology: product.upsTopology ?? null,
    upsBatteryType: product.upsBatteryType ?? null,
    specSheet: product.specSheet ?? [],
    specs: (product.specs as ProductResponseDto["specs"] | undefined) ?? {},
    brand: brand?.id
      ? {
          ...brand,
          description: null,
        }
      : null,
    category: category?.id
      ? {
          ...category,
          name: category.slug,
          description: null,
        }
      : null,
  };
}

/**
 * Core service managing product catalog operations, hybrid faceted search, and metadata aggregation.
 */
@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves paginated products matching hybrid faceted search filters.
   */
  async findProducts(
    query: ProductQueryDto,
  ): Promise<{ items: ProductResponseDto[]; meta: PaginationMetaDto }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const locale = query.locale ?? "vi";

    const whereClause = and(
      productFilters.isAvailable(),
      productFilters.bySearch(query.search),
      productFilters.byBrandId(query.brandId),
      productFilters.byCategoryId(query.categoryId),
      productFilters.byPriceRange(query.priceMin, query.priceMax),
      productFilters.byPowerRange(
        query.powerKvaMin ?? query.minPower,
        query.powerKvaMax ?? query.maxPower,
      ),
      productFilters.byVoltage(query.voltage),
      productFilters.byPhase(query.phase),
      productFilters.byFuelType(query.fuelType),
      productFilters.byCanopyType(query.canopyType),
      productFilters.byEngineBrand(query.engineBrand),
      productFilters.byAlternatorBrand(query.alternatorBrand),
      productFilters.byStatus(query.status),
      productFilters.byQuoteOnly(query.isQuoteOnly),
    );

    let orderByClause = desc(products.createdAt);
    if (query.sort === "priceAsc") {
      orderByClause = asc(products.price);
    } else if (query.sort === "priceDesc") {
      orderByClause = desc(products.price);
    }

    const [countResult] = await this.db
      .select({ total: count() })
      .from(products)
      .where(whereClause);

    const total = countResult?.total ?? 0;

    if (total === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(0, page, limit),
      };
    }

    const records = await this.db
      .select({
        product: products,
        brand: brands,
        category: categories,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    if (records.length === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(total, page, limit),
      };
    }

    const productIds = records.map((r) => r.product.id);
    const neededLocales = locale === "vi" ? ["vi"] : [locale, "vi"];
    const translationRows = await this.db
      .select()
      .from(productTranslations)
      .where(
        and(
          inArray(productTranslations.productId, productIds),
          inArray(productTranslations.locale, neededLocales),
        ),
      );

    const transMap = new Map<string, Map<string, ProductTranslation>>();
    const allTransMap = new Map<string, ProductTranslation[]>();

    for (const row of translationRows) {
      let pMap = transMap.get(row.productId);
      let pList = allTransMap.get(row.productId);
      if (!pMap) {
        pMap = new Map();
        transMap.set(row.productId, pMap);
      }
      if (!pList) {
        pList = [];
        allTransMap.set(row.productId, pList);
      }
      pMap.set(row.locale, row);
      pList.push(row);
    }

    const items = records.map((r) =>
      mapProductRow(
        r.product,
        r.brand,
        r.category,
        transMap.get(r.product.id),
        allTransMap.get(r.product.id),
        locale,
      ),
    );

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves aggregated faceted metadata and available filter ranges.
   */
  async getMetadata(locale = "vi"): Promise<ProductMetadataResponseDto> {
    const baseCondition = productFilters.isAvailable();

    const [
      [ranges],
      brandCounts,
      categoryCounts,
      fuelTypeCounts,
      phaseCounts,
      canopyTypeCounts,
    ] = await Promise.all([
      this.db
        .select({
          minPower: sql<string>`min(cast(${products.powerKva} as numeric))`,
          maxPower: sql<string>`max(cast(${products.powerKva} as numeric))`,
          minPrice: sql<string>`min(cast(${products.price} as numeric))`,
          maxPrice: sql<string>`max(cast(${products.price} as numeric))`,
        })
        .from(products)
        .where(baseCondition),

      this.db
        .select({
          id: brands.id,
          name: brands.name,
          count: count(products.id),
        })
        .from(products)
        .innerJoin(brands, eq(products.brandId, brands.id))
        .where(baseCondition)
        .groupBy(brands.id, brands.name),

      this.db
        .select({
          id: categories.id,
          name: sql<string>`coalesce(${categoryTranslations.name}, ${categories.slug})`,
          count: count(products.id),
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categories.id, categoryTranslations.categoryId),
            eq(categoryTranslations.locale, locale),
          ),
        )
        .where(baseCondition)
        .groupBy(categories.id, categories.slug, categoryTranslations.name),

      this.db
        .select({
          value: products.fuelType,
          count: count(products.id),
        })
        .from(products)
        .where(baseCondition)
        .groupBy(products.fuelType),

      this.db
        .select({
          value: products.phase,
          count: count(products.id),
        })
        .from(products)
        .where(baseCondition)
        .groupBy(products.phase),

      this.db
        .select({
          value: products.canopyType,
          count: count(products.id),
        })
        .from(products)
        .where(baseCondition)
        .groupBy(products.canopyType),
    ]);

    return {
      powerRange: {
        min: Number(ranges?.minPower) || 0,
        max: Number(ranges?.maxPower) || 0,
      },
      priceRange: {
        min: Number(ranges?.minPrice) || 0,
        max: Number(ranges?.maxPrice) || 0,
      },
      brands: brandCounts.map((b): BrandFacetItem => ({
        id: b.id,
        name: b.name,
        count: b.count,
      })),
      categories: categoryCounts.map((c): CategoryFacetItem => ({
        id: c.id,
        name: c.name,
        count: c.count,
      })),
      fuelTypes: fuelTypeCounts.map((f): ValueCountFacetItem => ({
        value: f.value ?? "",
        count: f.count,
      })),
      phases: phaseCounts.map((p): ValueCountFacetItem => ({
        value: p.value ?? "",
        count: p.count,
      })),
      canopyTypes: canopyTypeCounts.map((c): ValueCountFacetItem => ({
        value: c.value ?? "",
        count: c.count,
      })),
    };
  }

  /**
   * Retrieves a single product by UUID or slug with localized fallback.
   */
  async findById(idOrSlug: string, locale = "vi"): Promise<ProductResponseDto> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const [record] = await this.db
      .select({
        product: products,
        brand: brands,
        category: categories,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          isNull(products.deletedAt),
          isUuid ? eq(products.id, idOrSlug) : eq(products.slug, idOrSlug),
        ),
      )
      .limit(1);

    if (!record) {
      throw new I18nNotFoundException("catalog.PRODUCT_NOT_FOUND", {
        id: idOrSlug,
      });
    }

    const translationRows = await this.db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, record.product.id));

    const transMap = new Map<string, ProductTranslation>();
    for (const row of translationRows) {
      transMap.set(row.locale, row);
    }

    return mapProductRow(
      record.product,
      record.brand,
      record.category,
      transMap,
      translationRows,
      locale,
    );
  }

  /**
   * Creates a new product along with its localized translations.
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    if (dto.price < 0) {
      throw new I18nBadRequestException("catalog.PRICE_NEGATIVE");
    }

    const [existingSlug] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, dto.slug))
      .limit(1);

    if (existingSlug) {
      throw new I18nConflictException("catalog.PRODUCT_SLUG_EXISTS", {
        slug: dto.slug,
      });
    }

    if (dto.brandId) {
      const [brand] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.id, dto.brandId))
        .limit(1);

      if (!brand) {
        throw new I18nBadRequestException("catalog.BRAND_NOT_FOUND", {
          id: dto.brandId,
        });
      }
    }

    if (dto.categoryId) {
      const [category] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.categoryId))
        .limit(1);

      if (!category) {
        throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
          id: dto.categoryId,
        });
      }
    }

    return await this.db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values(toProductInsertValues(dto))
        .returning();

      if (!newProduct) {
        throw new I18nBadRequestException("catalog.PRODUCT_CREATE_FAILED");
      }

      const rowsToInsert: (typeof productTranslations.$inferInsert)[] = [];

      for (const t of dto.translations) {
        if (t.name && t.name.trim().length > 0) {
          rowsToInsert.push({
            productId: newProduct.id,
            locale: t.locale,
            name: t.name.trim(),
            shortDescription: t.shortDescription ?? null,
            description: t.description ?? null,
            seoTitle: t.seoTitle ?? null,
            seoDescription: t.seoDescription ?? null,
          });
        }
      }
      let createdTranslations: ProductTranslation[] = [];
      if (rowsToInsert.length > 0) {
        createdTranslations = await tx
          .insert(productTranslations)
          .values(rowsToInsert)
          .returning();
      }

      const transMap = new Map<string, ProductTranslation>();
      for (const t of createdTranslations) {
        transMap.set(t.locale, t);
      }

      return mapProductRow(
        newProduct,
        null,
        null,
        transMap,
        createdTranslations,
        "vi",
      );
    });
  }

  /**
   * Updates an existing product along with full-sync translation upsert and prune.
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    if (dto.price !== undefined && dto.price < 0) {
      throw new I18nBadRequestException("catalog.PRICE_NEGATIVE");
    }
    const [existing] = await this.db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.PRODUCT_NOT_FOUND", { id });
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, dto.slug))
        .limit(1);

      if (slugConflict) {
        throw new I18nConflictException("catalog.PRODUCT_SLUG_EXISTS", {
          slug: dto.slug,
        });
      }
    }

    if (dto.brandId) {
      const [brand] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.id, dto.brandId))
        .limit(1);

      if (!brand) {
        throw new I18nBadRequestException("catalog.BRAND_NOT_FOUND", {
          id: dto.brandId,
        });
      }
    }

    if (dto.categoryId) {
      const [category] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.categoryId))
        .limit(1);

      if (!category) {
        throw new I18nBadRequestException("catalog.CATEGORY_NOT_FOUND", {
          id: dto.categoryId,
        });
      }
    }

    return await this.db.transaction(async (tx) => {
      const updatePayload = toProductUpdateValues(dto);

      const [updatedProduct] = await tx
        .update(products)
        .set(updatePayload)
        .where(eq(products.id, id))
        .returning();
      if (!updatedProduct) {
        throw new I18nNotFoundException("catalog.PRODUCT_NOT_FOUND", { id });
      }

      if (dto.translations) {
        const validTranslations = dto.translations.filter(
          (t) => t.name && t.name.trim().length > 0,
        );
        const activeLocales = validTranslations.map((t) => t.locale);

        for (const t of validTranslations) {
          await tx
            .insert(productTranslations)
            .values({
              productId: id,
              locale: t.locale,
              name: t.name.trim(),
              shortDescription: t.shortDescription ?? null,
              description: t.description ?? null,
              seoTitle: t.seoTitle ?? null,
              seoDescription: t.seoDescription ?? null,
            })
            .onConflictDoUpdate({
              target: [
                productTranslations.productId,
                productTranslations.locale,
              ],
              set: {
                name: t.name.trim(),
                shortDescription: t.shortDescription ?? null,
                description: t.description ?? null,
                seoTitle: t.seoTitle ?? null,
                seoDescription: t.seoDescription ?? null,
              },
            });
        }

        if (activeLocales.length > 0) {
          await tx.delete(productTranslations).where(
            and(
              eq(productTranslations.productId, id),
              sql`${productTranslations.locale} NOT IN (${sql.join(
                activeLocales.map((l) => sql`${l}`),
                sql`, `,
              )})`,
            ),
          );
        }
      }

      const allTrans = await tx
        .select()
        .from(productTranslations)
        .where(eq(productTranslations.productId, id));

      const transMap = new Map<string, ProductTranslation>();
      for (const t of allTrans) {
        transMap.set(t.locale, t);
      }

      return mapProductRow(
        updatedProduct,
        null,
        null,
        transMap,
        allTrans,
        "vi",
      );
    });
  }

  /**
   * Soft deletes an existing product by setting deletedAt timestamp.
   */
  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      throw new I18nNotFoundException("catalog.PRODUCT_NOT_FOUND", { id });
    }

    await this.db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, id));
  }
}
