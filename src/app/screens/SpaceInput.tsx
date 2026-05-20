import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { tanksApi, type FuelTank } from "../services/api";

export const SpaceInput = () => {
  const [tanks, setTanks] = useState<FuelTank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [water, setWater] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await tanksApi.list();
      setTanks(data);
      const r: Record<string, string> = {};
      const w: Record<string, string> = {};
      data.forEach(t => { r[t.id] = String(t.current); w[t.id] = String(t.water_mm); });
      setReadings(r);
      setWater(w);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmitReading = async (tankId: string) => {
    setSaving(tankId);
    await tanksApi.update(tankId, { current: parseInt(readings[tankId]) || 0, water_mm: parseInt(water[tankId]) || 0 });
    await loadData();
    setSaving(null);
  };

  const pct = (t: FuelTank) => t.capacity > 0 ? Math.round((t.current / t.capacity) * 100) : 0;
  const statusColor = (t: FuelTank) => pct(t) < 20 ? "var(--red)" : pct(t) < 40 ? "var(--orange)" : "var(--green)";

  return (
    <div className="page">
      {showAdd && <AddTankModal onClose={() => setShowAdd(false)} onSave={loadData} />}

      <div className="breadcrumbs"><span>Operations</span><span className="here">Space Input</span></div>
      <div className="page-head">
        <div>
          <h1>Space Input — Fuel Tanks</h1>
          <div className="sub">Daily fuel tank readings and space availability</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={loadData}><Icon name="refresh" size={14} /> Refresh</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={14} /> Add Tank</button>
        </div>
      </div>

      {loading ? (
        <div className="card"><div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading tanks…</div></div>
      ) : tanks.length === 0 ? (
        <div className="card"><div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⛽</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No tanks added yet</div>
          <div className="small muted mb-2">Add fuel tanks to start recording daily space readings.</div>
          <button className="btn primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={14} /> Add First Tank</button>
        </div></div>
      ) : (
        <>
          {/* Tank Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
            {tanks.map(tank => (
              <div key={tank.id} className="card">
                <div className="card-head">
                  <div>
                    <h3>{tank.name}</h3>
                    <div className="small muted">{tank.product}</div>
                  </div>
                  <span className="chip" style={{ background: statusColor(tank), color: "white", border: "none", padding: "2px 8px", fontSize: 11 }}>
                    {pct(tank)}%
                  </span>
                </div>
                <div className="card-body">
                  {/* Visual Tank */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <div style={{ width: 80, height: 160, border: "2px solid var(--border)", borderRadius: 8, position: "relative", overflow: "hidden", background: "var(--bg-soft)" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct(tank)}%`, background: tank.color || "var(--blue)", transition: "height 0.5s ease", opacity: 0.8 }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{pct(tank)}%</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label style={{ fontSize: 11 }}>Current Reading (L)</label>
                      <input className="input" type="number" value={readings[tank.id] ?? tank.current}
                        onChange={e => setReadings(p => ({ ...p, [tank.id]: e.target.value }))} />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label style={{ fontSize: 11 }}>Water (mm)</label>
                      <input className="input" type="number" value={water[tank.id] ?? tank.water_mm}
                        onChange={e => setWater(p => ({ ...p, [tank.id]: e.target.value }))} />
                    </div>
                    <div className="small muted">Capacity: {tank.capacity.toLocaleString()} L · Space: {(tank.capacity - tank.current).toLocaleString()} L</div>
                    <button className="btn primary" style={{ width: "100%" }}
                      onClick={() => handleSubmitReading(tank.id)} disabled={saving === tank.id}>
                      {saving === tank.id ? "Saving…" : "Submit Reading"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Table */}
          <div className="card">
            <div className="card-head"><h3>Tank Summary</h3></div>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>TANK</th><th>PRODUCT</th><th>CAPACITY (L)</th><th>CURRENT (L)</th><th>SPACE (L)</th><th>WATER (mm)</th><th>STATUS</th></tr></thead>
                <tbody>
                  {tanks.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td className="muted">{t.product}</td>
                      <td className="num">{t.capacity.toLocaleString()}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{t.current.toLocaleString()}</td>
                      <td className="num" style={{ color: "var(--blue)" }}>{(t.capacity - t.current).toLocaleString()}</td>
                      <td className="num">{t.water_mm}</td>
                      <td>
                        <span className="chip" style={{ background: statusColor(t) + "22", color: statusColor(t), border: `1px solid ${statusColor(t)}44` }}>
                          {t.status || (pct(t) < 20 ? "Critical" : pct(t) < 40 ? "Low" : "Normal")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AddTankModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ name: "", product: "", color: "#3b82f6", capacity: "", current: "" });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.product) return;
    setSaving(true);
    await tanksApi.create({ name: form.name, product: form.product, color: form.color, capacity: parseInt(form.capacity) || 20000, current: parseInt(form.current) || 0 });
    onSave(); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:420,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Add Fuel Tank</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          <div className="field"><label>Tank Name *</label><input className="input" value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. T1: ULP91" /></div>
          <div className="field"><label>Product *</label><input className="input" value={form.product} onChange={e => f("product", e.target.value)} placeholder="e.g. ULP91, Diesel" /></div>
          <div className="field"><label>Capacity (L)</label><input className="input" type="number" value={form.capacity} onChange={e => f("capacity", e.target.value)} placeholder="20000" /></div>
          <div className="field"><label>Current Level (L)</label><input className="input" type="number" value={form.current} onChange={e => f("current", e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Colour</label><input type="color" value={form.color} onChange={e => f("color", e.target.value)} style={{ width:"100%",height:36,border:"1px solid var(--border)",borderRadius:6,padding:2,cursor:"pointer" }} /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.name || !form.product}>{saving ? "Saving…" : "Add Tank"}</button>
        </div>
      </div>
    </div>
  );
};
