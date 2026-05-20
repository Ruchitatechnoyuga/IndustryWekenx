// seed.js – Populate database with initial data matching the frontend wireframes
const db = require("./db");

console.log("🌱 Seeding ArcticStream database...");

const run = db.transaction(() => {

  // ─── Customers ───────────────────────────────────────────────────────────────
  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers (id, name, po, hours, contact, phone)
    VALUES (@id, @name, @po, @hours, @contact, @phone)
  `);

  [
    { id: "C-001", name: "Coles Express — Miranda",       po: "PO-44821", hours: "06:00 – 22:00", contact: "Jamie Welsh",  phone: "0412 008 441" },
    { id: "C-002", name: "BP Roadhouse — Port Kembla",    po: "PO-44822", hours: "24 hours",       contact: "Rhea Tan",    phone: "0433 112 908" },
    { id: "C-003", name: "IGA — Bulli",                   po: "",          hours: "07:00 – 21:00", contact: "Mark Petrov", phone: "0411 665 290" },
    { id: "C-004", name: "Ampol — Warrawong",             po: "PO-44903", hours: "05:00 – 23:00", contact: "Yasmin Lee",  phone: "0478 330 114" },
    { id: "C-005", name: "7-Eleven — Figtree",            po: "",          hours: "24 hours",       contact: "Dan Okafor",  phone: "0421 500 018" },
    { id: "C-006", name: "Coles — Wollongong Central",    po: "PO-44924", hours: "07:00 – 22:00", contact: "Lisa Park",   phone: "0466 221 554" },
    { id: "C-007", name: "Metro Petroleum — Unanderra",   po: "",          hours: "06:00 – 22:00", contact: "Peter Chen",  phone: "0422 887 103" },
    { id: "C-008", name: "Shell Coles Express — Albion Park", po: "",     hours: "05:00 – 23:00", contact: "Amy Ross",    phone: "0455 334 780" },
    { id: "C-009", name: "Shell Albion",                  po: "PO-45001", hours: "24 hours",       contact: "Tom Walsh",   phone: "0411 002 334" },
    { id: "C-010", name: "BP Dapto",                      po: "PO-45002", hours: "24 hours",       contact: "Nina Yap",    phone: "0433 557 991" },
    { id: "C-011", name: "NightOwl Convenience — Figtree",po: "PO-45003", hours: "24 hours",       contact: "Sophie Anderson", phone: "0488 112 334" },
    { id: "C-012", name: "Star Mart — Warrawong",          po: "",          hours: "05:00 – 23:00", contact: "Liam O'Connor",  phone: "0422 990 881" },
  ].forEach(c => insertCustomer.run(c));

  // ─── Sites ───────────────────────────────────────────────────────────────────
  const insertSite = db.prepare(`
    INSERT OR REPLACE INTO sites
      (id, customer_id, name, suburb, status, capacity, current_stock, required,
       pallets_desc, last_delivered, eta, scheduled, has_po, emergency,
       map_top, map_left, allocation_cap, stock_reliability)
    VALUES
      (@id, @customer_id, @name, @suburb, @status, @capacity, @current_stock, @required,
       @pallets_desc, @last_delivered, @eta, @scheduled, @has_po, @emergency,
       @map_top, @map_left, @allocation_cap, @stock_reliability)
  `);

  [
    { id: "S-2044", customer_id: "C-001", name: "Coles Express — Miranda",         suburb: "Miranda",       status: "red",    capacity: 480, current_stock: 32,  required: 448, pallets_desc: "2 × Pallet-195 + 58",       last_delivered: "2 days ago", eta: "Today 11:20", scheduled: "Today",   has_po: 1, emergency: 0, map_top: 34, map_left: 42, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-1198", customer_id: "C-002", name: "BP Roadhouse — Port Kembla",      suburb: "Port Kembla",   status: "red",    capacity: 720, current_stock: 96,  required: 624, pallets_desc: "3 × Pallet-195 + 39",       last_delivered: "3 days ago", eta: "Today 12:45", scheduled: "Today",   has_po: 1, emergency: 1, map_top: 62, map_left: 28, allocation_cap: 60,  stock_reliability: "unreliable" },
    { id: "S-3021", customer_id: "C-003", name: "IGA — Bulli",                     suburb: "Bulli",         status: "orange", capacity: 360, current_stock: 142, required: 218, pallets_desc: "1 × Pallet-195 + 23",       last_delivered: "Yesterday",  eta: "Today 14:10", scheduled: "Today",   has_po: 0, emergency: 0, map_top: 48, map_left: 68, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-4809", customer_id: "C-004", name: "Ampol — Warrawong",               suburb: "Warrawong",     status: "orange", capacity: 300, current_stock: 112, required: 188, pallets_desc: "Loose: 188 × 5kg",          last_delivered: "Yesterday",  eta: "Today 15:25", scheduled: "Today",   has_po: 1, emergency: 0, map_top: 54, map_left: 48, allocation_cap: 50,  stock_reliability: "unreliable" },
    { id: "S-5502", customer_id: "C-005", name: "7-Eleven — Figtree",              suburb: "Figtree",       status: "green",  capacity: 240, current_stock: 188, required: 0,   pallets_desc: "—",                          last_delivered: "Today 07:10",eta: "—",           scheduled: "Apr 22",  has_po: 0, emergency: 0, map_top: 72, map_left: 58, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-6140", customer_id: "C-006", name: "Coles — Wollongong Central",      suburb: "Wollongong",    status: "green",  capacity: 600, current_stock: 410, required: 0,   pallets_desc: "—",                          last_delivered: "Today 08:30",eta: "—",           scheduled: "Apr 23",  has_po: 1, emergency: 0, map_top: 42, map_left: 24, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-7211", customer_id: "C-007", name: "Metro Petroleum — Unanderra",     suburb: "Unanderra",     status: "hold",   capacity: 480, current_stock: 120, required: 0,   pallets_desc: "—",                          last_delivered: "Apr 14",     eta: "—",           scheduled: "On hold", has_po: 0, emergency: 0, map_top: 58, map_left: 38, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-8055", customer_id: "C-008", name: "Shell Coles Express — Albion Park",suburb: "Albion Park",  status: "orange", capacity: 360, current_stock: 144, required: 216, pallets_desc: "1 × Pallet-195 + 21",       last_delivered: "Yesterday",  eta: "Today 16:05", scheduled: "Today",   has_po: 0, emergency: 0, map_top: 76, map_left: 44, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-9011", customer_id: "C-011", name: "NightOwl Convenience Figtree",    suburb: "Figtree",       status: "red",    capacity: 300, current_stock: 15,  required: 285, pallets_desc: "1 × Pallet-195 + 90",       last_delivered: "3 days ago", eta: "Today 17:45", scheduled: "Today",   has_po: 1, emergency: 0, map_top: 45, map_left: 62, allocation_cap: 100, stock_reliability: "reliable" },
    { id: "S-9012", customer_id: "C-012", name: "Star Mart Warrawong Depot",       suburb: "Warrawong",     status: "orange", capacity: 200, current_stock: 80,  required: 120, pallets_desc: "1 × Pallet-120",            last_delivered: "Yesterday",  eta: "Today 18:30", scheduled: "Today",   has_po: 0, emergency: 0, map_top: 58, map_left: 72, allocation_cap: 100, stock_reliability: "reliable" },
  ].forEach(s => insertSite.run(s));

  // ─── Drivers ─────────────────────────────────────────────────────────────────
  const insertDriver = db.prepare(`
    INSERT OR REPLACE INTO drivers
      (id, name, type, availability, shift, truck, phone, certifications, assigned_route)
    VALUES (@id, @name, @type, @availability, @shift, @truck, @phone, @certifications, @assigned_route)
  `);

  [
    { id: "DRV-001", name: "Luka Martinovic", type: "contractor", availability: "available",   shift: "Morning (6am-2pm)",    truck: "T-02", phone: "0422 445 667", certifications: '["HC License","Forklift"]',            assigned_route: "RT-101" },
    { id: "DRV-002", name: "Priya Singh",     type: "employee",   availability: "available",   shift: "Full Day (8am-4pm)",   truck: "T-05", phone: "0411 332 998", certifications: '["HC License"]',                       assigned_route: "RT-102" },
    { id: "DRV-003", name: "Devon Kim",       type: "employee",   availability: "available",   shift: "Afternoon (12pm-8pm)", truck: "T-01", phone: "0433 776 221", certifications: '["HC License","Dangerous Goods"]',      assigned_route: null },
    { id: "DRV-004", name: "Aisha Rahman",    type: "employee",   availability: "on-route",    shift: "Full Day (8am-4pm)",   truck: "T-04", phone: "0488 554 332", certifications: '["HC License"]',                       assigned_route: "RT-104" },
    { id: "DRV-005", name: "Marcus Chen",     type: "contractor", availability: "available",   shift: "Morning (6am-2pm)",    truck: "T-03", phone: "0455 889 443", certifications: '["HC License","Forklift"]',            assigned_route: null },
    { id: "DRV-006", name: "Sarah O'Brien",   type: "employee",   availability: "on-leave",    shift: "—",                    truck: "—",    phone: "0421 667 889", certifications: '["HC License"]',                       assigned_route: null },
    { id: "DRV-007", name: "Jake Morrison",   type: "contractor", availability: "unavailable", shift: "Off roster",           truck: "—",    phone: "0434 221 556", certifications: '["HC License"]',                       assigned_route: null },
    { id: "DRV-008", name: "Nina Patel",      type: "employee",   availability: "available",   shift: "Afternoon (12pm-8pm)", truck: "T-06", phone: "0466 332 114", certifications: '["HC License","Dangerous Goods"]',      assigned_route: null },
    { id: "DRV-009", name: "Ethan Hunt",      type: "employee",   availability: "available",   shift: "Morning (6am-2pm)",    truck: "T-07", phone: "0412 888 999", certifications: '["HC License","Dangerous Goods","Forklift"]', assigned_route: "RT-105" },
    { id: "DRV-010", name: "Zoe Jenkins",     type: "contractor", availability: "available",   shift: "Afternoon (12pm-8pm)", truck: "T-08", phone: "0431 777 666", certifications: '["HC License"]',                       assigned_route: null },
  ].forEach(d => insertDriver.run(d));

  // ─── Vehicles ─────────────────────────────────────────────────────────────────
  const insertVehicle = db.prepare(`
    INSERT OR REPLACE INTO vehicles (id, code, type, capacity, status)
    VALUES (@id, @code, @type, @capacity, @status)
  `);

  [
    { id: "V-001", code: "T-01", type: "Refrigerated Truck", capacity: 120, status: "Active" },
    { id: "V-002", code: "T-02", type: "Refrigerated Truck", capacity: 150, status: "Active" },
    { id: "V-003", code: "T-03", type: "Van",                capacity: 80,  status: "Maintenance" },
    { id: "V-004", code: "T-04", type: "Refrigerated Truck", capacity: 200, status: "Active" },
    { id: "V-005", code: "T-05", type: "Flatbed",            capacity: 100, status: "Active" },
    { id: "V-006", code: "T-06", type: "Refrigerated Truck", capacity: 180, status: "Active" },
    { id: "V-007", code: "T-07", type: "Refrigerated Truck", capacity: 250, status: "Active" },
    { id: "V-008", code: "T-08", type: "Van",                capacity: 90,  status: "Active" },
  ].forEach(v => insertVehicle.run(v));

  // ─── Routes ──────────────────────────────────────────────────────────────────
  const insertRoute = db.prepare(`
    INSERT OR REPLACE INTO routes
      (id, driver_id, truck, status, stops_total, stops_done, distance_km, duration, utilisation, route_date, published)
    VALUES (@id, @driver_id, @truck, @status, @stops_total, @stops_done, @distance_km, @duration, @utilisation, @route_date, @published)
  `);

  [
    { id: "RT-101", driver_id: "DRV-001", truck: "T-02", status: "active",    stops_total: 4, stops_done: 2, distance_km: 92,  duration: "3h 20m", utilisation: 94, route_date: new Date().toISOString().split("T")[0], published: 1 },
    { id: "RT-102", driver_id: "DRV-002", truck: "T-05", status: "active",    stops_total: 5, stops_done: 1, distance_km: 118, duration: "4h 05m", utilisation: 87, route_date: new Date().toISOString().split("T")[0], published: 1 },
    { id: "RT-103", driver_id: "DRV-003", truck: "T-01", status: "planned",   stops_total: 3, stops_done: 0, distance_km: 64,  duration: "2h 15m", utilisation: 72, route_date: new Date().toISOString().split("T")[0], published: 1 },
    { id: "RT-104", driver_id: "DRV-004", truck: "T-04", status: "completed", stops_total: 6, stops_done: 6, distance_km: 145, duration: "5h 10m", utilisation: 91, route_date: new Date().toISOString().split("T")[0], published: 1 },
    { id: "RT-105", driver_id: "DRV-009", truck: "T-07", status: "planned",   stops_total: 2, stops_done: 0, distance_km: 45,  duration: "1h 45m", utilisation: 85, route_date: new Date().toISOString().split("T")[0], published: 1 },
  ].forEach(r => insertRoute.run(r));

  // Route stops
  const insertStop = db.prepare(`
    INSERT OR REPLACE INTO route_stops (route_id, site_id, stop_order, eta, bags, status)
    VALUES (@route_id, @site_id, @stop_order, @eta, @bags, @status)
  `);

  [
    { route_id: "RT-101", site_id: "S-2044", stop_order: 1, eta: "11:20", bags: 448, status: "delivered" },
    { route_id: "RT-101", site_id: "S-1198", stop_order: 2, eta: "12:45", bags: 624, status: "delivered" },
    { route_id: "RT-101", site_id: "S-8055", stop_order: 3, eta: "14:30", bags: 216, status: "pending" },
    { route_id: "RT-101", site_id: "S-4809", stop_order: 4, eta: "15:25", bags: 188, status: "pending" },
    { route_id: "RT-102", site_id: "S-3021", stop_order: 1, eta: "10:40", bags: 218, status: "delivered" },
    { route_id: "RT-102", site_id: "S-6140", stop_order: 2, eta: "11:30", bags: 0,   status: "pending" },
    { route_id: "RT-102", site_id: "S-5502", stop_order: 3, eta: "12:00", bags: 0,   status: "pending" },
    { route_id: "RT-105", site_id: "S-9011", stop_order: 1, eta: "17:45", bags: 285, status: "pending" },
    { route_id: "RT-105", site_id: "S-9012", stop_order: 2, eta: "18:30", bags: 120, status: "pending" },
  ].forEach(s => insertStop.run(s));

  // ─── Products ────────────────────────────────────────────────────────────────
  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products
      (id, name, sku, category, unit, price, cost, stock, min_stock, status, pallet_qty, supplier)
    VALUES (@id, @name, @sku, @category, @unit, @price, @cost, @stock, @min_stock, @status, @pallet_qty, @supplier)
  `);

  [
    { id: "PRD-001", name: "Ice Bag 5kg",             sku: "ICE-5KG-STD",   category: "Standard Ice", unit: "Bag",   price: 4.50, cost: 2.20, stock: 12450, min_stock: 5000, status: "active",    pallet_qty: 195, supplier: "IceCo Pty Ltd" },
    { id: "PRD-002", name: "Ice Bag 10kg",            sku: "ICE-10KG-STD",  category: "Standard Ice", unit: "Bag",   price: 8.50, cost: 4.10, stock: 8920,  min_stock: 3000, status: "active",    pallet_qty: 120, supplier: "IceCo Pty Ltd" },
    { id: "PRD-003", name: "Ice Bag 5kg Premium",     sku: "ICE-5KG-PREM",  category: "Premium Ice",  unit: "Bag",   price: 5.75, cost: 2.80, stock: 3200,  min_stock: 2000, status: "active",    pallet_qty: 195, supplier: "Crystal Ice Co" },
    { id: "PRD-004", name: "Crushed Ice 5kg",         sku: "ICE-5KG-CRUSH", category: "Crushed Ice",  unit: "Bag",   price: 5.25, cost: 2.50, stock: 1850,  min_stock: 2500, status: "low-stock", pallet_qty: 180, supplier: "IceCo Pty Ltd" },
    { id: "PRD-005", name: "Ice Block 10kg",          sku: "ICE-10KG-BLOCK",category: "Ice Blocks",   unit: "Block", price: 9.50, cost: 4.50, stock: 2100,  min_stock: 1500, status: "active",    pallet_qty: 80,  supplier: "Arctic Ice Supply" },
    { id: "PRD-006", name: "Party Ice Mix 7kg",       sku: "ICE-7KG-PARTY", category: "Premium Ice",  unit: "Bag",   price: 6.95, cost: 3.30, stock: 890,   min_stock: 1000, status: "low-stock", pallet_qty: 150, supplier: "Crystal Ice Co" },
    { id: "PRD-007", name: "Dry Ice 5kg",             sku: "DRY-5KG-STD",   category: "Dry Ice",      unit: "Block", price: 15.00,cost: 8.50, stock: 450,   min_stock: 500,  status: "low-stock", pallet_qty: 60,  supplier: "Dry Ice Solutions" },
    { id: "PRD-008", name: "Ice Bag 20kg Commercial", sku: "ICE-20KG-COM",  category: "Commercial",   unit: "Bag",   price: 16.00,cost: 7.80, stock: 1560,  min_stock: 1000, status: "active",    pallet_qty: 65,  supplier: "IceCo Pty Ltd" },
    { id: "PRD-009", name: "Gourmet Cocktail Ice 3kg",sku: "ICE-3KG-COCKTAIL",category: "Premium Ice", unit: "Bag",   price: 7.50, cost: 3.10, stock: 4500,  min_stock: 1500, status: "active",    pallet_qty: 250, supplier: "Crystal Ice Co" },
    { id: "PRD-010", name: "Spherical Ice (4-pack)",  sku: "ICE-SPHERE-4P", category: "Gourmet Ice",  unit: "Box",   price: 12.95,cost: 5.50, stock: 1200,  min_stock: 500,  status: "active",    pallet_qty: 100, supplier: "Artisan Ice" },
  ].forEach(p => insertProduct.run(p));

  // ─── Pallets ─────────────────────────────────────────────────────────────────
  const insertPallet = db.prepare(`
    INSERT OR REPLACE INTO pallets (id, type, code, capacity, dimensions, weight_kg, in_stock, last_used)
    VALUES (@id, @type, @code, @capacity, @dimensions, @weight_kg, @in_stock, @last_used)
  `);

  [
    { id: "PLT-001", type: "Standard Pallet",    code: "Pallet-195", capacity: 195, dimensions: "1165 × 1165 mm", weight_kg: 975,  in_stock: 45, last_used: "Today" },
    { id: "PLT-002", type: "Half Pallet",         code: "Pallet-120", capacity: 120, dimensions: "800 × 1165 mm",  weight_kg: 600,  in_stock: 28, last_used: "Today" },
    { id: "PLT-003", type: "Crushed Ice Pallet",  code: "Pallet-180", capacity: 180, dimensions: "1165 × 1165 mm", weight_kg: 900,  in_stock: 12, last_used: "Yesterday" },
    { id: "PLT-004", type: "Block Pallet",        code: "Pallet-80",  capacity: 80,  dimensions: "1000 × 1200 mm", weight_kg: 800,  in_stock: 18, last_used: "Today" },
    { id: "PLT-005", type: "Premium Mix Pallet",  code: "Pallet-150", capacity: 150, dimensions: "1165 × 1165 mm", weight_kg: 750,  in_stock: 8,  last_used: "2 days ago" },
    { id: "PLT-006", type: "Dry Ice Pallet",      code: "Pallet-60",  capacity: 60,  dimensions: "800 × 1200 mm",  weight_kg: 300,  in_stock: 5,  last_used: "Yesterday" },
    { id: "PLT-007", type: "Commercial Pallet",   code: "Pallet-65",  capacity: 65,  dimensions: "1200 × 1200 mm", weight_kg: 1300, in_stock: 22, last_used: "Today" },
    { id: "PLT-008", type: "Gourmet Ice Pallet",  code: "Pallet-250", capacity: 250, dimensions: "1165 × 1165 mm", weight_kg: 750,  in_stock: 15, last_used: "Today" },
    { id: "PLT-009", type: "Artisan Box Pallet",  code: "Pallet-100", capacity: 100, dimensions: "800 × 1200 mm",  weight_kg: 550,  in_stock: 20, last_used: "Yesterday" },
  ].forEach(p => insertPallet.run(p));

  // Pallet–Product links
  const insertPalletProduct = db.prepare(`INSERT OR IGNORE INTO pallet_products (pallet_id, product_id) VALUES (?, ?)`);
  [["PLT-001","PRD-001"],["PLT-001","PRD-003"],["PLT-002","PRD-002"],["PLT-003","PRD-004"],
   ["PLT-004","PRD-005"],["PLT-005","PRD-006"],["PLT-006","PRD-007"],["PLT-007","PRD-008"],
   ["PLT-008","PRD-009"],["PLT-009","PRD-010"]
  ].forEach(([pid, prd]) => insertPalletProduct.run(pid, prd));

  // ─── Inventory Movements ─────────────────────────────────────────────────────
  const insertMovement = db.prepare(`
    INSERT OR IGNORE INTO inventory_movements
      (movement_date, movement_time, type, product_id, product_name, quantity, location, recorded_by, notes)
    VALUES (@movement_date, @movement_time, @type, @product_id, @product_name, @quantity, @location, @recorded_by, @notes)
  `);

  [
    { movement_date: "2024-11-24", movement_time: "09:15 AM", type: "Stock In",    product_id: "PRD-004", product_name: "5KG Bags",    quantity:  500, location: "Main Warehouse", recorded_by: "Admin User",       notes: "" },
    { movement_date: "2024-11-24", movement_time: "08:45 AM", type: "Truck Load",  product_id: "PRD-001", product_name: "2KG Bags",    quantity: -120, location: "TR-8042",        recorded_by: "John Doe",         notes: "" },
    { movement_date: "2024-11-23", movement_time: "05:20 PM", type: "Return",      product_id: "PRD-005", product_name: "Blocks",      quantity:   15, location: "Main Warehouse", recorded_by: "Mike Wilson",      notes: "" },
    { movement_date: "2024-11-23", movement_time: "02:30 PM", type: "Delivery",    product_id: "PRD-002", product_name: "10KG Bags",   quantity:  -50, location: "BP Roadhouse",   recorded_by: "Elena Rodriguez",  notes: "" },
    { movement_date: "2024-11-23", movement_time: "11:00 AM", type: "Stock In",    product_id: "PRD-001", product_name: "2KG Bags",    quantity: 1000, location: "Main Warehouse", recorded_by: "Admin User",       notes: "Weekly delivery" },
    { movement_date: "2024-11-22", movement_time: "03:45 PM", type: "Truck Load",  product_id: "PRD-001", product_name: "2KG Bags",    quantity: -200, location: "TR-9115",        recorded_by: "Sarah Smith",      notes: "" },
    { movement_date: "2024-11-22", movement_time: "10:20 AM", type: "Adjustment",  product_id: "PRD-007", product_name: "Dry Ice 5kg", quantity:  -10, location: "Main Warehouse", recorded_by: "Admin User",       notes: "Expired stock removed" },
    { movement_date: "2024-11-24", movement_time: "10:30 AM", type: "Stock In",    product_id: "PRD-009", product_name: "Gourmet Cocktail Ice 3kg", quantity: 800, location: "Main Warehouse", recorded_by: "Admin User", notes: "Initial seasonal stock" },
    { movement_date: "2024-11-24", movement_time: "11:15 AM", type: "Truck Load",  product_id: "PRD-010", product_name: "Spherical Ice (4-pack)", quantity: -40, location: "T-07", recorded_by: "Ethan Hunt", notes: "Loaded for gourmet run" },
  ].forEach(m => insertMovement.run(m));

  // Truck stock
  const insertTruckStock = db.prepare(`
    INSERT OR IGNORE INTO truck_stock (truck_code, driver_name, bags, status) VALUES (?, ?, ?, ?)
  `);
  [
    ["TR-8042", "John Doe",       450, "Active"],
    ["TR-9115", "Sarah Smith",    320, "Active"],
    ["TR-4421", "Mike Wilson",    0,   "Returned"],
    ["TR-5580", "Elena Rodriguez",180, "Active"],
    ["TR-7001", "Ethan Hunt",     240, "Active"],
    ["TR-8002", "Zoe Jenkins",    90,  "Active"],
  ].forEach(r => insertTruckStock.run(...r));

  // ─── Invoices ────────────────────────────────────────────────────────────────
  const insertInvoice = db.prepare(`
    INSERT OR REPLACE INTO invoices
      (id, customer_id, customer, invoice_date, due_days, subtotal, gst, total, status)
    VALUES (@id, @customer_id, @customer, @invoice_date, @due_days, @subtotal, @gst, @total, @status)
  `);

  [
    { id: "INV-0001", customer_id: "C-009", customer: "Shell Albion",  invoice_date: "May 15", due_days: "$0.00", subtotal: 932.50,  gst: 93.25,  total: 1025.75, status: "paid" },
    { id: "INV-0002", customer_id: "C-010", customer: "BP Dapto",       invoice_date: "May 14", due_days: "$0.00", subtotal: 1090.00, gst: 109.00, total: 1199.00, status: "paid" },
    { id: "INV-0003", customer_id: "C-005", customer: "7-Eleven",       invoice_date: "May 13", due_days: "$0.00", subtotal: 195.00,  gst: 19.50,  total: 214.50,  status: "paid" },
    { id: "INV-0004", customer_id: "C-001", customer: "Miranda",        invoice_date: "May 12", due_days: "$0.00", subtotal: 456.00,  gst: 45.60,  total: 501.60,  status: "paid" },
    { id: "INV-0005", customer_id: "C-005", customer: "Figtree",        invoice_date: "May 11", due_days: "$0.00", subtotal: 543.00,  gst: 54.30,  total: 597.30,  status: "overdue" },
    { id: "INV-0006", customer_id: "C-003", customer: "Bulli",          invoice_date: "May 10", due_days: "$0.00", subtotal: 210.00,  gst: 21.00,  total: 231.00,  status: "overdue" },
    { id: "INV-0007", customer_id: "C-004", customer: "Warrawong",      invoice_date: "May 9",  due_days: "$0.00", subtotal: 732.50,  gst: 73.25,  total: 805.75,  status: "paid" },
    { id: "INV-0008", customer_id: "C-007", customer: "Unanderra",      invoice_date: "May 8",  due_days: "$0.00", subtotal: 654.00,  gst: 65.40,  total: 719.40,  status: "paid" },
    { id: "INV-0009", customer_id: "C-002", customer: "Port Kembla",    invoice_date: "May 7",  due_days: "$0.00", subtotal: 123.50,  gst: 12.35,  total: 135.85,  status: "paid" },
    { id: "INV-0010", customer_id: "C-010", customer: "Dapto",          invoice_date: "May 6",  due_days: "28d",   subtotal: 890.00,  gst: 89.00,  total: 979.00,  status: "pending" },
    { id: "INV-0011", customer_id: "C-011", customer: "NightOwl Figtree", invoice_date: "May 19", due_days: "30d",   subtotal: 350.00,  gst: 35.00,  total: 385.00,  status: "pending" },
    { id: "INV-0012", customer_id: "C-012", customer: "Star Mart Warrawong", invoice_date: "May 19", due_days: "$0.00", subtotal: 120.00,  gst: 12.00,  total: 132.00,  status: "paid" },
  ].forEach(i => insertInvoice.run(i));

  // ─── Fridges ─────────────────────────────────────────────────────────────────
  const insertFridge = db.prepare(`
    INSERT OR REPLACE INTO fridges (id, customer, branch, label, room, current, total, status, status_color, active)
    VALUES (@id, @customer, @branch, @label, @room, @current, @total, @status, @status_color, @active)
  `);

  [
    { id: "F-9021", customer: "QuickMart Retail",  branch: "North Hub Branch",      label: "Main Walk-in A",  room: "Floor 1, Storage Rm",  current: 1650, total: 2000, status: "Well Stocked",  status_color: "green",  active: 1 },
    { id: "F-9025", customer: "FuelStop Corp",      branch: "East 42nd Station",     label: "Freezer Unit 4",  room: "External Kiosk",        current: 45,   total: 400,  status: "Critical Low",  status_color: "red",    active: 1 },
    { id: "F-8812", customer: "Metro Ice Depot",    branch: "City Central Store",    label: "Cold Room B",     room: "Back of Store",         current: 800,  total: 1200, status: "Stocked",       status_color: "green",  active: 1 },
    { id: "F-7734", customer: "Coles Express",      branch: "Miranda",               label: "Walk-in Fridge",  room: "Storage Area",          current: 32,   total: 480,  status: "Urgent — Empty",status_color: "red",    active: 1 },
    { id: "F-6610", customer: "BP Roadhouse",       branch: "Port Kembla",           label: "Fridge Chest A",  room: "Service Bay",           current: 96,   total: 720,  status: "Low Stock",     status_color: "orange", active: 1 },
    { id: "F-5501", customer: "IGA",                branch: "Bulli",                 label: "Main Cold Room",  room: "Back of Shop",          current: 142,  total: 360,  status: "Order Soon",    status_color: "orange", active: 1 },
    { id: "F-4488", customer: "7-Eleven",           branch: "Figtree",               label: "Fridge Display",  room: "Shop Floor",            current: 188,  total: 240,  status: "Well Stocked",  status_color: "green",  active: 1 },
    { id: "F-3302", customer: "Metro Petroleum",    branch: "Unanderra",             label: "Storage Freezer", room: "Warehouse",             current: 120,  total: 480,  status: "On Hold",       status_color: "grey",   active: 0 },
    { id: "F-2211", customer: "NightOwl Convenience",branch: "Figtree",             label: "Walk-in Display C",room: "Front of Store",        current: 15,   total: 300,  status: "Urgent — Empty",status_color: "red",    active: 1 },
    { id: "F-2212", customer: "Star Mart",           branch: "Warrawong",            label: "Freezer Unit 7",  room: "Kiosk",                 current: 80,   total: 200,  status: "Order Soon",    status_color: "orange", active: 1 },
  ].forEach(f => insertFridge.run(f));

  // ─── Fuel Tanks ──────────────────────────────────────────────────────────────
  const insertTank = db.prepare(`
    INSERT OR REPLACE INTO fuel_tanks (id, name, product, color, capacity, current, water_mm, status)
    VALUES (@id, @name, @product, @color, @capacity, @current, @water_mm, @status)
  `);

  [
    { id: "TK-01", name: "T1: ULP91",  product: "ULP91",   color: "#3b82f6", capacity: 20000, current: 15200, water_mm: 0,  status: "Normal" },
    { id: "TK-02", name: "T2: ULP98",  product: "ULP98",   color: "#ef4444", capacity: 20000, current: 3800,  water_mm: 12, status: "Critical Low" },
    { id: "TK-03", name: "T3: Diesel", product: "Diesel",  color: "#10b981", capacity: 20000, current: 11200, water_mm: 0,  status: "Normal" },
    { id: "TK-04", name: "T4: AdBlue", product: "AdBlue",  color: "#6b7280", capacity: 5000,  current: 2100,  water_mm: 0,  status: "Order Soon" },
    { id: "TK-05", name: "T5: E10",    product: "E10",     color: "#f59e0b", capacity: 15000, current: 8500,  water_mm: 2,  status: "Normal" },
  ].forEach(t => insertTank.run(t));

  // ─── Daily Stats (sample) ────────────────────────────────────────────────────
  const insertStat = db.prepare(`
    INSERT OR IGNORE INTO daily_stats
      (stat_date, bags_delivered, routes_total, routes_completed, revenue, sites_urgent, sites_order_soon)
    VALUES (@stat_date, @bags_delivered, @routes_total, @routes_completed, @revenue, @sites_urgent, @sites_order_soon)
  `);

  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    insertStat.run({
      stat_date: dateStr,
      bags_delivered: Math.floor(800 + Math.random() * 600),
      routes_total: Math.floor(3 + Math.random() * 3),
      routes_completed: Math.floor(2 + Math.random() * 3),
      revenue: Math.round((2000 + Math.random() * 3000) * 100) / 100,
      sites_urgent: Math.floor(1 + Math.random() * 4),
      sites_order_soon: Math.floor(2 + Math.random() * 5),
    });
  }
});

try {
  run();
  console.log("✅ Database seeded successfully.");
  console.log(`   📦 Customers, Sites, Drivers, Routes, Products, Pallets, Inventory, Invoices, Fridges, Tanks seeded.`);
} catch (err) {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
}
