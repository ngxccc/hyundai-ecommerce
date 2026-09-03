import type { NewSeatType } from "@/database/schemas";

/**
 * Standard cinema seat types and dynamic pricing multipliers populated during Tier 1 seeding.
 */
export const SEAT_TYPES_DATA: Omit<NewSeatType, "id">[] = [
  {
    name: "Standard",
    priceMultiplier: "1.00",
  },
  {
    name: "VIP",
    priceMultiplier: "1.20",
  },
  {
    name: "Couple",
    priceMultiplier: "2.00",
  },
];
