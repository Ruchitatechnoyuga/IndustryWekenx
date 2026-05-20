import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { fridgesApi, type Fridge, type FridgeStats } from "../services/api";

export const Fridges = () => {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [stats, setStats] = useState<FridgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editFridge, setEditFridge] = useState<Fridge | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [f, s] = await Promise.all([fridgesApi.list(), fridgesApi.getStats()]);
      setFridges(f);
      setStats(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStock = async (id: string, current: number) => {
    await fridgesApi.updateStock(id, current);
    loadData();
  };

  return (
    <div className="page">
      {(showAdd || editFridge) && (
        <FridgeModal
          fridge={editFridge}
          onClose={() => { setShowAdd(false); setEditFridge(null); }}
          onSave={loadData}
        />
      )}

      <div className="breadcrumbs"><span>Operations</span><span className="here">Fridge Monitor</span></div>
      <div className="page-head">
        <div>
          <h1>Fridge Monitor</h1>
          <div className="sub">Real-time cold storage monitoring across all customer sites</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={loadData}><Icon name="refresh" size={14} /> Refresh</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={14} /> Add Fridge</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label"><Icon name="box" size={12} /> Total Fridges</div>
          <div className="value">{loading ? "—" : stats?.total_fridges ?? 0}</div>
          <div className="delta">Active units</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="box" size={12} /> Total Capacity</div>
          <div className="value">{loading ? "—" : (stats?.total_capacity ?? 0).toLocaleString()}</div>
          <div className="delta">Bags across all fridges</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="chart" size={12} /> Current Stock</div>
          <div className="value">{loading ? "—" : (stats?.current_stock ?? 0).toLocaleString()}</div>
          <div className="delta">{stats ? `${stats.occupancy_pct}% occupancy` : "—"}</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="alert" size={12} /> Low Stock Alerts</div>
          <div className="value" style={{ color: (stats?.low_stock_alerts ?? 0) > 0 ? "var(--red)" : undefined }}>
            {loading ? "—" : stats?.low_stock_alerts ?? 0}
          </div>
          <div className="delta down">{(stats?.low_stock_alerts ?? 0) > 0 ? "Action required" : "All stocked"}</div>
        </div>
      </div>

      {/* Fridges Table */}
      <div className="card">
        <div className="card-head">
          <div><h3>Cold Storage Units</h3><div className="sub">{loading ? "Loading…" : `${fridges.length} units`}</div></div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>ID</th><th>CUSTOMER</th><th>BRANCH / ROOM</th><th>LABEL</th><th>STOCK</th><th>CAPACITY</th><th>STATUS</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : fridges.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  No fridges added yet. Click "Add Fridge" to start monitoring cold storage.
                </td></tr>
              ) : fridges.map(f => {
                const pct = f.total > 0 ? Math.round((f.current / f.total) * 100) : 0;
                return (
                  <tr key={f.id}>
                    <td className="mono small">{f.id}</td>
                    <td style={{ fontWeight: 500 }}>{f.customer}</td>
                    <td className="muted">{[f.branch, f.room].filter(Boolean).join(" · ") || "—"}</td>
                    <td>{f.label || "—"}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{f.current}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="bar" style={{ width: 60 }}>
                          <div className="bar-fill" style={{ width: `${pct}%`, background: pct < 25 ? "var(--red)" : pct < 50 ? "var(--orange)" : "var(--green)" }} />
                        </div>
                        <span className="small mono">{f.current}/{f.total}</span>
                      </div>
                    </td>
                    <td>
                      {f.status_color === "red" && <span className="chip red"><span className="dot" />{f.status}</span>}
                      {f.status_color === "orange" && <span className="chip orange"><span className="dot" />{f.status}</span>}
                      {f.status_color === "green" && <span className="chip green"><span className="dot" />{f.status}</span>}
                      {!["red","orange","green"].includes(f.status_color) && <span className="chip"><span className="dot" />{f.status}</span>}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn ghost sm" onClick={() => setEditFridge(f)}><Icon name="edit" size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Fridge Modal ──────────────────────────────────────────────────────────────
const FridgeModal = ({ fridge, onClose, onSave }: { fridge: Fridge | null; onClose: () => void; onSave: () => void }) => {
  const isEdit = !!fridge;
  const [form, setForm] = useState({
    customer: fridge?.customer || "", branch: fridge?.branch || "",
    label: fridge?.label || "", room: fridge?.room || "",
    current: String(fridge?.current ?? ""), total: String(fridge?.total ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.customer) return;
    setSaving(true);
    if (isEdit) {
      await fridgesApi.update(fridge!.id, { customer: form.customer, branch: form.branch, label: form.label, room: form.room, total: parseInt(form.total) || 0 });
      if (form.current !== String(fridge!.current)) {
        await fridgesApi.updateStock(fridge!.id, parseInt(form.current) || 0);
      }
    } else {
      await fridgesApi.update(`F-${Date.now()}`, { customer: form.customer, branch: form.branch, label: form.label, room: form.room, current: parseInt(form.current) || 0, total: parseInt(form.total) || 0, active: 1 });
    }
    onSave(); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:460,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>{isEdit ? "Edit Fridge" : "Add Fridge"}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div className="field" style={{ gridColumn:"1/-1" }}><label>Customer *</label><input className="input" value={form.customer} onChange={e => f("customer", e.target.value)} placeholder="e.g. Shell Albion" /></div>
          <div className="field"><label>Branch</label><input className="input" value={form.branch} onChange={e => f("branch", e.target.value)} placeholder="e.g. Dapto" /></div>
          <div className="field"><label>Room</label><input className="input" value={form.room} onChange={e => f("room", e.target.value)} placeholder="e.g. Main Fridge" /></div>
          <div className="field" style={{ gridColumn:"1/-1" }}><label>Label</label><input className="input" value={form.label} onChange={e => f("label", e.target.value)} placeholder="e.g. Fridge A" /></div>
          <div className="field"><label>Current Stock (bags)</label><input className="input" type="number" value={form.current} onChange={e => f("current", e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Total Capacity (bags)</label><input className="input" type="number" value={form.total} onChange={e => f("total", e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.customer}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Fridge"}</button>
        </div>
      </div>
    </div>
  );
};
