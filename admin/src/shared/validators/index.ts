import { z } from "zod";

export const isValidIdentifier = (id: unknown): id is string => {
  return typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id.trim());
};

// Brand Validators
export const createBrandSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  slug: z.string().min(1, "validation.slugRequired"),
  logo: z.string().nullable().optional(),
  descriptionVi: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

// Category Validators
export const createCategorySchema = z.object({
  nameVi: z.string().min(1, "validation.nameRequired"),
  nameEn: z.string().nullable().optional(),
  slug: z.string().min(1, "validation.slugRequired"),
  descriptionVi: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Product Validators
export const specItemSchema = z.object({
  key: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().nullish(),
  value: z.string(),
  unit: z.string().nullish(),
});

export const specGroupSchema = z.object({
  groupKey: z.string().min(1),
  titleVi: z.string().min(1),
  titleEn: z.string().nullish(),
  order: z.number().default(0),
  items: z.array(specItemSchema).default([]),
});

export const productSpecSheetSchema = z.array(specGroupSchema);

export const productSpecsSchema = z
  .object({
    model: z.string().optional(),
    powerKva: z.string().optional(),
    powerKw: z.string().optional(),
    fuelType: z.string().optional(),
    phase: z.string().optional(),
    voltage: z.string().optional(),
    frequency: z.string().optional(),
    canopyType: z.string().optional(),
    engineBrand: z.string().optional(),
    alternatorBrand: z.string().optional(),
  })
  .catchall(z.unknown());

export const createProductSchema = z.object({
  nameVi: z.string().min(1, "validation.nameRequired"),
  nameEn: z.string().nullable().optional(),
  slug: z.string().min(1, "validation.slugRequired"),
  price: z.string().min(1, "validation.priceRequired"),
  descriptionVi: z.unknown().nullable().optional(),
  descriptionEn: z.unknown().nullable().optional(),
  shortDescriptionVi: z.string().nullable().optional(),
  shortDescriptionEn: z.string().nullable().optional(),
  images: z.array(z.string()).min(1, "validation.imagesRequired"),
  brandId: z.string().min(1, "validation.brandRequired"),
  categoryId: z.string().min(1, "validation.categoryRequired"),
  productType: z
    .enum(["generator", "ups", "ats", "accessory"])
    .default("generator"),
  powerKva: z.union([z.string(), z.number()]).nullable().optional(),
  powerKw: z.union([z.string(), z.number()]).nullable().optional(),
  standbyPowerKva: z.union([z.string(), z.number()]).nullable().optional(),
  standbyPowerKw: z.union([z.string(), z.number()]).nullable().optional(),
  phase: z.enum(["1phase", "3phase", "multi_phase"]).nullable().optional(),
  voltage: z.string().nullable().optional(),
  frequency: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .default(50),
  fuelType: z.enum(["diesel", "gasoline", "gas"]).nullable().optional(),
  canopyType: z
    .enum([
      "silent",
      "super_silent",
      "open_frame",
      "closed_case",
      "tower",
      "rackmount",
    ])
    .nullable()
    .optional(),
  startMethod: z
    .enum(["electric", "recoil", "remote", "auto_ats"])
    .nullable()
    .optional(),
  engineBrand: z.string().nullable().optional(),
  alternatorBrand: z.string().nullable().optional(),
  upsTopology: z
    .enum(["offline", "line_interactive", "online_double_conversion"])
    .nullable()
    .optional(),
  upsBatteryType: z.enum(["internal", "external"]).nullable().optional(),
  specSheet: productSpecSheetSchema.default([]),
  specs: productSpecsSchema.nullable().optional(),
  totalStockCache: z.coerce.number().default(0),
  isQuoteOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductSpecs = z.infer<typeof productSpecsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Warehouse Validators
export const createWarehouseSchema = z.object({
  name: z.string().optional(),
  nameVi: z.string().min(1, "validation.nameRequired").optional(),
  nameEn: z.string().nullish(),
  streetAddress: z.string().min(1, "validation.streetAddressRequired"),
  district: z.string().min(1, "validation.districtRequired"),
  city: z.string().min(1, "validation.cityRequired"),
  isActive: z.boolean(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const updateStockSchema = z.object({
  warehouseId: z.string().min(1),
  productId: z.string().min(1),
  stock: z.coerce.number().int().optional(),
  delta: z.coerce.number().int().optional(),
  minStockWarning: z.coerce.number().int().optional(),
  note: z.string().optional(),
});

export const updateWarehouseStockSchema = updateStockSchema;

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;

// Auth Validators
export const adminLoginSchema = z.object({
  email: z.email({ message: "validation.emailInvalid" }),
  password: z.string().min(1, "validation.passwordRequired"),
});

export const loginSchema = adminLoginSchema;
export type AdminLoginForm = z.infer<typeof adminLoginSchema>;
export type LoginForm = AdminLoginForm;

// Customer & Tier Validators
export const updateCustomerStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED", "PENDING_APPROVAL"]),
});

export const setCreditLimitSchema = z.object({
  creditLimit: z.string().min(1),
});

export const createDealerTierSchema = z.object({
  name: z.string().optional(),
  nameVi: z.string().min(1, "validation.nameRequired"),
  nameEn: z.string().optional().nullable(),
  minSpend: z.string().optional(),
  minimumSpend: z.string().min(1, "validation.minSpendRequired"),
  discountPercent: z.coerce.number().optional(),
  discountPercentage: z.string().min(1, "validation.discountRequired"),
  description: z.string().optional().nullable(),
});

export type CreateDealerTierInput = z.infer<typeof createDealerTierSchema>;

// Order & Quote Status Validators
export const updateOrderStatusSchema = z.object({
  orderId: z.string().optional(),
  status: z.string().min(1),
  note: z.string().optional(),
});

export const selectShippingBidSchema = z.object({
  orderId: z.string().min(1),
  bidId: z.string().min(1),
});

export const addShippingBidSchema = z.object({
  orderId: z.string().min(1),
  vendorName: z.string().min(1),
  quotedPrice: z.string().min(1),
  internalNote: z.string().optional(),
});

export type AddShippingBidInput = z.infer<typeof addShippingBidSchema>;

export const quoteIdSchema = z.object({
  quoteId: z.string().min(1),
});

export const updateQuoteStatusSchema = z.object({
  status: z.string().min(1),
});

export const updateQuoteItemPriceSchema = z.object({
  agreedPrice: z.string().min(1),
});

export const sendQuoteMessageSchema = z.object({
  message: z.string().min(1),
});

export const createAdminQuoteSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.email().optional().nullable(),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  vatRate: z.number().default(10),
  expirationDate: z.coerce.date().optional().nullable(),
  items: z.array(z.record(z.string(), z.unknown())),
});

export type CreateAdminQuoteInput = z.infer<typeof createAdminQuoteSchema>;
