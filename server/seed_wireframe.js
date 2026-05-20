// seed_wireframe.js – Direct SQLite injection script for ArcticStream End-to-End wireframe testing
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "arcticstream.db");
const db = new Database(DB_PATH);
db.pragma("foreign_keys = OFF"); // Disable constraints during clean data seeding

console.log("Starting direct SQLite wireframe data seeding...");

// Clear tables
const tables = [
  "customers", "sites", "drivers", "routes", "route_stops", 
  "products", "pallets", "pallet_products", "inventory_movements", 
  "truck_stock", "invoices", "invoice_items", "fridges", 
  "fuel_tanks", "space_readings", "daily_stats", "shipments"
];

for (const table of tables) {
  try {
    db.prepare(`DELETE FROM ${table}`).run();
  } catch (e) {
    console.log(`Table ${table} clear warning: ${e.message}`);
  }
}

// ─── STEP 1: CUSTOMERS & SITES ────────────────────────────────────────────────
console.log("Seeding Customers & Sites...");
db.prepare(`
  INSERT INTO customers (id, name, po, hours, contact, phone, notes)
  VALUES 
    ('C-001', 'Woolworths Metro', 'Yes', 'Mon–Fri 6am–6pm', 'James Harrington', '0412 345 678', 'Main metro distribution center'),
    ('C-002', 'Coles Fremantle', 'No', 'Mon–Sun 7am–10pm', 'Sandra Liu', '0498 221 009', 'Secondary delivery branch')
`).run();

db.prepare(`
  INSERT INTO sites (id, customer_id, name, suburb, status, capacity, current_stock, required, pallets_desc, last_delivered, eta, scheduled, has_po, emergency, map_top, map_left, allocation_cap, stock_reliability)
  VALUES
    ('S-001', 'C-001', 'Metro CBD', 'Melbourne CBD', 'red', 100, 10, 90, '1 × Standard Pallet', '18 May', 'Mon-Fri 6am-6pm', '23 May', 1, 1, 42.5, 68.2, 100, 'reliable'),
    ('S-002', 'C-002', 'Coles Fremantle Central', 'Fremantle', 'orange', 120, 40, 80, '2 × Euro Pallets', '18 May', 'Mon–Fri 6am–6pm', '23 May', 1, 0, 55.1, 48.9, 100, 'reliable')
`).run();

// ─── STEP 2: DRIVERS & VEHICLES ──────────────────────────────────────────────
console.log("Seeding Drivers & Vehicles...");
db.prepare(`
  INSERT INTO drivers (id, name, type, availability, shift, truck, phone, certifications, assigned_route)
  VALUES
    ('D-001', 'Marcus Webb', 'employee', 'available', '6:00 AM - 2:00 PM', 'T-01', '0412345678', '["Heavy Vehicle","Forklift"]', 'R-001'),
    ('D-002', 'Tom Watkins', 'contractor', 'available', '2:00 PM - 10:00 PM', 'T-02', '0431887654', '["Forklift"]', NULL),
    ('D-003', 'Priya Shah', 'employee', 'available', '10:00 AM - 6:00 PM', NULL, '0455001234', '["Refrigerated"]', NULL)
`).run();

db.prepare(`
  INSERT INTO vehicles (id, code, type, capacity, status)
  VALUES
    ('V-001', 'T-01', 'Refrigerated Truck', 100, 'Active'),
    ('V-002', 'T-02', 'Van', 40, 'Active')
`).run();

// ─── STEP 3: PRODUCTS & PALLETS ─────────────────────────────────────────────
console.log("Seeding Products & Pallets...");
db.prepare(`
  INSERT INTO products (id, name, sku, category, unit, price, cost, stock, min_stock, status, pallet_qty, supplier)
  VALUES
    ('P-001', 'Ice Bags 5kg', 'ICE-5KG', 'Ice', 'Bag', 5.50, 1.50, 500, 100, 'active', 80, 'ArcticStream'),
    ('P-002', 'Ice Bags 10kg', 'ICE-10KG', 'Ice', 'Bag', 9.90, 3.00, 300, 50, 'active', 60, 'ArcticStream'),
    ('P-003', 'Block Ice', 'BLOCK-ICE', 'Ice', 'Block', 12.00, 4.50, 150, 20, 'active', 40, 'ArcticStream')
`).run();

db.prepare(`
  INSERT INTO pallets (id, type, code, capacity, dimensions, weight_kg, in_stock, last_used)
  VALUES
    ('PA-001', 'Standard Pallet', 'PL-STD', 80, '1200x1000mm', 25.0, 150, '20 May'),
    ('PA-002', 'Euro Pallet', 'PL-EUR', 60, '1200x800mm', 20.0, 120, '20 May')
`).run();

// ─── STEP 4: INVENTORY MOVEMENTS ─────────────────────────────────────────────
console.log("Seeding Inventory Movements...");
db.prepare(`
  INSERT INTO inventory_movements (movement_date, movement_time, type, product_id, product_name, quantity, location, recorded_by, notes)
  VALUES
    (date('now'), time('now'), 'Stock In', 'P-001', 'Ice Bags 5kg', 100, 'Warehouse', 'Admin', 'Bulk stock delivery'),
    (date('now'), time('now'), 'Truck Load', 'P-002', 'Ice Bags 10kg', -50, 'T-01', 'Admin', 'Loaded to truck T-01')
`).run();

// ─── STEP 5 & 6: ROUTES & ROUTE STOPS (ACTIVE/COMPLETED STATE) ───────────────
console.log("Seeding Active/Completed Routes...");
db.prepare(`
  INSERT INTO routes (id, driver_id, truck, status, stops_total, stops_done, distance_km, duration, utilisation, route_date, published)
  VALUES
    ('R-001', 'D-001', 'T-01', 'completed', 1, 1, 14.5, '1h 20m', 75, date('now'), 1)
`).run();

db.prepare(`
  INSERT INTO route_stops (route_id, site_id, stop_order, eta, bags, status)
  VALUES
    ('R-001', 'S-001', 1, '10:30 AM', 30, 'delivered')
`).run();

// ─── STEP 7: INVOICES ────────────────────────────────────────────────────────
console.log("Seeding Invoices...");
db.prepare(`
  INSERT INTO invoices (id, customer_id, customer, invoice_date, due_days, subtotal, gst, total, status, notes)
  VALUES
    ('INV-001', 'C-001', 'Woolworths Metro', date('now'), '30d', 500, 50, 550, 'paid', 'Auto-created from delivered route')
`).run();

db.prepare(`
  INSERT INTO invoice_items (invoice_id, description, product_id, quantity, unit_price, line_total)
  VALUES
    ('INV-001', 'Ice delivery - Metro CBD', 'P-001', 1, 500, 500)
`).run();

// ─── STEP 8: REPORTS / DAILY SNAPSHOT ────────────────────────────────────────
console.log("Seeding Daily Snapshot Statistics...");
db.prepare(`
  INSERT OR REPLACE INTO daily_stats (stat_date, bags_delivered, routes_total, routes_completed, revenue, sites_urgent, sites_order_soon)
  VALUES
    (date('now'), 30, 1, 1, 500.00, 1, 1)
`).run();

// ─── STEP 9: FRIDGES ─────────────────────────────────────────────────────────
console.log("Seeding Fridges...");
db.prepare(`
  INSERT INTO fridges (id, customer, branch, label, room, current, total, status, status_color, active)
  VALUES
    ('FR-001', 'Woolworths Metro', 'CBD', 'F-01', 'Main Floor', 20, 50, 'Order Soon', 'orange', 1)
`).run();

// ─── STEP 10: FUEL TANKS (SPACE INPUT) ────────────────────────────────────────
console.log("Seeding Fuel Tanks & Space Readings...");
db.prepare(`
  INSERT INTO fuel_tanks (id, name, product, color, capacity, current, water_mm, status)
  VALUES
    ('FT-001', 'T1: ULP91', 'ULP91', '#0284c7', 20000, 6000, 5, 'Normal')
`).run();

db.prepare(`
  INSERT INTO space_readings (tank_id, reading, water_mm, recorded_by, notes)
  VALUES
    ('FT-001', 6000, 5, 'Admin', 'Daily manual tank volume reading')
`).run();

db.pragma("foreign_keys = ON"); // Re-enable keys
console.log("SQLite Seeding Complete! Database ready for E2E testing.");
db.close();
