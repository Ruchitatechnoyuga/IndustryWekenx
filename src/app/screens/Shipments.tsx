import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";

import { shipmentsApi, routesApi, Customer, Site, Product, Driver, Shipment, Route } from "../services/api";

export const Shipments = () => {
  const [activeTab, setActiveTab] = useState<"all" | "live">("all");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Refresh tracking
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load shipments
  useEffect(() => {
    async function fetchShipments() {
      try {
        const data = await shipmentsApi.list();
        // Sort shipments: new/urgent on top, or by date descending
        const sorted = [...data].sort((a, b) => b.id.localeCompare(a.id));
        setShipments(sorted);
        
        // Update selected shipment details if open
        if (selectedShipment) {
          const fresh = sorted.find(s => s.id === selectedShipment.id);
          if (fresh) setSelectedShipment(fresh);
        }
      } catch (err) {
        console.error("Failed to load shipments:", err);
      }
    }
    fetchShipments();

    // Listen to shipment creation trigger
    const handleCreated = () => {
      fetchShipments();
    };
    window.addEventListener("shipment-created", handleCreated);
    return () => window.removeEventListener("shipment-created", handleCreated);
  }, [refreshTrigger, selectedShipment?.id]);

  const handleRefresh = () => {
    setRefreshTrigger(t => t + 1);
  };

  // KPIs
  const totalToday = shipments.length;
  const unassigned = shipments.filter(s => !s.route_id).length;
  const inTransit = shipments.filter(s => s.status === "in-transit").length;
  const deliveredToday = shipments.filter(s => s.status === "delivered" || s.status === "invoiced").length;

  return (
    <div className="page" style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto", height: "100%", overflowY: "auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--navy-deep)", margin: 0, letterSpacing: "-0.02em" }}>
            Shipment Operations
          </h1>
          <div className="sub" style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "4px" }}>
            Track and dispatch customer shipments from booking to invoicing.
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Tabs selector */}
          <div style={{ display: "flex", background: "#f1f3f5", padding: "3px", borderRadius: "8px" }}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "all" ? "white" : "transparent",
                color: activeTab === "all" ? "var(--navy)" : "var(--text-muted)",
                boxShadow: activeTab === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              All Shipments
            </button>
            <button
              onClick={() => setActiveTab("live")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "live" ? "white" : "transparent",
                color: activeTab === "live" ? "var(--navy)" : "var(--text-muted)",
                boxShadow: activeTab === "live" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Live Routes
            </button>
          </div>

          <button onClick={handleRefresh} className="btn" style={{ padding: "8px 12px", background: "white", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>
            <Icon name="refresh" size={14} />
          </button>
        </div>
      </div>

      {activeTab === "all" ? (
        <AllShipmentsView 
          shipments={shipments}
          selected={selectedShipment}
          onSelect={setSelectedShipment}
          kpis={{ totalToday, unassigned, inTransit, deliveredToday }}
        />
      ) : (
        <LiveRoutesView />
      )}
    </div>
  );
};

// ─── TAB 1: ALL SHIPMENTS VIEW ───────────────────────────────────────────────
interface AllShipmentsViewProps {
  shipments: Shipment[];
  selected: Shipment | null;
  onSelect: (s: Shipment | null) => void;
  kpis: { totalToday: number; unassigned: number; inTransit: number; deliveredToday: number };
}

const AllShipmentsView = ({ shipments, selected, onSelect, kpis }: AllShipmentsViewProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* 4 KPI Chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Shipments Today", value: kpis.totalToday, icon: "clipboard", color: "var(--navy)" },
          { label: "Unassigned Shipments", value: kpis.unassigned, icon: "info", color: "var(--orange)" },
          { label: "In Transit Right Now", value: kpis.inTransit, icon: "truck", color: "var(--blue)" },
          { label: "Delivered Today", value: kpis.deliveredToday, icon: "check", color: "var(--green)" }
        ].map((kpi, idx) => (
          <div key={idx} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{kpi.label}</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--navy-deep)", marginTop: "4px" }}>{kpi.value}</div>
            </div>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "#F1F2F4",
              display: "grid",
              placeItems: "center",
              color: kpi.color
            }}>
              <Icon name={kpi.icon} size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table + Detail Drawer Layout */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", width: "100%" }}>
        
        {/* Left Side: Table */}
        <div className="card" style={{ flex: 1, overflow: "hidden" }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>ID</th>
                  <th>CUSTOMER & SITE</th>
                  <th>PRODUCT & QTY</th>
                  <th style={{ width: "100px" }}>DELIVERY</th>
                  <th style={{ width: "90px" }}>PRIORITY</th>
                  <th>DRIVER</th>
                  <th style={{ width: "80px" }}>ROUTE</th>
                  <th>STATUS JOURNEY</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => {
                  const isSelected = selected?.id === s.id;
                  const isEmergency = s.priority.toLowerCase() === "emergency";
                  const isUrgent = s.priority.toLowerCase() === "urgent";

                  return (
                    <tr 
                      key={s.id}
                      onClick={() => onSelect(isSelected ? null : s)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--blue-soft)" : undefined,
                        borderLeft: isSelected ? "3px solid var(--blue)" : "3px solid transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      <td>
                        <span style={{ color: "var(--blue)", fontWeight: 700 }}>{s.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{s.customer_name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "2px" }}>{s.site_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{s.product_name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "2px" }}>
                          <span style={{ fontWeight: 600, color: "var(--text)" }}>{s.quantity}</span> bags
                        </div>
                      </td>
                      <td style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
                        {s.delivery_date}
                      </td>
                      <td>
                        {isEmergency ? (
                          <span className="chip red" style={{ fontSize: "11px", fontWeight: 600 }}>Emergency</span>
                        ) : isUrgent ? (
                          <span className="chip orange" style={{ fontSize: "11px", fontWeight: 600 }}>Urgent</span>
                        ) : (
                          <span className="chip grey" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Normal</span>
                        )}
                      </td>
                      <td>
                        {s.assigned_driver_name ? (
                          <span style={{ fontWeight: 500 }}>{s.assigned_driver_name}</span>
                        ) : (
                          <span style={{ color: "var(--text-subtle)", fontStyle: "italic", fontSize: "12.5px" }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {s.route_id ? (
                          <span style={{ fontWeight: 600, color: "var(--navy)" }}>{s.route_id}</span>
                        ) : (
                          <span style={{ color: "var(--text-subtle)", fontSize: "12.5px" }}>Not yet</span>
                        )}
                      </td>
                      <td>
                        <Stepper status={s.status} />
                      </td>
                    </tr>
                  );
                })}
                {shipments.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-subtle)" }}>
                      No shipments found. Click "Create Shipment" in the sidebar to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Timeline details panel drawer */}
        {selected && (
          <div className="card" style={{
            width: "420px",
            flexShrink: 0,
            padding: "24px",
            border: "1px solid var(--border)",
            background: "white",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: "var(--shadow-sm)",
            position: "sticky",
            top: 0
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Shipment Details</span>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy-deep)", margin: "2px 0 0 0" }}>{selected.id}</h3>
              </div>
              <button 
                onClick={() => onSelect(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Shipment Data Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Customer:</span>
                <span style={{ fontWeight: 600 }}>{selected.customer_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Delivery Site:</span>
                <span style={{ fontWeight: 500 }}>{selected.site_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Product & Qty:</span>
                <span style={{ fontWeight: 600 }}>{selected.product_name} · {selected.quantity} bags</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Pallet Configuration:</span>
                <span>{selected.pallet_type || "None"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">PO Number:</span>
                <span style={{ fontWeight: 600, color: "var(--navy)" }}>{selected.po_number || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Driver Assigned:</span>
                <span>{selected.assigned_driver_name || "Unassigned"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Route Assigned:</span>
                <span style={{ fontWeight: 600 }}>{selected.route_id || "Not yet"}</span>
              </div>
              {selected.special_instructions && (
                <div style={{ background: "#F8FAFC", borderRadius: "6px", padding: "10px", marginTop: "6px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Special Instructions:</div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontStyle: "italic" }}>{selected.special_instructions}</div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "16px" }}>Timeline Journey</h4>
              <VerticalTimeline shipment={selected} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

// Connect-the-dots horizontal stepper for shipment list row
const Stepper = ({ status }: { status: Shipment["status"] }) => {
  const STAGES: Shipment["status"][] = ["new", "queued", "assigned", "in-transit", "delivered", "invoiced"];
  const STAGE_LABELS: Record<Shipment["status"], string> = {
    "new": "New",
    "queued": "Queued",
    "assigned": "Assigned",
    "in-transit": "In Transit",
    "delivered": "Delivered",
    "invoiced": "Invoiced"
  };
  const STAGE_COLORS: Record<Shipment["status"], string> = {
    "new": "var(--blue)",
    "queued": "var(--orange)",
    "assigned": "var(--purple)",
    "in-transit": "var(--green)",
    "delivered": "var(--green)",
    "invoiced": "var(--text-muted)"
  };

  const activeIndex = STAGES.indexOf(status);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {STAGES.map((st, idx) => {
        const isCurrent = idx === activeIndex;
        const isCompleted = idx < activeIndex;
        const color = STAGE_COLORS[st];

        return (
          <div key={st} style={{ display: "flex", alignItems: "center" }}>
            <div 
              title={STAGE_LABELS[st]}
              style={{
                width: isCurrent ? "12px" : "7px",
                height: isCurrent ? "12px" : "7px",
                borderRadius: "50%",
                background: isCurrent ? color : isCompleted ? "#cbd5e1" : "#e2e8f0",
                border: isCurrent ? "1.5px solid white" : "none",
                boxShadow: isCurrent ? `0 0 0 2px ${color}` : "none",
                position: "relative",
                display: "inline-block",
                transition: "all 0.2s"
              }}
            >
              {isCurrent && st === "in-transit" && (
                <span className="pulsing-dot-inner" style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: "50%",
                  border: "2px solid var(--green)",
                  animation: "ping 1.5s infinite"
                }} />
              )}
            </div>
            {idx < STAGES.length - 1 && (
              <div style={{
                width: "8px",
                height: "1.5px",
                background: isCompleted ? "#cbd5e1" : "#e2e8f0",
                marginLeft: "4px"
              }} />
            )}
          </div>
        );
      })}
      <span style={{ 
        marginLeft: "6px", 
        fontSize: "11px", 
        fontWeight: 600, 
        color: STAGE_COLORS[status],
        textTransform: "capitalize"
      }}>
        {STAGE_LABELS[status]}
      </span>
    </div>
  );
};

// Vertical timeline for shipment detail drawer panel
const VerticalTimeline = ({ shipment }: { shipment: Shipment }) => {
  const status = shipment.status;
  
  // Time helpers (mock dates matching creation times)
  const formatTime = (createdAtStr: string, offsetMin: number) => {
    const d = new Date(createdAtStr);
    if (isNaN(d.getTime())) return "Today 08:15";
    d.setMinutes(d.getMinutes() + offsetMin);
    return `Today ${d.toTimeString().slice(0, 5)}`;
  };

  const steps = [
    {
      label: "Created",
      desc: `by Nicole`,
      time: formatTime(shipment.created_at, 0),
      isDone: true,
      isCurrent: false
    },
    {
      label: `Queued`,
      desc: "Queued for planning",
      time: formatTime(shipment.created_at, 12),
      isDone: status !== "new",
      isCurrent: status === "queued"
    },
    {
      label: "Added to Route",
      desc: shipment.route_id ? `Assigned to ${shipment.route_id}` : "Pending route planning",
      time: shipment.route_id ? formatTime(shipment.created_at, 27) : "",
      isDone: status !== "new" && status !== "queued",
      isCurrent: status === "assigned"
    },
    {
      label: "Driver departed",
      desc: shipment.assigned_driver_name ? `Driver ${shipment.assigned_driver_name} departed` : "Pending departure",
      time: (status === "in-transit" || status === "delivered" || status === "invoiced") ? formatTime(shipment.created_at, 55) : "",
      isDone: status === "in-transit" || status === "delivered" || status === "invoiced",
      isCurrent: status === "in-transit"
    },
    {
      label: "Delivered",
      desc: status === "in-transit" ? `Stop 3 of 4 — ETA 14:30 — In progress` : (status === "delivered" || status === "invoiced") ? "Delivered & Signed" : "Pending delivery",
      time: (status === "delivered" || status === "invoiced") ? formatTime(shipment.created_at, 134) : "",
      isDone: status === "delivered" || status === "invoiced",
      isCurrent: status === "in-transit" // Highlight progress on delivery line
    },
    {
      label: "Invoice created",
      desc: shipment.invoice_id ? `Invoice ${shipment.invoice_id} generated` : "Pending invoice billing",
      time: shipment.invoice_id ? formatTime(shipment.created_at, 136) : "",
      isDone: status === "invoiced",
      isCurrent: status === "delivered"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {steps.map((step, idx) => {
        // Circle styling: green checkmark for done, blue pulsing for current, empty outline for upcoming
        const circleBg = step.isDone ? "var(--green)" : step.isCurrent ? "var(--blue)" : "white";
        const circleBorder = step.isDone ? "none" : step.isCurrent ? "none" : "1.5px solid var(--border-strong)";
        const circleColor = step.isDone || step.isCurrent ? "white" : "var(--text-subtle)";

        return (
          <div key={idx} style={{ display: "flex", gap: "16px", position: "relative" }}>
            {/* Left line segment connecting circles */}
            {idx < steps.length - 1 && (
              <div style={{
                position: "absolute",
                left: "11px",
                top: "24px",
                bottom: "-10px",
                width: "2px",
                background: step.isDone ? "var(--green)" : "#e2e8f0",
                zIndex: 1
              }} />
            )}

            {/* Circle Node */}
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: circleBg,
              border: circleBorder,
              color: circleColor,
              display: "grid",
              placeItems: "center",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
              zIndex: 2,
              boxShadow: step.isCurrent ? "0 0 0 4px rgba(59, 65, 112, 0.18)" : "none"
            }}>
              {step.isDone ? "✓" : idx + 1}
            </div>

            {/* Label and Info */}
            <div style={{ paddingBottom: "20px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 600, color: step.isDone ? "var(--navy-deep)" : "var(--text)" }}>{step.label}</span>
                {step.time && <span style={{ fontSize: "11px", color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>{step.time}</span>}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "2px" }}>{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ─── TAB 2: LIVE ROUTES VIEW ─────────────────────────────────────────────────
// Copied exactly from the original ActiveRoutes component to maintain its layout
const LiveRoutesView = () => {
  const [variant, setVariant] = useState(0);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    routesApi.list().then(setRoutes).catch(console.error);
    shipmentsApi.list().then(setShipments).catch(console.error);
  }, []);

  const activeRoutesCount = routes.filter(r => r.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy-deep)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Live Routes Tracking
            <span className="chip green" style={{ padding: "2px 8px", fontSize: "11px" }}>
              <span className="dot" style={{ background: "var(--green)" }} />
              Live
            </span>
          </h2>
          <div className="sub" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {activeRoutesCount} truck{activeRoutesCount === 1 ? "" : "s"} on the road · auto-refreshing every 30s via native GPS geofencing
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn sm" style={{ background: "white", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>
            Alerts (1)
          </button>
          <button className="btn sm primary" style={{ background: "var(--navy-deep)", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>
            End-of-day report
          </button>
        </div>
      </div>

      <VariationBar
        label="Tracking layout"
        note="A = single-truck deep dive (dispatcher focus). B = multi-truck overview (manager)."
        variants={["Map + stop timeline", "Multi-truck split view"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0 ? <TrackingA routes={routes} shipments={shipments} /> : <TrackingB routes={routes} />}
    </div>
  );
};

const TrackingA = ({ routes, shipments }: { routes: Route[]; shipments: Shipment[] }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [activeTruckPopup, setActiveTruckPopup] = useState<string | null>(null);

  useEffect(() => {
    if (routes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes, selectedRouteId]);

  useEffect(() => {
    function handleGlobalClick() {
      setActiveTruckPopup(null);
    }
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || null;
  const activeRoutes = routes.filter(r => r.status === "active");

  const getLiveTruckPosition = (truckCode: string, index: number) => {
    const positions = [
      { top: "54%", left: "44%", labelTop: "48%", labelLeft: "46%" },
      { top: "34%", left: "38%", labelTop: "28%", labelLeft: "40%" },
      { top: "68%", left: "52%", labelTop: "62%", labelLeft: "54%" },
      { top: "42%", left: "28%", labelTop: "36%", labelLeft: "30%" },
    ];
    return positions[index % positions.length];
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 360px", gap: 16 }}>
      <div className="card" style={{ alignSelf: "start" }}>
        <div className="card-head">
          <h3>Today's routes</h3>
          <span className="chip">{routes.length}</span>
        </div>
        <div>
          {routes.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No routes today</div>
          ) : routes.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: selectedRoute?.id === r.id ? "var(--blue-soft)" : undefined,
                borderLeft: selectedRoute?.id === r.id ? "3px solid var(--blue)" : "3px solid transparent",
              }}
            >
              <div className="between">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.id}</div>
                <StatusChip status={r.status} small />
              </div>
              <div className="small muted mt-1">
                {r.driver_name || "Unassigned"} · {r.truck || "—"}
              </div>
              <div className="row mt-1" style={{ gap: 6 }}>
                <div className="bar" style={{ flex: 1 }}>
                  <div className="bar-fill green" style={{ width: `${r.stops_total > 0 ? (r.stops_done / r.stops_total) * 100 : 0}%` }} />
                </div>
                <span className="small mono">
                  {r.stops_done}/{r.stops_total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>
              {selectedRoute?.id || "No Route Selected"} · {selectedRoute?.driver_name || "Unassigned"}{" "}
              {selectedRoute && (
                <span className={`chip ${selectedRoute.status === "active" ? "green" : "blue"}`} style={{ padding: "1px 7px", fontSize: 11, marginLeft: 6 }}>
                  <span className="dot" />
                  {selectedRoute.status === "active" ? "On route" : selectedRoute.status}
                </span>
              )}
            </h3>
            <div className="sub">
              {selectedRoute ? `Stop ${selectedRoute.stops_done} of ${selectedRoute.stops_total} · ${selectedRoute.truck || "No truck"}` : "Select a route to view tracking details"}
            </div>
          </div>
        </div>
        <div className="map" style={{ height: 500 }}>
          <svg
            viewBox="0 0 400 500"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <path
              d="M 48 110 L 168 170 L 112 310"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
            />
            <path d="M 112 310 L 192 380 L 176 270" stroke="var(--blue)" strokeWidth="2.5" fill="none" />
            <circle cx="176" cy="270" r="28" fill="rgba(59, 65, 112, 0.08)" stroke="var(--blue)" strokeDasharray="4 4" />
          </svg>

          {/* Render Active Trucks dynamically */}
          {activeRoutes.map((r, index) => {
            const pos = getLiveTruckPosition(r.truck, index);
            const isOpen = activeTruckPopup === r.id;

            // Get cargo products summary
            const routeShipments = shipments.filter(s => s.route_id === r.id);
            const cargoSummary = routeShipments.reduce((acc, curr) => {
              acc[curr.product_name] = (acc[curr.product_name] || 0) + curr.quantity;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={r.id}>
                {/* Truck Marker Pin */}
                <div
                  className="map-pin truck"
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
                  {r.truck ? r.truck.replace("T-", "T") : "🚚"}
                </div>

                {/* Cargo Detail Popover */}
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
                      <Icon name="x" size={12} />
                    </button>

                    {/* Header */}
                    <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#38BDF8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Icon name="truck" size={13} />
                      <span>{r.truck || "Truck"} ({r.id})</span>
                    </div>

                    {/* Driver */}
                    <div style={{ marginBottom: "8px", borderBottom: "1px solid #334155", paddingBottom: "6px" }}>
                      <span style={{ color: "#94A3B8", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>Driver</span>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#F1F5F9" }}>{r.driver_name || "Unassigned"}</span>
                    </div>

                    {/* Onboard Cargo Products */}
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

          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "white",
              borderRadius: 8,
              padding: "10px 12px",
              border: "1px solid var(--border)",
              minWidth: 170,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="small muted">Current location</div>
            <div style={{ fontWeight: 600 }}>Princes Hwy, Warrawong</div>
            <div className="small muted mt-1">
              Speed: <span className="mono">58 km/h</span>
            </div>
            <div className="small muted">
              Last ping: <span className="mono">12s ago</span>
            </div>
          </div>
        </div>
      </div>

    <div className="card" style={{ alignSelf: "start" }}>
      <div className="card-head">
        <div>
          <h3>Stop timeline</h3>
          <div className="sub">Auto-updated from driver app</div>
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          {
            n: 1,
            name: "Coles Express — Miranda",
            state: "done",
            arr: "11:18",
            dep: "11:34",
            bags: "448 / 448",
            sig: true,
            note: null,
          },
          {
            n: 2,
            name: "BP Roadhouse — Pt Kembla",
            state: "done",
            arr: "12:41",
            dep: "13:09",
            bags: "620 / 624",
            sig: true,
            note: "4 bags wastage logged",
          },
          {
            n: 3,
            name: "Ampol — Warrawong",
            state: "current",
            arr: "—",
            dep: "—",
            bags: "pending",
            sig: false,
            note: null,
          },
          {
            n: 4,
            name: "Shell — Albion Park",
            state: "upcoming",
            arr: "—",
            dep: "—",
            bags: "—",
            sig: false,
            note: null,
          },
        ].map((s) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              background: s.state === "current" ? "var(--blue-soft)" : undefined,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: s.state === "done" ? "var(--green)" : s.state === "current" ? "var(--blue)" : "var(--bg-soft)",
                color: s.state === "upcoming" ? "var(--text-muted)" : "white",
                border: s.state === "upcoming" ? "1px dashed var(--border-strong)" : "none",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.state === "done" ? "✓" : s.n}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div className="small muted mt-1">
                <span>
                  <Icon name="pin" size={10} style={{ verticalAlign: "middle" }} /> Arrived {s.arr}
                </span>
                {s.dep !== "—" && <span> · Departed {s.dep}</span>}
              </div>
              <div className="small mt-1" style={{ display: "flex", gap: 8 }}>
                <span className="muted">
                  Bags: <span className="mono" style={{ color: "var(--text)" }}>{s.bags}</span>
                </span>
                {s.sig && (
                  <span className="chip green" style={{ padding: "0 6px", fontSize: 10 }}>
                    <Icon name="check" size={9} />
                    Signed
                  </span>
                )}
                {s.note && (
                  <span className="chip orange" style={{ padding: "0 6px", fontSize: 10 }}>
                    {s.note}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

const TrackingB = ({ routes }: { routes: Route[] }) => (
  <div>
    <div className="card mb-2">
      <div className="card-head">
        <div>
          <h3>Fleet view · 4 trucks</h3>
          <div className="sub">2 active · 1 planned · 1 completed</div>
        </div>
        <div className="row">
          <div className="legend">
            <span>
              <span className="sw" style={{ background: "var(--green)" }} />
              Delivered
            </span>
            <span>
              <span className="sw" style={{ background: "var(--blue)" }} />
              In progress
            </span>
            <span>
              <span className="sw" style={{ background: "var(--border-strong)" }} />
              Upcoming
            </span>
          </div>
        </div>
      </div>
      <div>
        {routes.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No routes planned today</div>
        ) : routes.map((r, idx) => (
          <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="between mb-2">
              <div className="row" style={{ gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--bg-soft)",
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon name="truck" size={18} />
                </div>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{r.id}</div>
                    <StatusChip status={r.status} small />
                  </div>
                  <div className="small muted mt-1">
                    {r.driver_name || "Unassigned"} · {r.truck || "—"} · {r.distance_km} km · {r.duration || "—"}
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Utilisation</div>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {r.utilisation}%
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Progress</div>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {r.stops_done}/{r.stops_total}
                  </div>
                </div>
                <button className="btn sm">Open</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {r.stops_total === 0 ? (
                <div className="small muted">No stops</div>
              ) : [...Array(Math.min(r.stops_total, 10))].map((_, i) => {
                const done = i < r.stops_done;
                const current = i === r.stops_done && r.status === "active";
                return (
                  <div key={i} style={{ display: "contents" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: done ? "var(--green)" : current ? "var(--blue)" : "white",
                        border: done || current ? "none" : "1.5px dashed var(--border-strong)",
                        color: done || current ? "white" : "var(--text-subtle)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: current ? "0 0 0 4px rgba(59, 65, 112, 0.18)" : "none",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    {i < Math.min(r.stops_total, 10) - 1 && (
                      <div style={{ height: 2, flex: 1, background: done ? "var(--green)" : "var(--border)", minWidth: 20 }} />
                    )}
                  </div>
                );
              })}
              <div style={{ flex: 1, minWidth: 20 }} />
              {r.status === "active" && (
                <div className="chip blue" style={{ padding: "2px 8px" }}>
                  <Icon name="clock" size={10} />
                  Next ETA {idx === 0 ? "14:30" : "15:10"}
                </div>
              )}
              {r.status === "completed" && (
                <div className="chip green" style={{ padding: "2px 8px" }}>
                  <Icon name="check" size={10} />
                  Completed 15:42
                </div>
              )}
            </div>

            {r.status === "active" && (
              <div className="grid-3 mt-2" style={{ gap: 8 }}>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Current stop</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {idx === 0 ? "Ampol — Warrawong" : "IGA — Bulli"}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Bags delivered</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }} className="mono">
                      {idx === 0 ? "1,068 / 1,476" : "218 / 618"}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Alerts</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: idx === 0 ? "var(--orange)" : "var(--text)" }}>
                      {idx === 0 ? "1 wastage logged" : "None"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
