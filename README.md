# Supply Chain Parts Traceability Dashboard

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Java](https://img.shields.io/badge/java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring_boot-3-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)

Track spare parts as they move from supplier → warehouse → assembly → deployed.
Supports stock monitoring, supplier health, audit logs, and inventory valuation.

**Live demo:** https://srijamalhar.github.io/supply-chain-dashboard/

## Quick Start

```bash
# Easiest — needs Docker + Docker Compose
docker compose up
# Frontend → http://localhost:3000   Backend → http://localhost:8080
```

Or run each piece manually:

```bash
# Terminal 1 — backend
cd backend
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## Run Tests

```bash
cd backend && mvn test
```

## Features

- Pipeline overview — part counts per stage with progress bar
- Inventory value — total value broken down by stage
- Supplier performance — health status per supplier
- Low-stock alerts — per-part reorder threshold
- Audit log — full history of stock and stage changes per part
- Optimistic UI — actions reflect instantly; rollback on error
- Bulk stock update — select multiple parts, update at once
- CSV export, column sorting, search, stage and machine filters
- Status report — plain-text summary copyable to clipboard
- Duplicate detection — live suggestions when adding a part name

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18 + Vite               |
| Backend  | Spring Boot 3 (Java 17)       |
| Database | H2 in-memory (seeded via SQL) |
| API docs | Swagger UI (springdoc)        |
| Infra    | Docker Compose                |
| Tests    | JUnit (via Maven)             |

## Bonus Endpoints

Once the backend is running:

- **Swagger UI** — browse and test all endpoints: http://localhost:8080/swagger-ui.html
- **H2 Console** — inspect the live DB: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:partsdb` — username `sa`, no password

## License

MIT
