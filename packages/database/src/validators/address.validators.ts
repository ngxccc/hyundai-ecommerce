import { z } from "zod";

export const addressSchema = z.object({
  receiverName: z.string().min(2, "validation.receiverNameMin"),
  phoneNumber: z
    .string()
    .min(10, "validation.phoneInvalid")
    .max(10, "validation.phoneInvalid"),
  streetAddress: z.string().min(1, "validation.streetAddressRequired"),
  district: z.string().min(1, "validation.districtRequired"),
  city: z.string().min(1, "validation.cityRequired"),
  isDefault: z.boolean().default(false),
});

export type TAddressForm = z.infer<typeof addressSchema>;
