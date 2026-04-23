# Architecture

This document explains how the **Supply Chain Parts Traceability Dashboard**
is put together: the layers, how a request flows through the system, the
design decisions, and what could be improved if this were a production app.

---

## High-level diagram

```
+-------------------+        HTTP / JSON         +-----------------------+
|                   |  --------------------->    |                       |
|  React + Vite     |                            |  Spring Boot 3        |
|  (frontend)       |  <---------------------    |  (backend, port 8080) |
|  port 5173        |        JSON                |                       |
+-------------------+                            +-----------+-----------+
                                                             |
                                                             | JPA
                                                             v
                                                    +-----------------+
                                                    |  H2 in-memory   |
                                                    |  database       |
                                                    +-----------------+
```

- **Frontend** (`/frontend`) — a React single-page app served by Vite. It
  calls the backend with `fetch()` and renders the parts table, summary
  card, low-stock banner, and forms.
- **Backend** (`/backend`) — a Spring Boot application that exposes a REST
  API under `/api/parts` and persists data with Spring Data JPA.
- **Database** — H2, running in-memory. The schema is created on startup
  from the JPA entity, and `data.sql` seeds five sample parts each time
  the app starts.

---

## Backend layers

The backend follows the classic Spring layered architecture. Each layer
has a single responsibility and only talks to the layer directly below
it.

```
   Controller   <-- HTTP in, JSON out, validation
        |
        v
    Service     <-- business rules (e.g. stage advancement)
        |
        v
   Repository   <-- database queries (Spring Data JPA)
        |
        v
     Entity     <-- the SparePart table
```

### 1. Entity — `model/SparePart.java`
A plain Java class annotated with `@Entity`. Each field maps to a column
in the `SPARE_PART` table. Bean-Validation annotations (`@NotBlank`,
`@Min`, `@Pattern`) declare the rules the data must obey.

### 2. Repository — `repository/SparePartRepository.java`
An interface that extends `JpaRepository<SparePart, Long>`. Spring Data
generates the implementation at runtime, giving us `findAll`, `save`,
`deleteById`, etc. for free. We add one custom finder:

```java
List<SparePart> findByStockQuantityLessThan(int threshold);
```

Spring parses the method name and writes the SQL for us.

### 3. Service — `service/SparePartService.java`
Holds the business logic that doesn't belong in the controller or the
database:

- `addPart`, `updatePart`, `deletePart` — wrap the repository calls.
- `getLowStockParts()` — calls the custom finder with threshold `10`.
- `getStageSummary()` — counts parts per pipeline stage.
- `advanceStage(id)` — knows the pipeline order
  `SUPPLIER → WAREHOUSE → ASSEMBLY → DEPLOYED` and moves a part one
  step forward (no-op if it's already `DEPLOYED`).

Keeping this logic in the service means the controller stays thin and
the rules are easy to unit-test.

### 4. Controller — `controller/SparePartController.java`
Translates HTTP into method calls. Each endpoint is one short method
annotated with `@GetMapping`, `@PostMapping`, etc., plus an
`@Operation` summary that Swagger picks up. `@Valid` on the request
body triggers Bean Validation before the method runs.

### 5. Exception handler — `controller/GlobalExceptionHandler.java`
A `@RestControllerAdvice` that catches:

- `MethodArgumentNotValidException` → **HTTP 400** with a JSON map of
  field → message.
- `IllegalArgumentException` (thrown by the service when an id is not
  found) → **HTTP 404** with `{ "error": "..." }`.

This keeps error formatting consistent across every endpoint.

---

## Request flow example: `POST /api/parts`

1. The browser sends `POST /api/parts` with a JSON body.
2. **CORS filter** allows the request because it comes from
   `http://localhost:5173` (configured via `@CrossOrigin` on the
   controller).
3. Spring binds the JSON to a `SparePart` object.
4. `@Valid` runs every constraint on `SparePart`. If anything fails,
   `GlobalExceptionHandler` returns a 400 — the controller method is
   never called.
5. `SparePartController.add(part)` calls `service.addPart(part)`.
6. The service calls `repository.save(part)`.
7. JPA inserts a row in H2 and returns the entity with its generated
   `id`.
8. The controller serializes the saved entity back to JSON; the client
   gets a 200 with the new part.

---

## Frontend structure

```
src/
  App.jsx                     // wires everything together; holds refreshKey
  main.jsx                    // React entry point
  styles.css                  // plain CSS, navy header, yellow buttons
  components/
    PartsTable.jsx            // table with red/green rows, search,
                              // stage filter, inline edit, advance,
                              // delete buttons
    AddPartForm.jsx           // controlled form -> POST /api/parts
    LowStockBanner.jsx        // GET /api/parts/low-stock
    StageSummary.jsx          // GET /api/parts/summary
```

### Refresh pattern
`App.jsx` keeps a single integer in state called `refreshKey`. Whenever
a child component performs a mutation (add, update, delete, advance),
it calls `onChange()` which bumps `refreshKey`. Children receive
`refreshKey` as a prop and re-fetch inside a `useEffect` whose
dependency list includes it. This keeps every panel in sync without
adding a state-management library.

### Why plain `fetch()` and plain CSS?
The brief is a beginner-friendly internship portfolio piece. Avoiding
extra libraries (axios, react-query, Tailwind, Material UI) keeps the
code readable end-to-end and makes it obvious which lines do what.

---

## Key design decisions

| Decision | Reason |
| --- | --- |
| H2 in-memory database | Zero setup; data resets on restart, which is ideal for a demo. Swap the JDBC URL for Postgres later with no code changes. |
| Stage stored as a `String` (not `enum`) | Simpler to evolve and easier for a beginner to read in the database. The `@Pattern` annotation enforces the allowed values. |
| Single resource (`SparePart`) | Keeps the project small enough to read in one sitting while still showing the full CRUD + business-logic loop. |
| `refreshKey` instead of Redux/Context | One integer is enough for a four-component UI. Showing the simplest thing that works is part of the portfolio story. |
| Validation in the entity, not the controller | The constraints live next to the fields they describe; any endpoint that accepts a `SparePart` gets them automatically. |
| Global exception handler | Each endpoint stays focused on the happy path; error shape is consistent across the API. |

---

## What I'd change for production

- Replace H2 with Postgres and manage schema with Flyway or Liquibase.
- Add authentication (Spring Security + JWT) and per-user audit fields
  (`createdBy`, `updatedAt`).
- Split `SparePart` into request/response DTOs so the API contract is
  decoupled from the database schema.
- Add unit tests for `SparePartService` (especially `advanceStage`)
  and integration tests for the controller using `MockMvc`.
- Containerize with a multi-stage `Dockerfile` and add a GitHub Actions
  pipeline for build + test on every push.
- Add structured logging and a `/actuator/health` probe for the
  deployment platform.

---

## File map (quick reference)

```
supply-chain-dashboard/
├── README.md                   project overview, run instructions, API table
├── ARCHITECTURE.md             this file
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/portfolio/supplychain/
│       │   ├── SupplyChainApplication.java
│       │   ├── controller/
│       │   │   ├── SparePartController.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── service/SparePartService.java
│       │   ├── repository/SparePartRepository.java
│       │   └── model/SparePart.java
│       └── resources/
│           ├── application.properties
│           └── data.sql
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles.css
        └── components/
            ├── PartsTable.jsx
            ├── AddPartForm.jsx
            ├── LowStockBanner.jsx
            └── StageSummary.jsx
```
