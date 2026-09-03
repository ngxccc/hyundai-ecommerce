import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { eq, inArray, and, sql } from "drizzle-orm";
import { ReserveSeatsDto } from "./dto/reserve-seats.dto";
import {
  ConfirmBookingDto,
  ConfirmBookingResponseDto,
} from "./dto/confirm-booking.dto";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "../../database/database.module";
import {
  bookings,
  showSeats,
  shows,
  tickets,
  payments,
  outboxEvents,
} from "../../database/schemas";
import { RedlockService } from "../../common/services/redlock.service";
import { randomBytes } from "node:crypto";
import { getExpiryDate } from "@/common/utils/date.util";
import { generatePayOSOrderCode } from "@/common/utils/payos-crypto.util";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";
import {
  LOG_EVENTS,
  OUTBOX_EVENT_TYPE,
} from "@/common/constants/event.constant";
import { BOOKING_JOBS, BOOKING_CONFIG, REDIS_KEYS } from "./booking.constants";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    private readonly redlockService: RedlockService,
    @InjectQueue(QUEUE_NAMES.BOOKING)
    private readonly bookingQueue: Queue,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async reserveSeats(
    userId: string,
    dto: ReserveSeatsDto,
    idempotencyKey?: string,
  ) {
    if (dto.seatIds.length === 0) {
      throw new NotFoundException(
        this.i18n.t("booking.SEAT_NOT_BELONG_TO_SHOWTIME"),
      );
    }

    const sortedSeatIds = [...dto.seatIds].sort();
    const redis = this.redlockService.getRedisClient();

    // 1. Idempotency Check
    if (idempotencyKey) {
      try {
        const cached = await redis.get(
          REDIS_KEYS.bookingIdempotency(userId, idempotencyKey),
        );
        if (cached) {
          return JSON.parse(cached) as Record<string, unknown>;
        }
      } catch {
        // WHY: Fail-open on idempotency read errors so Redis stream connection blips do not fail user requests with 500.
      }
    }

    // 2. Redlock Acquisition (RAM Layer Lock)
    const lockResources = sortedSeatIds.map((seatId: string) =>
      REDIS_KEYS.showSeatLock(seatId),
    );
    let lock;
    try {
      lock = await this.redlockService.acquireLock(lockResources, 2000);
    } catch {
      throw new ConflictException(this.i18n.t("booking.SEATS_ALREADY_LOCKED"));
    }

    try {
      const now = new Date();
      const lockedUntil = getExpiryDate("10m");

      // 3. Database Transaction with Pessimistic Locking (SELECT ... FOR UPDATE)
      const result = await this.db.transaction(async (tx) => {
        // Validate show exists
        const [show] = await tx
          .select({
            id: shows.id,
            basePrice: shows.basePrice,
          })
          .from(shows)
          .where(eq(shows.id, dto.showId));

        if (!show) {
          throw new NotFoundException(
            this.i18n.t("booking.SHOWTIME_NOT_FOUND"),
          );
        }

        // Fetch show seats with FOR UPDATE lock
        const selectedSeats = await tx
          .select({
            id: showSeats.id,
            seatId: showSeats.seatId,
            status: showSeats.status,
            lockedUntil: showSeats.lockedUntil,
          })
          .from(showSeats)
          .where(
            and(
              eq(showSeats.showId, dto.showId),
              inArray(showSeats.seatId, sortedSeatIds),
            ),
          )
          .for("update");

        if (selectedSeats.length !== sortedSeatIds.length) {
          throw new NotFoundException(
            this.i18n.t("booking.SEAT_NOT_BELONG_TO_SHOWTIME"),
          );
        }

        // Verify all seats are available or expired
        const unavailable = selectedSeats.find((seat) => {
          if (seat.status === "booked") return true;
          if (
            seat.status === "reserved" &&
            seat.lockedUntil &&
            seat.lockedUntil > now
          ) {
            return true;
          }
          return false;
        });

        if (unavailable) {
          throw new ConflictException(
            this.i18n.t("booking.SEATS_NOT_AVAILABLE"),
          );
        }

        // Update show seats status to reserved
        await tx
          .update(showSeats)
          .set({
            status: "reserved",
            lockedUntil,
          })
          .where(
            and(
              eq(showSeats.showId, dto.showId),
              inArray(showSeats.seatId, sortedSeatIds),
            ),
          );

        // Calculate pricing
        const totalPrice = show.basePrice * sortedSeatIds.length;

        // Create booking record
        const [booking] = await tx
          .insert(bookings)
          .values({
            userId,
            showId: dto.showId,
            orderCode: generatePayOSOrderCode(),
            originalPrice: totalPrice,
            discountPrice: 0,
            totalPrice,
            status: "pending_payment",
            expiresAt: lockedUntil,
          })
          .returning({
            id: bookings.id,
            totalPrice: bookings.totalPrice,
            status: bookings.status,
          });

        if (!booking) {
          throw new ConflictException(this.i18n.t("booking.BOOKING_FAILED"));
        }

        // Create tickets
        const ticketValues = selectedSeats.map((seat) => ({
          bookingId: booking.id,
          showSeatId: seat.id,
          ticketCode: `TKT-${randomBytes(4).toString("hex").toUpperCase()}`,
          finalPrice: show.basePrice,
        }));

        await tx.insert(tickets).values(ticketValues);

        return {
          bookingId: booking.id,
          showId: dto.showId,
          totalPrice: booking.totalPrice,
          status: booking.status,
          expiresAt: lockedUntil.toISOString(),
          seats: sortedSeatIds,
        };
      });

      // 4. Enqueue BullMQ delayed cancellation job (600,000ms = 10 min)
      await this.bookingQueue.add(
        BOOKING_JOBS.CANCEL_BOOKING,
        { bookingId: result.bookingId },
        {
          delay: BOOKING_CONFIG.CANCEL_JOB_DELAY_MS,
          jobId: REDIS_KEYS.cancelBookingJobId(result.bookingId),
        },
      );

      // 5. Cache Idempotency Key (60s)
      if (idempotencyKey) {
        try {
          await redis.setex(
            REDIS_KEYS.bookingIdempotency(userId, idempotencyKey),
            BOOKING_CONFIG.IDEMPOTENCY_TTL_SECONDS,
            JSON.stringify(result),
          );
        } catch {
          // WHY: Fail-open on idempotency write errors to prevent Redis connection blips from throwing unhandled exceptions.
        }
      }

      return result;
    } finally {
      // Release Redlock in all code paths
      await this.redlockService.releaseLock(lock);
    }
  }

  async confirmBooking(
    userId: string,
    dto: ConfirmBookingDto,
    idempotencyKey?: string,
  ): Promise<ConfirmBookingResponseDto> {
    const redis = this.redlockService.getRedisClient();
    if (idempotencyKey) {
      try {
        const cached = await redis.get(
          REDIS_KEYS.confirmIdempotency(userId, idempotencyKey),
        );
        if (cached) {
          return JSON.parse(cached) as ConfirmBookingResponseDto;
        }
      } catch (err) {
        // INV-7: Graceful degradation to DB transaction on Redis connection loss
        this.logger.warn(
          `Redis Idempotency Check Bypassed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 2. Database Transaction with Pessimistic Locking & Statement Timeout (INV-1, INV-5, INV-8)
    const result = await this.db.transaction(async (tx) => {
      // Statement Timeout Guard (INV-8: 3000ms)
      await tx.execute(sql`SET LOCAL statement_timeout = 3000`);

      // Fetch booking row with SELECT ... FOR UPDATE (INV-1) and Strict Ownership (INV-5)
      const [booking] = await tx
        .select({
          id: bookings.id,
          userId: bookings.userId,
          showId: bookings.showId,
          orderCode: bookings.orderCode,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          expiresAt: bookings.expiresAt,
          updatedAt: bookings.updatedAt,
        })
        .from(bookings)
        .where(and(eq(bookings.id, dto.bookingId), eq(bookings.userId, userId)))
        .for("update");
      // INV-5: Anti-Enumeration Defense (Return 404 instead of 403 on missing or unauthorized booking)
      if (!booking) {
        throw new NotFoundException(this.i18n.t("booking.BOOKING_NOT_FOUND"));
      }

      // Check if already confirmed (Idempotent 200 OK)
      if (booking.status === "confirmed") {
        const [existingPayment] = await tx
          .select({
            id: payments.id,
            transactionId: payments.transactionId,
          })
          .from(payments)
          .where(eq(payments.bookingId, booking.id));

        const bookedTickets = await tx
          .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            showSeatId: tickets.showSeatId,
            finalPrice: tickets.finalPrice,
          })
          .from(tickets)
          .where(eq(tickets.bookingId, booking.id));

        return {
          bookingId: booking.id,
          paymentId: existingPayment?.id ?? "",
          transactionId: existingPayment?.transactionId ?? dto.transactionId,
          status: "confirmed" as const,
          confirmedAt: booking.updatedAt.toISOString(),
          totalPrice: booking.totalPrice,
          tickets: bookedTickets.map((t) => ({
            ticketId: t.id,
            ticketCode: t.ticketCode,
            showSeatId: t.showSeatId,
            finalPrice: t.finalPrice,
          })),
        };
      }

      // Check status invalidity (EDGE-2)
      if (
        booking.status === "cancelled" ||
        booking.status === "expired" ||
        booking.expiresAt < new Date()
      ) {
        if (booking.status === "pending_payment") {
          await tx
            .update(bookings)
            .set({ status: "expired" })
            .where(eq(bookings.id, booking.id));
        }
        throw new GoneException(this.i18n.t("booking.BOOKING_EXPIRED"));
      }

      // Check unique transactionId constraint first (EDGE-3)
      const [existingTx] = await tx
        .select({
          id: payments.id,
        })
        .from(payments)
        .where(eq(payments.transactionId, dto.transactionId));

      if (existingTx) {
        throw new ConflictException(
          this.i18n.t("booking.DUPLICATE_TRANSACTION"),
        );
      }

      // EDGE-1 & INV-3: Amount Matching Safeguard
      if (dto.amount !== booking.totalPrice) {
        // Record transaction as requires_refund for automated PayOS refund worker
        await tx.insert(payments).values({
          bookingId: booking.id,
          paymentMethod: "PAYOS",
          transactionId: dto.transactionId,
          amount: dto.amount,
          status: "requires_refund",
        });
        throw new BadRequestException(
          this.i18n.t("booking.PAYMENT_AMOUNT_MISMATCH"),
        );
      }

      // Insert Completed Payment Record
      const [payment] = await tx
        .insert(payments)
        .values({
          bookingId: booking.id,
          paymentMethod: "PAYOS",
          transactionId: dto.transactionId,
          amount: dto.amount,
          status: "completed",
        })
        .returning({
          id: payments.id,
          transactionId: payments.transactionId,
        });

      if (!payment) {
        throw new BadRequestException(
          this.i18n.t("booking.RECORD_PAYMENT_FAILED"),
        );
      }

      // Update Booking Status to Confirmed & Store PayOS order_code
      await tx
        .update(bookings)
        .set({
          status: "confirmed",
          orderCode: booking.orderCode ?? dto.orderCode,
        })
        .where(eq(bookings.id, booking.id));

      // Fetch tickets created
      const bookedTickets = await tx
        .select({
          id: tickets.id,
          ticketCode: tickets.ticketCode,
          showSeatId: tickets.showSeatId,
          finalPrice: tickets.finalPrice,
        })
        .from(tickets)
        .where(eq(tickets.bookingId, booking.id));

      // Update Seats from reserved -> booked
      if (bookedTickets.length > 0) {
        const seatIds = bookedTickets.map((t) => t.showSeatId);
        await tx
          .update(showSeats)
          .set({
            status: "booked",
            lockedUntil: null,
          })
          .where(inArray(showSeats.id, seatIds));
      }

      // INV-2: Transactional Dual-Write Outbox Event insertion inside same DB transaction
      const confirmedAt = new Date().toISOString();
      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.BOOKING_CONFIRMED,
        payload: {
          bookingId: booking.id,
          userId: booking.userId,
          showId: booking.showId,
          paymentId: payment.id,
          transactionId: payment.transactionId,
          orderCode: booking.orderCode ?? dto.orderCode,
          totalPrice: booking.totalPrice,
          confirmedAt,
          tickets: bookedTickets.map((t) => ({
            ticketId: t.id,
            ticketCode: t.ticketCode,
            showSeatId: t.showSeatId,
            finalPrice: t.finalPrice,
          })),
        },
        status: "pending",
      });

      // INV-8: Structured JSON Logger Observability
      this.logger.log(
        JSON.stringify({
          level: 30,
          context: BookingService.name,
          event: LOG_EVENTS.PAYMENT_CONFIRMED_SUCCESS,
          bookingId: booking.id,
          orderCode: booking.orderCode ?? dto.orderCode,
          userId,
          amount: dto.amount,
          confirmedAt,
        }),
      );

      return {
        bookingId: booking.id,
        paymentId: payment.id,
        transactionId: dto.transactionId,
        status: "confirmed" as const,
        confirmedAt,
        totalPrice: booking.totalPrice,
        tickets: bookedTickets.map((t) => ({
          ticketId: t.id,
          ticketCode: t.ticketCode,
          showSeatId: t.showSeatId,
          finalPrice: t.finalPrice,
        })),
      };
    });

    // 3. Post-Transaction: Remove Delayed BullMQ Cancellation Job (INV-3)
    try {
      const job = await this.bookingQueue.getJob(
        REDIS_KEYS.cancelBookingJobId(result.bookingId),
      );
      if (job) {
        await job.remove();
      }
    } catch (err) {
      this.logger.warn(
        `Failed to remove delayed cancellation job for booking ${result.bookingId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 4. Cache Idempotency Key (60s)
    if (idempotencyKey) {
      try {
        await redis.setex(
          REDIS_KEYS.confirmIdempotency(userId, idempotencyKey),
          BOOKING_CONFIG.IDEMPOTENCY_TTL_SECONDS,
          JSON.stringify(result),
        );
      } catch {
        // WHY: Fail-open on idempotency write errors to prevent Redis connection blips from throwing unhandled exceptions.
      }
    }

    return result;
  }
}
