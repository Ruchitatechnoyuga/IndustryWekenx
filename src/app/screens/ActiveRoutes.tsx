import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";
import { routesApi, type Route } from "../services/api";

export const ActiveRoutes = () => {
  const [variant, setVariant] = useState(0);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await routesApi.list();
      setRoutes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const activeRoutes = routes.filter(r => r.status === "active");

  return (
    <div className="page">
      <div className="breadcrumbs"><span>Daily Ops</span><span className="here">Active Routes</span></div>
      <div className="page-head">
        <div>
          <h1>
            Active routes{" "}
            <span className="chip" style={{ marginLeft: 8, verticalAlign: "middle" }}>
              <span className="dot" style={{ background: "var(--green)" }} /> Live
            </span>
          </h1>
          <div className="sub">{loading ? "Loading…" : `${activeRoutes.length} trucks on the road · ${routes.length} total routes today`}</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={loadData}><Icon name="refresh" size={14} /> Refresh</button>
          <button className="btn primary"><Icon name="download" size={14} /> End-of-day report</button>
        </div>
      </div>

      <VariationBar
        label="Tracking layout"
        note="A = single-truck deep dive (dispatcher focus). B = multi-truck overview (manager)."
        variants={["Map + stop timeline", "Multi-truck split view"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0
        ? <TrackingA routes={routes} loading={loading} onRefresh={loadData} />
        : <TrackingB routes={routes} loading={loading} onRefresh={loadData} />}
    </div>
  );
};

// ── Tracking A: Single Truck Deep Dive ────────────────────────────────────────
const TrackingA = ({ routes, loading, onRefresh }: { routes: Route[]; loading: boolean; onRefresh: () => void }) => {
  const [selected, setSelected] = useState<Route | null>(null);

  useEffect(() => {
    if (routes.length > 0 && !selected) setSelected(routes[0]);
  }, [routes]);

  const handleUpdateStop = async (routeId: string, stopId: number, status: string) => {
    await routesApi.updateStop(routeId, stopId, { status });
    onRefresh();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 360px", gap: 16 }}>
      {/* Route list */}
      <div className="card" style={{ alignSelf: "start" }}>
        <div className="card-head">
          <h3>Today's routes</h3>
          <span className="chip">{routes.length}</span>
        </div>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : routes.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No routes today. Create routes in Route Planner.</div>
        ) : routes.map((r, i) => (
          <div key={r.id} onClick={() => setSelected(r)}
            style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
              background: selected?.id === r.id ? "var(--blue-soft)" : undefined,
              borderLeft: selected?.id === r.id ? "3px solid var(--blue)" : "3px solid transparent" }}>
            <div className="between">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.id}</div>
              <StatusChip status={r.status} small />
            </div>
            <div className="small muted mt-1">{r.driver_name || "Unassigned"} · {r.truck || "—"}</div>
            <div className="row mt-1" style={{ gap: 6 }}>
              <div className="bar" style={{ flex: 1 }}>
                <div className="bar-fill green" style={{ width: `${r.stops_total > 0 ? (r.stops_done / r.stops_total) * 100 : 0}%` }} />
              </div>
              <span className="small mono">{r.stops_done}/{r.stops_total}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>
              {selected ? `${selected.id} · ${selected.driver_name || "Unassigned"}` : "Select a route"}
              {selected?.status === "active" && (
                <span className="chip green" style={{ padding: "1px 7px", fontSize: 11, marginLeft: 6 }}>
                  <span className="dot" /> On route
                </span>
              )}
            </h3>
            <div className="sub">
              {selected ? `Stop ${selected.stops_done} of ${selected.stops_total} · ${selected.distance_km} km` : "No route selected"}
            </div>
          </div>
        </div>
        <div className="map" style={{ height: 500 }}>
          {selected && (() => {
            // Build stop coordinates from mock site positions
            const SITE_COORDS: Record<string, { top: number; left: number }> = {
              "S-001": { top: 42, left: 38 },
              "S-002": { top: 62, left: 55 },
              "S-003": { top: 35, left: 62 },
              "S-004": { top: 28, left: 45 },
            };
            const orderedStops = selected.stops ? [...selected.stops].sort((a, b) => a.stop_order - b.stop_order) : [];
            // Coordinates: warehouse origin + each stop site
            const warehousePt = { x: 48, y: 110 }; // 12%×400, 22%×500
            const stopPts = orderedStops.map(st => {
              const coord = SITE_COORDS[st.site_id];
              return coord ? { x: (coord.left / 100) * 400, y: (coord.top / 100) * 500 } : null;
            }).filter(Boolean) as { x: number; y: number }[];
            const allPts = [warehousePt, ...stopPts];

            // Build smooth bezier path for all stops
            const buildPath = (pts: { x: number; y: number }[]) => {
              if (pts.length < 2) return "";
              let d = `M ${pts[0].x} ${pts[0].y}`;
              for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const mx = (prev.x + curr.x) / 2;
                const my = (prev.y + curr.y) / 2;
                d += ` Q ${mx} ${my} ${curr.x} ${curr.y}`;
              }
              return d;
            };

            // Split into completed path and upcoming path
            const completedPts = allPts.slice(0, selected.stops_done + 1);
            const upcomingPts = allPts.slice(Math.max(0, selected.stops_done));
            const completedPath = buildPath(completedPts);
            const upcomingPath = buildPath(upcomingPts);

            // Current truck position: slightly past the last completed stop
            const truckPt = selected.stops_done > 0 && allPts[selected.stops_done]
              ? allPts[selected.stops_done]
              : selected.stops_done === 0 && allPts[1]
              ? { x: (warehousePt.x + allPts[1].x) / 2, y: (warehousePt.y + allPts[1].y) / 2 }
              : warehousePt;

            return (
              <>
                <svg viewBox="0 0 400 500" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <defs>
                    <filter id="glow-green">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {/* Completed portion — solid green */}
                  {completedPath && (
                    <path d={completedPath} stroke="var(--green)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* Upcoming portion — dashed blue */}
                  {upcomingPath && (
                    <path d={upcomingPath} stroke="var(--blue)" strokeWidth="2" strokeDasharray="6 4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                  )}
                  {/* Geofence around current truck */}
                  {selected.status === "active" && (
                    <circle cx={truckPt.x} cy={truckPt.y} r="30" fill="rgba(59, 65, 112, 0.07)" stroke="var(--blue)" strokeWidth="1.5" strokeDasharray="4 3" />
                  )}
                </svg>

                {/* Stop pins — rendered as React divs */}
                {/* Warehouse */}
                <div style={{ position: "absolute", top: "22%", left: "12%", transform: "translate(-50%,-50%)", zIndex: 6 }}>
                  <div className="map-pin truck" style={{ fontSize: 10 }}>W</div>
                </div>

                {orderedStops.map((stop, i) => {
                  const coord = SITE_COORDS[stop.site_id];
                  if (!coord) return null;
                  const isDone = stop.status === "delivered";
                  const isCurrent = i === selected.stops_done && selected.status === "active";
                  const isUpcoming = !isDone && !isCurrent;
                  return (
                    <div key={stop.id} style={{
                      position: "absolute",
                      top: `${coord.top}%`, left: `${coord.left}%`,
                      transform: "translate(-50%,-50%)", zIndex: 5
                    }}>
                      {/* Pin */}
                      <div className={`map-pin ${isDone ? "green" : isCurrent ? "truck" : ""}`} style={{
                        border: isUpcoming ? "2px dashed #94a3b8" : undefined,
                        background: isUpcoming ? "white" : undefined,
                        color: isUpcoming ? "#64748b" : undefined,
                        boxShadow: isCurrent ? "0 0 0 4px rgba(59,130,246,0.25)" : undefined,
                        fontSize: 11, fontWeight: 700
                      }}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      {/* Stop name label */}
                      <div style={{
                        position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                        marginTop: 3, background: "rgba(255,255,255,0.93)",
                        border: `1px solid ${isDone ? "var(--green)" : isCurrent ? "var(--blue)" : "var(--border)"}`,
                        borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 600,
                        color: isDone ? "var(--green)" : isCurrent ? "var(--blue)" : "var(--text-muted)",
                        whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                      }}>
                        {stop.site_name?.replace("Shell ", "").replace("7-Eleven ", "")} · {stop.bags}bg
                      </div>
                    </div>
                  );
                })}

                {/* Live truck marker */}
                {selected.status === "active" && (
                  <div style={{
                    position: "absolute",
                    top: `${(truckPt.y / 500) * 100}%`,
                    left: `${(truckPt.x / 400) * 100}%`,
                    transform: "translate(-50%,-50%)", zIndex: 8
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "var(--navy-deep)", color: "white",
                      display: "grid", placeItems: "center", fontSize: 14,
                      boxShadow: "0 0 0 5px rgba(59,65,112,0.25), 0 2px 8px rgba(0,0,0,0.3)",
                      animation: "ping 2s ease-in-out infinite"
                    }}>
                      🚚
                    </div>
                  </div>
                )}

                {/* Info overlay */}
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  background: "white", borderRadius: 8, padding: "10px 12px",
                  border: "1px solid var(--border)", minWidth: 170, boxShadow: "var(--shadow-sm)"
                }}>
                  {selected.status === "active" ? (
                    <>
                      <div className="small muted">Current location</div>
                      <div style={{ fontWeight: 600 }}>
                        {orderedStops[selected.stops_done]?.site_name || "En route"}
                      </div>
                      <div className="small muted mt-1">Stop {selected.stops_done + 1} of {selected.stops_total}</div>
                      <div className="small muted">ETA: <span className="mono">{orderedStops[selected.stops_done]?.eta || "—"}</span></div>
                      <div className="small muted">Util: <span className="mono">{selected.utilisation}%</span></div>
                    </>
                  ) : (
                    <>
                      <div className="small muted">Route status</div>
                      <div style={{ fontWeight: 600 }}>{selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</div>
                      <div className="small muted mt-1">Util: <span className="mono">{selected.utilisation}%</span></div>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div style={{
                  position: "absolute", bottom: 12, left: 12,
                  background: "rgba(255,255,255,0.93)", borderRadius: 6,
                  padding: "6px 10px", border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)", fontSize: 10, display: "flex", flexDirection: "column", gap: 3
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 16, height: 2, background: "var(--green)", borderRadius: 2 }} />
                    <span style={{ color: "var(--text-muted)" }}>Completed</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 16, height: 2, background: "var(--blue)", borderRadius: 2, borderTop: "2px dashed var(--blue)", background: "transparent" as any }} />
                    <span style={{ color: "var(--text-muted)" }}>Upcoming</span>
                  </div>
                </div>
              </>
            );
          })()}

          {!selected && !loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Select a route from the list to view live tracking
            </div>
          )}
        </div>
      </div>

      {/* Stop timeline */}
      <div className="card" style={{ alignSelf: "start" }}>
        <div className="card-head">
          <div><h3>Stop timeline</h3><div className="sub">Route stop status</div></div>
        </div>
        {!selected ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Select a route to view stops</div>
        ) : !selected.stops || selected.stops.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
            No stops added to this route yet.
            <br /><span className="small muted">Add stops via Route Planner.</span>
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            {selected.stops.map((stop, i) => (
              <div key={stop.id} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: stop.status === "pending" && i === selected.stops_done ? "var(--blue-soft)" : undefined }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%",
                  background: stop.status === "delivered" ? "var(--green)" : stop.status === "skipped" ? "var(--red)" : i === selected.stops_done ? "var(--blue)" : "var(--bg-soft)",
                  color: stop.status === "pending" && i !== selected.stops_done ? "var(--text-muted)" : "white",
                  border: stop.status === "pending" && i !== selected.stops_done ? "1px dashed var(--border-strong)" : "none",
                  display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {stop.status === "delivered" ? "✓" : stop.status === "skipped" ? "✗" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{stop.site_name || stop.site_id}</div>
                  <div className="small muted mt-1">ETA {stop.eta || "—"} · {stop.bags} bags</div>
                  <div className="row mt-1" style={{ gap: 6 }}>
                    {stop.status === "pending" && (
                      <>
                        <button className="btn sm" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => handleUpdateStop(selected.id, stop.id, "delivered")}>✓ Delivered</button>
                        <button className="btn sm" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => handleUpdateStop(selected.id, stop.id, "skipped")}>Skip</button>
                      </>
                    )}
                    {stop.status === "delivered" && <span className="chip green" style={{ padding: "0 6px", fontSize: 10 }}><Icon name="check" size={9} /> Delivered</span>}
                    {stop.status === "skipped" && <span className="chip red" style={{ padding: "0 6px", fontSize: 10 }}>Skipped</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Tracking B: Multi-Truck View ──────────────────────────────────────────────
const TrackingB = ({ routes, loading, onRefresh }: { routes: Route[]; loading: boolean; onRefresh: () => void }) => {
  const handleStatusChange = async (id: string, status: string) => {
    await routesApi.updateStatus(id, status as any);
    onRefresh();
  };

  return (
    <div>
      <div className="card mb-2">
        <div className="card-head">
          <div>
            <h3>Fleet view · {routes.length} routes</h3>
            <div className="sub">{routes.filter(r => r.status === "active").length} active · {routes.filter(r => r.status === "planned").length} planned · {routes.filter(r => r.status === "completed").length} completed</div>
          </div>
          <div className="row">
            <div className="legend">
              <span><span className="sw" style={{ background: "var(--green)" }} />Delivered</span>
              <span><span className="sw" style={{ background: "var(--blue)" }} />In progress</span>
              <span><span className="sw" style={{ background: "var(--border-strong)" }} />Upcoming</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Loading routes…</div>
        ) : routes.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No routes today. Plan routes first in Route Planner.</div>
        ) : routes.map(r => (
          <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="between mb-2">
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-soft)", display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
                  <Icon name="truck" size={18} />
                </div>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{r.id}</div>
                    <StatusChip status={r.status} small />
                  </div>
                  <div className="small muted mt-1">{r.driver_name || "Unassigned"} · {r.truck || "—"} · {r.distance_km} km · {r.duration || "—"}</div>
                </div>
              </div>
              <div className="row" style={{ gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Utilisation</div>
                  <div className="mono" style={{ fontWeight: 600 }}>{r.utilisation}%</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Progress</div>
                  <div className="mono" style={{ fontWeight: 600 }}>{r.stops_done}/{r.stops_total}</div>
                </div>
                {r.status === "planned" && (
                  <button className="btn sm" onClick={() => handleStatusChange(r.id, "active")}>Start</button>
                )}
                {r.status === "active" && (
                  <button className="btn sm" onClick={() => handleStatusChange(r.id, "completed")}>Complete</button>
                )}
              </div>
            </div>

            {/* Stop Progress Bar */}
            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {r.stops_total > 0 ? [...Array(Math.min(r.stops_total, 10))].map((_, i) => {
                const done = i < r.stops_done;
                const current = i === r.stops_done && r.status === "active";
                return (
                  <div key={i} style={{ display: "contents" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%",
                      background: done ? "var(--green)" : current ? "var(--blue)" : "white",
                      border: done || current ? "none" : "1.5px dashed var(--border-strong)",
                      color: done || current ? "white" : "var(--text-subtle)",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                      boxShadow: current ? "0 0 0 4px rgba(59, 65, 112, 0.18)" : "none" }}>
                      {done ? "✓" : i + 1}
                    </div>
                    {i < Math.min(r.stops_total, 10) - 1 && (
                      <div style={{ height: 2, flex: 1, background: done ? "var(--green)" : "var(--border)", minWidth: 20 }} />
                    )}
                  </div>
                );
              }) : (
                <div className="small muted">No stops added yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
