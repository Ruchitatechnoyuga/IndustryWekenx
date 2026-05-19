import { useState } from "react";
import { Icon } from "../components/Icon";

const KPI_DATA = [
  {
    label: "TOTAL FRIDGES",
    value: "12",
    sub: "↑ +2 this month",
    subColor: "#16a34a",
    borderColor: "#3B4170", // blue
  },
  {
    label: "TOTAL CAPACITY",
    value: "2,400",
    unit: "Bags",
    sub: "Across all active sites",
    icon: "chart",
    borderColor: "#3B4170", // blue
  },
  {
    label: "CURRENT STOCK",
    value: "1,650",
    unit: "Bags",
    sub: "68.7% total occupancy",
    icon: "help", // circular occupancy icon
    borderColor: "#f59e0b", // yellow-orange
  },
  {
    label: "LOW STOCK ALERTS",
    value: "3",
    sub: "Action Required",
    subColor: "#dc2626",
    hasAlert: true,
    borderColor: "#dc2626", // red
  }
];

const FRIDGE_ITEMS = [
  {
    id: "#F-9021",
    customer: "QuickMart Retail",
    branch: "North Hub Branch",
    label: "Main Walk-in A",
    room: "Floor 1, Storage Rm",
    current: 1650,
    total: 2000,
    occupancy: 82.5,
    status: "Well Stocked",
    statusColor: "green",
    active: true
  },
  {
    id: "#F-9025",
    customer: "FuelStop Corp",
    branch: "East 42nd Station",
    label: "Freezer Unit 4",
    room: "External Kiosk",
    current: 45,
    total: 400,
    occupancy: 11.2,
    status: "Low Stock",
    statusColor: "red",
    active: true
  },
  {
    id: "#F-8842",
    customer: "QuickMart Retail",
    branch: "Metro Plaza",
    label: "Drink Chiller B",
    room: "Sales Floor",
    current: 140,
    total: 300,
    occupancy: 46.6,
    status: "Medium",
    statusColor: "orange",
    active: true
  }
];

const STORAGE_ALERTS = [
  {
    id: 1,
    type: "red",
    title: "Fridge 4 Low Stock",
    location: "FuelStop East 42nd",
    desc: "is at 11% capacity. Shipment recommended.",
    hasLink: true
  },
  {
    id: 2,
    type: "orange",
    title: "Main Freezer A",
    desc: "Approaching max capacity (82%). Consider rerouting incoming."
  },
  {
    id: 3,
    type: "grey",
    title: "Temp Fluctuation",
    desc: "Fridge #F-8842 reported a 2°C rise. Monitoring..."
  }
];

export const Fridges = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [activeToggle, setActiveToggle] = useState("Active");

  return (
    <>
      {showAddModal && <AddFridgeModal onClose={() => setShowAddModal(false)} />}
      <div className="page" style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", alignItems: "center" }}>
        <span>Customers</span>
        <span style={{ color: "#cbced4" }}>&gt;</span>
        <span>Customer Details</span>
        <span style={{ color: "#cbced4" }}>&gt;</span>
        <span className="here" style={{ color: "var(--navy)", fontWeight: 600 }}>Fridge & Storage Capacity</span>
      </div>

      {/* Header */}
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--navy-deep)", margin: 0, letterSpacing: "-0.02em" }}>
            Fridge & Storage Capacity
          </h1>
          <div className="sub" style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "4px" }}>
            Manage storage units, stock levels, and fridge capacity across customer sites.
          </div>
        </div>
        <div className="actions" style={{ display: "flex", gap: "8px" }}>
          <button className="btn" style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer"
          }}>
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn primary" onClick={() => setShowAddModal(true)} style={{
            background: "var(--navy)",
            borderColor: "var(--navy)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(59, 65, 112, 0.1)"
          }}>
            <Icon name="plus" size={14} /> Add New Fridge
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
        {KPI_DATA.map((kpi, idx) => (
          <div key={idx} className="card" style={{
            borderLeft: `4px solid ${kpi.borderColor}`,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "100px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--navy-deep)", margin: "8px 0 4px 0", display: "flex", alignItems: "baseline", gap: "4px" }}>
              {kpi.value}
              {kpi.unit && <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-subtle)" }}>{kpi.unit}</span>}
            </div>
            <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", color: kpi.subColor || "var(--text-muted)", fontWeight: 500 }}>
              {kpi.icon && <Icon name={kpi.icon} size={13} style={{ color: "var(--text-muted)" }} />}
              {kpi.hasAlert && <span style={{ marginRight: "-2px" }}>⚠️</span>}
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      <div className="card" style={{ padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 180px", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>CUSTOMER</div>
            <select 
              value={customerFilter} 
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13.5px", outline: "none", color: "var(--text)" }}
            >
              <option>All Customers</option>
              <option>QuickMart Retail</option>
              <option>FuelStop Corp</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>SITE</div>
            <select 
              value={siteFilter} 
              onChange={(e) => setSiteFilter(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13.5px", outline: "none", color: "var(--text)" }}
            >
              <option>All Sites</option>
              <option>North Hub Branch</option>
              <option>East 42nd Station</option>
              <option>Metro Plaza</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>STOCK STATUS</div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13.5px", outline: "none", color: "var(--text)" }}
            >
              <option>All Statuses</option>
              <option>Well Stocked</option>
              <option>Medium</option>
              <option>Low Stock</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>ACTIVE STATUS</div>
            <div style={{ display: "flex", background: "#F1F2F4", padding: "3px", borderRadius: "6px" }}>
              <button 
                onClick={() => setActiveToggle("All")}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12.5px",
                  fontWeight: activeToggle === "All" ? 600 : 500,
                  background: activeToggle === "All" ? "#ffffff" : "transparent",
                  color: activeToggle === "All" ? "var(--text)" : "var(--text-muted)",
                  cursor: "pointer",
                  boxShadow: activeToggle === "All" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s"
                }}
              >
                All
              </button>
              <button 
                onClick={() => setActiveToggle("Active")}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12.5px",
                  fontWeight: activeToggle === "Active" ? 600 : 500,
                  background: activeToggle === "Active" ? "#ffffff" : "transparent",
                  color: activeToggle === "Active" ? "var(--text)" : "var(--text-muted)",
                  cursor: "pointer",
                  boxShadow: activeToggle === "Active" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s"
                }}
              >
                Active
              </button>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>SEARCH</div>
          <div style={{ position: "relative" }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input 
              type="text" 
              placeholder="ID, Label or Location..." 
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13.5px",
                outline: "none",
                color: "var(--text)"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid Split Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
        
        {/* Left Column - Fridge Inventory Table */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="table-wrap" style={{ flex: 1 }}>
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Fridge ID</th>
                  <th style={{ width: "20%" }}>Customer & Site</th>
                  <th style={{ width: "20%" }}>Fridge Label</th>
                  <th style={{ width: "18%" }}>Capacity & Stock</th>
                  <th style={{ width: "15%" }}>Utilization</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ textAlign: "center", width: "7%" }}>Active</th>
                  <th style={{ textAlign: "center", width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {FRIDGE_ITEMS.map((item) => {
                  const available = item.total - item.current;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>{item.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "13.5px" }}>{item.customer}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "11.5px", marginTop: "2px" }}>{item.branch}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "13.5px" }}>{item.label}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "11.5px", marginTop: "2px" }}>{item.room}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "13.5px", fontWeight: 600 }}>
                          {item.current.toLocaleString()} / {item.total.toLocaleString()}{" "}
                          <span style={{ fontSize: "11.5px", fontWeight: 400, color: "var(--text-subtle)" }}>Bags</span>
                        </div>
                        <div style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {available} Bags Available
                        </div>
                        <div style={{ fontSize: "10px", color: "#cbced4", marginTop: "1px" }}>(Auto-calc)</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", minWidth: "40px" }}>
                            {item.occupancy}%
                          </span>
                          <div style={{
                            flex: 1,
                            height: "6px",
                            borderRadius: "3px",
                            background: "#E6E8EC",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${item.occupancy}%`,
                              height: "100%",
                              background: item.statusColor === "green"
                                ? "#16a34a"
                                : item.statusColor === "red"
                                ? "#dc2626"
                                : "#ea8a1a"
                            }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.statusColor === "green" && (
                          <span className="chip green" style={{ padding: "4px 8px", borderRadius: "12px", border: "1px solid #b9e0c6", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}>
                            <span className="dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a" }} />
                            Well Stocked
                          </span>
                        )}
                        {item.statusColor === "red" && (
                          <span className="chip red" style={{ padding: "4px 8px", borderRadius: "12px", border: "1px solid #f3c4c4", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}>
                            <span className="dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#dc2626" }} />
                            Low Stock
                          </span>
                        )}
                        {item.statusColor === "orange" && (
                          <span className="chip orange" style={{ padding: "4px 8px", borderRadius: "12px", border: "1px solid #f0d6a9", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}>
                            <span className="dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ea8a1a" }} />
                            Medium
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {/* Toggle switch */}
                        <label style={{
                          position: "relative",
                          display: "inline-block",
                          width: "36px",
                          height: "18px",
                          cursor: "pointer"
                        }}>
                          <input type="checkbox" defaultChecked={item.active} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "var(--navy)",
                            borderRadius: "18px",
                            transition: "all 0.2s"
                          }}>
                            <span style={{
                              position: "absolute",
                              height: "12px",
                              width: "12px",
                              left: "3px",
                              bottom: "3px",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              transform: "translateX(18px)",
                              transition: "all 0.2s"
                            }} />
                          </span>
                        </label>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", color: "var(--text-subtle)" }}>
                          <Icon name="eye" size={15} style={{ cursor: "pointer" }} />
                          <Icon name="edit" size={15} style={{ cursor: "pointer" }} />
                          <Icon name="clock" size={15} style={{ cursor: "pointer" }} />
                          <Icon name="trash" size={15} style={{ cursor: "pointer" }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fbfbfc"
          }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Showing 1-10 of 12 fridges
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button className="btn sm" style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center"
              }}>&lt;</button>
              <button className="btn sm" style={{
                background: "var(--navy)",
                border: "1px solid var(--navy)",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
                color: "white",
                fontWeight: 600
              }}>1</button>
              <button className="btn sm" style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}>2</button>
              <button className="btn sm" style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center"
              }}>&gt;</button>
            </div>
          </div>
        </div>

        {/* Right Column - Storage Alerts & Regional Snapshot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Storage Alerts */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-head" style={{ display: "flex", justifyContent: "between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "14.5px", fontWeight: 600, color: "var(--text)" }}>
                <Icon name="bell" size={16} style={{ color: "var(--red)" }} />
                Storage Alerts
              </h3>
              <span className="chip red" style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>3</span>
            </div>
            <div>
              {STORAGE_ALERTS.map((alert) => (
                <div key={alert.id} style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  background: alert.type === "red"
                    ? "#fef2f2"
                    : alert.type === "orange"
                    ? "#fffbeb"
                    : "#f8fafc",
                  borderLeft: `4px solid ${
                    alert.type === "red"
                      ? "#dc2626"
                      : alert.type === "orange"
                      ? "#f59e0b"
                      : "#94a3b8"
                  }`,
                  display: "flex",
                  gap: "10px"
                }}>
                  <div style={{ marginTop: "2px" }}>
                    {alert.type === "red" && <Icon name="alert_circle" size={15} style={{ color: "#dc2626" }} />}
                    {alert.type === "orange" && <Icon name="alert_triangle" size={15} style={{ color: "#f59e0b" }} />}
                    {alert.type === "grey" && <Icon name="snowflake" size={15} style={{ color: "#94a3b8" }} />}
                  </div>
                  <div style={{ fontSize: "12.5px", lineHeight: "1.4" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{alert.title}</span>{" "}
                    {alert.location && <span style={{ fontWeight: 600, color: "var(--text)" }}>{alert.location}</span>}{" "}
                    <span style={{ color: "var(--text-muted)" }}>{alert.desc}</span>
                    {alert.hasLink && (
                      <div style={{ marginTop: "4px" }}>
                        <a href="#" style={{ color: "var(--blue)", fontWeight: 600, textDecoration: "none", fontSize: "12px" }}>
                          Create Dispatch
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", background: "#fbfbfc", textAlign: "center" }}>
              <button style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid var(--border)",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "var(--text-muted)",
                cursor: "pointer"
              }}>
                View All Notifications
              </button>
            </div>
          </div>

          {/* Regional Snapshot Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #20253B 0%, #171B2D 100%)",
            color: "white",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "0 4px 12px rgba(15, 20, 25, 0.15)",
            borderRadius: "8px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255, 255, 255, 0.6)" }}>
              REGIONAL SNAPSHOT
            </div>

            {/* Premium Glowing SVG Network Map */}
            <div style={{
              height: "130px",
              borderRadius: "6px",
              background: "radial-gradient(circle at center, #262E4D 0%, #131726 100%)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.05)"
            }}>
              <svg width="100%" height="100%" viewBox="0 0 260 130">
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Curved connecting line */}
                <path d="M 40,90 Q 90,30 150,70 T 220,40" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3, 3" />
                <path d="M 60,30 Q 120,100 180,30" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

                {/* Glow behind points */}
                <circle cx="150" cy="70" r="24" fill="url(#glow)" />
                <circle cx="40" cy="90" r="16" fill="url(#glow)" />
                <circle cx="220" cy="40" r="20" fill="url(#glow)" />

                {/* Network nodes */}
                <circle cx="40" cy="90" r="4" fill="#3b82f6" />
                <circle cx="40" cy="90" r="8" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                
                <circle cx="150" cy="70" r="5" fill="#10b981" />
                <circle cx="150" cy="70" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />

                <circle cx="220" cy="40" r="4" fill="#3b82f6" />
                <circle cx="220" cy="40" r="8" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />

                <circle cx="60" cy="30" r="3" fill="rgba(255, 255, 255, 0.4)" />
                <circle cx="180" cy="30" r="3" fill="rgba(255, 255, 255, 0.4)" />
                <circle cx="110" cy="100" r="3.5" fill="rgba(255, 255, 255, 0.4)" />

                {/* Live Ripple Animation effects (static representatives) */}
                <circle cx="150" cy="70" r="15" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>

            {/* Routes and Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>Active Routes</span>
                <span style={{ fontWeight: 600 }}>7</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>Pending Deliveries</span>
                <span style={{ fontWeight: 600 }}>12</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </>
  );
};

const AddFridgeModal = ({ onClose }: { onClose: () => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.3)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{
        background: "#ffffff",
        borderRadius: "12px",
        width: "720px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--navy-deep)", margin: 0 }}>Add New Fridge</h2>
          <button onClick={onClose} style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: "4px"
          }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 2-Column Body without Scroll */}
          <div style={{
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px"
          }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Fridge Label <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fridge 1, Main Freezer"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none",
                    color: "var(--text)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Customer / Site <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#F8FAFC",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      outline: "none",
                      color: "var(--text)",
                      appearance: "none"
                    }}
                  >
                    <option value="">Select customer site</option>
                    <option value="quickmart-north">QuickMart Retail — North Hub</option>
                    <option value="fuelstop-east">FuelStop Corp — East 42nd</option>
                    <option value="quickmart-metro">QuickMart Retail — Metro Plaza</option>
                  </select>
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-subtle)", display: "flex", alignItems: "center" }}>
                    <Icon name="arrow_down" size={14} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Maximum Bag Capacity <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter total bag capacity"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none",
                    color: "var(--text)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
                  Products Stocked
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}>
                  {["2KG Bags", "5KG Bags", "10KG Bags", "Blocks"].map((prod) => (
                    <label key={prod} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "var(--text)" }}>
                      <input type="checkbox" style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "var(--navy)",
                        cursor: "pointer"
                      }} />
                      <span>{prod}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Fridge Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inside main store, Back loading dock"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none",
                    color: "var(--text)"
                  }}
                />
              </div>

              {/* Full Pallets & Active Toggles Row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Full Pallets Only</div>
                  <div style={{ display: "inline-flex", background: "#E2E8F0", padding: "2px", borderRadius: "20px" }}>
                    <button type="button" style={{ border: "none", background: "#ffffff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: "var(--text)", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>No</button>
                    <button type="button" style={{ border: "none", background: "transparent", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", cursor: "pointer" }}>Yes</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>Active</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <label style={{ position: "relative", display: "inline-block", width: "36px", height: "18px", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "var(--navy)", borderRadius: "18px", transition: "all 0.2s" }}>
                        <span style={{ position: "absolute", height: "12px", width: "12px", left: "3px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transform: "translateX(18px)", transition: "all 0.2s" }} />
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special instructions for this fridge"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none",
                    color: "var(--text)",
                    minHeight: "84px",
                    resize: "none"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer centered buttons */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            background: "#F8FAFC"
          }}>
            <button type="button" onClick={onClose} style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "8px 24px",
              fontSize: "13.5px",
              fontWeight: 500,
              color: "var(--text)",
              cursor: "pointer"
            }}>
              Cancel
            </button>
            <button type="submit" style={{
              background: "var(--navy)",
              border: "1px solid var(--navy)",
              borderRadius: "6px",
              padding: "8px 24px",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(59, 65, 112, 0.1)"
            }}>
              <Icon name="save" size={14} /> Save Fridge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
