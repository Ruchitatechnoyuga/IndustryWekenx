import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";
import { driversApi, sitesApi, routesApi, type Driver, type Site, type Route } from "../services/api";

export const RoutePlanner = () => {
  const [variant, setVariant] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, s, r] = await Promise.all([driversApi.list(), sitesApi.list(), routesApi.list()]);
      setDrivers(d);
      setSites(s);
      setRoutes(r);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const availableDrivers = drivers.filter(d => d.availability === "available");
  const urgentSites = sites.filter(s => s.status === "red" || s.status === "orange");
  const publishedRoutes = routes.filter(r => r.status === "planned");

  return (
    <div className="page">
      <div className="breadcrumbs"><span>Daily Ops</span><span className="here">Route Planner</span></div>
      <div className="page-head">
        <div>
          <h1>
            Route planner{" "}
            <span className="chip blue" style={{ marginLeft: 8, verticalAlign: "middle" }}>
              <Icon name="sparkles" size={10} /> AI-assisted
            </span>
          </h1>
          <div className="sub">
            {loading ? "Loading data…" : `${urgentSites.length} sites needing delivery · ${availableDrivers.length} drivers available · ${publishedRoutes.length} planned routes`}
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={loadData}><Icon name="refresh" size={14} /> Recalculate</button>
          <button className="btn primary"><Icon name="send" size={14} /> Publish Routes</button>
        </div>
      </div>

      <VariationBar
        label="Route planner layout"
        note="A = spatial map view with driver roster. B = timeline scheduler with shift availability."
        variants={["Map-based with available drivers", "Timeline scheduler with shifts"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0
        ? <PlannerA drivers={drivers} sites={sites} routes={routes} loading={loading} onRefresh={loadData} />
        : <PlannerB drivers={drivers} sites={sites} routes={routes} loading={loading} />}
    </div>
  );
};

// ── Planner A: Map View ───────────────────────────────────────────────────────
const PlannerA = ({ drivers, sites, routes, loading, onRefresh }: { drivers: Driver[]; sites: Site[]; routes: Route[]; loading: boolean; onRefresh: () => void }) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(routes[0] ?? null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [suggestedRoutes, setSuggestedRoutes] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleGenerateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await routesApi.suggest();
      setSuggestedRoutes(res.routes || []);
    } catch (err) {
      console.error("Failed to fetch route suggestions:", err);
      alert("No new unassigned shipments to group. Please book a shipment first.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestions = async () => {
    try {
      for (const sug of suggestedRoutes) {
        await routesApi.create({
          driver_id: sug.driver_id,
          truck: sug.truck,
          status: "planned",
          stops: sug.stops.map((st: any) => ({ site_id: st.site_id, bags: st.bags, eta: st.eta })),
          stops_total: sug.stops.length,
          utilisation: sug.utilisation
        });
      }
      alert("AI Suggested Routes successfully applied and saved! 🎉");
      setSuggestedRoutes([]);
      onRefresh();
    } catch (err) {
      console.error("Failed to save route suggestions:", err);
      alert("Failed to apply suggestions. Please try again.");
    }
  };

  const handleConfirmRoute = async (route: Route | null) => {
    if (!route) return;
    setConfirming(true);
    try {
      await routesApi.updateStatus(route.id, "active");
      alert(`Route ${route.id} successfully confirmed! Truck ${route.truck || ""} is now active and on route. 🚚`);
      onRefresh();
    } catch (err) {
      console.error("Failed to confirm route:", err);
      alert("Failed to confirm route. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const availableDrivers = drivers.filter(d => d.availability === "available");
  const unavailableDrivers = drivers.filter(d => d.availability !== "available");

  useEffect(() => { if (routes.length > 0) setSelectedRoute(routes[0]); }, [routes]);

  const certStr = (driver: Driver) => {
    if (!driver.certifications) return "";
    if (Array.isArray(driver.certifications)) return driver.certifications.join(", ");
    try { return JSON.parse(driver.certifications as any).join(", "); } catch { return driver.certifications as any; }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 360px", gap: 16 }}>
      {/* Drivers Panel */}
      <div>
        <div className="card mb-2" style={{ alignSelf: "start" }}>
          <div className="card-head">
            <div>
              <h3>Available Drivers</h3>
              <div className="sub">{availableDrivers.length} ready</div>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
          ) : availableDrivers.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No available drivers</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {availableDrivers.map(driver => (
                <div key={driver.id} onClick={() => setSelectedDriver(driver.id)}
                  style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: selectedDriver === driver.id ? "var(--blue-soft)" : undefined,
                    borderLeft: selectedDriver === driver.id ? "3px solid var(--blue)" : "3px solid transparent" }}>
                  <div className="between">
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{driver.name}</div>
                    <span className={`chip ${driver.type === "contractor" ? "orange" : "blue"}`} style={{ padding: "1px 6px", fontSize: 10 }}>
                      {driver.type === "contractor" ? "Contractor" : "Employee"}
                    </span>
                  </div>
                  <div className="small muted mt-1"><Icon name="clock" size={10} style={{ verticalAlign: "middle" }} /> {driver.shift || "No shift set"}</div>
                  <div className="small muted"><Icon name="truck" size={10} style={{ verticalAlign: "middle" }} /> {driver.truck || "No truck"} · {certStr(driver)}</div>
                  {driver.assigned_route && (
                    <div className="mt-1"><span className="chip green" style={{ padding: "1px 6px", fontSize: 10 }}>✓ Assigned to {driver.assigned_route}</span></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {unavailableDrivers.length > 0 && (
          <div className="card" style={{ alignSelf: "start" }}>
            <div className="card-head"><div><h3>Unavailable</h3><div className="sub">{unavailableDrivers.length} drivers</div></div></div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {unavailableDrivers.map(driver => (
                <div key={driver.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", opacity: 0.6 }}>
                  <div className="between">
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{driver.name}</div>
                    <span className={`chip ${driver.availability === "on-leave" ? "orange" : "grey"}`} style={{ padding: "1px 6px", fontSize: 10 }}>
                      {driver.availability === "on-leave" ? "On Leave" : driver.availability === "on-route" ? "On Route" : "Unavailable"}
                    </span>
                  </div>
                  <div className="small muted mt-1">{driver.shift || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Route map · AI preview</h3>
            <div className="sub">{routes.length} routes planned</div>
          </div>
        </div>
        <div className="map" style={{ height: 560 }}>
          {/* Route path SVG */}
          <svg viewBox="0 0 400 560" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Drop shadow filter */}
            <defs>
              <filter id="route-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
              </filter>
            </defs>
            {routes.map((r, rIdx) => {
              const rStops = r.stops ? [...r.stops].sort((a, b) => a.stop_order - b.stop_order) : [];
              const rPoints = rStops.map(st => {
                const site = sites.find(s => s.id === st.site_id);
                return site ? { x: site.map_left ?? 50, y: site.map_top ?? 50 } : null;
              }).filter(Boolean) as { x: number; y: number }[];

              if (rPoints.length === 0) return null;
              const isSelected = selectedRoute?.id === r.id;
              const colors = ["var(--blue)", "#a259ff", "#14b8a6", "#f59e0b", "#ef4444"];
              const color = isSelected ? "var(--blue)" : colors[rIdx % colors.length];
              // Build smooth path using quadratic bezier midpoints
              const pts = [{ x: 12, y: 22 }, ...rPoints]; // warehouse at 12%,22%
              let d = `M ${(pts[0].x / 100) * 400} ${(pts[0].y / 100) * 560}`;
              for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const mx = ((prev.x + curr.x) / 2 / 100) * 400;
                const my = ((prev.y + curr.y) / 2 / 100) * 560;
                d += ` Q ${mx} ${my} ${(curr.x / 100) * 400} ${(curr.y / 100) * 560}`;
              }
              return (
                <g key={r.id}>
                  {/* Route shadow */}
                  <path d={d} stroke={color} strokeWidth={isSelected ? "5" : "3"} fill="none" opacity="0.12" filter="url(#route-shadow)" />
                  {/* Route line */}
                  <path d={d} stroke={color} strokeWidth={isSelected ? "2.5" : "1.5"} strokeDasharray={r.status === "planned" ? "6 4" : "none"} fill="none" opacity={isSelected ? 1 : 0.5} style={{ transition: "all 0.3s ease" }} />
                </g>
              );
            })}
            {/* Fallback demo routes when no real routes */}
            {routes.length === 0 && (
              <>
                <path d="M 48 123 Q 113 140 180 157 Q 166 196 152 235" stroke="var(--blue)" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                <path d="M 152 235 Q 198 216 248 196 Q 234 272 220 347" stroke="var(--blue)" strokeWidth="2.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
                <path d="M 48 123 Q 198 158 248 196" stroke="#a259ff" strokeWidth="2" strokeDasharray="5 4" fill="none" opacity="0.6" />
              </>
            )}
          </svg>

          {/* Site pins — show stop order badge if on a route */}
          {sites.map(s => {
            // Find which stop this site is on the selected route
            const stopOnRoute = selectedRoute?.stops?.find(st => st.site_id === s.id);
            return (
              <div key={s.id} style={{ position: "absolute", top: `${s.map_top ?? 50}%`, left: `${s.map_left ?? 50}%`, transform: "translate(-50%, -50%)", zIndex: 5 }}>
                <div className={`map-pin ${s.status}`} style={{ position: "relative" }}>
                  {s.id.slice(-2)}
                  {/* Stop order badge */}
                  {stopOnRoute && (
                    <span style={{
                      position: "absolute", top: -8, right: -8,
                      background: stopOnRoute.status === "delivered" ? "var(--green)" : "var(--navy)",
                      color: "white", borderRadius: "50%", width: 16, height: 16,
                      fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center",
                      border: "1.5px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                    }}>
                      {stopOnRoute.stop_order}
                    </span>
                  )}
                </div>
                {/* Site label */}
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  marginTop: 3, background: "rgba(255,255,255,0.92)", border: "1px solid var(--border)",
                  borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 600,
                  color: "var(--navy-deep)", whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  {s.name.replace("Shell ", "").replace("7-Eleven ", "").replace(" Wollongong", "")}
                </div>
              </div>
            );
          })}

          {/* Warehouse pin */}
          <div style={{ position: "absolute", top: "22%", left: "12%", transform: "translate(-50%, -50%)", zIndex: 6 }}>
            <div className="map-pin truck">W</div>
            <div style={{
              position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
              marginTop: 3, background: "var(--navy-deep)", color: "white",
              borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700,
              whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
            }}>
              Depot
            </div>
          </div>

          {/* Warehouse info overlay */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "white", borderRadius: 6, padding: "8px 12px", border: "1px solid var(--border)", fontSize: 12, boxShadow: "var(--shadow-sm)" }}>
            <div className="small muted">Warehouse</div>
            <div style={{ fontWeight: 600 }}>Wollongong Depot</div>
          </div>

          {/* Route colour legend — bottom left */}
          {routes.length > 0 && (
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              background: "rgba(255,255,255,0.95)", borderRadius: 8,
              padding: "8px 12px", border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)", fontSize: 11
            }}>
              {routes.map((r, rIdx) => {
                const colors = ["var(--blue)", "#a259ff", "#14b8a6", "#f59e0b", "#ef4444"];
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: rIdx < routes.length - 1 ? 4 : 0 }}>
                    <div style={{ width: 24, height: 3, borderRadius: 2, background: colors[rIdx % colors.length], flexShrink: 0, borderTop: r.status === "planned" ? "2px dashed " + colors[rIdx % colors.length] : undefined, background: r.status === "planned" ? "transparent" : colors[rIdx % colors.length] as any }} />
                    <span style={{ fontWeight: 600, color: "var(--navy-deep)" }}>{r.id}</span>
                    <span style={{ color: "var(--text-muted)" }}>· {r.driver_name?.split(" ")[0]}</span>
                    <span className={`chip ${r.status === "active" ? "green" : "blue"}`} style={{ padding: "0 5px", fontSize: 9 }}>{r.status}</span>
                  </div>
                );
              })}
            </div>
          )}

          {sites.length === 0 && !loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No sites added yet. Add customer sites to see map pins.
            </div>
          )}
        </div>
      </div>

      {/* Route / Create Panel */}
      <div className="card" style={{ alignSelf: "start" }}>
        {routes.length === 0 ? (
          <div className="card-body" style={{ textAlign: "center", padding: "24px 20px" }}>
            <Icon name="route" size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 8 }}>No routes planned yet</div>
            <div className="small muted mb-4">Add drivers and sites, then create routes to plan deliveries.</div>
            
            <button className="btn primary" style={{ width: "100%", marginBottom: "16px" }} onClick={() => setShowCreateRoute(true)}>
              <Icon name="plus" size={14} /> Create Route Manually
            </button>

            <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0", paddingTop: "16px" }}>
              <div className="small muted mb-2">Or let our AI optimize your day:</div>
              <button 
                className="btn secondary" 
                style={{ width: "100%", background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }} 
                onClick={handleGenerateSuggestions} 
                disabled={loadingSuggestions}
              >
                <Icon name="sparkles" size={14} /> {loadingSuggestions ? "Generating AI suggestions..." : "Generate AI Suggested Routes"}
              </button>
            </div>

            {suggestedRoutes.length > 0 && (
              <div className="mt-3" style={{ textAlign: "left", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569", marginBottom: "8px", fontWeight: 700 }}>AI Optimization Preview</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto", marginBottom: "12px" }}>
                  {suggestedRoutes.map((sug, idx) => (
                    <div key={idx} style={{ fontSize: "11px", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" }}>
                      <b>{sug.driver_name}</b> ({sug.truck}): {sug.stops.length} stops, {sug.utilisation}% full.
                    </div>
                  ))}
                </div>
                <button className="btn primary" style={{ width: "100%", fontWeight: 600, background: "#16a34a", borderColor: "#16a34a" }} onClick={handleApplySuggestions}>
                  Apply and Save AI Routes
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="card-head">
              <div>
                <h3>{selectedRoute?.id || routes[0]?.id} · Route Details</h3>
                <div className="sub">{selectedRoute?.stops_total || 0} stops · {selectedRoute?.distance_km || 0} km</div>
              </div>
              <span className="chip blue" style={{ padding: "1px 7px", fontSize: 11 }}><Icon name="sparkles" size={10} /> AI suggested</span>
            </div>
            <div className="card-body">
              {routes.length > 1 && (
                <div className="field mb-2">
                  <select className="select" value={selectedRoute?.id || ""} onChange={e => setSelectedRoute(routes.find(r => r.id === e.target.value) || null)}>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.id} — {r.driver_name || "Unassigned"}</option>)}
                  </select>
                </div>
              )}
              {selectedRoute && (
                <>
                  <div className="grid-2 mb-2">
                    <div>
                      <div className="small muted">Driver</div>
                      <div style={{ fontWeight: 500 }}>{selectedRoute.driver_name || "Unassigned"}</div>
                    </div>
                    <div>
                      <div className="small muted">Truck</div>
                      <div style={{ fontWeight: 500 }}>{selectedRoute.truck || "—"}</div>
                    </div>
                  </div>
                  <div className="card mb-2" style={{ background: "var(--bg-soft)", border: "1px dashed var(--border)" }}>
                    <div className="card-body" style={{ padding: 12 }}>
                      <div className="between small mb-1">
                        <span className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>Truck utilisation</span>
                        <span className="mono" style={{ fontWeight: 600 }}>{selectedRoute.utilisation}%</span>
                      </div>
                      <div className="bar"><div className="bar-fill" style={{ width: `${selectedRoute.utilisation}%` }} /></div>
                      <div className="small muted mt-1">{selectedRoute.stops_done} of {selectedRoute.stops_total} stops complete</div>
                    </div>
                  </div>
                  <div className="row mt-2" style={{ justifyContent: "flex-end", gap: 8 }}>
                    <button className="btn primary" onClick={() => handleConfirmRoute(selectedRoute)} disabled={confirming || selectedRoute.status === "active"}>
                      {confirming ? "Confirming..." : selectedRoute.status === "active" ? "Active" : "Confirm Route"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {showCreateRoute && <CreateRouteModal drivers={drivers} onClose={() => setShowCreateRoute(false)} onSave={onRefresh} />}
      </div>
    </div>
  );
};

// ── Planner B: Timeline View ──────────────────────────────────────────────────
const PlannerB = ({ drivers, sites, routes, loading }: { drivers: Driver[]; sites: Site[]; routes: Route[]; loading: boolean }) => {
  const timeSlots = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];
  const activeDrivers = drivers.filter(d => d.availability === "available" || d.availability === "on-route");
  const offDrivers = drivers.filter(d => d.availability !== "available" && d.availability !== "on-route");
  const urgentSites = sites.filter(s => s.status === "red" || s.status === "orange");
  const routeColors = ["var(--blue)", "#a259ff", "#14b8a6", "#f59e0b", "#ef4444"];

  return (
    <div>
      <div className="banner mb-2">
        <Icon name="clock" size={14} />
        <span><b>Timeline Scheduler</b> — Driver shifts and route assignments by time.</span>
      </div>

      <div className="card mb-2">
        <div className="card-head">
          <div><h3>Driver Roster & Shift Timeline</h3><div className="sub">Today's schedule</div></div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 1200 }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px repeat(8, 1fr)", borderBottom: "1px solid var(--border)", background: "var(--bg-softer)" }}>
              <div style={{ padding: "12px 16px", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Driver / Shift</div>
              {timeSlots.map((time, i) => (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", fontWeight: 500, fontSize: 12, borderLeft: "1px solid var(--border)" }}>{time}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Loading drivers…</div>
            ) : activeDrivers.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No active drivers. Add drivers first.</div>
            ) : activeDrivers.map((driver, dIdx) => {
              const driverRoute = routes.find(r => r.driver_id === driver.id);
              const shiftStart = driver.shift?.toLowerCase().includes("morning") ? 0
                : driver.shift?.toLowerCase().includes("afternoon") ? 4 : 1;
              const shiftDur = 4;
              return (
                <div key={driver.id} style={{ display: "grid", gridTemplateColumns: "200px repeat(8, 1fr)", borderBottom: "1px solid var(--border)", minHeight: 80 }}>
                  <div style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{driver.name}</div>
                    <div className="row mt-1" style={{ gap: 4 }}>
                      <span className={`chip ${driver.type === "contractor" ? "orange" : "blue"}`} style={{ padding: "1px 5px", fontSize: 10 }}>{driver.type === "contractor" ? "Contractor" : "Employee"}</span>
                      <span className={`chip ${driver.availability === "available" ? "green" : "grey"}`} style={{ padding: "1px 5px", fontSize: 10 }}>{driver.availability === "available" ? "Available" : "On Route"}</span>
                    </div>
                    <div className="small muted mt-1"><Icon name="truck" size={10} style={{ verticalAlign: "middle" }} /> {driver.truck || "—"}</div>
                  </div>
                  <div style={{ gridColumn: "2 / -1", position: "relative", display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                    <div style={{ position: "absolute", left: `${(shiftStart / 8) * 100}%`, width: `${(shiftDur / 8) * 100}%`, height: "100%", background: "var(--bg-soft)", borderLeft: "2px solid var(--border-strong)", borderRight: "2px solid var(--border-strong)", opacity: 0.5, pointerEvents: "none" }} />
                    {driverRoute && (
                      <div style={{ position: "absolute", left: `${(shiftStart / 8) * 100}%`, width: `${((driverRoute.stops_total || 2) / 8) * 100}%`, top: "50%", transform: "translateY(-50%)", height: "60%", background: routeColors[dIdx % routeColors.length], borderRadius: 6, padding: "8px 12px", color: "white", boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{driverRoute.id}</div>
                        <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>{driverRoute.stops_total} stops · {driverRoute.distance_km} km</div>
                      </div>
                    )}
                    {timeSlots.map((_, i) => <div key={i} style={{ borderLeft: i > 0 ? "1px solid var(--border)" : "none" }} />)}
                  </div>
                </div>
              );
            })}

            {offDrivers.length > 0 && (
              <div style={{ background: "var(--bg-soft)", padding: "12px 16px", borderTop: "2px solid var(--border)" }}>
                <div className="between">
                  <span className="small muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>Unavailable Today · {offDrivers.length} drivers</span>
                  <div className="row" style={{ gap: 8 }}>
                    {offDrivers.map(d => (
                      <span key={d.id} className="chip grey" style={{ padding: "2px 8px", fontSize: 11 }}>{d.name} ({d.availability === "on-leave" ? "Leave" : "Unavailable"})</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2 mt-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div><h3>Unassigned Sites</h3><div className="sub">Sites needing delivery</div></div>
            <span className="chip red">{urgentSites.length} urgent</span>
          </div>
          {urgentSites.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>All sites are well-stocked!</div>
          ) : (
            <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {urgentSites.slice(0, 6).map(s => (
                <div key={s.id} className={`site-card ${s.status}`} style={{ cursor: "grab" }}>
                  <div className="between">
                    <span className="mono subtle small">{s.id}</span>
                    <StatusChip status={s.status} small />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div className="small muted">{s.suburb}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><div><h3>Route Statistics</h3><div className="sub">Current plan</div></div></div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 12 }}>
              <div><div className="small muted">Total Routes</div><div style={{ fontSize: 20, fontWeight: 600 }} className="mono">{routes.length}</div></div>
              <div><div className="small muted">Active Drivers</div><div style={{ fontSize: 20, fontWeight: 600 }} className="mono">{activeDrivers.length}</div></div>
              <div><div className="small muted">Sites Urgent</div><div style={{ fontSize: 20, fontWeight: 600 }} className="mono">{urgentSites.length}</div></div>
              <div><div className="small muted">Sites Total</div><div style={{ fontSize: 20, fontWeight: 600 }} className="mono">{sites.length}</div></div>
            </div>
            {activeDrivers.length > 0 && (
              <>
                <div className="divider" style={{ margin: "12px 0" }} />
                <div className="banner" style={{ marginBottom: 0 }}>
                  <Icon name="sparkles" size={14} />
                  <span>AI suggests assigning available drivers to urgent sites first for optimal coverage.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Create Route Modal ────────────────────────────────────────────────────────
const CreateRouteModal = ({ drivers, onClose, onSave }: { drivers: Driver[]; onClose: () => void; onSave: () => void }) => {
  const availableDrivers = drivers.filter(d => d.availability === "available");
  const [form, setForm] = useState({ driver_id: availableDrivers[0]?.id || "", truck: "", route_date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const driver = drivers.find(d => d.id === form.driver_id);
    await routesApi.create({ driver_id: form.driver_id, truck: form.truck || driver?.truck || "", route_date: form.route_date, status: "planned" });
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:440,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Create Route</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          <div className="field">
            <label>Assign Driver</label>
            <select className="select" value={form.driver_id} onChange={e => setForm(p => ({ ...p, driver_id: e.target.value }))}>
              {availableDrivers.length === 0 ? <option>No available drivers</option> : availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — {d.truck || "No truck"}</option>)}
            </select>
          </div>
          <div className="field"><label>Truck (override)</label><input className="input" placeholder="Auto from driver" value={form.truck} onChange={e => setForm(p => ({ ...p, truck: e.target.value }))} /></div>
          <div className="field"><label>Route Date</label><input className="input" type="date" value={form.route_date} onChange={e => setForm(p => ({ ...p, route_date: e.target.value }))} /></div>
          <div className="banner" style={{ margin: 0 }}><Icon name="sparkles" size={14} /><span>Route stops are added in Active Routes after creation.</span></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || availableDrivers.length === 0}>{saving ? "Creating…" : "Create Route"}</button>
        </div>
      </div>
    </div>
  );
};
