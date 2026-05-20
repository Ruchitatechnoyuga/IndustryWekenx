// db.js – SQLite database setup for ArcticStream
const Database = require("better-sqlite3");
const path = require("path");

// Use /data volume on Railway (persistent), fallback to local for development
const DB_PATH = process.env.RAILWAY_ENVIRONMENT
  ? "/data/arcticstream.db"
  : path.join(__dirname, "arcticstream.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  -- Customers / Companies
  CREATE TABLE IF NOT EXISTS customers (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    po          TEXT,
    hours       TEXT,
    contact     TEXT,
    phone       TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Delivery sites (customer locations)
  CREATE TABLE IF NOT EXISTS sites (
    id              TEXT PRIMARY KEY,
    customer_id     TEXT REFERENCES customers(id),
    name            TEXT NOT NULL,
    suburb          TEXT,
    status          TEXT DEFAULT 'green',   -- red | orange | green | hold
    capacity        INTEGER DEFAULT 0,
    current_stock   INTEGER DEFAULT 0,
    required        INTEGER DEFAULT 0,
    pallets_desc    TEXT,
    last_delivered  TEXT,
    eta             TEXT,
    scheduled       TEXT,
    has_po          INTEGER DEFAULT 0,       -- boolean
    emergency       INTEGER DEFAULT 0,       -- boolean
    map_top         REAL DEFAULT 50,
    map_left        REAL DEFAULT 50,
    allocation_cap  INTEGER DEFAULT 100,
    stock_reliability TEXT DEFAULT 'reliable',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  -- Drivers (employees + contractors)
  CREATE TABLE IF NOT EXISTS drivers (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    type            TEXT DEFAULT 'employee',   -- employee | contractor
    availability    TEXT DEFAULT 'available',  -- available | on-route | on-leave | unavailable
    shift           TEXT,
    truck           TEXT,
    phone           TEXT,
    certifications  TEXT,   -- JSON array stored as string
    assigned_route  TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  -- Delivery routes
  CREATE TABLE IF NOT EXISTS routes (
    id          TEXT PRIMARY KEY,
    driver_id   TEXT REFERENCES drivers(id),
    truck       TEXT,
    status      TEXT DEFAULT 'planned',   -- planned | active | completed | cancelled
    stops_total INTEGER DEFAULT 0,
    stops_done  INTEGER DEFAULT 0,
    distance_km REAL DEFAULT 0,
    duration    TEXT,
    utilisation INTEGER DEFAULT 0,
    route_date  TEXT DEFAULT (date('now')),
    published   INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Individual stops within a route
  CREATE TABLE IF NOT EXISTS route_stops (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id    TEXT REFERENCES routes(id),
    site_id     TEXT REFERENCES sites(id),
    stop_order  INTEGER DEFAULT 1,
    eta         TEXT,
    bags        INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'pending',   -- pending | delivered | skipped
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Ice products
  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    sku         TEXT UNIQUE,
    category    TEXT,
    unit        TEXT DEFAULT 'Bag',
    price       REAL DEFAULT 0,
    cost        REAL DEFAULT 0,
    stock       INTEGER DEFAULT 0,
    min_stock   INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'active',   -- active | low-stock | discontinued
    pallet_qty  INTEGER DEFAULT 0,
    supplier    TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Pallet configurations
  CREATE TABLE IF NOT EXISTS pallets (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    code        TEXT UNIQUE,
    capacity    INTEGER DEFAULT 0,
    dimensions  TEXT,
    weight_kg   REAL DEFAULT 0,
    in_stock    INTEGER DEFAULT 0,
    last_used   TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Pallet–Product relationships
  CREATE TABLE IF NOT EXISTS pallet_products (
    pallet_id   TEXT REFERENCES pallets(id),
    product_id  TEXT REFERENCES products(id),
    PRIMARY KEY (pallet_id, product_id)
  );

  -- Inventory / stock movements log
  CREATE TABLE IF NOT EXISTS inventory_movements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_date   TEXT DEFAULT (date('now')),
    movement_time   TEXT DEFAULT (time('now')),
    type            TEXT NOT NULL,   -- Stock In | Truck Load | Return | Delivery | Adjustment
    product_id      TEXT REFERENCES products(id),
    product_name    TEXT,
    quantity        INTEGER NOT NULL,   -- positive = in, negative = out
    location        TEXT,
    recorded_by     TEXT,
    notes           TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  -- Truck stock (bags currently loaded on each truck)
  CREATE TABLE IF NOT EXISTS truck_stock (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_code  TEXT NOT NULL,
    driver_name TEXT,
    bags        INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'Active',   -- Active | Returned | Loading
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Invoices
  CREATE TABLE IF NOT EXISTS invoices (
    id          TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    customer    TEXT NOT NULL,
    invoice_date TEXT,
    due_days    TEXT DEFAULT '30d',
    subtotal    REAL DEFAULT 0,
    gst         REAL DEFAULT 0,
    total       REAL DEFAULT 0,
    status      TEXT DEFAULT 'pending',   -- pending | paid | overdue | draft
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Invoice line items
  CREATE TABLE IF NOT EXISTS invoice_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id  TEXT REFERENCES invoices(id),
    description TEXT,
    product_id  TEXT,
    quantity    INTEGER DEFAULT 1,
    unit_price  REAL DEFAULT 0,
    line_total  REAL DEFAULT 0
  );

  -- Fridges / cold storage units at sites
  CREATE TABLE IF NOT EXISTS fridges (
    id          TEXT PRIMARY KEY,
    customer    TEXT NOT NULL,
    branch      TEXT,
    label       TEXT,
    room        TEXT,
    current     INTEGER DEFAULT 0,
    total       INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'Well Stocked',
    status_color TEXT DEFAULT 'green',
    active      INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Fuel tanks (for Space Input module)
  CREATE TABLE IF NOT EXISTS fuel_tanks (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    product     TEXT NOT NULL,
    color       TEXT,
    capacity    INTEGER DEFAULT 20000,
    current     INTEGER DEFAULT 0,
    water_mm    INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'Normal',
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Daily space input readings log
  CREATE TABLE IF NOT EXISTS space_readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_id     TEXT REFERENCES fuel_tanks(id),
    reading     INTEGER NOT NULL,
    water_mm    INTEGER DEFAULT 0,
    recorded_by TEXT,
    reading_date TEXT DEFAULT (date('now')),
    reading_time TEXT DEFAULT (time('now')),
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Daily KPI / analytics snapshot (for Reports screen)
  CREATE TABLE IF NOT EXISTS daily_stats (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_date       TEXT UNIQUE DEFAULT (date('now')),
    bags_delivered  INTEGER DEFAULT 0,
    routes_total    INTEGER DEFAULT 0,
    routes_completed INTEGER DEFAULT 0,
    revenue         REAL DEFAULT 0,
    sites_urgent    INTEGER DEFAULT 0,
    sites_order_soon INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  -- Shipments table
  CREATE TABLE IF NOT EXISTS shipments (
    id                   TEXT PRIMARY KEY,
    customer_id          TEXT REFERENCES customers(id),
    customer_name        TEXT,
    site_id              TEXT REFERENCES sites(id),
    site_name            TEXT,
    product_id           TEXT REFERENCES products(id),
    product_name         TEXT,
    quantity             INTEGER,
    pallet_type          TEXT,
    delivery_date        TEXT,
    time_window          TEXT,
    priority             TEXT,
    assigned_driver_id   TEXT REFERENCES drivers(id),
    po_number            TEXT,
    special_instructions TEXT,
    status               TEXT DEFAULT 'new',
    route_id             TEXT REFERENCES routes(id),
    invoice_id           TEXT REFERENCES invoices(id),
    created_at           TEXT DEFAULT (datetime('now')),
    updated_at           TEXT DEFAULT (datetime('now'))
  );
`);

// Try to alter existing invoices table to add shipment_id if not present
try {
  db.exec("ALTER TABLE invoices ADD COLUMN shipment_id TEXT REFERENCES shipments(id);");
} catch (e) {
  // Column may already exist
}

// Add notes column to customers if not present
try {
  db.exec("ALTER TABLE customers ADD COLUMN notes TEXT;");
} catch (e) {
  // Column may already exist
}

// Add assigned_driver_name column to shipments if not present
try {
  db.exec("ALTER TABLE shipments ADD COLUMN assigned_driver_name TEXT;");
} catch (e) {}

// Vehicles table
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id       TEXT PRIMARY KEY,
    code     TEXT UNIQUE,
    type     TEXT DEFAULT 'Refrigerated Truck',
    capacity INTEGER DEFAULT 100,
    status   TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// No seed data — client adds all real data

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = db;

