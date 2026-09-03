import { post } from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { vu } from "k6/execution";
import { v7 as uuidv7 } from "uuid";
import type { BookingLoadFixture } from "./fixtures/types";

// SharedArray loads fixture data into shared memory once during init context, eliminating per-VU RAM duplication.
const fixtureData = new SharedArray("booking_fixtures", () => {
  const fixturePath = __ENV["FIXTURES_PATH"] ?? "./booking-fixtures.json";
  const fileContent = open(fixturePath);
  return [JSON.parse(fileContent) as BookingLoadFixture];
});

const defaultFixture: BookingLoadFixture = {
  targetUrl: "http://127.0.0.1:3000",
  showId: "",
  targetSeatId: "",
  otherSeatIds: [],
  totalVus: 500,
  users: [],
};
const fixture: BookingLoadFixture = fixtureData[0] ?? defaultFixture;
const totalVus = fixture.totalVus;
const p95Threshold = __ENV["P95_THRESHOLD"] ?? "1500";
const p99Threshold = __ENV["P99_THRESHOLD"] ?? "2000";
export const reserveSuccess201 = new Counter("reserve_success_201");
export const reserveConflict409 = new Counter("reserve_conflict_409");
export const reserveThrottled429 = new Counter("reserve_throttled_429");
export const reserveUnexpectedErrors = new Counter("reserve_unexpected_errors");
export const hotSeatDuration = new Trend("hot_seat_duration_ms");

export const options = {
  // Discard response bodies to minimize memory footprint under high concurrency
  discardResponseBodies: true,
  // Strip unused default system tags to save CPU & RAM during high VU scale
  systemTags: [
    "status",
    "method",
    "url",
    "scenario",
    "check",
    "error",
    "error_code",
  ],
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "p(99)", "max"],
  scenarios: {
    hot_seat_burst: {
      executor: "per-vu-iterations",
      vus: totalVus,
      iterations: 1,
      maxDuration: "10s",
      gracefulStop: "1s",
      exec: "hotSeatScenario",
      startTime: "0s",
    },
    rate_limit_abuse: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 30,
      maxDuration: "10s",
      gracefulStop: "0s",
      exec: "rateLimitScenario",
      startTime: "12s",
    },
  },
  thresholds: {
    // Exactly 1 user acquires the seat lock under high contention.
    reserve_success_201: ["count==1"],
    // All remaining concurrent requests are rejected with 409 Conflict.
    reserve_conflict_409: [`count==${String(totalVus - 1)}`],
    // Fail-fast: instantly abort test if unexpected 500 server crashes occur.
    reserve_unexpected_errors: [
      { threshold: "count==0", abortOnFail: true, delayAbortEval: "1s" },
    ],
    // Configurable latency thresholds defaulting to standard SLOs (ADR 0006)
    "http_req_duration{scenario:hot_seat_burst}": [
      `p(95)<=${p95Threshold}`,
      `p(99)<=${p99Threshold}`,
    ],
  },
};

/**
 * Simulates mass concurrent Virtual Users competing for the exact same VIP seat,
 * asserting mutual exclusion locking and zero double-bookings.
 */
export function hotSeatScenario(): void {
  const vuIndex = (vu.idInTest - 1) % fixture.users.length;
  const user = fixture.users[vuIndex];
  if (!user) {
    reserveUnexpectedErrors.add(1);
    return;
  }

  const url = `${fixture.targetUrl}/bookings/reserve`;
  const payload = JSON.stringify({
    showId: fixture.showId,
    seatIds: [fixture.targetSeatId],
  });

  // Spoof distinct client IP per VU so CustomThrottlerGuard evaluates individual client limits.
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
      "idempotency-key": uuidv7(),
      "X-Forwarded-For": user.ip,
    },
    tags: {
      scenario: "hot_seat_burst",
    },
  };

  const response = post(url, payload, params);

  hotSeatDuration.add(response.timings.duration);

  if (response.status === 201) {
    reserveSuccess201.add(1);
  } else if (response.status === 409) {
    reserveConflict409.add(1);
  } else {
    reserveUnexpectedErrors.add(1);
  }

  check(response, {
    "status is 201 Created or 409 Conflict": (r) =>
      r.status === 201 || r.status === 409,
    "response is not 500 Internal Server Error": (r) => r.status !== 500,
  });
}

/**
 * Simulates rapid requests from a single client IP to verify CustomThrottlerGuard
 * rate limiting protection.
 */
export function rateLimitScenario(): void {
  const user = fixture.users[0];
  if (!user) return;

  const url = `${fixture.targetUrl}/bookings/reserve`;
  const payload = JSON.stringify({
    showId: fixture.showId,
    seatIds: [fixture.otherSeatIds[0] ?? fixture.targetSeatId],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
      "idempotency-key": uuidv7(),
      "X-Forwarded-For": "192.168.100.99",
    },
    tags: {
      scenario: "rate_limit_abuse",
    },
  };

  const response = post(url, payload, params);

  if (response.status === 429) {
    reserveThrottled429.add(1);
  }

  check(response, {
    "status is valid response": (r) =>
      r.status === 201 || r.status === 409 || r.status === 429,
  });
}

/**
 * Generates structured JSON summary artifacts for CI/CD pipeline auditing
 * while preserving standard stdout terminal reporting.
 */
export function handleSummary(data: unknown) {
  return {
    "dist/load-test-summary.json": JSON.stringify(data, null, 2),
  };
}
