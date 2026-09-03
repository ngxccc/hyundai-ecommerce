import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { and, eq, inArray } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "../../../database/database.module";
import { bookings, showSeats, tickets } from "../../../database/schemas";
import { BOOKING_QUEUES } from "../booking.constants";

export interface CancelBookingJobData {
  bookingId: string;
}

@Processor(BOOKING_QUEUES.BOOKING)
export class BookingCancellationProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingCancellationProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {
    super();
  }

  async process(job: Job<CancelBookingJobData>): Promise<void> {
    const { bookingId } = job.data;
    this.logger.debug(
      `Processing delayed booking cancellation for: ${bookingId}`,
    );

    await this.db.transaction(async (tx) => {
      // Mark booking as expired if still pending_payment
      const [updatedBooking] = await tx
        .update(bookings)
        .set({ status: "expired" })
        .where(
          and(
            eq(bookings.id, bookingId),
            eq(bookings.status, "pending_payment"),
          ),
        )
        .returning({ id: bookings.id });

      if (!updatedBooking) {
        this.logger.debug(
          `Booking ${bookingId} was not in pending_payment state during update, cancellation skipped`,
        );
        return;
      }

      // Fetch linked tickets to find reserved show_seats
      const bookingTickets = await tx
        .select({ showSeatId: tickets.showSeatId })
        .from(tickets)
        .where(eq(tickets.bookingId, bookingId));

      if (bookingTickets.length > 0) {
        const showSeatIds = bookingTickets.map((t) => t.showSeatId);

        // Revert reserved seats to available
        await tx
          .update(showSeats)
          .set({
            status: "available",
            lockedUntil: null,
          })
          .where(
            and(
              inArray(showSeats.id, showSeatIds),
              eq(showSeats.status, "reserved"),
            ),
          );
      }

      this.logger.log(
        `Successfully expired booking ${bookingId} and released seats`,
      );
    });
  }
}
