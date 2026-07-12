# TransitOps API

Node.js / Express / MongoDB backend for the TransitOps fleet management system.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # or: npm start
```

Requires a running MongoDB instance (local or Atlas) at the URI in `.env`.

## Collections

`Users` · `Vehicles` · `Drivers` · `Trips` · `MaintenanceLogs` · `Expenses`

## Business rules enforced server-side

- Vehicle `registrationNumber` must be unique.
- A vehicle `In Shop` or `On Trip` cannot be dispatched again.
- A driver already `On Trip`, `Off Duty`, `Suspended`, or with an expired license cannot be assigned.
- Cargo weight cannot exceed the assigned vehicle's `loadCapacityKg`.
- Dispatching a trip (`POST /api/trips/dispatch`) atomically flips the vehicle and driver to `On Trip` inside a MongoDB transaction — if any validation fails, nothing is written.
- Completing or cancelling a trip (`PATCH /api/trips/:id/finish`) restores both to `Available`.
- Sending a vehicle to maintenance blocks it from dispatch until `PATCH /api/maintenance/:id/complete` is called.

## API reference

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Route | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Get a JWT |
| GET | `/api/vehicles` | any | List vehicles (`?status=` filter) |
| POST | `/api/vehicles` | Fleet Manager | Register a vehicle |
| PUT | `/api/vehicles/:id` | Fleet Manager | Update a vehicle |
| DELETE | `/api/vehicles/:id` | Fleet Manager | Remove a vehicle |
| GET | `/api/drivers` | any | List drivers |
| POST | `/api/drivers` | Fleet Manager, Safety Officer | Add a driver |
| GET | `/api/trips` | any | List trips (`?status=` filter) |
| POST | `/api/trips/dispatch` | Fleet Manager | Dispatch a trip |
| PATCH | `/api/trips/:id/finish` | Fleet Manager | `{ outcome: "Completed" \| "Cancelled" }` |
| POST | `/api/maintenance/start` | Fleet Manager, Safety Officer | Send a vehicle to the shop |
| PATCH | `/api/maintenance/:id/complete` | Fleet Manager, Safety Officer | Return vehicle to service |
| GET/POST | `/api/expenses` | any | Log or list fuel/toll/repair costs |
| GET | `/api/expenses/trip/:tripId/total` | any | Cost total for one trip |
| GET | `/api/reports/dashboard` | any | KPI summary for the dashboard |
| GET | `/api/reports/utilization` | any | Fleet utilization breakdown |
| GET | `/api/reports/cost` | any | Operational cost by category |

## Example: dispatch a trip

```bash
curl -X POST http://localhost:5000/api/trips/dispatch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Mumbai",
    "destination": "Pune",
    "vehicleId": "<vehicle _id>",
    "driverId": "<driver _id>",
    "cargoWeightKg": 450
  }'
```
