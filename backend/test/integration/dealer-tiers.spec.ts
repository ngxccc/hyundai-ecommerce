import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import request from "supertest";
import { type INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { type DrizzleDB } from "@/database/database.module";
import { dealerTiers } from "@/database/schemas";

interface DealerTierResponseBody {
  id: string;
  nameVi: string;
  nameEn: string | null;
  discountPercentage: string;
  minimumSpend: string;
}

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface Rfc9457ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

describe("Dealer Tiers Module Integration", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;

  const getHttpServer = (): Server => app.getHttpServer() as unknown as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
  }, 30000);

  afterAll(async () => {
    await teardownTestApp(setup);
  }, 30000);

  beforeEach(async () => {
    await db.delete(dealerTiers);
  }, 15000);

  describe("GET /dealer-tiers", () => {
    describe("when dealer tiers exist in database", () => {
      it("should return 200 OK with tiers ordered by minimumSpend ascending", async () => {
        const tier1Id = randomUUID();
        const tier2Id = randomUUID();

        await db.insert(dealerTiers).values([
          {
            id: tier2Id,
            nameVi: "Đại lý Vàng",
            nameEn: "Gold Dealer",
            discountPercentage: "15.00",
            minimumSpend: "50000000.00",
          },
          {
            id: tier1Id,
            nameVi: "Đại lý Bạc",
            nameEn: "Silver Dealer",
            discountPercentage: "10.00",
            minimumSpend: "10000000.00",
          },
        ]);

        const res = await request(getHttpServer()).get("/dealer-tiers");

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          DealerTierResponseBody[]
        >;
        expect(body.success).toBe(true);
        expect(body.data.length).toBe(2);
        // Assert ordering by minimumSpend ascending
        expect(body.data[0]!.id).toBe(tier1Id);
        expect(body.data[0]!.nameVi).toBe("Đại lý Bạc");
        expect(body.data[1]!.id).toBe(tier2Id);
        expect(body.data[1]!.nameVi).toBe("Đại lý Vàng");
      });
    });

    describe("when no dealer tiers exist", () => {
      it("should return 200 OK with an empty array", async () => {
        const res = await request(getHttpServer()).get("/dealer-tiers");

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          DealerTierResponseBody[]
        >;
        expect(body.success).toBe(true);
        expect(body.data).toEqual([]);
      });
    });
  });

  describe("GET /dealer-tiers/:id", () => {
    describe("when requesting an existing tier by UUID", () => {
      it("should return 200 OK with the corresponding tier payload", async () => {
        const tierId = randomUUID();
        await db.insert(dealerTiers).values({
          id: tierId,
          nameVi: "Đại lý Kim Cương",
          nameEn: "Diamond Dealer",
          discountPercentage: "20.00",
          minimumSpend: "100000000.00",
        });

        const res = await request(getHttpServer()).get(
          `/dealer-tiers/${tierId}`,
        );

        expect(res.status).toBe(200);
        const body =
          res.body as unknown as GenericSuccessResponse<DealerTierResponseBody>;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(tierId);
        expect(body.data.nameVi).toBe("Đại lý Kim Cương");
        expect(body.data.discountPercentage).toBe("20.00");
      });
    });

    describe("when tier does not exist", () => {
      it("should return 404 Not Found in RFC 9457 format", async () => {
        const nonExistentId = randomUUID();
        const res = await request(getHttpServer()).get(
          `/dealer-tiers/${nonExistentId}`,
        );

        expect(res.status).toBe(404);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(404);
        expect(body.title).toBe("Not Found");
        expect(body.detail).toContain(
          `Dealer tier with id "${nonExistentId}" not found`,
        );
      });
    });

    describe("when ID parameter is malformed", () => {
      it("should return 400 Bad Request when id is not a valid UUID", async () => {
        const res = await request(getHttpServer()).get(
          "/dealer-tiers/invalid-uuid-123",
        );

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(400);
        expect(body.title).toBe("Bad Request");
      });
    });
  });
});
