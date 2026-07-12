# TransitOps frontend

React (Vite) frontend for the TransitOps fleet management system. Talks to the
Express/MongoDB API in `../backend` over `/api` (proxied to `http://localhost:5000` in dev).

## Setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Make sure the backend is running first (`cd ../backend && npm run dev`) — this app has no
mock data, every screen reads and writes through the real API.

## Structure

```
src/
  api.js                  fetch wrapper, attaches JWT, one function per endpoint
  context/AuthContext.jsx login/register/logout, persists token in localStorage
  components/
    Sidebar.jsx            nav + signed-in user + sign out
    Badge.jsx               status pill (Available / On Trip / In Shop / ...)
    ProtectedRoute.jsx     redirects to /login if no user
  pages/
    Login.jsx               sign in / register
    Dashboard.jsx           KPI cards + trips in progress
    Vehicles.jsx             registry + add form
    Drivers.jsx              roster + add form, flags expired licenses
    Trips.jsx                dispatch / complete / cancel — the core workflow
    Maintenance.jsx          send to shop / mark serviced
    Fuel.jsx                 log fuel/toll/repair against a trip
    Reports.jsx              Chart.js utilization + cost charts
```

## How the interactivity maps to the backend's business rules

- The vehicle and driver dropdowns on **Trips** only list `status: Available`
  records (and drivers with a non-expired license) — fetched fresh from
  `GET /api/vehicles?status=Available` and `GET /api/drivers?status=Available`.
- **Dispatch trip** calls `POST /api/trips/dispatch`. The backend does the
  authoritative capacity/license/availability check inside a Mongo
  transaction; the UI surfaces whatever message it returns.
- **Complete/Cancel** calls `PATCH /api/trips/:id/finish`, which the backend
  uses to flip the vehicle and driver back to `Available`.
- **Maintenance** toggles a vehicle in/out of `In Shop`, which is why it
  disappears from the Trips dispatch dropdown until serviced.

## Build

```bash
npm run build
```

Outputs a static `dist/` you can serve from any static host or behind the
Express server itself.
