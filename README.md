# Supply Chain Parts Traceability Dashboard

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-6%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)

Track spare parts as they move from supplier → warehouse → assembly → deployed.
Supports stock monitoring, supplier health, audit logs, and inventory valuation.

## Quick Start

```bash
docker compose up
# frontend: http://localhost:3000
# backend:  http://localhost:5000
```

Or run locally:

```bash
# backend
cd backend && npm install && npm start

# frontend (separate terminal)
cd frontend && npm install && npm run dev
```

## Run Tests

```bash
cd backend && npm test
```

Covers: `advanceStage`, `getLowStockParts`, `getStageSummary` — 6 tests, no mocks needed.

## Features

- Pipeline overview — part counts per stage with progress bar
- Inventory value — total value broken down by stage
- Supplier performance — health status per supplier
- Low-stock alerts — parts at or below their reorder threshold
- Audit log — full history of stock and stage changes per part
- Optimistic UI — actions reflect instantly; rollback on server error
- Bulk stock update — select multiple parts and update quantities at once
- CSV export, column sorting, search, stage and machine filters
- Status report — plain-text summary copyable to clipboard
- Duplicate detection — live suggestions when adding a part name

## Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 18 + Vite             |
| Backend  | Node.js + Express           |
| Infra    | Docker Compose              |
| Tests    | Jest                        |

## License

MIT
