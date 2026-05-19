# ArcticStream – Backend API

## Quick Start

**One-time setup (first time only):**
```bash
# From the project root:
npm run setup
```
This installs Express/SQLite and seeds the database with all initial data.

**Running the server:**
```bash
# From the project root:
npm run server          # Production mode
npm run server:dev      # Dev mode with auto-restart (nodemon)
```
Server starts at: **http://localhost:3001**

**Running frontend + backend together:**
- Terminal 1: `npm run dev`      → Vite frontend on http://localhost:5173
- Terminal 2: `npm run server`   → Express backend on http://localhost:3001

---

## API Endpoints

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Health | GET | `/api/health` | Server status check |
| Dashboard | GET | `/api/dashboard` | Combined ops overview |
| Customers | GET/POST | `/api/customers` | List / create customers |
| Customers | GET/PUT/DELETE | `/api/customers/:id` | Get / update / delete |
| Sites | GET/POST | `/api/sites` | List / create sites (filter: `?status=red`) |
| Sites | GET/PUT/DELETE | `/api/sites/:id` | Get / update / delete |
| Sites | PATCH | `/api/sites/:id/stock` | Update stock level only |
| Drivers | GET/POST | `/api/drivers` | List / create (filter: `?availability=available`) |
| Drivers | PATCH | `/api/drivers/:id/availability` | Change driver status |
| Routes | GET/POST | `/api/routes` | List today's routes / create |
| Routes | POST | `/api/routes/publish` | Publish multiple routes |
| Routes | POST | `/api/routes/suggest` | AI route grouping |
| Routes | PATCH | `/api/routes/:id/stops/:stopId` | Mark stop delivered |
| Products | GET/POST | `/api/products` | List / create |
| Products | PATCH | `/api/products/:id/stock` | Adjust stock by delta |
| Pallets | GET | `/api/pallets` | List all pallets |
| Inventory | GET | `/api/inventory/warehouse` | Warehouse stock summary |
| Inventory | GET | `/api/inventory/trucks` | Truck stock levels |
| Inventory | GET/POST | `/api/inventory/movements` | Stock movement log |
| Invoices | GET/POST | `/api/invoices` | List / create |
| Invoices | PATCH | `/api/invoices/:id/status` | Mark paid/overdue/etc. |
| Invoices | GET | `/api/invoices/stats/summary` | Outstanding / overdue KPIs |
| Fridges | GET | `/api/fridges` | List fridges |
| Fridges | GET | `/api/fridges/stats` | Capacity KPIs |
| Fridges | PATCH | `/api/fridges/:id/stock` | Update current stock |
| Tanks | GET | `/api/tanks` | List fuel tanks |
| Tanks | PATCH | `/api/tanks/:id` | Submit a dip reading |
| Tanks | GET | `/api/tanks/:id/history` | Reading history |
| Tanks | POST | `/api/tanks/bulk-save` | Save all tanks at once |
| Reports | GET | `/api/reports/summary` | KPI summary |
| Reports | GET | `/api/reports/daily-stats` | Daily stats (last 30 days) |
| Reports | GET | `/api/reports/top-customers` | Revenue by customer |
| Reports | GET | `/api/reports/driver-performance` | Driver stats |

---

## Database

- Engine: SQLite (file: `server/arcticstream.db`)
- Library: `better-sqlite3` (synchronous, no async needed)

**Tables:** customers, sites, drivers, routes, route_stops, products, pallets, pallet_products, inventory_movements, truck_stock, invoices, invoice_items, fridges, fuel_tanks, space_readings, daily_stats

**Re-seed (reset all data):**
```bash
npm run server:seed
```

---

## Connecting Frontend to Backend

All screens should import from `src/app/services/api.ts`:

```ts
import { sitesApi, driversApi, routesApi } from "../services/api";

// In a useEffect:
const sites = await sitesApi.list();
const drivers = await driversApi.list("available");
const routes = await routesApi.list();
```

The old hardcoded `data.ts` can remain as a fallback/type reference but all live data should come through the API service.
