// index.js – ArcticStream Express API Server
// Run: node index.js  (or: npx nodemon index.js for dev)
// Port: 3001  — Frontend on 5173 connects here via CORS

const express = require("express");
const cors    = require("cors");
const db      = require("./db");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString().slice(11,19)} ${req.method} ${req.path}`);
  next();
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "ArcticStream API", time: new Date().toISOString() });
});

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/customers", (_req, res) => {
  const rows = db.prepare("SELECT * FROM customers ORDER BY name").all();
  res.json(rows);
});

app.get("/api/customers/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Customer not found" });
  res.json(row);
});

app.post("/api/customers", (req, res) => {
  const { id, name, po, hours, contact, phone } = req.body;
  if (!id || !name) return res.status(400).json({ error: "id and name are required" });
  try {
    db.prepare(
      "INSERT INTO customers (id, name, po, hours, contact, phone) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, name, po || "", hours || "", contact || "", phone || "");
    res.status(201).json({ id });
  } catch (e) {
    res.status(409).json({ error: "Customer ID already exists" });
  }
});

app.put("/api/customers/:id", (req, res) => {
  const { name, po, hours, contact, phone } = req.body;
  const result = db.prepare(
    "UPDATE customers SET name=?, po=?, hours=?, contact=?, phone=?, updated_at=datetime('now') WHERE id=?"
  ).run(name, po, hours, contact, phone, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true });
});

app.delete("/api/customers/:id", (req, res) => {
  db.prepare("DELETE FROM customers WHERE id=?").run(req.params.id);
  res.json({ deleted: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SITES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/sites", (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM sites";
  const params = [];
  if (status) {
    query += " WHERE status = ?";
    params.push(status);
  }
  query += " ORDER BY CASE status WHEN 'red' THEN 1 WHEN 'orange' THEN 2 WHEN 'green' THEN 3 ELSE 4 END";
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.get("/api/sites/:id", (req, res) => {
  const row = db.prepare("SELECT s.*, c.contact, c.phone FROM sites s LEFT JOIN customers c ON s.customer_id=c.id WHERE s.id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Site not found" });
  res.json(row);
});

app.post("/api/sites", (req, res) => {
  const f = req.body;
  try {
    db.prepare(`
      INSERT INTO sites (id, customer_id, name, suburb, status, capacity, current_stock, required,
        pallets_desc, last_delivered, eta, scheduled, has_po, emergency,
        map_top, map_left, allocation_cap, stock_reliability)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(f.id, f.customer_id, f.name, f.suburb, f.status || "green",
           f.capacity || 0, f.current_stock || 0, f.required || 0,
           f.pallets_desc || "", f.last_delivered || "", f.eta || "", f.scheduled || "",
           f.has_po ? 1 : 0, f.emergency ? 1 : 0,
           f.map_top || 50, f.map_left || 50, f.allocation_cap || 100,
           f.stock_reliability || "reliable");
    res.status(201).json({ id: f.id });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

app.put("/api/sites/:id", (req, res) => {
  const f = req.body;
  const result = db.prepare(`
    UPDATE sites SET
      name=?, suburb=?, status=?, capacity=?, current_stock=?, required=?,
      pallets_desc=?, last_delivered=?, eta=?, scheduled=?, has_po=?, emergency=?,
      allocation_cap=?, stock_reliability=?, updated_at=datetime('now')
    WHERE id=?
  `).run(f.name, f.suburb, f.status, f.capacity, f.current_stock, f.required,
         f.pallets_desc, f.last_delivered, f.eta, f.scheduled, f.has_po ? 1 : 0,
         f.emergency ? 1 : 0, f.allocation_cap, f.stock_reliability, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true });
});

// Update site stock level only (used after deliveries)
app.patch("/api/sites/:id/stock", (req, res) => {
  const { current_stock, status } = req.body;
  const result = db.prepare(
    "UPDATE sites SET current_stock=?, status=?, updated_at=datetime('now') WHERE id=?"
  ).run(current_stock, status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true });
});

app.delete("/api/sites/:id", (req, res) => {
  db.prepare("DELETE FROM sites WHERE id=?").run(req.params.id);
  res.json({ deleted: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  DRIVERS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/drivers", (req, res) => {
  const { availability } = req.query;
  let query = "SELECT * FROM drivers";
  const params = [];
  if (availability) {
    query += " WHERE availability = ?";
    params.push(availability);
  }
  query += " ORDER BY type, name";
  const rows = db.prepare(query).all(...params);
  // Parse certifications JSON
  const parsed = rows.map(d => ({
    ...d,
    certifications: JSON.parse(d.certifications || "[]")
  }));
  res.json(parsed);
});

app.get("/api/drivers/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM drivers WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Driver not found" });
  res.json({ ...row, certifications: JSON.parse(row.certifications || "[]") });
});

app.post("/api/drivers", (req, res) => {
  const f = req.body;
  try {
    db.prepare(`
      INSERT INTO drivers (id, name, type, availability, shift, truck, phone, certifications, assigned_route)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(f.id, f.name, f.type || "employee", f.availability || "available",
           f.shift || "", f.truck || "", f.phone || "",
           JSON.stringify(f.certifications || []), f.assigned_route || null);
    res.status(201).json({ id: f.id });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

app.put("/api/drivers/:id", (req, res) => {
  const f = req.body;
  const result = db.prepare(`
    UPDATE drivers SET
      name=?, type=?, availability=?, shift=?, truck=?, phone=?,
      certifications=?, assigned_route=?, updated_at=datetime('now')
    WHERE id=?
  `).run(f.name, f.type, f.availability, f.shift, f.truck, f.phone,
         JSON.stringify(f.certifications || []), f.assigned_route || null, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true });
});

// Update driver availability quickly
app.patch("/api/drivers/:id/availability", (req, res) => {
  const { availability, assigned_route } = req.body;
  db.prepare(
    "UPDATE drivers SET availability=?, assigned_route=?, updated_at=datetime('now') WHERE id=?"
  ).run(availability, assigned_route || null, req.params.id);
  res.json({ updated: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/routes", (req, res) => {
  const { date, status } = req.query;
  const today = new Date().toISOString().split("T")[0];
  const targetDate = date || today;

  const rows = db.prepare(`
    SELECT r.*, d.name as driver_name, d.phone as driver_phone, d.type as driver_type
    FROM routes r
    LEFT JOIN drivers d ON r.driver_id = d.id
    WHERE r.route_date = ?
    ${status ? "AND r.status = ?" : ""}
    ORDER BY r.id
  `).all(...(status ? [targetDate, status] : [targetDate]));

  // Attach stops to each route
  const withStops = rows.map(route => {
    const stops = db.prepare(`
      SELECT rs.*, s.name as site_name, s.suburb, s.status as site_status,
             (SELECT sh.id FROM shipments sh WHERE sh.route_id = rs.route_id AND sh.site_id = rs.site_id LIMIT 1) as shipment_id
      FROM route_stops rs
      LEFT JOIN sites s ON rs.site_id = s.id
      WHERE rs.route_id = ?
      ORDER BY rs.stop_order
    `).all(route.id);
    return { ...route, stops };
  });

  res.json(withStops);
});

// AI route suggestion (simplified grouping logic)
const suggestHandler = (req, res) => {
  const urgentSites = db.prepare(`
    SELECT s.*, sh.quantity as shipment_qty, sh.priority as shipment_priority
    FROM sites s
    JOIN shipments sh ON s.id = sh.site_id
    WHERE sh.status = 'new'
    ORDER BY CASE sh.priority WHEN 'emergency' THEN 1 WHEN 'urgent' THEN 2 WHEN 'High' THEN 2 ELSE 3 END
  `).all();
  
  const availableDrivers = db.prepare("SELECT * FROM drivers WHERE availability='available'").all();

  if (!availableDrivers.length) return res.json({ routes: [], message: "No available drivers" });

  // Simple greedy grouping: split sites evenly across drivers
  const chunkSize = Math.ceil(urgentSites.length / Math.min(availableDrivers.length, 3));
  const suggestions = [];

  for (let i = 0; i < availableDrivers.length && i * chunkSize < urgentSites.length; i++) {
    const chunk = urgentSites.slice(i * chunkSize, (i + 1) * chunkSize);
    if (!chunk.length) break;
    const driver = availableDrivers[i];
    const totalBags = chunk.reduce((s, site) => s + site.shipment_qty, 0);
    suggestions.push({
      driver_id: driver.id,
      driver_name: driver.name,
      truck: driver.truck,
      stops: chunk.map((s, idx) => ({
        site_id: s.id,
        site_name: s.name,
        stop_order: idx + 1,
        bags: s.shipment_qty,
        status: s.status
      })),
      total_bags: totalBags,
      utilisation: Math.min(100, Math.round((totalBags / 2000) * 100))
    });
  }

  res.json({ routes: suggestions, sites_covered: urgentSites.length, drivers_used: suggestions.length });
};

app.post("/api/routes/suggest", suggestHandler);
app.get("/api/routes/suggest", suggestHandler);

app.get("/api/routes/:id", (req, res) => {
  const route = db.prepare(`
    SELECT r.*, d.name as driver_name, d.phone as driver_phone
    FROM routes r LEFT JOIN drivers d ON r.driver_id=d.id
    WHERE r.id=?
  `).get(req.params.id);
  if (!route) return res.status(404).json({ error: "Route not found" });

  const stops = db.prepare(`
    SELECT rs.*, s.name as site_name, s.suburb, s.status as site_status, s.capacity, s.current_stock,
           (SELECT sh.id FROM shipments sh WHERE sh.route_id = rs.route_id AND sh.site_id = rs.site_id LIMIT 1) as shipment_id
    FROM route_stops rs LEFT JOIN sites s ON rs.site_id=s.id
    WHERE rs.route_id=? ORDER BY rs.stop_order
  `).all(route.id);

  res.json({ ...route, stops });
});


app.post("/api/routes", (req, res) => {
  const f = req.body;
  const id = f.id || `RT-${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO routes (id, driver_id, truck, status, stops_total, stops_done, distance_km, duration, utilisation, route_date, published)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, f.driver_id, f.truck, f.status || "planned",
           f.stops_total || 0, 0, f.distance_km || 0, f.duration || "",
           f.utilisation || 0, f.route_date || new Date().toISOString().split("T")[0], 0);

    // Insert stops if provided
    if (f.stops && Array.isArray(f.stops)) {
      const addStop = db.prepare(
        "INSERT INTO route_stops (route_id, site_id, stop_order, eta, bags, status) VALUES (?,?,?,?,?,?)"
      );
      f.stops.forEach((s, i) => addStop.run(id, s.site_id, i + 1, s.eta || "", s.bags || 0, "pending"));
    }

    res.status(201).json({ id });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

// Publish routes (mark as published, set drivers on-route)
app.post("/api/routes/publish", (req, res) => {
  const { route_ids } = req.body;
  if (!Array.isArray(route_ids)) return res.status(400).json({ error: "route_ids must be array" });

  const publishRoute = db.prepare("UPDATE routes SET published=1, status='active', updated_at=datetime('now') WHERE id=?");
  const setDriverOnRoute = db.prepare("UPDATE drivers SET availability='on-route', updated_at=datetime('now') WHERE assigned_route=?");

  const tx = db.transaction(() => {
    route_ids.forEach(id => {
      publishRoute.run(id);
      setDriverOnRoute.run(id);
    });
  });
  tx();
  res.json({ published: route_ids.length });
});

// Mark a stop as delivered
app.patch("/api/routes/:routeId/stops/:stopId", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE route_stops SET status=? WHERE id=? AND route_id=?")
    .run(status, req.params.stopId, req.params.routeId);

  // Recalculate stops_done
  const done = db.prepare("SELECT COUNT(*) as cnt FROM route_stops WHERE route_id=? AND status='delivered'").get(req.params.routeId);
  const total = db.prepare("SELECT COUNT(*) as cnt FROM route_stops WHERE route_id=?").get(req.params.routeId);

  let newStatus = "active";
  if (done.cnt >= total.cnt) newStatus = "completed";

  db.prepare("UPDATE routes SET stops_done=?, status=?, updated_at=datetime('now') WHERE id=?")
    .run(done.cnt, newStatus, req.params.routeId);

  res.json({ updated: true, stops_done: done.cnt, route_status: newStatus });
});


// ═════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/products", (req, res) => {
  const { category, status } = req.query;
  let q = "SELECT * FROM products WHERE 1=1";
  const p = [];
  if (category) { q += " AND category=?"; p.push(category); }
  if (status)   { q += " AND status=?";   p.push(status); }
  q += " ORDER BY category, name";
  res.json(db.prepare(q).all(...p));
});

app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.post("/api/products", (req, res) => {
  const f = req.body;
  const id = f.id || `PRD-${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO products (id, name, sku, category, unit, price, cost, stock, min_stock, status, pallet_qty, supplier)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, f.name, f.sku, f.category, f.unit || "Bag",
           f.price || 0, f.cost || 0, f.stock || 0, f.min_stock || 0,
           f.status || "active", f.pallet_qty || 0, f.supplier || "");
    res.status(201).json({ id });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

app.put("/api/products/:id", (req, res) => {
  const f = req.body;
  const result = db.prepare(`
    UPDATE products SET name=?, sku=?, category=?, unit=?, price=?, cost=?,
      stock=?, min_stock=?, status=?, pallet_qty=?, supplier=?, updated_at=datetime('now')
    WHERE id=?
  `).run(f.name, f.sku, f.category, f.unit, f.price, f.cost,
         f.stock, f.min_stock, f.status, f.pallet_qty, f.supplier, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true });
});

app.patch("/api/products/:id/stock", (req, res) => {
  const { delta } = req.body; // positive = add, negative = remove
  const prod = db.prepare("SELECT stock, min_stock FROM products WHERE id=?").get(req.params.id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  const newStock = Math.max(0, prod.stock + delta);
  const newStatus = newStock <= 0 ? "out-of-stock" : newStock < prod.min_stock ? "low-stock" : "active";
  db.prepare("UPDATE products SET stock=?, status=?, updated_at=datetime('now') WHERE id=?")
    .run(newStock, newStatus, req.params.id);
  res.json({ stock: newStock, status: newStatus });
});

app.delete("/api/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ deleted: true });
});

// ─── Pallets ─────────────────────────────────────────────────────────────────
app.get("/api/pallets", (_req, res) => {
  const pallets = db.prepare("SELECT * FROM pallets ORDER BY type").all();
  const withProducts = pallets.map(p => {
    const products = db.prepare(`
      SELECT pr.id, pr.name, pr.sku FROM pallet_products pp
      JOIN products pr ON pp.product_id = pr.id
      WHERE pp.pallet_id = ?
    `).all(p.id);
    return { ...p, products };
  });
  res.json(withProducts);
});

app.put("/api/pallets/:id", (req, res) => {
  const f = req.body;
  db.prepare(
    "UPDATE pallets SET type=?, capacity=?, dimensions=?, weight_kg=?, in_stock=?, last_used=? WHERE id=?"
  ).run(f.type, f.capacity, f.dimensions, f.weight_kg, f.in_stock, f.last_used, req.params.id);
  res.json({ updated: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  INVENTORY
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/inventory/warehouse", (_req, res) => {
  // Aggregate current stock per product from products table
  const rows = db.prepare(`
    SELECT id, name, stock, min_stock,
      CASE WHEN stock <= 0 THEN 'critical'
           WHEN stock < min_stock THEN 'low'
           ELSE 'ok'
      END as status
    FROM products ORDER BY name
  `).all();
  res.json(rows);
});

app.get("/api/inventory/trucks", (_req, res) => {
  res.json(db.prepare("SELECT * FROM truck_stock ORDER BY truck_code").all());
});

app.get("/api/inventory/movements", (req, res) => {
  const { limit = 50, offset = 0, type } = req.query;
  let q = "SELECT * FROM inventory_movements WHERE 1=1";
  const p = [];
  if (type) { q += " AND type=?"; p.push(type); }
  q += " ORDER BY movement_date DESC, movement_time DESC LIMIT ? OFFSET ?";
  p.push(Number(limit), Number(offset));
  res.json(db.prepare(q).all(...p));
});

app.post("/api/inventory/movements", (req, res) => {
  const f = req.body;
  if (!f.type || !f.quantity) return res.status(400).json({ error: "type and quantity required" });

  const id = db.prepare(`
    INSERT INTO inventory_movements
      (movement_date, movement_time, type, product_id, product_name, quantity, location, recorded_by, notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    f.movement_date || new Date().toISOString().split("T")[0],
    f.movement_time || new Date().toTimeString().slice(0, 5),
    f.type, f.product_id || null, f.product_name || "", f.quantity,
    f.location || "", f.recorded_by || "System", f.notes || ""
  ).lastInsertRowid;

  // Auto-update product stock if product_id given
  if (f.product_id) {
    const prod = db.prepare("SELECT stock, min_stock FROM products WHERE id=?").get(f.product_id);
    if (prod) {
      const newStock = Math.max(0, prod.stock + f.quantity);
      const newStatus = newStock < prod.min_stock ? "low-stock" : "active";
      db.prepare("UPDATE products SET stock=?, status=?, updated_at=datetime('now') WHERE id=?")
        .run(newStock, newStatus, f.product_id);
    }
  }

  res.status(201).json({ id });
});

app.put("/api/inventory/trucks/:id", (req, res) => {
  const { bags, status } = req.body;
  db.prepare("UPDATE truck_stock SET bags=?, status=?, updated_at=datetime('now') WHERE id=?")
    .run(bags, status, req.params.id);
  res.json({ updated: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  INVOICES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/invoices", (req, res) => {
  const { status } = req.query;
  let q = "SELECT i.*, c.contact, c.phone as c_phone FROM invoices i LEFT JOIN customers c ON i.customer_id=c.id WHERE 1=1";
  const p = [];
  if (status) { q += " AND i.status=?"; p.push(status); }
  q += " ORDER BY i.invoice_date DESC, i.id DESC";
  res.json(db.prepare(q).all(...p));
});

app.get("/api/invoices/:id", (req, res) => {
  const invoice = db.prepare(
    "SELECT i.*, c.contact, c.phone as c_phone FROM invoices i LEFT JOIN customers c ON i.customer_id=c.id WHERE i.id=?"
  ).get(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Not found" });
  const items = db.prepare("SELECT * FROM invoice_items WHERE invoice_id=?").all(req.params.id);
  res.json({ ...invoice, items });
});

app.post("/api/invoices", (req, res) => {
  const f = req.body;
  const id = f.id || `INV-${String(Date.now()).slice(-6)}`;
  const subtotal = f.subtotal || 0;
  const gst = f.gst || Math.round(subtotal * 0.1 * 100) / 100;
  const total = f.total || subtotal + gst;

  try {
    db.prepare(`
      INSERT INTO invoices (id, customer_id, customer, invoice_date, due_days, subtotal, gst, total, status, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(id, f.customer_id || null, f.customer || "", f.invoice_date || new Date().toLocaleDateString("en-AU"),
           f.due_days || "30d", subtotal, gst, total, f.status || "pending", f.notes || "");

    if (f.items && Array.isArray(f.items)) {
      const addItem = db.prepare(
        "INSERT INTO invoice_items (invoice_id, description, product_id, quantity, unit_price, line_total) VALUES (?,?,?,?,?,?)"
      );
      f.items.forEach(item => {
        const lineTotal = (item.quantity || 1) * (item.unit_price || 0);
        addItem.run(id, item.description || "", item.product_id || null, item.quantity || 1, item.unit_price || 0, lineTotal);
      });
    }

    res.status(201).json({ id });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

app.patch("/api/invoices/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["draft", "pending", "paid", "overdue"];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
  const result = db.prepare("UPDATE invoices SET status=?, updated_at=datetime('now') WHERE id=?")
    .run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: "Not found" });
  res.json({ updated: true, status });
});

app.delete("/api/invoices/:id", (req, res) => {
  db.prepare("DELETE FROM invoice_items WHERE invoice_id=?").run(req.params.id);
  db.prepare("DELETE FROM invoices WHERE id=?").run(req.params.id);
  res.json({ deleted: true });
});

// Invoice summary KPIs
app.get("/api/invoices/stats/summary", (_req, res) => {
  const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN status != 'paid' THEN total ELSE 0 END) as outstanding,
      SUM(CASE WHEN status = 'overdue'  THEN total ELSE 0 END) as overdue,
      SUM(CASE WHEN invoice_date >= date('now','-30 days') THEN total ELSE 0 END) as last_30_days,
      COUNT(*) as total_count,
      SUM(CASE WHEN status='paid' THEN total ELSE 0 END) as total_paid
    FROM invoices
  `).get();
  res.json(stats);
});


// ═════════════════════════════════════════════════════════════════════════════
//  SHIPMENTS
// ═════════════════════════════════════════════════════════════════════════════

app.post("/api/shipments", (req, res) => {
  const f = req.body;
  if (!f.customer_name || !f.site_name || !f.product_name || !f.quantity) {
    return res.status(400).json({ error: "Missing required fields (customer_name, site_name, product_name, quantity)" });
  }

  try {
    // Generate sequential ID: SHP-001, SHP-002, etc.
    const maxIdRow = db.prepare("SELECT id FROM shipments ORDER BY rowid DESC LIMIT 1").get();
    let nextNum = 1;
    if (maxIdRow && maxIdRow.id) {
      const match = maxIdRow.id.match(/SHP-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const id = `SHP-${String(nextNum).padStart(3, '0')}`;

    // Lookup corresponding IDs
    let customer_id = f.customer_id;
    if (!customer_id) {
      const cust = db.prepare("SELECT id FROM customers WHERE name = ?").get(f.customer_name);
      customer_id = cust ? cust.id : `CUST-${Date.now()}`;
    }

    let site_id = f.site_id;
    if (!site_id) {
      const st = db.prepare("SELECT id FROM sites WHERE name = ?").get(f.site_name);
      site_id = st ? st.id : `SITE-${Date.now()}`;
    }

    let product_id = f.product_id;
    if (!product_id) {
      const prod = db.prepare("SELECT id FROM products WHERE name = ?").get(f.product_name);
      product_id = prod ? prod.id : `PRD-${Date.now()}`;
    }

    // Determine site status based on priority:
    // if priority is "emergency" set site status to "red", if "urgent" set to "red", if "normal" set to "orange"
    const priority = (f.priority || "normal").toLowerCase();
    let siteStatus = "orange";
    if (priority === "emergency" || priority === "urgent" || priority === "high") {
      siteStatus = "red";
    }

    const tx = db.transaction(() => {
      // Save shipment
      db.prepare(`
        INSERT INTO shipments (
          id, customer_id, customer_name, site_id, site_name, product_id, product_name,
          quantity, pallet_type, delivery_date, time_window, priority, assigned_driver_id,
          po_number, special_instructions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
      `).run(
        id, customer_id, f.customer_name, site_id, f.site_name, product_id, f.product_name,
        f.quantity, f.pallet_type || "", f.delivery_date || "", f.time_window || "",
        f.priority || "Normal", f.assigned_driver_id || null, f.po_number || "", f.special_instructions || ""
      );

      // Update site status, required quantity, and scheduled date
      db.prepare(`
        UPDATE sites
        SET status = ?, required = ?, scheduled = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(siteStatus, f.quantity, f.delivery_date || "", site_id);
    });

    tx();
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/shipments", (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT s.*, 
           COALESCE(c.name, s.customer_name) as customer_name, 
           COALESCE(st.name, s.site_name) as site_name, 
           d.name as driver_name
    FROM shipments s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN sites st ON s.site_id = st.id
    LEFT JOIN drivers d ON s.assigned_driver_id = d.id
  `;
  const params = [];
  if (status) {
    query += " WHERE s.status = ?";
    params.push(status);
  }
  query += " ORDER BY s.created_at DESC";

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/shipments/:id", (req, res) => {
  try {
    const row = db.prepare(`
      SELECT s.*, 
             COALESCE(c.name, s.customer_name) as customer_name, 
             COALESCE(st.name, s.site_name) as site_name, 
             d.name as driver_name
      FROM shipments s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sites st ON s.site_id = st.id
      LEFT JOIN drivers d ON s.assigned_driver_id = d.id
      WHERE s.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: "Shipment not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/shipments/:id/status", (req, res) => {
  const { status, route_id } = req.body;
  const { id } = req.params;

  try {
    const shipment = db.prepare("SELECT * FROM shipments WHERE id = ?").get(id);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    const tx = db.transaction(() => {
      if (status === "assigned") {
        db.prepare("UPDATE shipments SET status = ?, route_id = ?, updated_at = datetime('now') WHERE id = ?")
          .run("assigned", route_id || shipment.route_id, id);
      } else if (status === "delivered") {
        // 1. Deduct quantity from product stock
        const prod = db.prepare("SELECT stock, min_stock FROM products WHERE id = ?").get(shipment.product_id);
        if (prod) {
          const newStock = Math.max(0, prod.stock - shipment.quantity);
          const newStatus = newStock <= 0 ? "out-of-stock" : newStock < prod.min_stock ? "low-stock" : "active";
          db.prepare("UPDATE products SET stock = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
            .run(newStock, newStatus, shipment.product_id);
        }

        // 2. Add inventory movement log
        db.prepare(`
          INSERT INTO inventory_movements (movement_date, movement_time, type, product_id, product_name, quantity, location, recorded_by, notes)
          VALUES (?, ?, 'Delivery', ?, ?, ?, ?, 'System', ?)
        `).run(
          new Date().toISOString().split("T")[0],
          new Date().toTimeString().slice(0, 5),
          shipment.product_id,
          shipment.product_name,
          -shipment.quantity,
          shipment.site_name,
          `Shipment ${id} delivered`
        );

        // 3. Update site's current_stock
        const site = db.prepare("SELECT current_stock, capacity FROM sites WHERE id = ?").get(shipment.site_id);
        if (site) {
          const newSiteStock = Math.min(site.capacity, (site.current_stock || 0) + shipment.quantity);
          const pct = site.capacity ? Math.round((newSiteStock / site.capacity) * 100) : 100;
          let siteStatus = "green";
          if (pct <= 20) siteStatus = "red";
          else if (pct <= 45) siteStatus = "orange";

          db.prepare("UPDATE sites SET current_stock = ?, status = ?, required = 0, updated_at = datetime('now') WHERE id = ?")
            .run(newSiteStock, siteStatus, shipment.site_id);
        }

        db.prepare("UPDATE shipments SET status = ?, updated_at = datetime('now') WHERE id = ?")
          .run("delivered", id);

      } else if (status === "invoiced") {
        // Create a new record in invoices
        const invoiceId = `INV-${String(Date.now()).slice(-6)}`;
        const prod = db.prepare("SELECT price FROM products WHERE id = ?").get(shipment.product_id);
        const price = prod ? prod.price : 0;
        const subtotal = shipment.quantity * price;
        const gst = Math.round(subtotal * 0.1 * 100) / 100;
        const total = subtotal + gst;

        db.prepare(`
          INSERT INTO invoices (id, customer_id, customer, invoice_date, due_days, subtotal, gst, total, status, notes, shipment_id)
          VALUES (?, ?, ?, ?, '30d', ?, ?, ?, 'pending', ?, ?)
        `).run(
          invoiceId,
          shipment.customer_id,
          shipment.customer_name,
          new Date().toLocaleDateString("en-AU"),
          subtotal,
          gst,
          total,
          `Auto-created from shipment ${id}`,
          id
        );

        db.prepare(`
          INSERT INTO invoice_items (invoice_id, description, product_id, quantity, unit_price, line_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          invoiceId,
          `${shipment.product_name} delivery`,
          shipment.product_id,
          shipment.quantity,
          price,
          subtotal
        );

        db.prepare("UPDATE shipments SET invoice_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
          .run(invoiceId, "invoiced", id);
      } else {
        // Fallback for general status updates (e.g. "in-transit")
        db.prepare("UPDATE shipments SET status = ?, updated_at = datetime('now') WHERE id = ?")
          .run(status, id);
      }
    });

    tx();
    res.json({ updated: true, status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/shipments/:id", (req, res) => {
  const { id } = req.params;
  try {
    const shipment = db.prepare("SELECT * FROM shipments WHERE id = ?").get(id);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    if (shipment.status !== "new") {
      return res.status(400).json({ error: "Only shipments with status 'new' can be deleted" });
    }

    const tx = db.transaction(() => {
      // Revert site status back
      const site = db.prepare("SELECT current_stock, capacity FROM sites WHERE id = ?").get(shipment.site_id);
      let oldStatus = "green";
      if (site && site.capacity) {
        const pct = Math.round((site.current_stock / site.capacity) * 100);
        if (pct <= 20) oldStatus = "red";
        else if (pct <= 45) oldStatus = "orange";
      }

      db.prepare("UPDATE sites SET status = ?, required = 0, scheduled = NULL, updated_at = datetime('now') WHERE id = ?")
        .run(oldStatus, shipment.site_id);

      db.prepare("DELETE FROM shipments WHERE id = ?").run(id);
    });

    tx();
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  FRIDGES
// ═════════════════════════════════════════════════════════════════════════════


app.get("/api/fridges", (req, res) => {
  const { active } = req.query;
  let q = "SELECT * FROM fridges WHERE 1=1";
  const p = [];
  if (active !== undefined) { q += " AND active=?"; p.push(active === "true" || active === "1" ? 1 : 0); }
  q += " ORDER BY status_color, customer";
  res.json(db.prepare(q).all(...p));
});

app.get("/api/fridges/stats", (_req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_fridges,
      SUM(total) as total_capacity,
      SUM(current) as current_stock,
      ROUND(100.0 * SUM(current) / NULLIF(SUM(total), 0), 1) as occupancy_pct,
      SUM(CASE WHEN status_color IN ('red','orange') THEN 1 ELSE 0 END) as low_stock_alerts
    FROM fridges WHERE active=1
  `).get();
  res.json(stats);
});

app.put("/api/fridges/:id", (req, res) => {
  const f = req.body;
  const occupancy = f.total ? Math.round((f.current / f.total) * 100) : 0;
  let status = "Well Stocked", status_color = "green";
  if (occupancy < 20)  { status = "Critical Low"; status_color = "red"; }
  else if (occupancy < 40) { status = "Low Stock"; status_color = "orange"; }
  else if (occupancy < 60) { status = "Order Soon"; status_color = "orange"; }

  db.prepare(`
    UPDATE fridges SET customer=?, branch=?, label=?, room=?, current=?, total=?,
      status=?, status_color=?, active=?, updated_at=datetime('now')
    WHERE id=?
  `).run(f.customer, f.branch, f.label, f.room, f.current, f.total,
         f.status || status, f.status_color || status_color, f.active ? 1 : 0, req.params.id);
  res.json({ updated: true });
});

app.patch("/api/fridges/:id/stock", (req, res) => {
  const { current } = req.body;
  const fridge = db.prepare("SELECT total FROM fridges WHERE id=?").get(req.params.id);
  if (!fridge) return res.status(404).json({ error: "Not found" });
  const occupancy = Math.round((current / fridge.total) * 100);
  let status = "Well Stocked", status_color = "green";
  if (occupancy < 20)       { status = "Critical Low"; status_color = "red"; }
  else if (occupancy < 40)  { status = "Low Stock";    status_color = "orange"; }
  else if (occupancy < 60)  { status = "Order Soon";   status_color = "orange"; }
  db.prepare("UPDATE fridges SET current=?, status=?, status_color=?, updated_at=datetime('now') WHERE id=?")
    .run(current, status, status_color, req.params.id);
  res.json({ updated: true, status, occupancy });
});

// ═════════════════════════════════════════════════════════════════════════════
//  FUEL TANKS (Space Input module)
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/tanks", (_req, res) => {
  const tanks = db.prepare("SELECT * FROM fuel_tanks ORDER BY id").all();
  // Attach today's latest reading for each tank
  const withReadings = tanks.map(t => {
    const latest = db.prepare(
      "SELECT * FROM space_readings WHERE tank_id=? ORDER BY reading_date DESC, reading_time DESC LIMIT 1"
    ).get(t.id);
    return { ...t, latest_reading: latest || null };
  });
  res.json(withReadings);
});

app.patch("/api/tanks/:id", (req, res) => {
  const { current, water_mm, recorded_by, notes } = req.body;
  const tank = db.prepare("SELECT * FROM fuel_tanks WHERE id=?").get(req.params.id);
  if (!tank) return res.status(404).json({ error: "Not found" });

  const pct = Math.round((current / tank.capacity) * 100);
  let status = "Normal";
  if (pct <= 20)      status = "Critical Low";
  else if (pct <= 35) status = "Order Soon";

  db.prepare("UPDATE fuel_tanks SET current=?, water_mm=?, status=?, updated_at=datetime('now') WHERE id=?")
    .run(current, water_mm || 0, status, req.params.id);

  // Log the reading
  db.prepare(`
    INSERT INTO space_readings (tank_id, reading, water_mm, recorded_by, notes)
    VALUES (?,?,?,?,?)
  `).run(req.params.id, current, water_mm || 0, recorded_by || "Operator", notes || "");

  res.json({ updated: true, status, percentage: pct });
});

app.get("/api/tanks/:id/history", (req, res) => {
  const { limit = 30 } = req.query;
  const rows = db.prepare(
    "SELECT * FROM space_readings WHERE tank_id=? ORDER BY reading_date DESC, reading_time DESC LIMIT ?"
  ).all(req.params.id, Number(limit));
  res.json(rows);
});

// Bulk save all tank readings (end-of-day dip)
app.post("/api/tanks/bulk-save", (req, res) => {
  const { readings, recorded_by } = req.body; // [{tank_id, current, water_mm}]
  if (!Array.isArray(readings)) return res.status(400).json({ error: "readings must be array" });

  const tx = db.transaction(() => {
    readings.forEach(r => {
      const tank = db.prepare("SELECT * FROM fuel_tanks WHERE id=?").get(r.tank_id);
      if (!tank) return;
      const pct = Math.round((r.current / tank.capacity) * 100);
      let status = "Normal";
      if (pct <= 20) status = "Critical Low";
      else if (pct <= 35) status = "Order Soon";
      db.prepare("UPDATE fuel_tanks SET current=?, water_mm=?, status=?, updated_at=datetime('now') WHERE id=?")
        .run(r.current, r.water_mm || 0, status, r.tank_id);
      db.prepare("INSERT INTO space_readings (tank_id, reading, water_mm, recorded_by) VALUES (?,?,?,?)")
        .run(r.tank_id, r.current, r.water_mm || 0, recorded_by || "Operator");
    });
  });
  tx();
  res.json({ saved: readings.length });
});

// ═════════════════════════════════════════════════════════════════════════════
//  REPORTS & ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/reports/daily-stats", (req, res) => {
  const { days = 30 } = req.query;
  const rows = db.prepare(
    "SELECT * FROM daily_stats ORDER BY stat_date DESC LIMIT ?"
  ).all(Number(days));
  res.json(rows.reverse()); // chronological
});

app.get("/api/reports/summary", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);

  const kpis = {
    total_revenue_month: db.prepare(
      "SELECT COALESCE(SUM(revenue),0) as v FROM daily_stats WHERE stat_date LIKE ?"
    ).get(`${thisMonth}%`).v,
    bags_delivered_today: db.prepare(
      "SELECT COALESCE(bags_delivered,0) as v FROM daily_stats WHERE stat_date=?"
    ).get(today)?.v || 0,
    routes_today: db.prepare(
      "SELECT COALESCE(routes_total,0) as v FROM daily_stats WHERE stat_date=?"
    ).get(today)?.v || 0,
    active_routes: db.prepare(
      "SELECT COUNT(*) as v FROM routes WHERE status='active' AND route_date=?"
    ).get(today).v,
    urgent_sites: db.prepare(
      "SELECT COUNT(*) as v FROM sites WHERE status='red'"
    ).get().v,
    order_soon_sites: db.prepare(
      "SELECT COUNT(*) as v FROM sites WHERE status='orange'"
    ).get().v,
    total_outstanding_invoices: db.prepare(
      "SELECT COALESCE(SUM(total),0) as v FROM invoices WHERE status != 'paid'"
    ).get().v,
    low_stock_products: db.prepare(
      "SELECT COUNT(*) as v FROM products WHERE status='low-stock'"
    ).get().v,
  };

  res.json(kpis);
});

app.get("/api/reports/top-customers", (req, res) => {
  const { limit = 5 } = req.query;
  const rows = db.prepare(`
    SELECT customer, SUM(total) as revenue, COUNT(*) as invoice_count
    FROM invoices WHERE status='paid'
    GROUP BY customer ORDER BY revenue DESC LIMIT ?
  `).all(Number(limit));
  res.json(rows);
});

app.get("/api/reports/driver-performance", (_req, res) => {
  const rows = db.prepare(`
    SELECT d.id, d.name,
      COUNT(r.id) as routes_total,
      SUM(r.stops_total) as deliveries,
      ROUND(100.0 * SUM(r.stops_done) / NULLIF(SUM(r.stops_total), 0), 1) as on_time_pct
    FROM drivers d
    LEFT JOIN routes r ON r.driver_id = d.id
    GROUP BY d.id ORDER BY deliveries DESC
  `).all();
  res.json(rows);
});

// ═════════════════════════════════════════════════════════════════════════════
//  DASHBOARD – combined data for the ops overview
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/dashboard", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const sites        = db.prepare("SELECT * FROM sites ORDER BY CASE status WHEN 'red' THEN 1 WHEN 'orange' THEN 2 WHEN 'green' THEN 3 ELSE 4 END").all();
  const todayStat    = db.prepare("SELECT * FROM daily_stats WHERE stat_date=?").get(today);
  const routes       = db.prepare("SELECT r.*, d.name as driver_name FROM routes r LEFT JOIN drivers d ON r.driver_id=d.id WHERE route_date=?").all(today);
  const urgentCount  = sites.filter(s => s.status === "red").length;
  const soonCount    = sites.filter(s => s.status === "orange").length;
  const activeRoutes = routes.filter(r => r.status === "active").length;

  const pending_shipments = db.prepare("SELECT COUNT(*) as cnt FROM shipments WHERE status = 'new'").get().cnt;
  const urgent_shipments = db.prepare("SELECT COUNT(*) as cnt FROM shipments WHERE priority IN ('emergency', 'urgent', 'High')").get().cnt;

  res.json({
    sites,
    routes,
    pending_shipments,
    urgent_shipments,
    kpis: {
      urgent_sites: urgentCount,
      order_soon_sites: soonCount,
      active_routes: activeRoutes,
      total_routes: routes.length,
      bags_delivered: todayStat?.bags_delivered || 0,
      bags_yesterday: 0,
      pending_shipments,
      urgent_shipments
    }
  });
});


// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "API route not found" }));

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ArcticStream API running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/customers /api/sites /api/drivers /api/routes`);
  console.log(`             /api/products /api/pallets /api/inventory/*`);
  console.log(`             /api/invoices /api/fridges /api/tanks /api/reports/*`);
  console.log(`             /api/dashboard\n`);
});
