# Supply Chain Parts Traceability Dashboard

A simple full-stack web app that tracks spare parts moving through a supply
chain (Supplier → Warehouse → Assembly → Deployed). Built as an
internship-portfolio project.

## Tech stack

- **Backend:** Java 17, Spring Boot 3, Spring Data JPA, H2 in-memory DB,
  springdoc-openapi (Swagger UI), Maven
- **Frontend:** React 18 + Vite (functional components), plain CSS

## Folder structure

```
supply-chain-dashboard/
├── backend/    # Spring Boot REST API
└── frontend/   # React + Vite UI
```

## Running the backend

```bash
cd backend
mvn spring-boot:run
```

The API will start on **http://localhost:8080**.

Useful URLs:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- H2 Console: <http://localhost:8080/h2-console>
  - JDBC URL: `jdbc:h2:mem:partsdb`
  - User: `sa` (no password)

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be served on **http://localhost:5173** and will talk to the
backend at `http://localhost:8080`. CORS is already enabled for the dev
port.

## Architecture

A walkthrough of the layers, request flow, and design decisions lives in
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

## License

Released under the MIT License — see [`LICENSE`](./LICENSE).

## REST endpoints

| Method | Path                          | Description                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/api/parts`                  | List all spare parts                           |
| POST   | `/api/parts`                  | Add a new spare part (validated)               |
| PUT    | `/api/parts/{id}`             | Update an existing part (validated)            |
| DELETE | `/api/parts/{id}`             | Delete a part by id                            |
| GET    | `/api/parts/low-stock`        | Parts with `stockQuantity < 10`                |
| GET    | `/api/parts/summary`          | Count of parts at each stage of the pipeline   |
| PUT    | `/api/parts/{id}/advance`     | Move a part to the next stage in the pipeline  |

### Validation

POST and PUT bodies are validated with Jakarta Bean Validation:

- `partName`, `supplierName`, `machineModel`, `stage` — required, non-blank
- `stage` — must be one of `SUPPLIER`, `WAREHOUSE`, `ASSEMBLY`, `DEPLOYED`
- `stockQuantity` — required, must be `>= 0`

Invalid requests return **HTTP 400** with a JSON map of field → error message,
e.g.:

```json
{
  "partName": "partName is required",
  "stockQuantity": "stockQuantity must be 0 or greater"
}
```

Looking up a missing id returns **HTTP 404**.

## Sample data

Five parts are pre-loaded on every startup (see `backend/src/main/resources/data.sql`):

- Hydraulic Filter (25)
- Engine Piston (4)  ← low stock
- Drive Shaft (15)
- Fuel Injector (7)  ← low stock
- Brake Pad (30)
