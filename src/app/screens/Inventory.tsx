import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { inventoryApi, type WarehouseStock, type TruckStock, type InventoryMovement } from "../services/api";

const AVATAR_COLORS = [
  "linear-gradient(135deg, #FF5E62 0%, #FF9966 100%)",
  "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
];

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

export const Inventory = () => {
  const [warehouse, setWarehouse] = useState<WarehouseStock[]>([]);
  const [trucks, setTrucks] = useState<TruckStock[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [w, t, m] = await Promise.all([
        inventoryApi.getWarehouse(),
        inventoryApi.getTrucks(),
        inventoryApi.getMovements(),
      ]);
      setWarehouse(w);
      setTrucks(t);
      setMovements(m);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const stockStatus = (stock: number, min: number) => {
    if (stock <= 0) return "critical";
    if (min > 0 && stock < min) return "low";
    return "ok";
  };

  return (
    <div className="page" style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto" }}>
      {showAddModal && <AddMovementModal onClose={() => setShowAddModal(false)} onSave={loadData} />}

      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--navy-deep)", margin: 0, letterSpacing: "-0.02em" }}>Inventory</h1>
          <div className="sub" style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 4 }}>Real-time stock monitoring and movement tracking.</div>
        </div>
        <div className="actions">
          <button className="btn sm" onClick={loadData}><Icon name="refresh" size={14} /> Refresh</button>
          <button className="btn primary" onClick={() => setShowAddModal(true)}><Icon name="plus" size={14} /> Record Stock In</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Warehouse Stock */}
        <div className="card">
          <div className="card-head">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Icon name="inventory" size={18} /> Warehouse Stock</h3>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>PRODUCT</th><th style={{ textAlign: "center" }}>STOCK (BAGS)</th><th style={{ textAlign: "center" }}>STATUS</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading…</td></tr>
                ) : warehouse.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No warehouse stock data. Add products first.</td></tr>
                ) : warehouse.map(item => {
                  const st = stockStatus(item.stock, item.min_stock);
                  return (
                    <tr key={item.name}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{item.stock.toLocaleString()}</td>
                      <td style={{ textAlign: "center" }}>
                        {st === "ok" && <span className="chip green"><span className="dot" />OK</span>}
                        {st === "low" && <span className="chip orange"><span className="dot" />Low</span>}
                        {st === "critical" && <span className="chip red"><span className="dot" />Critical</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock on Trucks */}
        <div className="card">
          <div className="card-head">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Icon name="truck" size={18} /> Stock on Trucks</h3>
            <div className="small muted">{trucks.filter(t => t.status === "Active").length} active trucks</div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>TRUCK ID</th><th>DRIVER</th><th>BAGS</th><th style={{ textAlign: "center" }}>STATUS</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading…</td></tr>
                ) : trucks.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No trucks loaded yet.</td></tr>
                ) : trucks.map(item => (
                  <tr key={item.id}>
                    <td><span style={{ color: "var(--blue)", fontWeight: 600 }}>{item.truck_code}</span></td>
                    <td className="muted">{item.driver_name || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{item.bags}</td>
                    <td style={{ textAlign: "center" }}>
                      {item.status === "Active" ? <span className="chip blue">Active</span>
                        : item.status === "Loading" ? <span className="chip orange">Loading</span>
                        : <span className="chip">Returned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Movements */}
      <div className="card">
        <div className="card-head">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Icon name="clock" size={18} /> Recent Stock Movements</h3>
          <button className="btn sm"><Icon name="download" size={12} /> Export CSV</button>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>DATE & TIME</th><th>TYPE</th><th>PRODUCT</th><th>QUANTITY</th><th>LOCATION</th><th>RECORDED BY</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No stock movements yet. Record your first movement!</td></tr>
              ) : movements.slice(0, 20).map((item, idx) => {
                const qty = item.quantity;
                const qtyDisplay = qty > 0 ? `+${qty}` : `${qty}`;
                const qtyColor = qty > 0 ? "var(--green)" : "var(--red)";
                const typeChips: Record<string, string> = {
                  "Stock In": "green", "Return": "green",
                  "Truck Load": "blue", "Delivery": "blue",
                  "Adjustment": "", "Manual Adjustment": "",
                };
                const chipClass = typeChips[item.type] || "";
                return (
                  <tr key={item.id}>
                    <td className="muted">{item.movement_date} <span style={{ color: "#cbced4", margin: "0 4px" }}>|</span> <span style={{ fontSize: 12 }}>{item.movement_time}</span></td>
                    <td><span className={`chip ${chipClass}`} style={{ fontSize: 11 }}>{item.type}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.product_name || "—"}</td>
                    <td><span style={{ fontWeight: 700, color: qtyColor }}>{qtyDisplay}</span></td>
                    <td className="muted">{item.location || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>
                          {initials(item.recorded_by || "?")}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.recorded_by || "—"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "#fbfbfc" }}>
          <span className="small muted">Showing {Math.min(movements.length, 20)} of {movements.length} movements</span>
        </div>
      </div>
    </div>
  );
};

// ── Add Movement Modal ────────────────────────────────────────────────────────
const AddMovementModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ type: "Stock In", product_name: "", quantity: "", location: "Main Warehouse", recorded_by: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.product_name || !form.quantity) return;
    setSaving(true);
    const qty = parseInt(form.quantity);
    const finalQty = form.type === "Truck Load" || form.type === "Delivery" ? -Math.abs(qty) : Math.abs(qty);
    await inventoryApi.addMovement({ type: form.type, product_name: form.product_name, quantity: finalQty, location: form.location, recorded_by: form.recorded_by, notes: form.notes });
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:480,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Record Stock Movement</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          <div className="field"><label>Movement Type *</label>
            <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option>Stock In</option><option>Truck Load</option><option>Return</option><option>Delivery</option><option>Adjustment</option>
            </select>
          </div>
          <div className="field"><label>Product *</label><input className="input" placeholder="e.g. 5KG Bags" value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} /></div>
          <div className="field"><label>Quantity (bags) *</label><input className="input" type="number" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
          <div className="field"><label>Location</label><input className="input" placeholder="Main Warehouse" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
          <div className="field"><label>Recorded By</label><input className="input" placeholder="Your name" value={form.recorded_by} onChange={e => setForm(p => ({ ...p, recorded_by: e.target.value }))} /></div>
          <div className="field"><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.product_name || !form.quantity}>{saving ? "Saving…" : "Record Movement"}</button>
        </div>
      </div>
    </div>
  );
};
