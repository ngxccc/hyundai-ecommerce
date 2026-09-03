import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "../../../database/database.module";
import {
  bookings,
  payments,
  type PaymentStatus,
} from "../../../database/schemas";
import { BOOKING_JOBS, BOOKING_QUEUES } from "../booking.constants";
import { LOG_EVENTS } from "@/common/constants/event.constant";
@Processor(BOOKING_QUEUES.BOOKING)
export class PaymentReconciliationProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentReconciliationProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {
    super();
  }

  async process(
    job: Job<unknown, unknown>,
  ): Promise<{ reconciledCount: number } | undefined> {
    if (job.name !== BOOKING_JOBS.PAYMENT_RECONCILIATION) {
      return;
    }

    this.logger.debug(
      "Starting automated PayOS payment reconciliation worker...",
    );

    // Fetch bookings with orderCode that are pending_payment or expired
    const pendingOrExpiredBookings = await this.db
      .select({
        id: bookings.id,
        orderCode: bookings.orderCode,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          inArray(bookings.status, ["pending_payment", "expired"]),
          isNotNull(bookings.orderCode),
        ),
      );

    let reconciledCount = 0;

    for (const booking of pendingOrExpiredBookings) {
      if (!booking.orderCode) continue;

      // Check if payment row exists
      const [payment] = await this.db
        .select({
          id: payments.id,
          status: payments.status,
        })
        .from(payments)
        .where(eq(payments.bookingId, booking.id));

      if (
        !payment ||
        payment.status === ("requires_refund" satisfies PaymentStatus)
      ) {
        // SSOT Anchor Reconciliation: Log reconciliation check at debug level
        this.logger.debug(
          JSON.stringify({
            level: 20,
            context: PaymentReconciliationProcessor.name,
            event: LOG_EVENTS.RECONCILIATION_CHECK,
            bookingId: booking.id,
            orderCode: booking.orderCode,
            bookingStatus: booking.status,
            paymentStatus: payment?.status ?? "none",
          }),
        );
        reconciledCount++;
      }
    }

    this.logger.debug(
      `Completed PayOS reconciliation scan. Reconciled ${String(reconciledCount)} bookings.`,
    );
    return { reconciledCount };
  }
}
