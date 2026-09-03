import type { NewUser } from "@/database/schemas";

/**
 * System and test user accounts populated during Tier 1 database seeding.
 */
export const SEED_USERS_DATA: (Omit<NewUser, "id" | "passwordHash"> & {
  plainPassword?: string;
})[] = [
  {
    email: "admin@ticketbooking.com",
    fullName: "System Administrator",
    phoneNumber: "0901234567",
    role: "admin",
    status: "active",
  },
  {
    email: "staff@ticketbooking.com",
    fullName: "Cinema Staff Manager",
    phoneNumber: "0902345678",
    role: "staff",
    status: "active",
  },
  {
    email: "user@ticketbooking.com",
    fullName: "Standard Moviegoer",
    phoneNumber: "0903456789",
    role: "user",
    status: "active",
  },
];
