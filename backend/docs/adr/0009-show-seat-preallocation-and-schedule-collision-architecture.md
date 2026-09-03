# 9. Show Seat Preallocation and Schedule Collision Architecture

Date: 2026-08-20

## Status

Accepted

## Context

Movie showtime creation (`ShowsModule`) requires two fundamental operational invariants:

1. High-concurrency seat availability checking during ticket sales must be performant without incurring runtime allocation overhead or race conditions.
2. Hall schedules must never overlap (including a minimum 15-minute cleaning buffer between consecutive shows), even during concurrent batch creation requests submitted by system administrators.

Evaluating lazy/dynamic seat allocation versus pre-allocation revealed that lazy allocation introduces complex locking semantics (`SELECT FOR UPDATE` on missing rows) when hundreds of concurrent users attempt to view or reserve seats for a freshly published showtime. Furthermore, application-only schedule overlap checking is susceptible to race conditions under concurrent admin operations.

## Decision

We decided to implement:

1. **Pre-allocation Bulk Insertion Strategy**: Upon showtime creation (`POST /shows` or `POST /shows/batch`), all physical seats from the target `hall` are bulk-inserted into `show_seats` within a single database transaction as a static snapshot (`status = 'available'`).
2. **Two-Tier Schedule Collision Defense**:
   - Application-level interval validation calculating `endTime = startTime + movie.durationMinutes` and enforcing a configurable cleaning buffer (15 minutes).
   - Database-level enforcement using a PostgreSQL Exclusion Constraint (`GiST` index over `tsrange(start_time, end_time + interval '15 minutes', '[)')`).
3. **All-or-Nothing Transactional Batch Processing**: Batch show creation (`POST /shows/batch`) executes inside a single DB transaction that rolls back completely if any single generated showtime encounters a schedule collision.

## Consequences

- Seat maps for published shows are immediately queryable without runtime allocation latency or dynamic seat synthesis overhead.
- High-concurrency seat reservation operates directly via atomic `UPDATE show_seats` / `SELECT FOR UPDATE` on pre-existing primary key rows.
- Schedule collisions are impossible even if concurrent admin operations bypass NestJS application validation.

### Explicit Tradeoffs

- **Derived `endTime` vs Admin Input**: `endTime` is strictly derived by the backend from `startTime + movies.durationMinutes` (omitted from `CreateShowDto`). This preserves movie duration invariants and eliminates human entry error, while storing `end_time` physically in `shows` to power the PostgreSQL GiST exclusion constraint and range queries.
- **Storage Pre-allocation vs Storage Efficiency**: Pre-allocating 50–300 `show_seats` rows per show requires ~10KB database storage per showtime, accepted for zero-latency seat map reads and safe concurrency locking.
- **Strict All-or-Nothing Rollback vs Partial Success**: Batch creation rejects the entire batch if a single show collides, requiring admin payload correction rather than leaving fragmented schedules.
