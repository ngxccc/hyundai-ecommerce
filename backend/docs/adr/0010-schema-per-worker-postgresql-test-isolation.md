# 10. Schema-per-Worker PostgreSQL Test Isolation and CI RAM-Disk Architecture

Date: 2026-08-27

## Status

Accepted

## Context

Executing the integration test suite (`test/integration/*.spec.ts`) against a single shared PostgreSQL and Redis instance encountered critical scalability and race condition bottlenecks when running parallel workers:

1. **Parallel Worker Database Deadlocks (`AccessExclusiveLock`)**:
   Executing tests concurrently without `--max-concurrency=1` caused intermittent deadlocks and data corruption. When multiple worker threads executed `truncateAllTables()` (`TRUNCATE TABLE ... CASCADE`) concurrently against the shared `public` schema, test runs collided, resulting in flaky test suites and forcing sequential execution (~40s runtime).
2. **Connection Pool `search_path` Leakage**:
   Running a bare `db.execute(sql`SET search_path...`)` only alters the search path for the single checked-out connection. Subsequent queries checking out other connections from the `pg.Pool` fall back to the default `public` schema, causing non-deterministic query failures and table resolution errors.
3. **Redis Global Key & Distributed Lock Contention**:
   In integration tests testing distributed concurrency (`booking.spec.ts`), tests execute distributed locks (`lock:show_seat:*`) and idempotency keys (`idempotency:*`). When `beforeEach` runs wildcard key deletions (`redis.keys()` + `redis.del()`), it destroys in-flight locks created by concurrent peer workers.
4. **BullMQ Cross-Worker Job Theft**:
   Shared queue names (`bull:booking:*`, `bull:outbox:*`) on a single Redis instance allow worker processors in one test suite to dequeue and process jobs referencing entities in another worker's isolated database schema, triggering false `RecordNotFound` errors.
5. **Background Cron Timer Pollution**:
   `ScheduleModule` cron timers (`@Cron(...)` in `BookingCronService`) fire periodically in all worker processes, executing queries against terminating test database connections.
6. **CI Disk I/O Latency**:
   On GitHub Actions virtualized runners, continuous database migrations and high-frequency transactional writes suffered from virtual SSD disk I/O bottlenecks.

## Decision

We decided to implement a unified, multi-tier isolation architecture:

1. **Global Pre-Flight Setup (`bunfig.toml` Preload)**:
   - Configured `[test] preload = ["./test/helpers/global-setup.ts"]` in `bunfig.toml` to execute pre-flight initialization before any worker test file is loaded.
   - Idempotently installs database-level extensions in the shared schema: `CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA public;`.
   - Purges stale orphaned test schemas (`test_*`) older than 1 hour.
   - Registers interactive process signal handlers (`process.on('SIGINT')`, `process.on('SIGTERM')`) to ensure immediate schema cleanup when a test run is aborted interactively.
2. **Timestamp & UUID-based Dynamic Schema Provisioning**:
   - Each test suite execution allocates an isolated PostgreSQL schema formatted as `test_${Date.now()}_${randomUUID().replace(/-/g, '_')}`.
   - Incorporating the millisecond timestamp enables deterministic age calculation for orphan garbage collection, while the UUID guarantees zero collisions across Bun worker threads.
3. **Pool-Level Protocol `search_path` Binding**:
   - The PostgreSQL `Pool` is configured at startup with `options: "-c search_path=<worker_schema>,public"` (or connection string option `?options=-c%20search_path%3D<worker_schema>%2Cpublic`).
   - Every connection checked out by any NestJS service or Drizzle query automatically operates within the worker's isolated schema at the PostgreSQL protocol level.
   - `public` is retained in the search path to guarantee global PostgreSQL extensions (such as `btree_gist` for exclusion constraints in ADR 0009) resolve without per-schema reinstallation.
4. **Isolated Migration & Current-Schema Truncation Safety**:
   - Drizzle migrations run seamlessly within `<worker_schema>` because the underlying connection pool defaults to that schema.
   - `truncateAllTables(db)` queries `SELECT tablename FROM pg_tables WHERE schemaname = current_schema()`, preserves `__drizzle_migrations`, and escapes table names via `sql.identifier()` and `sql.join()` with `RESTART IDENTITY CASCADE`, ensuring truncation is strictly scoped to the active worker schema.
5. **Redis Namespace Isolation (`keyPrefix`)**:
   - In integration tests, IoRedis is instantiated with `keyPrefix: "test:${workerSchemaId}:"`.
   - All distributed locks (`RedlockService`), cache keys, and idempotency records are automatically namespaced. Wildcard key cleanups in `beforeEach` only affect the worker's own Redis keys.
   - _Unit Tests vs Integration Tests_: Unit tests continue using `RedlockMock` for isolated logic testing; Integration tests use real Redis with `keyPrefix` to genuinely verify distributed locking, lock expiration, and race condition prevention.
6. **BullMQ Queue Scoping & Cron Disabling**:
   - Integration test app factory (`createTestApp`) injects `prefix: "bull:${workerSchemaId}"` into BullMQ and disables background `@Cron` schedulers (`BookingCronService`) to eliminate background execution noise.
7. **Deterministic Schema Teardown**:
   - On clean test exit (`afterAll`), the schema is dropped (`DROP SCHEMA IF EXISTS <worker_schema> CASCADE;`).
8. **CI RAM-Disk (`tmpfs`) Acceleration**:
   - In GitHub Actions workflow (`.github/workflows/integration.yml`), configure the PostgreSQL service container with `PGDATA: /var/lib/postgresql/data/pgdata` and mount `--tmpfs /var/lib/postgresql/data:rw` with performance parameters (`-c fsync=off -c synchronous_commit=off -c full_page_writes=off`).
   - Remove `--max-concurrency=1` to unleash full multi-core CPU parallel test execution across all integration test suites.

## Consequences

- Integration test suites execute fully in parallel across all available CPU cores with zero deadlock or race condition risk.
- Local test execution time is reduced from ~40s down to $< 5\text{s}$.
- CI integration test pipeline runs in volatile memory (`tmpfs`), completing in $< 15\text{s}$.
- Distributed locking and transaction boundaries are verified against real Redis and PostgreSQL instances with zero cross-worker interference.

### Explicit Tradeoffs

- **Real Redis with `keyPrefix` vs Mocking in Integration Tests**:
  Mocking Redis in integration tests would run faster but would eliminate test coverage for real distributed concurrency (Redlock mutexes, TTL expiration, race condition defense in `POST /bookings/reserve`). Using real Redis with `keyPrefix` preserves 100% fidelity while guaranteeing zero cross-worker key corruption.
- **Schema Lifecycle DDL Overhead vs. Isolation**:
  Running `CREATE SCHEMA`, Drizzle migrations, and `DROP SCHEMA CASCADE` per test suite adds ~50–80ms of DDL setup overhead per file. This is offset by running all test suites concurrently in parallel.
