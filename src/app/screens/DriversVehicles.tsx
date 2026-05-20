import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/Icon";
import { driversApi, vehiclesApi } from "../services/api";

const CERTS = ["Heavy Vehicle", "Forklift", "Dangerous Goods", "Refrigerated"];
const statusMap: Record<string, string> = { available:"Available","on-route":"On Route","on-leave":"On Leave",unavailable:"Unavailable" };
const statusApiMap: Record<string, string> = { Available:"available","On Route":"on-route","On Leave":"on-leave",Unavailable:"unavailable" };
const initials = (name: string) => name.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2);

export const DriversVehicles = () => {
  const [activeTab, setActiveTab] = useState<"drivers"|"vehicles">("drivers");
  
  // ── Collapsible Panel States (Add Vehicle Drawer) ──
  const [isVhDetailsOpen, setIsVhDetailsOpen] = useState(true);
  const [isVhStatusOpen, setIsVhStatusOpen] = useState(true);

  // ── Collapsible Panel States (Add Driver Drawer) ──
  const [isDrPersonalOpen, setIsDrPersonalOpen] = useState(true);
  const [isDrAssignmentOpen, setIsDrAssignmentOpen] = useState(true);
  const [isDrAvailabilityOpen, setIsDrAvailabilityOpen] = useState(true);

  // ── Quick Fill Helper for Vehicles ──
  const handleQuickFillVehicle = () => {
    const examples = [
      { code: "T-07", type: "Refrigerated Truck", capacity: 160, status: "Active" },
      { code: "T-08", type: "Van",                capacity: 90,  status: "Active" },
      { code: "T-09", type: "Flatbed",            capacity: 120, status: "Maintenance" }
    ];
    const pick = examples[Math.floor(Math.random() * examples.length)];
    setVhCode(pick.code);
    setVhType(pick.type);
    setVhCap(pick.capacity);
    setVhStatus(pick.status);
  };

  // ── Quick Fill Helper for Drivers ──
  const handleQuickFillDriver = () => {
    const examples = [
      { name: "Robert Miller", type: "Employee", phone: "412 882 119", shift: "6:00 AM – 2:00 PM", certs: ["Heavy Vehicle", "Forklift"], availability: "Available" },
      { name: "Jessica Taylor", type: "Employee", phone: "432 990 411", shift: "8:00 AM – 4:00 PM", certs: ["Heavy Vehicle", "Refrigerated"], availability: "Available" },
      { name: "David Vance", type: "Contractor", phone: "466 771 223", shift: "6:00 AM – 2:00 PM", certs: ["Dangerous Goods"], availability: "Available" }
    ];
    const pick = examples[Math.floor(Math.random() * examples.length)];
    setDrName(pick.name);
    setDrType(pick.type);
    setDrPhone(pick.phone);
    setDrShift(pick.shift);
    setDrCerts(pick.certs);
    setDrStatus(pick.availability);
  };

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [driverFilter, setDriverFilter] = useState("All");
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [editDr, setEditDr] = useState<any>(null);
  const [editVh, setEditVh] = useState<any>(null);
  const [drName,setDrName]=useState(""); const [drType,setDrType]=useState("Employee");
  const [drPhone,setDrPhone]=useState(""); const [drShift,setDrShift]=useState("");
  const [drTruck,setDrTruck]=useState(""); const [drCerts,setDrCerts]=useState<string[]>([]);
  const [drStatus,setDrStatus]=useState("Available");
  const [vhCode,setVhCode]=useState(""); const [vhType,setVhType]=useState("Refrigerated Truck");
  const [vhCap,setVhCap]=useState(100); const [vhStatus,setVhStatus]=useState("Active");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d,v] = await Promise.all([driversApi.list(), vehiclesApi.list()]);
      setDrivers(d as any[]); setVehicles(v as any[]);
    } catch { setError("Cannot reach server on port 3001"); }
    finally { setLoading(false); }
  },[]);
  useEffect(() => { load(); },[load]);

  const filtered = drivers.filter(d => driverFilter==="All" || statusMap[d.availability]===driverFilter);

  const openAddDriver = () => {
    setEditDr(null); setDrName(""); setDrType("Employee"); setDrPhone("");
    setDrShift("6:00 AM – 2:00 PM"); setDrTruck(""); setDrCerts([]); setDrStatus("Available");
    setIsDriverOpen(true);
  };
  const openEditDriver = (d:any) => {
    setEditDr(d); setDrName(d.name); setDrType(d.type==="employee"?"Employee":"Contractor");
    setDrPhone(d.phone); setDrShift(d.shift); setDrTruck(d.truck||"");
    setDrCerts(()=>{try{return JSON.parse(d.certifications||"[]");}catch{return [];}});
    setDrStatus(statusMap[d.availability]||"Available"); setIsDriverOpen(true);
  };
  const saveDriver = async (e:React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const p:any = { name:drName, type:drType.toLowerCase(), phone:drPhone, shift:drShift,
        truck:drTruck, certifications:JSON.stringify(drCerts), availability:statusApiMap[drStatus]||"available" };
      if(editDr) await driversApi.update(editDr.id,p);
      else await driversApi.create({id:`D-${Date.now()}`,...p});
      await load(); setIsDriverOpen(false);
    } catch(e:any){setError(e.message);} finally{setSaving(false);}
  };

  const openAddVehicle = () => {
    setEditVh(null); setVhCode(""); setVhType("Refrigerated Truck"); setVhCap(100); setVhStatus("Active");
    setIsVehicleOpen(true);
  };
  const openEditVehicle = (v:any) => {
    setEditVh(v); setVhCode(v.code); setVhType(v.type); setVhCap(v.capacity); setVhStatus(v.status);
    setIsVehicleOpen(true);
  };
  const saveVehicle = async (e:React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const p = {code:vhCode,type:vhType,capacity:Number(vhCap),status:vhStatus};
      if(editVh) await vehiclesApi.update(editVh.id,p);
      else await vehiclesApi.create({id:`V-${Date.now()}`,...p});
      await load(); setIsVehicleOpen(false);
    } catch(e:any){setError(e.message);} finally{setSaving(false);}
  };

  const toggleCert = (c:string) => setDrCerts(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);

  const statusBadge = (avail:string) => {
    const label = statusMap[avail]||avail;
    const bg:Record<string,string> = {Available:"#f0fdf4",OnRoute:"#f0f9ff",OnLeave:"#fef9c3",Unavailable:"#f1f2f4"};
    const col:Record<string,string> = {Available:"#16a34a",OnRoute:"#0ea5e9",OnLeave:"#a16207",Unavailable:"#6b7280"};
    const k = label.replace(" ","");
    return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,padding:"2px 8px",borderRadius:999,background:bg[k]||"#f1f2f4",color:col[k]||"#6b7280",border:`1px solid ${col[k]||"#d4d7dd"}33`}}><span style={{width:6,height:6,borderRadius:"50%",background:"currentColor"}} />{label}</span>;
  };

  const CSS = `
    .dv{--blue:#0EA5E9;--bh:#0284c7;--bs:#f0f9ff;}
    .dv .tab.active{color:#0EA5E9!important;border-bottom-color:#0EA5E9!important;}
    .dv .btn.primary{background:#0EA5E9!important;border-color:#0EA5E9!important;color:#fff!important;}
    .dv .btn.primary:hover{background:#0284c7!important;}
    .fc{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
    .fchip{padding:6px 14px;border-radius:999px;border:1px solid var(--border);font-size:12.5px;font-weight:500;color:var(--text-muted);background:#fff;cursor:pointer;transition:all .15s;}
    .fchip:hover{border-color:#0EA5E9;color:#0EA5E9;}
    .fchip.on{background:#0EA5E9;border-color:#0EA5E9;color:#fff;}
    .dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:18px;margin-bottom:18px;}
    .dcard{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow-sm);transition:all .2s;}
    .dcard:hover{border-color:var(--border-strong);box-shadow:var(--shadow-md);transform:translateY(-2px);}
    .davatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#0EA5E9,#0284c7);color:#fff;font-weight:700;font-size:14px;display:grid;place-items:center;flex-shrink:0;}
    .dmeta{font-size:12px;color:var(--text-muted);display:flex;flex-direction:column;gap:4px;}
    .dml{color:var(--text-subtle);font-weight:500;width:72px;flex-shrink:0;}
    .dtag{font-size:11px;padding:2px 7px;border-radius:4px;font-weight:500;background:var(--bg-soft);color:var(--text-muted);border:1px solid var(--border);}
    .dabtns{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);padding-top:10px;margin-top:auto;}
    .dashcard{border:2px dashed var(--border-strong);background:var(--bg-soft);border-radius:var(--radius-lg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;min-height:200px;gap:8px;transition:all .2s;}
    .dashcard:hover{background:#fff;border-color:#0EA5E9;}
    .dro{position:fixed;inset:0;background:rgba(15,20,25,.4);backdrop-filter:blur(4px);z-index:1000;opacity:0;pointer-events:none;transition:opacity .25s;}
    .dro.open{opacity:1;pointer-events:auto;}
    .drc{position:fixed;top:0;right:0;height:100%;width:100%;max-width:480px;background:#fff;box-shadow:-8px 0 32px rgba(15,20,25,.15);z-index:1001;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;}
    .drc.open{transform:translateX(0);}
    .drh{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}
    .drh h2{margin:0;font-size:16px;font-weight:600;}
    .drb{padding:18px 22px;overflow-y:auto;flex:1;background:var(--bg-soft);display:flex;flex-direction:column;gap:14px;}
    .drs{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;display:flex;flex-direction:column;gap:12px;}
    .drst{font-size:12.5px;font-weight:600;border-bottom:1px solid var(--border);padding-bottom:5px;margin-bottom:2px;}
    .drf{padding:12px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:#fff;}
    .cgrid{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
    .sch{padding:5px 11px;border-radius:6px;border:1px solid var(--border);font-size:11.5px;font-weight:500;background:var(--bg-soft);color:var(--text-muted);cursor:pointer;transition:all .1s;}
    .sch:hover{border-color:#0EA5E9;color:#0EA5E9;}
    .sch.on{background:#f0f9ff;border-color:#0EA5E9;color:#075985;}
    .sstrip{margin-top:18px;padding:12px 18px;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;align-items:center;gap:16px;font-size:13px;font-weight:500;color:var(--text-muted);}
    .sdot{width:5px;height:5px;border-radius:50%;background:var(--border-strong);}

    /* Collapsible Form Section Styling matching reference design */
    .premium-card {
      background: #ffffff;
      border: 1px solid #dde3ea;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      margin-bottom: 16px;
      transition: all 0.2s ease;
    }
    .premium-card:hover {
      border-color: #cbd5e1;
    }
    .premium-header {
      background-color: #f0f6ff !important;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid #e2e8f0;
    }
    .premium-header h3 {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1e3a8a !important; /* Bold navy */
    }
    .premium-toggle-icon {
      color: #1e3a8a;
      font-size: 12px;
      font-weight: bold;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .premium-toggle-icon.collapsed {
      transform: rotate(180deg);
    }
    .premium-body {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #ffffff;
    }
    .premium-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }
    .premium-label .required {
      color: #ef4444;
      margin-left: 3px;
    }
    .premium-input {
      width: 100%;
      border: 1px solid #cbd5e1 !important;
      border-radius: 6px !important;
      padding: 9px 12px !important;
      font-size: 13.5px !important;
      color: #0f172a !important;
      background-color: #ffffff !important;
      transition: all 0.15s ease-in-out;
    }
    .premium-input:focus {
      border-color: #0ea5e9 !important;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15) !important;
      outline: none !important;
    }
    .premium-input::placeholder {
      color: #94a3b8;
      font-size: 13px;
    }
    .quick-fill-btn {
      background-color: #f0fdf4 !important;
      border: 1px solid #bbf7d0 !important;
      color: #15803d !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .quick-fill-btn:hover {
      background-color: #dcfce7 !important;
      border-color: #86efac !important;
    }
    
    /* Custom Flags / Selectors */
    .phone-input-group {
      display: flex;
      align-items: center;
      border: 1px solid #cbd5e1 !important;
      border-radius: 6px !important;
      overflow: hidden;
      background-color: #ffffff;
      transition: border-color 0.15s ease;
      width: 100%;
    }
    .phone-input-group:focus-within {
      border-color: #0ea5e9 !important;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15) !important;
    }
    .flag-dropdown {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      background-color: #f8fafc;
      border-right: 1px solid #cbd5e1;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
      user-select: none;
    }
    .phone-input-group input {
      border: none !important;
      box-shadow: none !important;
      padding: 9px 12px !important;
      flex: 1;
      font-size: 13.5px !important;
      color: #0f172a !important;
      background-color: transparent !important;
    }
  `;

  return (
    <div className="page dv">
      <style>{CSS}</style>
      <div className="breadcrumbs"><span>Fleet Operations</span><span className="here">Drivers & Vehicles</span></div>
      <div className="page-head">
        <div><h1>Drivers & Vehicles</h1><div className="sub">Manage your fleet — route assignment happens in Route Planning</div></div>
        <div className="actions">
          {activeTab==="drivers"
            ? <button className="btn primary" onClick={openAddDriver}><Icon name="plus" size={14}/> Add Driver</button>
            : <button className="btn primary" onClick={openAddVehicle}><Icon name="plus" size={14}/> Add Vehicle</button>}
        </div>
      </div>

      {error && <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"var(--radius)",padding:"10px 16px",marginBottom:14,fontSize:13,color:"#b91c1c",display:"flex",justifyContent:"space-between"}}>⚠️ {error}<button onClick={()=>setError(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#b91c1c"}}>✕</button></div>}

      <div className="card" style={{marginBottom:18}}>
        <div style={{display:"flex",padding:"0 18px",borderBottom:"1px solid var(--border)"}}>
          <div className="tabs" style={{marginBottom:0,borderBottom:"none"}}>
            <div className={`tab ${activeTab==="drivers"?"active":""}`} onClick={()=>setActiveTab("drivers")}>Drivers {!loading&&<span style={{fontSize:11,color:"var(--text-subtle)",marginLeft:4}}>({drivers.length})</span>}</div>
            <div className={`tab ${activeTab==="vehicles"?"active":""}`} onClick={()=>setActiveTab("vehicles")}>Vehicles {!loading&&<span style={{fontSize:11,color:"var(--text-subtle)",marginLeft:4}}>({vehicles.length})</span>}</div>
          </div>
        </div>
        <div style={{padding:18}}>
          {loading ? <div style={{textAlign:"center",padding:50,color:"var(--text-subtle)"}}>⏳ Loading…</div>
          : activeTab==="drivers" ? (
            <>
              <div className="fc">
                {["All","Available","On Route","On Leave","Unavailable"].map(f=>(
                  <div key={f} className={`fchip ${driverFilter===f?"on":""}`} onClick={()=>setDriverFilter(f)}>
                    {f==="Available"?"🟢 Available":f==="On Route"?"🔵 On Route":f==="On Leave"?"🟡 On Leave":f==="Unavailable"?"⚫ Unavailable":f}
                  </div>
                ))}
              </div>
              <div className="dgrid">
                {filtered.map(d=>{
                  const certs:string[] = (()=>{try{return JSON.parse(d.certifications||"[]");}catch{return [];}})();
                  return (
                    <div key={d.id} className="dcard">
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div className="davatar">{initials(d.name)}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{d.name}</div>
                          <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                            <span className="dtag">{d.type==="employee"?"Employee":"Contractor"}</span>
                            {statusBadge(d.availability)}
                          </div>
                        </div>
                      </div>
                      <div className="dmeta">
                        <div style={{display:"flex",gap:8}}><span className="dml">Truck</span><span style={{fontWeight:500,color:"var(--text)"}}>{d.truck||"—"}</span></div>
                        <div style={{display:"flex",gap:8}}><span className="dml">Shift</span><span>{d.shift||"—"}</span></div>
                        <div style={{display:"flex",gap:8}}><span className="dml">Phone</span><span className="mono">{d.phone||"—"}</span></div>
                      </div>
                      {certs.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{certs.map((c:string)=><span key={c} className="dtag">{c}</span>)}</div>}
                      <div className="dabtns"><button className="btn sm" onClick={()=>openEditDriver(d)}>Edit</button></div>
                    </div>
                  );
                })}
                <div className="dashcard" onClick={openAddDriver}>
                  <Icon name="plus" size={22}/><div style={{fontWeight:600,color:"var(--text-muted)"}}>Add New Driver</div>
                  <div style={{fontSize:12,color:"var(--text-subtle)"}}>Employee or Contractor</div>
                </div>
              </div>
            </>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Code</th><th>Type</th><th>Capacity</th><th>Status</th><th style={{textAlign:"right"}}>Action</th></tr></thead>
                <tbody>
                  {vehicles.length===0?<tr><td colSpan={5} style={{textAlign:"center",padding:40,color:"var(--text-subtle)"}}>No vehicles yet.</td></tr>
                  :vehicles.map(v=>(
                    <tr key={v.id}>
                      <td style={{fontWeight:600}} className="mono">{v.code}</td>
                      <td>{v.type}</td><td>{v.capacity} bags</td>
                      <td><span className={`chip ${v.status==="Active"||v.status==="On Road"?"green":v.status==="Maintenance"?"orange":"grey"}`}><span className="dot"/>{v.status}</span></td>
                      <td style={{textAlign:"right"}}><button className="btn sm ghost" onClick={()=>openEditVehicle(v)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)"}}><button className="btn primary" onClick={openAddVehicle}><Icon name="plus" size={13}/> Add Vehicle</button></div>
            </div>
          )}
        </div>
      </div>

      <div className="sstrip">
        <span style={{color:"var(--text)"}}>{drivers.length} drivers</span><span className="sdot"/>
        <span style={{color:"var(--text)"}}>{vehicles.length} vehicles</span><span className="sdot"/>
        <span style={{color:"#16a34a",fontWeight:600}}>{drivers.filter(d=>d.availability==="available").length} available</span><span className="sdot"/>
        <span style={{color:"#0ea5e9"}}>{drivers.filter(d=>d.availability==="on-route").length} on route</span>
      </div>

      {/* DRIVER MODAL */}
      {isDriverOpen && (
        <div className="modal-overlay" onClick={() => setIsDriverOpen(false)} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column" }}>
            <form onSubmit={saveDriver} style={{ display: "flex", flexDirection: "column", height: "100%", margin: 0 }}>
              <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>{editDr ? "Edit Driver Details" : "Add New Driver"}</h2>
                <button type="button" onClick={() => setIsDriverOpen(false)} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
              </div>
              <div style={{ padding: 24 }}>
                {!editDr && (
                  <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="quick-fill-btn" onClick={handleQuickFillDriver}>
                      <Icon name="zap" size={14} /> Quick Fill Example Data
                    </button>
                  </div>
                )}
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label>Full Name *</label>
                    <input required className="input" placeholder="e.g. Marcus Webb" value={drName} onChange={e=>setDrName(e.target.value)}/>
                  </div>
                  <div className="field">
                    <label>Type *</label>
                    <select className="select" value={drType} onChange={e=>setDrType(e.target.value)}>
                      <option>Employee</option>
                      <option>Contractor</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Phone *</label>
                    <div className="phone-input-group">
                      <div className="flag-dropdown">
                        <span>🇦🇺</span>
                        <span>+61</span>
                      </div>
                      <input type="text" required placeholder="e.g. 412 345 678" value={drPhone} onChange={e=>setDrPhone(e.target.value)}/>
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label>Shift Hours *</label>
                    <input required className="input" placeholder="e.g. 6:00 AM – 2:00 PM" value={drShift} onChange={e=>setDrShift(e.target.value)}/>
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label>Assign Truck</label>
                    <select className="select" value={drTruck} onChange={e=>setDrTruck(e.target.value)}>
                      <option value="">— None —</option>
                      {vehicles.map(v=><option key={v.id} value={v.code}>{v.code} ({v.capacity} bags – {v.type})</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label>Certifications / Qualifications</label>
                    <div className="cgrid" style={{ display:"flex",flexWrap:"wrap",gap:6,marginTop:4 }}>{CERTS.map(c=><span key={c} className={`sch ${drCerts.includes(c)?"on":""}`} onClick={()=>toggleCert(c)}>{c}</span>)}</div>
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label>Status *</label>
                    <select className="select" value={drStatus} onChange={e=>setDrStatus(e.target.value)}>
                      <option>Available</option>
                      <option>On Route</option>
                      <option>On Leave</option>
                      <option>Unavailable</option>
                    </select>
                  </div>
                </div>
                <p style={{ fontSize:11.5,color:"var(--text-subtle)",fontStyle:"italic",marginTop:14,marginBottom:0 }}>💡 Route assignment is managed in Route Planning.</p>
              </div>
              <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,background:"#fff" }}>
                <button type="button" className="btn" onClick={()=>setIsDriverOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving?"Saving…":"Save Driver"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VEHICLE MODAL */}
      {isVehicleOpen && (
        <div className="modal-overlay" onClick={() => setIsVehicleOpen(false)} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column" }}>
            <form onSubmit={saveVehicle} style={{ display: "flex", flexDirection: "column", height: "100%", margin: 0 }}>
              <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>{editVh ? "Edit Vehicle Details" : "Add New Vehicle"}</h2>
                <button type="button" onClick={() => setIsVehicleOpen(false)} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                {!editVh && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="quick-fill-btn" onClick={handleQuickFillVehicle}>
                      <Icon name="zap" size={14} /> Quick Fill Example Data
                    </button>
                  </div>
                )}
                
                <div className="field">
                  <label>Vehicle Code *</label>
                  <input required className="input" placeholder="e.g. T-07" value={vhCode} onChange={e=>setVhCode(e.target.value)}/>
                </div>
                <div className="field">
                  <label>Vehicle Type</label>
                  <select className="select" value={vhType} onChange={e=>setVhType(e.target.value)}>
                    <option>Refrigerated Truck</option>
                    <option>Van</option>
                    <option>Flatbed</option>
                  </select>
                </div>
                <div className="field">
                  <label>Capacity (bags) *</label>
                  <input type="number" className="input" min={1} value={vhCap} onChange={e=>setVhCap(Number(e.target.value))}/>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="select" value={vhStatus} onChange={e=>setVhStatus(e.target.value)}>
                    <option>Active</option>
                    <option>On Road</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>
                </div>
                
                <p style={{ fontSize:11.5,color:"var(--text-subtle)",fontStyle:"italic",marginTop:4,marginBottom:0 }}>💡 Driver & route assignment is managed in Route Planning.</p>
              </div>
              <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,background:"#fff" }}>
                <button type="button" className="btn" onClick={()=>setIsVehicleOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving?"Saving…":"Save Vehicle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
