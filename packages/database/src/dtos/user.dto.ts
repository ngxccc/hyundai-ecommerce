import { type TUser } from "../schemas/auth.schema";

export type UserProfileDTO = Omit<
  TUser,
  | "emailVerified"
  | "image"
  | "dealerTierId"
  | "creditLimit"
  | "currentDebt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type UserDTO = Omit<
  TUser,
  "emailVerified" | "image" | "createdAt" | "updatedAt" | "deletedAt"
>;
