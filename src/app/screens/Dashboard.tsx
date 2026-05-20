import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { dashboardApi, shipmentsApi, type Shipment } from "../services/api";

interface DashboardProps {
  onNav?: (route: string) => void;
}

export const Dashboard = ({ onNav }: DashboardProps) => {
  const [data, setData] = useState<any>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTruckPopup, setActiveTruckPopup] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getOverview().then(setData as any).catch(console.error);
    shipmentsApi.list().then(setShipments).catch(console.error);
  }, []);

  useEffect(() => {
    function handleGlobalClick() {
      setActiveTruckPopup(null);
    }
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const getTruckPosition = (truckCode: string, index: number) => {
    const positions = [
      { top: "42%", left: "42%", labelTop: "35%", labelLeft: "44%" },
      { top: "62%", left: "50%", labelTop: "55%", labelLeft: "52%" },
      { top: "52%", left: "46%", labelTop: "45%", labelLeft: "48%" },
      { top: "38%", left: "48%", labelTop: "31%", labelLeft: "50%" },
      { top: "48%", left: "44%", labelTop: "41%", labelLeft: "46%" },
    ];
    return positions[index % positions.length];
  };

  const sites: any[] = data?.sites || [];
  const routes: any[] = data?.routes || [];
  const kpis = data?.kpis || {};

  const attentionSites = sites
    .filter(s => s.status === "red" || s.status === "orange")
    .sort((a, b) => a.status !== b.status ? (a.status === "red" ? -1 : 1) : b.required - a.required);

  const kpiCards = [
    { label:"Urgent Sites", icon:"alert", value: data ? String(kpis.urgent_sites||0) : "—", accent:"var(--red)", note:"Need dispatch before noon" },
    { label:"Order Soon",   icon:"clock", value: data ? String(kpis.order_soon_sites||0) : "—", accent:"var(--orange)", note:"To be covered in 1-2 days" },
    { label:"Active Routes",icon:"truck", value: data ? `${kpis.active_routes||0} / ${kpis.total_routes||0} planned` : "—", accent:"var(--navy)", note:"Trucks on road" },
    { label:"Bags Delivered Today", icon:"box", value: data ? (kpis.bags_delivered||0).toLocaleString() : "—", accent:"var(--text)", note:`vs ${(kpis.bags_yesterday||0).toLocaleString()} yesterday`, positive:true },
  ];

  return (
    <div className="page dispatch-board-page">
      <div className="breadcrumbs"><span>Home</span><span className="here">Dispatch Board</span></div>
      <div className="page-head">
        <div><h1>Dispatch Board</h1><div className="sub">What needs attention today across Wollongong and the Illawarra.</div></div>
        <div className="actions">
          <button className="btn"><Icon name="download" size={14}/> Export</button>
          <button className="btn primary" onClick={() => onNav?.("route-planner")}><Icon name="sparkles" size={14}/> Plan today's routes</button>
        </div>
      </div>

      <div className="dispatch-kpi-grid">
        {kpiCards.map(k => (
          <div key={k.label} className="dispatch-kpi-card">
            <div className="dispatch-kpi-label"><Icon name={k.icon} size={13}/><span>{k.label}</span></div>
            <div className="dispatch-kpi-value" style={{color:k.accent}}>{k.value}</div>
            <div className={`dispatch-kpi-note ${k.positive?"positive":""}`}>{k.note}</div>
          </div>
        ))}
      </div>

      <div className="dispatch-main-grid">
        <div className="card">
          <div className="card-head">
            <div><h3>Live operations map</h3><div className="sub">Illawarra region with active trucks and site urgency</div></div>
            <div className="dispatch-map-legend legend">
              <span><span className="sw" style={{background:"var(--red)"}}/> Urgent</span>
              <span><span className="sw" style={{background:"var(--orange)"}}/> Soon</span>
              <span><span className="sw" style={{background:"var(--green)"}}/> OK</span>
              <span><span className="sw" style={{background:"var(--navy)"}}/> Truck</span>
            </div>
          </div>
          <div className="dispatch-map">
            <svg viewBox="0 0 860 480" className="dispatch-map-svg" aria-hidden="true">
              <defs><linearGradient id="seaFade" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stopColor="#dff3ff"/><stop offset="100%" stopColor="#edf7ff"/></linearGradient></defs>
              <rect x="640" y="0" width="220" height="480" fill="url(#seaFade)"/>
              <path className="dispatch-region" d="M88 42 C148 34, 254 55, 326 96 C392 132, 450 198, 492 266 C530 327, 561 391, 620 439 L104 439 C84 382, 74 315, 83 248 C92 175, 101 102, 88 42 Z"/>
              <path className="dispatch-coast" d="M531 51 C572 92, 607 130, 631 182 C657 237, 669 292, 669 347 C669 389, 662 418, 649 439"/>
              <path className="dispatch-road dispatch-road-strong" d="M208 79 C289 146, 337 188, 425 269 C479 319, 526 363, 595 426"/>
              <path className="dispatch-road" d="M251 108 C244 162, 238 209, 247 269 C257 326, 286 377, 324 425"/>
              <path className="dispatch-road" d="M182 205 C278 205, 355 209, 431 238 C506 267, 558 306, 618 359"/>
              <path className="dispatch-road" d="M332 68 C388 118, 447 155, 523 181"/>
              <g className="dispatch-map-labels">
                <text x="347" y="55">Wollongong</text><text x="276" y="172">Figtree</text>
                <text x="442" y="180">Bulli</text><text x="331" y="249">Warrawong</text>
                <text x="238" y="304">Port Kembla</text><text x="358" y="401">Albion Park</text>
                <text x="695" y="96">Tasman Sea</text>
              </g>
              <path className="dispatch-truck-route route-one" d="M240 140 C304 190, 359 216, 425 269"/>
              <path className="dispatch-truck-route route-two" d="M334 248 C382 284, 426 326, 493 360"/>
            </svg>
            {sites.filter(s=>s.status!=="hold").map(site=>(
              <div key={site.id} className={`dispatch-site-dot ${site.status}`}
                style={{top:`${site.map_top||50}%`,left:`${site.map_left||50}%`}} title={`${site.name}`}>
                <span className="dispatch-dot-pulse"/>
              </div>
            ))}
            
            {/* Dynamic Active Trucks Pin Rendering */}
            {routes.filter((r: any) => r.status === "active").map((r: any, index: number) => {
              const pos = getTruckPosition(r.truck, index);
              const isOpen = activeTruckPopup === r.id;
              
              // Onboard cargo mapping
              const routeShipments = shipments.filter(s => s.route_id === r.id);
              const cargoSummary = routeShipments.reduce((acc, curr) => {
                acc[curr.product_name] = (acc[curr.product_name] || 0) + curr.quantity;
                return acc;
              }, {} as Record<string, number>);

              return (
                <div key={r.id}>
                  {/* Truck pin on the region map */}
                  <div 
                    className="dispatch-truck-pin" 
                    style={{ 
                      top: pos.top, 
                      left: pos.left, 
                      cursor: "pointer",
                      transform: isOpen ? "scale(1.2)" : "none",
                      transition: "transform 0.2s ease",
                      zIndex: 10
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTruckPopup(isOpen ? null : r.id);
                    }}
                  >
                    <Icon name="truck" size={14}/>
                  </div>
                  
                  {/* Truck Name Label */}
                  <div className="dispatch-truck-label" style={{ top: pos.labelTop, left: pos.labelLeft }}>
                    {r.truck || "Truck"}
                  </div>

                  {/* Popover overlay */}
                  {isOpen && (
                    <div 
                      style={{
                        position: "absolute",
                        top: `calc(${pos.top} - 130px)`,
                        left: `calc(${pos.left} - 80px)`,
                        width: "220px",
                        background: "#1E293B",
                        color: "#F8FAFC",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
                        border: "1px solid #334155",
                        zIndex: 100
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button 
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "none",
                          border: "none",
                          color: "#94A3B8",
                          cursor: "pointer",
                          padding: "2px"
                        }}
                        onClick={() => setActiveTruckPopup(null)}
                      >
                        <Icon name="x" size={12}/>
                      </button>

                      {/* Header */}
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#38BDF8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <Icon name="truck" size={13}/>
                        <span>Route {r.id} ({r.truck})</span>
                      </div>

                      {/* Driver info */}
                      <div style={{ marginBottom: "8px", borderBottom: "1px solid #334155", paddingBottom: "6px" }}>
                        <span style={{ color: "#94A3B8", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>Driver</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#F1F5F9" }}>{r.driver_name || "Unassigned"}</span>
                      </div>

                      {/* Products Cargo details */}
                      <div>
                        <span style={{ color: "#94A3B8", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>Onboard Cargo</span>
                        {Object.keys(cargoSummary).length === 0 ? (
                          <span style={{ color: "#64748B", fontStyle: "italic" }}>No cargo loaded</span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            {Object.entries(cargoSummary).map(([prod, qty]) => (
                              <div key={prod} style={{ display: "flex", justifyContent: "space-between", color: "#E2E8F0" }}>
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }}>{prod}</span>
                                <span style={{ fontWeight: 600, color: "#38BDF8" }}>{qty} bags</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card dispatch-attention-card">
          <div className="card-head">
            <div><h3>Sites needing attention</h3><div className="sub">Red and orange sites ranked by urgency</div></div>
            <span className="chip blue"><span className="dot"/>{attentionSites.length} sites</span>
          </div>
          <div className="dispatch-attention-list">
            {attentionSites.length===0 && <div style={{padding:"24px",textAlign:"center",color:"var(--text-subtle)"}}>All sites are well stocked 🎉</div>}
            {attentionSites.map(site=>(
              <div key={site.id} className={`dispatch-attention-row ${site.status}`}>
                <div className="dispatch-attention-border"/>
                <div className="dispatch-attention-content">
                  <div className="dispatch-attention-topline">
                    <div>
                      <div className="dispatch-attention-name">{site.name}</div>
                      <div className="dispatch-attention-meta">{site.id} · Last delivered {site.last_delivered} · {site.required} bags needed</div>
                    </div>
                    <div className="dispatch-attention-actions">
                      {site.emergency===1&&<span className="chip red"><span className="dot"/>Emergency</span>}
                      <button className="btn sm" onClick={() => onNav?.("route-planner")}>Assign</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Today's Routes</h3><div className="sub">Planned, active, and completed work for the current shift</div></div></div>
        <div className="table-wrap">
          <table className="data dispatch-routes-table">
            <thead><tr>
              <th>Route ID</th><th>Driver</th><th>Truck</th><th>Stops</th>
              <th>Distance</th><th>Duration</th><th>Utilisation</th><th>Progress</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {routes.length===0&&<tr><td colSpan={10} style={{textAlign:"center",padding:32,color:"var(--text-subtle)"}}>No routes today yet.</td></tr>}
              {routes.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600}}>{r.id}</td>
                  <td>{r.driver_name||r.driver_id}</td>
                  <td className="mono">{r.truck}</td>
                  <td>{r.stops_total} stops</td>
                  <td className="muted">{r.distance_km} km</td>
                  <td className="muted">{r.duration}</td>
                  <td className="dispatch-util-cell">
                    <div className="dispatch-util-label"><span>{r.utilisation}%</span></div>
                    <div className="bar"><div className="bar-fill" style={{width:`${r.utilisation}%`}}/></div>
                  </td>
                  <td><div className="dispatch-progress-text">{r.stops_done}/{r.stops_total} done</div></td>
                  <td><StatusChip status={r.status} small/></td>
                  <td><button className="btn ghost sm"><Icon name="dots" size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
