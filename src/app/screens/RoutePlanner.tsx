import { useState } from "react";
import { Icon } from "../components/Icon";
import { SITES, DRIVERS } from "../components/data";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";

export const RoutePlanner = () => {
  const [variant, setVariant] = useState(0);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <span>Daily Ops</span>
        <span className="here">Route Planner</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            Route planner{" "}
            <span className="chip blue" style={{ marginLeft: 8, verticalAlign: "middle" }}>
              <Icon name="sparkles" size={10} />
              AI-assisted
            </span>
          </h1>
          <div className="sub">
            8 sites awaiting assignment · 5 drivers available (3 employees + 2 contractors) · AI has grouped into 3 suggested routes.
          </div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="refresh" size={14} /> Recalculate
          </button>
          <button className="btn">
            <Icon name="edit" size={14} /> Manual mode
          </button>
          <button className="btn primary">
            <Icon name="send" size={14} /> Publish 3 routes
          </button>
        </div>
      </div>

      <VariationBar
        label="Route planner layout"
        note="A = spatial map view with driver roster. B = timeline scheduler with shift availability."
        variants={["Map-based with available drivers", "Timeline scheduler with shifts"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0 ? <PlannerA /> : <PlannerB />}
    </div>
  );
};

const PlannerA = () => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const availableDrivers = DRIVERS.filter(d => d.availability === "available");
  const unavailableDrivers = DRIVERS.filter(d => d.availability !== "available");

  const stops = [
    { id: "S-2044", name: "Coles Express — Miranda", status: "red" as const, eta: "11:20", bags: 448, route: "RT-101" },
    { id: "S-1198", name: "BP Roadhouse — Port Kembla", status: "red" as const, eta: "12:45", bags: 624, route: "RT-101" },
    { id: "S-8055", name: "Shell Coles — Albion Park", status: "orange" as const, eta: "14:30", bags: 216, route: "RT-101" },
    { id: "S-4809", name: "Ampol — Warrawong", status: "orange" as const, eta: "15:25", bags: 188, route: "RT-101" },
    { id: "S-3021", name: "IGA — Bulli", status: "orange" as const, eta: "10:40", bags: 218, route: "RT-102" },
    { id: "S-5502", name: "7-Eleven — Figtree", status: "green" as const, eta: "12:00", bags: 0, route: null },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 360px", gap: 16 }}>
      {/* Available Drivers Panel */}
      <div>
        <div className="card mb-2" style={{ alignSelf: "start" }}>
          <div className="card-head">
            <div>
              <h3>Available Drivers</h3>
              <div className="sub">{availableDrivers.length} ready · From roster system</div>
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {availableDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver.id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selectedDriver === driver.id ? "var(--blue-soft)" : undefined,
                  borderLeft: selectedDriver === driver.id ? "3px solid var(--blue)" : "3px solid transparent"
                }}
              >
                <div className="between">
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{driver.name}</div>
                  <span className={`chip ${driver.type === "contractor" ? "orange" : "blue"}`} style={{ padding: "1px 6px", fontSize: 10 }}>
                    {driver.type === "contractor" ? "Contractor" : "Employee"}
                  </span>
                </div>
                <div className="small muted mt-1">
                  <Icon name="clock" size={10} style={{ verticalAlign: "middle" }} /> {driver.shift}
                </div>
                <div className="small muted">
                  <Icon name="truck" size={10} style={{ verticalAlign: "middle" }} /> {driver.truck} · {driver.certifications.join(", ")}
                </div>
                {driver.assigned && (
                  <div className="mt-1">
                    <span className="chip green" style={{ padding: "1px 6px", fontSize: 10 }}>
                      ✓ Assigned to {driver.assigned}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-head">
            <div>
              <h3>Unavailable</h3>
              <div className="sub">{unavailableDrivers.length} drivers</div>
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {unavailableDrivers.map((driver) => (
              <div
                key={driver.id}
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border)",
                  opacity: 0.6
                }}
              >
                <div className="between">
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{driver.name}</div>
                  <span className={`chip ${driver.availability === "on-leave" ? "orange" : "grey"}`} style={{ padding: "1px 6px", fontSize: 10 }}>
                    {driver.availability === "on-leave" ? "On Leave" : driver.availability === "on-route" ? "On Route" : "Off Roster"}
                  </span>
                </div>
                <div className="small muted mt-1">{driver.shift}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Route map · AI preview</h3>
            <div className="sub">3 routes · 387 km · 11h 30m total</div>
          </div>
          <div className="row">
            <div className="legend">
              <span>
                <span className="sw" style={{ background: "var(--blue)" }} />
                RT-101 (Luka M.)
              </span>
              <span>
                <span className="sw" style={{ background: "#a259ff" }} />
                RT-102 (Priya S.)
              </span>
              <span>
                <span className="sw" style={{ background: "#14b8a6" }} />
                RT-103 (Unassigned)
              </span>
            </div>
          </div>
        </div>
        <div className="map" style={{ height: 560 }}>
          <svg
            viewBox="0 0 400 560"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <path
              d="M 168 190 L 112 348 L 192 425 L 176 302"
              stroke="var(--blue)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
            />
            <path d="M 272 268 L 232 403" stroke="#a259ff" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
            <path d="M 96 234 L 152 324" stroke="#14b8a6" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
          </svg>
          {SITES.map((s) => (
            <div key={s.id} className={`map-pin ${s.status}`} style={{ top: `${s.top}%`, left: `${s.left}%` }}>
              {s.id.slice(-2)}
            </div>
          ))}
          <div className="map-pin truck" style={{ top: "22%", left: "12%" }}>
            W
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "white",
              borderRadius: 6,
              padding: "8px 12px",
              border: "1px solid var(--border)",
              fontSize: 12,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="small muted">Warehouse</div>
            <div style={{ fontWeight: 600 }}>Wollongong Depot</div>
          </div>
        </div>
      </div>

      {/* Route Details with Driver Info */}
      <div className="card" style={{ alignSelf: "start" }}>
        <div className="card-head">
          <div>
            <h3>RT-101 · Southside</h3>
            <div className="sub">4 stops · 92 km · 3h 20m</div>
          </div>
          <span className="chip blue" style={{ padding: "1px 7px", fontSize: 11 }}>
            <Icon name="sparkles" size={10} />
            AI suggested
          </span>
        </div>
        <div className="card-body">
          <div className="banner" style={{ marginBottom: 12, background: "var(--blue-soft)", borderColor: "#d4d8e6" }}>
            <Icon name="users" size={14} />
            <span><b>Driver assigned from roster:</b> Luka Martinovic (Contractor, Morning shift)</span>
          </div>

          <div className="grid-2 mb-2">
            <div>
              <div className="small muted">Driver</div>
              <div style={{ fontWeight: 500 }}>
                Luka Martinovic
              </div>
              <div className="row mt-1" style={{ gap: 4 }}>
                <span className="chip orange" style={{ padding: "1px 6px", fontSize: 10 }}>Contractor</span>
                <span className="chip green" style={{ padding: "1px 6px", fontSize: 10 }}>Available</span>
              </div>
            </div>
            <div>
              <div className="small muted">Shift & Truck</div>
              <div style={{ fontWeight: 500 }}>Morning (6am-2pm)</div>
              <div className="small muted mt-1">T-02 · HC License</div>
            </div>
          </div>

          <div className="card mb-2" style={{ background: "var(--bg-soft)", border: "1px dashed var(--border)" }}>
            <div className="card-body" style={{ padding: 12 }}>
              <div className="between small mb-1">
                <span className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>
                  Truck utilisation
                </span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  94%
                </span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: "94%" }} />
              </div>
              <div className="small muted mt-1">14 of 15 pallets used · 1,476 bags total</div>
            </div>
          </div>

          <div className="small muted mb-1" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>
            Stop sequence
          </div>
          {stops
            .filter((s) => s.route === "RT-101")
            .map((s, i) => (
              <div
                key={s.id}
                style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: `var(--${s.status === "red" ? "red" : "orange"})`,
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div className="small muted">
                    ETA {s.eta} · {s.bags} bags
                  </div>
                </div>
                <button className="btn ghost sm">
                  <Icon name="dots" size={14} />
                </button>
              </div>
            ))}

          <div className="row mt-2" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button className="btn">Change Driver</button>
            <button className="btn">Re-AI Route</button>
            <button className="btn primary">Confirm RT-101</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlannerB = () => {
  const timeSlots = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];

  const routes = [
    {
      id: "RT-101",
      driver: DRIVERS.find(d => d.id === "DRV-001")!,
      startTime: 2, // 10am
      duration: 4, // 4 hours
      stops: 4,
      distance: "92 km",
      sites: ["S-2044", "S-1198", "S-8055", "S-4809"],
      color: "var(--blue)"
    },
    {
      id: "RT-102",
      driver: DRIVERS.find(d => d.id === "DRV-002")!,
      startTime: 1, // 8am
      duration: 5, // 5 hours
      stops: 2,
      distance: "118 km",
      sites: ["S-3021", "S-5502"],
      color: "#a259ff"
    },
  ];

  return (
    <div>
      <div className="banner mb-2">
        <Icon name="clock" size={14} />
        <span>
          <b>Timeline Scheduler</b> — View shows driver shifts and route assignments by time. Drag routes to reassign drivers or adjust timing.
        </span>
      </div>

      {/* Header Row */}
      <div className="card mb-2">
        <div className="card-head">
          <div>
            <h3>Driver Roster & Shift Timeline</h3>
            <div className="sub">Tuesday, 20 April 2026 · All times AEST</div>
          </div>
          <div className="row">
            <div className="segmented">
              <button className="seg active">Today</button>
              <button className="seg">Tomorrow</button>
              <button className="seg">Week View</button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 1200 }}>
            {/* Time Header */}
            <div style={{ display: "grid", gridTemplateColumns: "200px repeat(8, 1fr)", borderBottom: "1px solid var(--border)", background: "var(--bg-softer)" }}>
              <div style={{ padding: "12px 16px", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Driver / Shift
              </div>
              {timeSlots.map((time, i) => (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", fontWeight: 500, fontSize: 12, borderLeft: "1px solid var(--border)" }}>
                  {time}
                </div>
              ))}
            </div>

            {/* Driver Rows */}
            {DRIVERS.filter(d => d.availability === "available" || d.availability === "on-route").map((driver) => {
              const assignedRoute = routes.find(r => r.driver.id === driver.id);
              const shiftStart = driver.shift.includes("Morning") ? 0 : driver.shift.includes("Afternoon") ? 4 : 1;
              const shiftDuration = driver.shift.includes("Morning") ? 4 : driver.shift.includes("Afternoon") ? 4 : 4;

              return (
                <div key={driver.id} style={{ display: "grid", gridTemplateColumns: "200px repeat(8, 1fr)", borderBottom: "1px solid var(--border)", minHeight: 80 }}>
                  {/* Driver Info */}
                  <div style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{driver.name}</div>
                    <div className="row mt-1" style={{ gap: 4 }}>
                      <span className={`chip ${driver.type === "contractor" ? "orange" : "blue"}`} style={{ padding: "1px 5px", fontSize: 10 }}>
                        {driver.type === "contractor" ? "Contractor" : "Employee"}
                      </span>
                      <span className={`chip ${driver.availability === "available" ? "green" : "grey"}`} style={{ padding: "1px 5px", fontSize: 10 }}>
                        {driver.availability === "available" ? "Available" : "On Route"}
                      </span>
                    </div>
                    <div className="small muted mt-1">
                      <Icon name="truck" size={10} style={{ verticalAlign: "middle" }} /> {driver.truck}
                    </div>
                  </div>

                  {/* Timeline Cells */}
                  <div style={{ gridColumn: "2 / -1", position: "relative", display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                    {/* Shift Background */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${(shiftStart / 8) * 100}%`,
                        width: `${(shiftDuration / 8) * 100}%`,
                        height: "100%",
                        background: "var(--bg-soft)",
                        borderLeft: "2px solid var(--border-strong)",
                        borderRight: "2px solid var(--border-strong)",
                        opacity: 0.5,
                        pointerEvents: "none"
                      }}
                    />

                    {/* Route Bar */}
                    {assignedRoute && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${(assignedRoute.startTime / 8) * 100}%`,
                          width: `${(assignedRoute.duration / 8) * 100}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "60%",
                          background: assignedRoute.color,
                          borderRadius: 6,
                          padding: "8px 12px",
                          color: "white",
                          cursor: "grab",
                          boxShadow: "var(--shadow-md)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center"
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{assignedRoute.id}</div>
                        <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>
                          {assignedRoute.stops} stops · {assignedRoute.distance}
                        </div>
                      </div>
                    )}

                    {/* Grid Lines */}
                    {timeSlots.map((_, i) => (
                      <div key={i} style={{ borderLeft: i > 0 ? "1px solid var(--border)" : "none" }} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Unavailable Drivers (Collapsed View) */}
            <div style={{ background: "var(--bg-soft)", padding: "12px 16px", borderTop: "2px solid var(--border)" }}>
              <div className="between">
                <div>
                  <span className="small muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>
                    Unavailable Today
                  </span>
                  <span className="small muted" style={{ marginLeft: 12 }}>
                    {DRIVERS.filter(d => d.availability !== "available" && d.availability !== "on-route").length} drivers
                  </span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {DRIVERS.filter(d => d.availability !== "available" && d.availability !== "on-route").map(d => (
                    <span key={d.id} className="chip grey" style={{ padding: "2px 8px", fontSize: 11 }}>
                      {d.name} ({d.availability === "on-leave" ? "Leave" : "Off Roster"})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Awaiting Assignment */}
      <div className="grid-2 mt-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Unassigned Sites</h3>
              <div className="sub">Drag sites to driver timeline to create routes</div>
            </div>
            <span className="chip red">3 urgent</span>
          </div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SITES.filter(s => s.status === "red" || s.status === "orange").slice(0, 6).map(s => (
              <div key={s.id} className={`site-card ${s.status}`} style={{ cursor: "grab" }}>
                <div className="between">
                  <span className="mono subtle small">{s.id}</span>
                  <StatusChip status={s.status} small />
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div className="small muted">{s.required} bags · {s.suburb}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>Route Statistics</h3>
              <div className="sub">AI-optimized assignments</div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div className="small muted">Total Distance</div>
                <div style={{ fontSize: 20, fontWeight: 600 }} className="mono">387 km</div>
              </div>
              <div>
                <div className="small muted">Total Duration</div>
                <div style={{ fontSize: 20, fontWeight: 600 }} className="mono">11h 30m</div>
              </div>
              <div>
                <div className="small muted">Routes Planned</div>
                <div style={{ fontSize: 20, fontWeight: 600 }} className="mono">2</div>
              </div>
              <div>
                <div className="small muted">Avg Utilization</div>
                <div style={{ fontSize: 20, fontWeight: 600 }} className="mono">88%</div>
              </div>
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div className="banner" style={{ marginBottom: 0 }}>
              <Icon name="sparkles" size={14} />
              <span>AI suggests assigning <b>Devon Kim</b> or <b>Nina Patel</b> (afternoon shift) for RT-103 to cover western loop sites.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
