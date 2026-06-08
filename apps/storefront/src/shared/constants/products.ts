import type { TProduct } from "@nhatnang/database/schemas";

export const PRODUCTS_REVALIDATE_SECONDS = 60 * 60;

export const BUILD_TIME_PRODUCTS: TProduct[] = [
  {
    id: "sku-hy-30cle",
    name: "Máy phát điện chạy xăng 2.3kW cho gia đình",
    slug: "sku-hy-30cle",
    price: "150000000.00",
    images: [
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/MAY-PHAT-DIEN-HYUNDAI-HY-30CLE-1-600x600.jpg",
    ],
    specs: {
      power: 2.3,
      fuelType: "gasoline",
    },
    totalStockCache: 5,
    totalSalesCache: 0,
    isQuoteOnly: false,
    brandId: null,
    categoryId: null,
    shortDescription: null,
    description: null,
    createdAt: new Date("2026-06-08T00:00:00.000Z"),
    updatedAt: new Date("2026-06-08T00:00:00.000Z"),
    deletedAt: null,
  },
  {
    id: "sku-hy-7000le",
    name: "Máy phát điện chạy xăng 5kW cho gia đình văn phòng",
    slug: "sku-hy-7000le",
    price: "25000000.00",
    images: [
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/MAY-PHAT-DIEN-hyundai-hy-7000le-nn-dai-dien-1-600x600.jpg",
    ],
    specs: {
      power: 5,
      fuelType: "gasoline",
    },
    totalStockCache: 2,
    totalSalesCache: 0,
    isQuoteOnly: false,
    brandId: null,
    categoryId: null,
    shortDescription: null,
    description: null,
    createdAt: new Date("2026-06-08T00:00:00.000Z"),
    updatedAt: new Date("2026-06-08T00:00:00.000Z"),
    deletedAt: null,
  },
  {
    id: "sku-hpg1000l",
    name: "Bộ lưu điện cho gia đình, văn phòng HPgreen HPG1000L - Pin Lithium",
    slug: "sku-hpg1000l",
    price: "18500000.00",
    images: [
      "https://hyundainhatnang.vn/wp-content/uploads/2022/07/Tram-sac-du-phong-di-dong-HPgreen-HPG1000L-Pin-Lithium-cong-suat-600W-600x600.png",
    ],
    specs: {
      power: 1.2,
    },
    totalStockCache: 8,
    totalSalesCache: 0,
    isQuoteOnly: false,
    brandId: null,
    categoryId: null,
    shortDescription: null,
    description: null,
    createdAt: new Date("2026-06-08T00:00:00.000Z"),
    updatedAt: new Date("2026-06-08T00:00:00.000Z"),
    deletedAt: null,
  },
];

export const getProductSlug = (product: TProduct) => product.slug;
