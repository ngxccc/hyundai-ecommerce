import { type User } from "../schemas/auth.schema";

export type UserProfileDTO = Omit<
  User,
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
  User,
  "emailVerified" | "image" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type UserB2BProfileDTO = Omit<
  User,
  | "password"
  | "emailVerified"
  | "image"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
