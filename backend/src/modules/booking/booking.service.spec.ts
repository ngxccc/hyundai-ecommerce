import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  BadRequestException,
  ConflictException,
  GoneException,
  NotFoundException,
} from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { BookingService } from "./booking.service";
import type { DrizzleDB } from "../../database/database.module";
import type { RedlockService } from "../../common/services/redlock.service";
import type { Queue } from "bullmq";
import type { ConfirmBookingDto } from "./dto/confirm-booking.dto";
import {
  createMockI18nService,
  createMockRedlockService,
  createMockQueue,
} from "../../../test/mocks";

interface MockTx {
  select: ReturnType<typeof mock>;
  update: ReturnType<typeof mock>;
  insert: ReturnType<typeof mock>;
  execute: ReturnType<typeof mock>;
}

interface MockDb {
  transaction: ReturnType<typeof mock>;
}

interface MockBookingQueue {
  add: ReturnType<typeof mock>;
  getJob: ReturnType<typeof mock>;
  clearAll: () => void;
}

describe("BookingService", () => {
  let service: BookingService;
  const mockI18nService = createMockI18nService();
  let mockRedlockService: ReturnType<typeof createMockRedlockService>;
  let mockBookingQueue: MockBookingQueue;
  let mockRedis: typeof mockRedlockService.mockRedis;
  let mockTx: MockTx;
  let mockDb: MockDb;

  beforeEach(() => {
    mockI18nService.clearAll();
    mockRedlockService = createMockRedlockService();
    mockRedis = mockRedlockService.mockRedis;
    const baseQueue = createMockQueue();
    mockBookingQueue = {
      ...baseQueue,
      getJob: mock(() =>
        Promise.resolve({ remove: mock(() => Promise.resolve()) }),
      ),
    };
    mockTx = {
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => {
            const resPromise = Promise.resolve([]);
            return Object.assign(resPromise, {
              for: mock(() => Promise.resolve([])),
            });
          }),
        })),
      })),
      update: mock(() => ({
        set: mock(() => ({
          where: mock(() => Promise.resolve([])),
        })),
      })),
      insert: mock(() => ({
        values: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      })),
      execute: mock(() => Promise.resolve()),
    };

    mockDb = {
      transaction: mock((cb: (tx: MockTx) => Promise<unknown>) => cb(mockTx)),
    };

    service = new BookingService(
      mockDb as unknown as DrizzleDB,
      mockRedlockService as unknown as RedlockService,
      mockBookingQueue as unknown as Queue,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("when reserving seats", () => {
    const userId = "user-uuid-123";
    const dto = {
      showId: "show-uuid-456",
      seatIds: ["seat-1", "seat-2"],
    };

    it("should throw NotFoundException when seatIds is empty array", () => {
      expect(
        service.reserveSeats(userId, { ...dto, seatIds: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return cached payload when idempotencyKey is found for user", async () => {
      const cachedResult = { bookingId: "cached-booking-123" };
      mockRedis.get.mockImplementation(() =>
        Promise.resolve(JSON.stringify(cachedResult)),
      );

      const result = await service.reserveSeats(userId, dto, "idempotency-123");

      expect(result).toEqual(cachedResult);
      expect(mockRedis.get).toHaveBeenCalledWith(
        `idempotency:booking:${userId}:idempotency-123`,
      );
      expect(mockRedlockService.acquireLock).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when redlock acquisition fails", () => {
      mockRedlockService.acquireLock.mockImplementation(() =>
        Promise.reject(new Error("Lock failed")),
      );

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw NotFoundException when showtime is not found", () => {
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => Promise.resolve([])),
        })),
      }));

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when selected seats count does not match dto", () => {
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when requested seat is already booked", () => {
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
              { id: "ss-2", seatId: "seat-2", status: "booked" },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException when requested seat is reserved and not expired", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
              {
                id: "ss-2",
                seatId: "seat-2",
                status: "reserved",
                lockedUntil: futureDate,
              },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should allow reservation if seat status is reserved but lockedUntil is null or past", async () => {
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
              {
                id: "ss-2",
                seatId: "seat-2",
                status: "reserved",
                lockedUntil: null,
              },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      mockTx.insert.mockImplementation(() => ({
        values: mock(() => ({
          returning: mock(() =>
            Promise.resolve([
              {
                id: "booking-789",
                totalPrice: 200000,
                status: "pending_payment",
              },
            ]),
          ),
        })),
      }));

      const result = await service.reserveSeats(userId, dto);
      expect(result).toBeDefined();
      expect(result.bookingId).toBe("booking-789");
    });

    it("should throw ConflictException when booking creation returns empty", () => {
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
              { id: "ss-2", seatId: "seat-2", status: "available" },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      mockTx.insert.mockImplementation(() => ({
        values: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      }));

      expect(service.reserveSeats(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should successfully reserve seats, update DB, enqueue cancellation job, and set user-namespaced idempotency cache", async () => {
      let callCount = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{ id: dto.showId, basePrice: 100000 }]);
            }
            const resPromise = Promise.resolve([
              { id: "ss-1", seatId: "seat-1", status: "available" },
              { id: "ss-2", seatId: "seat-2", status: "available" },
            ]);
            return Object.assign(resPromise, {
              for: mock(() => resPromise),
            });
          }),
        })),
      }));

      mockTx.insert.mockImplementation(() => ({
        values: mock(() => ({
          returning: mock(() =>
            Promise.resolve([
              {
                id: "booking-789",
                totalPrice: 200000,
                status: "pending_payment",
              },
            ]),
          ),
        })),
      }));

      const result = await service.reserveSeats(
        userId,
        dto,
        "idempotency-key-xyz",
      );

      expect(result).toBeDefined();
      expect(result.bookingId).toBe("booking-789");
      expect(result.totalPrice).toBe(200000);
      expect(result.status).toBe("pending_payment");
      expect(mockBookingQueue.add).toHaveBeenCalledWith(
        "cancel-booking",
        { bookingId: "booking-789" },
        expect.objectContaining({ delay: 600000 }),
      );
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `idempotency:booking:${userId}:idempotency-key-xyz`,
        60,
        JSON.stringify(result),
      );
      expect(mockRedlockService.releaseLock).toHaveBeenCalled();
    });
  });

  describe("when confirming bookings", () => {
    const userId = "user-uuid-123";
    const confirmDto: ConfirmBookingDto = {
      bookingId: "booking-uuid-789",
      transactionId: "tx-payos-999",
      orderCode: 123456,
      amount: 200000,
      paymentMethod: "PAYOS",
    };

    it("should return cached payload when idempotencyKey exists in cache", async () => {
      const cachedResult = {
        bookingId: confirmDto.bookingId,
        paymentId: "pay-123",
        transactionId: confirmDto.transactionId,
        status: "confirmed" as const,
        confirmedAt: new Date().toISOString(),
        totalPrice: 200000,
        tickets: [],
      };
      mockRedis.get.mockImplementation(() =>
        Promise.resolve(JSON.stringify(cachedResult)),
      );

      const result = await service.confirmBooking(
        userId,
        confirmDto,
        "idempotency-key-confirm",
      );

      expect(result).toEqual(cachedResult);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it("should bypass redis cache and proceed to transaction when redis get throws error", async () => {
      mockRedis.get.mockImplementation(() =>
        Promise.reject(new Error("Redis offline")),
      );

      const mockBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 200000,
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 600000),
        updatedAt: new Date(),
      };

      let selectCalls = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            selectCalls++;
            if (selectCalls === 1) {
              const res = Promise.resolve([mockBooking]);
              return Object.assign(res, { for: () => res });
            }
            if (selectCalls === 2) {
              return Promise.resolve([]); // existingTx check
            }
            return Promise.resolve([
              {
                id: "ticket-1",
                ticketCode: "TCK-1",
                showSeatId: "ss-1",
                finalPrice: 200000,
              },
            ]);
          }),
        })),
      }));

      mockTx.insert.mockImplementation(() => ({
        values: mock(() => ({
          returning: mock(() =>
            Promise.resolve([
              { id: "pay-1", transactionId: confirmDto.transactionId },
            ]),
          ),
        })),
      }));

      const result = await service.confirmBooking(
        userId,
        confirmDto,
        "idempotency-err-key",
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("confirmed");
      expect(result.bookingId).toBe(confirmDto.bookingId);
    });

    it("should throw NotFoundException when booking is not found or belongs to another user", () => {
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            const res = Promise.resolve([]);
            return Object.assign(res, { for: () => res });
          }),
        })),
      }));

      expect(service.confirmBooking(userId, confirmDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return existing payment when booking is already confirmed", async () => {
      const mockBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 200000,
        status: "confirmed",
        expiresAt: new Date(Date.now() + 600000),
        updatedAt: new Date(),
      };

      let selectCalls = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            selectCalls++;
            if (selectCalls === 1) {
              const res = Promise.resolve([mockBooking]);
              return Object.assign(res, { for: () => res });
            }
            if (selectCalls === 2) {
              return Promise.resolve([
                { id: "existing-pay-1", transactionId: "existing-tx-123" },
              ]);
            }
            return Promise.resolve([
              {
                id: "ticket-1",
                ticketCode: "TCK-1",
                showSeatId: "ss-1",
                finalPrice: 200000,
              },
            ]);
          }),
        })),
      }));

      const result = await service.confirmBooking(userId, confirmDto);

      expect(result).toBeDefined();
      expect(result.status).toBe("confirmed");
      expect(result.paymentId).toBe("existing-pay-1");
    });

    it("should throw GoneException when booking is cancelled or expired", () => {
      const mockExpiredBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 200000,
        status: "pending_payment",
        expiresAt: new Date(Date.now() - 10000), // expired
        updatedAt: new Date(),
      };

      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            const res = Promise.resolve([mockExpiredBooking]);
            return Object.assign(res, { for: () => res });
          }),
        })),
      }));

      expect(service.confirmBooking(userId, confirmDto)).rejects.toThrow(
        GoneException,
      );
    });

    it("should throw ConflictException when transactionId already exists for another payment", () => {
      const mockBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 200000,
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 600000),
        updatedAt: new Date(),
      };

      let selectCalls = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            selectCalls++;
            if (selectCalls === 1) {
              const res = Promise.resolve([mockBooking]);
              return Object.assign(res, { for: () => res });
            }
            return Promise.resolve([{ id: "duplicate-pay-id" }]);
          }),
        })),
      }));

      expect(service.confirmBooking(userId, confirmDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw BadRequestException and record requires_refund payment when amount mismatches", () => {
      const mockBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 500000, // mismatch with confirmDto.amount (200000)
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 600000),
        updatedAt: new Date(),
      };

      let selectCalls = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            selectCalls++;
            if (selectCalls === 1) {
              const res = Promise.resolve([mockBooking]);
              return Object.assign(res, { for: () => res });
            }
            return Promise.resolve([]); // existingTx check
          }),
        })),
      }));

      expect(service.confirmBooking(userId, confirmDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTx.insert).toHaveBeenCalled();
    });

    it("should confirm booking, update seats, create outbox event, and remove delayed queue job when payment is valid", async () => {
      const mockBooking = {
        id: confirmDto.bookingId,
        userId,
        showId: "show-1",
        orderCode: 123456,
        totalPrice: 200000,
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 600000),
        updatedAt: new Date(),
      };

      let selectCalls = 0;
      mockTx.select.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            selectCalls++;
            if (selectCalls === 1) {
              const res = Promise.resolve([mockBooking]);
              return Object.assign(res, { for: () => res });
            }
            if (selectCalls === 2) {
              return Promise.resolve([]); // existingTx check
            }
            return Promise.resolve([
              {
                id: "ticket-1",
                ticketCode: "TCK-1",
                showSeatId: "ss-1",
                finalPrice: 200000,
              },
            ]);
          }),
        })),
      }));

      mockTx.insert.mockImplementation(() => ({
        values: mock(() => ({
          returning: mock(() =>
            Promise.resolve([
              { id: "pay-1", transactionId: confirmDto.transactionId },
            ]),
          ),
        })),
      }));

      const removeMock = mock(() => Promise.resolve());
      mockBookingQueue.getJob.mockImplementation(() =>
        Promise.resolve({ remove: removeMock }),
      );

      const result = await service.confirmBooking(
        userId,
        confirmDto,
        "idempotency-key-success",
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("confirmed");
      expect(result.bookingId).toBe(confirmDto.bookingId);
      expect(result.paymentId).toBe("pay-1");
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalled();
      expect(removeMock).toHaveBeenCalledTimes(1);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `idempotency:confirm:${userId}:idempotency-key-success`,
        60,
        JSON.stringify(result),
      );
    });
  });
});
