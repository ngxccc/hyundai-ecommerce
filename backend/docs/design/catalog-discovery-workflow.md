---
title: Catalog Discovery SSOT Operational Workflow
docType: feature-workflow
status: approved
date: 2026-08-30
---

# Catalog Discovery SSOT Operational Workflow

---

## Overview & Context

This document serves as the **Single Source of Truth (SSOT)** describing the architecture, database schema, operational workflows, and domain invariants for the Catalog Discovery module (`src/modules/catalog/`).

The catalog discovery module provides public, high-throughput REST endpoints allowing clients (Mobile App, Web Frontend) to explore movies and cinema venues without authentication:

1. **Movie Discovery (`GET /movies`)**: Browse movies filtered by status (`now-showing`, `coming-soon`), genre ID/name, rating, and cross-language search, with paginated results and localized translations.
2. **Movie Details (`GET /movies/:id`)**: Retrieve detailed movie metadata, duration, structured genre objects (`{ id, name }[]`), release dates, and localized titles/descriptions by UUIDv7 identifier.
3. **Cinema Discovery (`GET /cinemas`)**: Locate cinema venues filtered by city, ward, and venue name, including aggregated hall counts (`totalHalls`).

---

## Architecture & Work Breakdown Structure (WBS)

### 1. Database Schema Specifications

#### A. Cinemas Schema (`src/database/schemas/cinemas.schema.ts`)

Streamlined two-tier administrative hierarchy for Vietnam venues:

- `id`: UUIDv7 primary key.
- `name`: Venue name (e.g., `"CGV Vincom Đồng Khởi"`).
- `city`: Level 1 administrative division (e.g., `"Thành phố Hồ Chí Minh"`, `"Hà Nội"`).
- `ward`: Level 2 administrative division (e.g., `"Phường Bến Nghé"`).
- `streetAddress`: Detailed building and street address (e.g., `"Tầng 5, 72 Lê Thánh Tôn"`).
- `postalCode`: 5-digit postal code (e.g., `"70000"`).
- `latitude`, `longitude`: Optional geographic coordinates for mapping.
- **Indexes**: Composite index `(city, ward)` and B-Tree index `(name)`.

#### B. Movies & Translations Schema (`src/database/schemas/movies.schema.ts`)

- `movies`: Core metadata (`durationMinutes`, `releaseDate`, `rating`, `posterUrl`, `trailerUrl`, `tmdbId`, `imdbId`).
- `movie_translations`: Localization table (`movieId`, `languageCode` [`'vi' | 'en'`], `title`, `description`).
- `movie_genres` & `genres`: Many-to-many relationship linking movies to structured genre records (`id`, `name`).

### 2. Work Breakdown Structure (WBS) Table

| WBS Code | Component / Feature    | Level           | Description / Task                                            | Output / Artifact                           |
| :------- | :--------------------- | :-------------- | :------------------------------------------------------------ | :------------------------------------------ |
| **1.0**  | **Catalog Module**     | **L1: Module**  | Public discovery domain module                                | `src/modules/catalog/`                      |
| **1.1**  | **Database Schema**    | **L2: DB**      | Refactor `cinemas` table with `city`, `ward`, `streetAddress` | `src/database/schemas/cinemas.schema.ts`    |
| **1.2**  | **Movie Listing API**  | **L2: API**     | `GET /movies` with query filters & i18n fallback              | `src/modules/catalog/movies.controller.ts`  |
| **1.3**  | **Movie Details API**  | **L2: API**     | `GET /movies/:id` with UUIDv7 validation & 404 guard          | `src/modules/catalog/movies.controller.ts`  |
| **1.4**  | **Cinema Listing API** | **L2: API**     | `GET /cinemas` with city/ward/name filters & `totalHalls`     | `src/modules/catalog/cinemas.controller.ts` |
| **1.5**  | **Test Suites**        | **L2: Quality** | Unit & Integration BDD suites (`(INV-1..5)`)                  | `test/integration/movies.spec.ts`           |

---

## Operational Flow & Invariants

```text
Client Request (GET /movies?status=now-showing&genreId=019fa8bc...&page=2&limit=20&lang=en)
  │
  ▼
ZodValidationPipe (Strict Whitelist + Kebab-Case Enum Validation)
  │
  ▼
MoviesController ──► MoviesService.findMovies()
  │
  ├─► Schedule Invariant (INV-1): EXISTS (SELECT 1 FROM shows WHERE shows.movie_id = movies.id AND start_time >= NOW())
  │
  ├─► Localization Fallback (INV-2): COALESCE(requested_trans.title, fallback_vi.title)
  │
  ├─► SQL Wildcard Sanitization (INV-3): Escape '%', '_', and '\\'
  │
  ├─► Deterministic Ordering: ORDER BY release_date DESC, created_at DESC, id ASC
  │
  └─► Pagination (INV-4): LIMIT limit OFFSET (page - 1) * limit, Envelope { success: true, data: [...], meta: { page, limit, total, totalPages } }
```

### Domain Invariants Matrix

- **INV-1 (Schedule-Driven `now-showing` Invariant)**: A movie is classified as `now-showing` if and only if there is at least 1 future active showtime (`shows.start_time >= NOW()`).
- **INV-2 (Deterministic Localization Fallback Invariant)**: When the requested language translation (`?lang=en`) is null/missing, the service deterministically falls back to the default locale (`vi`).
- **INV-3 (SQL Wildcard Sanitization & Safe Search Invariant)**: All search inputs (`search`, `city`, `ward`) have `%`, `_`, and `\` escaped prior to SQL execution to prevent ReDoS and table scan attacks. Cross-language search matches across all translations.
- **INV-4 (Strict Pagination & Empty List Semantics Invariant)**: Page $\ge 1$, Limit $1..100$. Internal offset is calculated as $(\text{page} - 1) \times \text{limit}$. When a search matches 0 records, return HTTP `200 OK` with `data: []` and `meta: { total: 0, page, limit, totalPages: 0 }` (never `404`).
- **INV-5 (UUIDv7 Validation & 404 Entity Missing Invariant)**: `GET /movies/:id` validates UUIDv7 at pipe layer (`400 Bad Request`); non-existent valid UUIDs return `404 Not Found` with RFC 9457 details.

---

## API Contracts & Payload Samples

### 1. Movie Discovery: `GET /movies`

- **Query Parameters**:
  - `status`: `'now-showing' | 'coming-soon'` (optional)
  - `genreId`: UUIDv7 format (optional)
  - `rating`: `'G' | 'PG' | 'PG_13' | 'R' | 'NC_17'` (optional)
  - `search`: Keyword matching across Vietnamese and English titles (optional)
  - `page`: Integer $\ge 1$, default `1`
  - `limit`: Integer between $1..100$, default `20`
  - `lang`: `'vi' | 'en'`, default `'vi'`
- **Response Payload**:

```json
{
  "success": true,
  "data": [
    {
      "id": "019fa8bc-8f4d-7000-b366-e691f45cfb91",
      "title": "Deadpool & Wolverine",
      "description": "Wolverine joins Deadpool on a multiverse mission.",
      "durationMinutes": 128,
      "releaseDate": "2026-07-26",
      "rating": "R",
      "posterUrl": "https://cdn.ticketbooking.com/posters/deadpool-wolverine.jpg",
      "trailerUrl": "https://youtube.com/watch?v=deadpool",
      "genres": [
        { "id": "019fa8bc-8f4d-7000-b366-e691f45cfb01", "name": "Action" },
        { "id": "019fa8bc-8f4d-7000-b366-e691f45cfb02", "name": "Comedy" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. Cinema Discovery: `GET /cinemas`

- **Query Parameters**:
  - `city`: Substring filter on city/province (optional)
  - `ward`: Substring filter on ward (optional)
  - `search`: Keyword matching on venue name (optional)
  - `page`: Integer $\ge 1$, default `1`
  - `limit`: Integer between $1..100$, default `20`
- **Response Payload**:

```json
{
  "success": true,
  "data": [
    {
      "id": "019fa8bc-8f4d-7000-b366-e691f45cfc01",
      "name": "CGV Vincom Đồng Khởi",
      "city": "Thành phố Hồ Chí Minh",
      "ward": "Phường Bến Nghé",
      "streetAddress": "Tầng 5, TTTM Vincom Center, 72 Lê Thánh Tôn",
      "postalCode": "70000",
      "latitude": "10.77810000",
      "longitude": "106.70250000",
      "totalHalls": 7
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## Security & Edge Cases

1. **DDoS & Rate Limiting**: All discovery routes are protected by `CustomThrottlerGuard` to prevent scraping abuse.
2. **Strict Whitelisting**: Zod `.strict()` schema drops or rejects unauthorized query parameters.
3. **Empty Results vs Not Found**: List endpoints return empty arrays (`200 OK`), whereas individual item retrieval by ID returns `404 Not Found` when absent.
4. **Structured Genre Output**: Both movie listing and details endpoints return `genres: { id: string, name: string }[]`, enabling client UI chips to trigger indexed `GET /movies?genreId=<id>` requests.
5. **Deterministic Ordering**:
   - Movies are ordered by `release_date DESC, created_at DESC, id ASC`.
   - Cinemas are ordered by `city ASC, ward ASC, name ASC, id ASC`.
