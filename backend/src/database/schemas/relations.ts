import { defineRelations } from "drizzle-orm";
import type {
  PgTableWithColumns,
  PgUUIDBuilder,
  PgTextBuilder,
  PgIntegerBuilder,
  PgNumericBuilder,
  PgTimestampBuilder,
  PgBooleanBuilder,
  PgVarcharBuilder,
  PgDateStringBuilder,
  PgEnumColumnBuilder,
  PgBuildColumn,
} from "drizzle-orm/pg-core";
import { refreshTokens, users } from "./auth.schema";
import {
  bookingCombos,
  bookings,
  combos,
  tickets,
  vouchers,
} from "./bookings.schema";
import { cinemas, halls, seats, seatTypes } from "./cinemas.schema";
import {
  genres,
  movieGenres,
  movies,
  movieTranslations,
} from "./movies.schema";
import { payments } from "./payments.schema";
import { shows, showSeats } from "./shows.schema";

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */
export interface _PgTypeHelper {
  table?: PgTableWithColumns<any>;
  uuid?: PgUUIDBuilder;
  text?: PgTextBuilder<any>;
  int?: PgIntegerBuilder;
  num?: PgNumericBuilder;
  timestamp?: PgTimestampBuilder;
  bool?: PgBooleanBuilder;
  varchar?: PgVarcharBuilder<any>;
  date?: PgDateStringBuilder;
  enum?: PgEnumColumnBuilder<any>;
  col?: PgBuildColumn<any, any>;
}
/* eslint-enable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */

export const schemaRelations = defineRelations(
  {
    users,
    refreshTokens,
    movies,
    genres,
    movieGenres,
    movieTranslations,
    cinemas,
    halls,
    seatTypes,
    seats,
    shows,
    showSeats,
    vouchers,
    bookings,
    tickets,
    combos,
    bookingCombos,
    payments,
  },
  (r) => ({
    users: {
      refreshTokens: r.many.refreshTokens({
        from: r.users.id,
        to: r.refreshTokens.userId,
      }),
      bookings: r.many.bookings({
        from: r.users.id,
        to: r.bookings.userId,
      }),
    },

    refreshTokens: {
      user: r.one.users({
        from: r.refreshTokens.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    movies: {
      movieGenres: r.many.movieGenres({
        from: r.movies.id,
        to: r.movieGenres.movieId,
      }),
      translations: r.many.movieTranslations({
        from: r.movies.id,
        to: r.movieTranslations.movieId,
      }),
      shows: r.many.shows({
        from: r.movies.id,
        to: r.shows.movieId,
      }),
    },

    genres: {
      movieGenres: r.many.movieGenres({
        from: r.genres.id,
        to: r.movieGenres.genreId,
      }),
    },

    movieGenres: {
      movie: r.one.movies({
        from: r.movieGenres.movieId,
        to: r.movies.id,
        optional: false,
      }),
      genre: r.one.genres({
        from: r.movieGenres.genreId,
        to: r.genres.id,
        optional: false,
      }),
    },

    movieTranslations: {
      movie: r.one.movies({
        from: r.movieTranslations.movieId,
        to: r.movies.id,
        optional: false,
      }),
    },

    cinemas: {
      halls: r.many.halls({
        from: r.cinemas.id,
        to: r.halls.cinemaId,
      }),
    },

    halls: {
      cinema: r.one.cinemas({
        from: r.halls.cinemaId,
        to: r.cinemas.id,
        optional: false,
      }),
      seats: r.many.seats({
        from: r.halls.id,
        to: r.seats.hallId,
      }),
      shows: r.many.shows({
        from: r.halls.id,
        to: r.shows.hallId,
      }),
    },

    seatTypes: {
      seats: r.many.seats({
        from: r.seatTypes.id,
        to: r.seats.seatTypeId,
      }),
    },

    seats: {
      hall: r.one.halls({
        from: r.seats.hallId,
        to: r.halls.id,
        optional: false,
      }),
      seatType: r.one.seatTypes({
        from: r.seats.seatTypeId,
        to: r.seatTypes.id,
        optional: false,
      }),
      showSeats: r.many.showSeats({
        from: r.seats.id,
        to: r.showSeats.seatId,
      }),
    },

    shows: {
      movie: r.one.movies({
        from: r.shows.movieId,
        to: r.movies.id,
        optional: false,
      }),
      hall: r.one.halls({
        from: r.shows.hallId,
        to: r.halls.id,
        optional: false,
      }),
      showSeats: r.many.showSeats({
        from: r.shows.id,
        to: r.showSeats.showId,
      }),
      bookings: r.many.bookings({
        from: r.shows.id,
        to: r.bookings.showId,
      }),
    },

    showSeats: {
      show: r.one.shows({
        from: r.showSeats.showId,
        to: r.shows.id,
        optional: false,
      }),
      seat: r.one.seats({
        from: r.showSeats.seatId,
        to: r.seats.id,
        optional: false,
      }),
      tickets: r.many.tickets({
        from: r.showSeats.id,
        to: r.tickets.showSeatId,
      }),
    },

    vouchers: {
      bookings: r.many.bookings({
        from: r.vouchers.id,
        to: r.bookings.voucherId,
      }),
    },

    bookings: {
      user: r.one.users({
        from: r.bookings.userId,
        to: r.users.id,
        optional: false,
      }),
      show: r.one.shows({
        from: r.bookings.showId,
        to: r.shows.id,
        optional: false,
      }),
      voucher: r.one.vouchers({
        from: r.bookings.voucherId,
        to: r.vouchers.id,
        optional: true,
      }),
      tickets: r.many.tickets({
        from: r.bookings.id,
        to: r.tickets.bookingId,
      }),
      bookingCombos: r.many.bookingCombos({
        from: r.bookings.id,
        to: r.bookingCombos.bookingId,
      }),
      payments: r.many.payments({
        from: r.bookings.id,
        to: r.payments.bookingId,
      }),
    },

    tickets: {
      booking: r.one.bookings({
        from: r.tickets.bookingId,
        to: r.bookings.id,
        optional: false,
      }),
      showSeat: r.one.showSeats({
        from: r.tickets.showSeatId,
        to: r.showSeats.id,
        optional: false,
      }),
    },

    combos: {
      bookingCombos: r.many.bookingCombos({
        from: r.combos.id,
        to: r.bookingCombos.comboId,
      }),
    },

    bookingCombos: {
      booking: r.one.bookings({
        from: r.bookingCombos.bookingId,
        to: r.bookings.id,
        optional: false,
      }),
      combo: r.one.combos({
        from: r.bookingCombos.comboId,
        to: r.combos.id,
        optional: false,
      }),
    },

    payments: {
      booking: r.one.bookings({
        from: r.payments.bookingId,
        to: r.bookings.id,
        optional: false,
      }),
    },
  }),
);
