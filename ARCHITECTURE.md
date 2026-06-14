# Architecture

## Overview

```
Browser
  └── React 18 (Vite)
        ├── Components
        │     ├── LowStockBanner    -- parts at/below reorder threshold
        │     ├── StageSummary      -- count per pipeline stage
        │     ├── ValueSummary      -- total inventory value
        │     ├── SupplierPerformance -- health status per supplier
        │     ├── StatusReport      -- plain-text report modal
        │     ├── AddPartForm       -- create part with duplicate detection
        │     └── PartsTable        -- list, sort, filter, edit, delete
        └── HTTP (fetch)
              |
              v
        Express 5 (Node.js)
              ├── GET  /api/parts
              ├── POST /api/parts
              ├── PUT  /api/parts/:id
              ├── PUT  /api/parts/:id/advance
              ├── DELETE /api/parts/:id
              ├── GET  /api/parts/low-stock
              ├── GET  /api/parts/summary
              └── GET  /api/parts/:id/history
                    |
                    v
              In-memory store (array)
              -- resets on server restart
              -- swap for a DB without changing the API
```

## Data Flow

1. User action (add/edit/delete/advance) hits a React mutation hook.
2. Optimistic update applies to local state immediately.
3. Fetch call goes to Express.
4. On success: server response confirms, React Query refetches.
5. On error: local state rolls back to the pre-mutation snapshot.

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/routes/parts.js` | All REST endpoints |
| `backend/src/partsService.js` | Pure logic functions (tested) |
| `frontend/src/components/` | All UI components |
| `frontend/src/api.js` | API base URL config |
| `docker-compose.yml` | One-command local run |
| `.github/workflows/ci.yml` | CI pipeline |
