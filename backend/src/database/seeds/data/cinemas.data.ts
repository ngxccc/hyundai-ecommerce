import type { NewCinema, NewHall } from "@/database/schemas";

export type SeedHallConfig = Pick<NewHall, "name" | "totalSeats">;

export type SeedCinemaData = Omit<
  NewCinema,
  "id" | "createdAt" | "updatedAt"
> & {
  halls: SeedHallConfig[];
};

/**
 * Authentic Vietnamese cinema venues across Ho Chi Minh City, Ha Noi, and Da Nang.
 */
export const SEED_CINEMAS_DATA: SeedCinemaData[] = [
  {
    name: "CineStar Landmark Saigon",
    city: "Thành phố Hồ Chí Minh",
    ward: "Phường Bến Nghé",
    streetAddress: "72 Lê Thánh Tôn, Quận 1",
    postalCode: "700000",
    latitude: "10.77800000",
    longitude: "106.70200000",
    halls: [
      { name: "Phòng chiếu 01 (Standard)", totalSeats: 80 },
      { name: "Phòng chiếu 02 (IMAX Laser)", totalSeats: 80 },
      { name: "Phòng chiếu 03 (Gold Class)", totalSeats: 80 },
    ],
  },
  {
    name: "CineStar Royal City Hanoi",
    city: "Hà Nội",
    ward: "Phường Thượng Đình",
    streetAddress: "72A Nguyễn Trãi, Quận Thanh Xuân",
    postalCode: "100000",
    latitude: "20.99800000",
    longitude: "105.81600000",
    halls: [
      { name: "Phòng chiếu 01 (Standard)", totalSeats: 80 },
      { name: "Phòng chiếu 02 (VIP Premiere)", totalSeats: 80 },
    ],
  },
  {
    name: "CineStar Riverside Da Nang",
    city: "Đà Nẵng",
    ward: "Phường Hải Châu 1",
    streetAddress: "123 Bạch Đằng, Quận Hải Châu",
    postalCode: "550000",
    latitude: "16.06800000",
    longitude: "108.22300000",
    halls: [
      { name: "Phòng chiếu 01 (Standard)", totalSeats: 80 },
      { name: "Phòng chiếu 02 (Gold Class)", totalSeats: 80 },
    ],
  },
];
