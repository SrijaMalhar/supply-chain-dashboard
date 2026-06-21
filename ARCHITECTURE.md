# Architecture

## Overview

```
Browser
  └── React 18 (Vite, port 5173 in dev)
        ├── LowStockBanner       -- parts at/below per-part reorder threshold
        ├── StageSummary         -- count per pipeline stage
        ├── ValueSummary         -- total inventory value by stage
        ├── SupplierPerformance  -- health status per supplier
        ├── StatusReport         -- plain-text report modal
        ├── AddPartForm          -- create part with duplicate detection
        └── PartsTable           -- list, sort, filter, inline edit, delete, history
              |
              | HTTP fetch to localhost:8080
              v
        Spring Boot 3 (Java 17, port 8080)
              ├── SparePartController  -- REST endpoints
              ├── SparePartService     -- business logic + in-memory audit log
              └── SparePartRepository -- Spring Data JPA
                    |
                    v
              H2 in-memory database
              -- schema recreated on every start (create-drop)
              -- seeded by data.sql
              -- swap for Postgres: one line in application.properties
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/parts | All parts |
| POST | /api/parts | Create part |
| PUT | /api/parts/:id | Update part |
| DELETE | /api/parts/:id | Delete part |
| PUT | /api/parts/:id/advance | Advance pipeline stage |
| GET | /api/parts/low-stock | Parts at/below their reorder threshold |
| GET | /api/parts/summary | Count per stage |
| GET | /api/parts/:id/history | Audit log for one part |
| GET | /h2-console | H2 database web console |
| GET | /swagger-ui.html | Interactive API docs |

## Data Flow

1. User action (add / edit / delete / advance) fires a fetch in the React component.
2. Spring Boot controller receives the request, validates inputs, delegates to the service.
3. Service updates the H2 database via JPA and appends to the in-memory audit log.
4. Controller returns the updated resource as JSON; React re-fetches the full list.

## Key Files

| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven build — Spring Boot 3, JPA, H2, springdoc |
| `backend/src/main/java/.../model/SparePart.java` | JPA entity (all part fields) |
| `backend/src/main/java/.../model/HistoryEntry.java` | Audit log entry POJO |
| `backend/src/main/java/.../controller/SparePartController.java` | REST endpoints |
| `backend/src/main/java/.../service/SparePartService.java` | Logic + audit log |
| `backend/src/main/resources/data.sql` | Seed data (5 sample parts) |
| `backend/src/main/resources/application.properties` | Spring Boot config |
| `frontend/src/api.js` | API base URL (http://localhost:8080/api/parts) |
| `docker-compose.yml` | One-command local run |
| `.github/workflows/ci.yml` | CI pipeline (Maven build + test) |
