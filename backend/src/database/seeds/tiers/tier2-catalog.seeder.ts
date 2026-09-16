import type { DrizzleDB } from "@/database/database.module";
import {
  brands,
  brandTranslations,
  categories,
  categoryTranslations,
  products,
  productTranslations,
  warehouses,
  warehouseStocks,
} from "@/database/schemas";
import { isScopeActive, type SeedScope } from "../constants/seed.constant";
import type {
  Tier1SeedResult,
  Tier2SeedResult,
  BrandFixtureData,
  CategoryFixtureData,
  WarehouseFixtureData,
  ProductFixtureData,
  WarehouseStockFixtureData,
} from "../types/seed.type";
import brandsFixture from "../fixtures/catalog/brands.json";
import categoriesFixture from "../fixtures/catalog/categories.json";
import warehousesFixture from "../fixtures/catalog/warehouses.json";
import productsFixture from "../fixtures/catalog/products.json";
import warehouseStocksFixture from "../fixtures/catalog/warehouse-stocks.json";

export async function seedTier2Catalog(
  db: DrizzleDB,
  scopes: SeedScope[],
  _tier1Result?: Tier1SeedResult,
): Promise<Tier2SeedResult> {
  const result: Tier2SeedResult = {
    brands: [],
    categories: [],
    products: [],
    warehouses: [],
    warehouseStocksCount: 0,
  };

  // 1. Seed Brands & Translations
  if (isScopeActive(scopes, "catalog", "brands")) {
    const brandsList: BrandFixtureData[] = brandsFixture;
    const brandsTableData = brandsList.map(
      ({ translations: _t, ...brand }) => brand,
    );
    await db.insert(brands).values(brandsTableData).onConflictDoNothing();

    const brandTranslationData = brandsList.flatMap((b) =>
      b.translations.map((t) => ({
        brandId: b.id,
        locale: t.locale,
        description: t.description,
      })),
    );
    await db
      .insert(brandTranslations)
      .values(brandTranslationData)
      .onConflictDoNothing();

    result.brands = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
      })
      .from(brands);
  }

  // 2. Seed Categories & Translations
  if (isScopeActive(scopes, "catalog", "categories")) {
    const categoriesList: CategoryFixtureData[] = categoriesFixture;
    const categoriesTableData = categoriesList.map(
      ({ translations: _t, ...category }) => category,
    );
    await db
      .insert(categories)
      .values(categoriesTableData)
      .onConflictDoNothing();

    const categoryTranslationData = categoriesList.flatMap((c) =>
      c.translations.map((t) => ({
        categoryId: c.id,
        locale: t.locale,
        name: t.name,
        description: t.description,
      })),
    );
    await db
      .insert(categoryTranslations)
      .values(categoryTranslationData)
      .onConflictDoNothing();

    result.categories = await db
      .select({
        id: categories.id,
        slug: categories.slug,
      })
      .from(categories);
  }

  // 3. Seed Warehouses
  if (isScopeActive(scopes, "catalog", "warehouses")) {
    const warehousesList: WarehouseFixtureData[] = warehousesFixture;
    await db.insert(warehouses).values(warehousesList).onConflictDoNothing();

    result.warehouses = await db
      .select({
        id: warehouses.id,
        nameVi: warehouses.nameVi,
        city: warehouses.city,
      })
      .from(warehouses);
  }

  // 4. Seed Products & Translations
  if (isScopeActive(scopes, "catalog", "products")) {
    const productsList = productsFixture as unknown as ProductFixtureData[];
    const productsTableData = productsList.map(
      ({ translations: _t, ...product }) => product,
    );

    await db.insert(products).values(productsTableData).onConflictDoNothing();

    const productTranslationData = productsList.flatMap((p) =>
      p.translations.map((t) => ({
        productId: p.id,
        locale: t.locale,
        name: t.name,
        shortDescription: t.shortDescription,
        description: t.description,
      })),
    );
    await db
      .insert(productTranslations)
      .values(productTranslationData)
      .onConflictDoNothing();

    result.products = await db
      .select({
        id: products.id,
        slug: products.slug,
        price: products.price,
        totalStockCache: products.totalStockCache,
      })
      .from(products);

    // 5. Seed Warehouse Stocks
    const warehouseStocksList: WarehouseStockFixtureData[] =
      warehouseStocksFixture;
    await db
      .insert(warehouseStocks)
      .values(warehouseStocksList)
      .onConflictDoNothing();
    result.warehouseStocksCount = warehouseStocksList.length;
  }

  return result;
}
