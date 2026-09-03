export interface TestUserFixture {
  id: string;
  email: string;
  token: string;
  ip: string;
}

export interface BookingLoadFixture {
  targetUrl: string;
  showId: string;
  targetSeatId: string;
  otherSeatIds: string[];
  totalVus: number;
  users: TestUserFixture[];
}
