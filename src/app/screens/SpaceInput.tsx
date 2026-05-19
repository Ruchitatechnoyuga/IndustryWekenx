import { useState } from "react";
import { Icon } from "../components/Icon";

export const SpaceInput = () => {
  const [activeView, setActiveView] = useState<"table" | "tank">("tank");

  // Live interactive tank data state
  const [tanks, setTanks] = useState([
    {
      id: "T1",
      name: "T1: ULP91",
      product: "ULP91",
      color: "#3b82f6",
      lightColor: "#dbeafe",
      gradient: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
      capacity: 20000,
      current: 15200,
      water: 0,
      status: "Normal",
      statusText: "✓ Normal",
      statusColor: "#16a34a"
    },
    {
      id: "T2",
      name: "T2: ULP98",
      product: "ULP98",
      color: "#ef4444",
      lightColor: "#fee2e2",
      gradient: "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)",
      capacity: 20000,
      current: 3800,
      water: 12,
      status: "Critical Low",
      statusText: "⚠️ CRITICAL LOW",
      statusColor: "#ef4444"
    },
    {
      id: "T3",
      name: "T3: Diesel",
      product: "Diesel",
      color: "#10b981",
      lightColor: "#d1fae5",
      gradient: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
      capacity: 20000,
      current: 11200,
      water: 0,
      status: "Normal",
      statusText: "✓ Normal",
      statusColor: "#16a34a"
    },
    {
      id: "T4",
      name: "T4: AdBlue",
      product: "AdBlue",
      color: "#6b7280",
      lightColor: "#f3f4f6",
      gradient: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
      capacity: 5000,
      current: 2100,
      water: 0,
      status: "Order Soon",
      statusText: "! Order Soon",
      statusColor: "#d97706"
    }
  ]);

  // Handle live edits in table view
  const handleLevelChange = (id: string, val: number) => {
    setTanks(prev => prev.map(t => {
      if (t.id === id) {
        const current = Math.min(t.capacity, Math.max(0, val));
        const pct = Math.round((current / t.capacity) * 100);
        let status = "Normal";
        let statusText = "✓ Normal";
        let statusColor = "#16a34a";

        if (pct <= 20) {
          status = "Critical Low";
          statusText = "⚠️ CRITICAL LOW";
          statusColor = "#ef4444";
        } else if (pct <= 45) {
          status = "Order Soon";
          statusText = "! Order Soon";
          statusColor = "#d97706";
        }

        return { ...t, current, status, statusText, statusColor };
      }
      return t;
    }));
  };

  const handleWaterChange = (id: string, val: number) => {
    setTanks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, water: Math.max(0, val) };
      }
      return t;
    }));
  };

  return (
    <div className="page" style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", alignItems: "center" }}>
        <span>Dashboard</span>
        <span style={{ color: "#cbced4" }}>&gt;</span>
        <span>Stock Submission</span>
        <span style={{ color: "#cbced4" }}>&gt;</span>
        <span style={{ color: "var(--navy)", fontWeight: 600 }}>Fuel Dips</span>
      </div>

      {/* Header */}
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--navy-deep)", margin: 0, letterSpacing: "-0.02em" }}>
            Daily Dips Entry
          </h1>
        </div>
        <div className="actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button className="btn primary" style={{
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
            Create New
          </button>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#6b21a8",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            SM
          </div>
        </div>
      </div>

      {/* Meta Indicators & View Switcher Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Site */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f3f5", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
            <Icon name="pin" size={13} style={{ color: "var(--text-subtle)" }} />
            <span>Site: BP Toowong</span>
          </div>
          {/* Date */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f3f5", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
            <Icon name="calendar" size={13} style={{ color: "var(--text-subtle)" }} />
            <span>Date: 17 May 2026</span>
          </div>
          {/* Time */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f3f5", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
            <Icon name="clock" size={13} style={{ color: "var(--text-subtle)" }} />
            <span>Time: 08:45 AM</span>
          </div>
          {/* Entered By */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f3f5", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
            <Icon name="users" size={13} style={{ color: "var(--text-subtle)" }} />
            <span>Entered By: Sarah Mitchell</span>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div style={{ display: "inline-flex", background: "#E2E8F0", padding: "2px", borderRadius: "24px" }}>
          <button 
            type="button" 
            onClick={() => setActiveView("table")}
            style={{
              border: "none",
              background: activeView === "table" ? "#ffffff" : "transparent",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: activeView === "table" ? "var(--navy)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeView === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <Icon name="list" size={13} />
            Table View
          </button>
          <button 
            type="button" 
            onClick={() => setActiveView("tank")}
            style={{
              border: "none",
              background: activeView === "tank" ? "#ffffff" : "transparent",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: activeView === "tank" ? "var(--navy)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeView === "tank" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: activeView === "tank" ? "var(--navy)" : "var(--text-muted)",
              display: "inline-block"
            }} />
            Tank View
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === "tank" ? (
        /* Tank Visual View Screen */
        <div className="card" style={{ padding: "24px", borderRadius: "12px", background: "#ffffff", border: "1px solid var(--border)", marginBottom: "20px" }}>
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy-deep)", margin: 0 }}>Tank Visual View — BP Toowong</h3>
            {/* Color Legends */}
            <div style={{ display: "flex", gap: "16px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />
                <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>ULP91</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>ULP98</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>Diesel</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6b7280" }} />
                <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>AdBlue</span>
              </div>
            </div>
          </div>

          {/* Tanks Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {tanks.map((tank) => {
              const pct = Math.round((tank.current / tank.capacity) * 100);
              const ullage = tank.capacity - tank.current;

              return (
                <div key={tank.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Arch Tank Outer */}
                  <div style={{
                    width: "100%",
                    height: "300px",
                    border: "1px solid var(--border)",
                    borderTopLeftRadius: "150px",
                    borderTopRightRadius: "150px",
                    background: "#F8FAFC",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "inset 0 4px 10px rgba(0,0,0,0.03)"
                  }}>
                    {/* Dotted Grid Lines */}
                    {[
                      { val: "75%", bottom: "75%" },
                      { val: "50%", bottom: "50%" },
                      { val: "25%", bottom: "25%" }
                    ].map((line) => (
                      <div key={line.val} style={{
                        position: "absolute",
                        bottom: line.bottom,
                        left: 0,
                        right: 0,
                        borderTop: "1px dashed rgba(148, 163, 184, 0.4)",
                        zIndex: 2
                      }}>
                        <span style={{
                          position: "absolute",
                          right: "8px",
                          top: "-8px",
                          fontSize: "10px",
                          color: "var(--text-subtle)",
                          fontWeight: 500,
                          background: "#F8FAFC",
                          padding: "0 4px",
                          borderRadius: "4px"
                        }}>{line.val}</span>
                      </div>
                    ))}

                    {/* Fuel Liquid Level Fill */}
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${pct}%`,
                      background: tank.gradient,
                      borderRadius: "12px 12px 0 0",
                      transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}>
                      {/* Interactive Subtle Top Wave Layer */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "8px",
                        background: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px 12px 0 0"
                      }} />
                    </div>

                    {/* Level Centered Value Chip */}
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: tank.color,
                      zIndex: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${tank.lightColor}`
                    }}>
                      {pct}%
                    </div>
                  </div>

                  {/* Below Tank Labels */}
                  <div style={{ textAlign: "center", marginTop: "16px", width: "100%" }}>
                    {/* Badge */}
                    <span style={{
                      background: tank.lightColor,
                      color: tank.color,
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      display: "inline-block",
                      marginBottom: "12px"
                    }}>
                      {tank.name}
                    </span>

                    {/* Liter Capacity */}
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "4px" }} className="mono">
                      {tank.current.toLocaleString()} L
                    </div>

                    {/* Ullage */}
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "8px" }} className="mono">
                      Ullage: {ullage.toLocaleString()} L
                    </div>

                    {/* Status Chip */}
                    <div style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: tank.statusColor,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {tank.statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View Screen */
        <div className="card" style={{ padding: "0", borderRadius: "12px", background: "#ffffff", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "20px" }}>
          <div className="card-head" style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy-deep)", margin: 0 }}>Active Tank Inventory dips</h3>
          </div>
          <table className="data" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 24px", textAlign: "left" }}>TANK / PRODUCT</th>
                <th style={{ padding: "12px 24px", textAlign: "right" }}>MAX CAPACITY (L)</th>
                <th style={{ padding: "12px 24px", textAlign: "left", width: "160px" }}>CURRENT DIP LEVEL (L)</th>
                <th style={{ padding: "12px 24px", textAlign: "left", width: "140px" }}>WATER LEVEL (MM)</th>
                <th style={{ padding: "12px 24px", textAlign: "right" }}>ULLAGE / SPACE (L)</th>
                <th style={{ padding: "12px 24px", textAlign: "center" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tanks.map((tank) => {
                const ullage = tank.capacity - tank.current;
                const pct = Math.round((tank.current / tank.capacity) * 100);

                return (
                  <tr key={tank.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        background: tank.lightColor,
                        color: tank.color,
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        display: "inline-block",
                        marginRight: "8px"
                      }}>
                        {tank.id}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{tank.product}</span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 500 }} className="mono">
                      {tank.capacity.toLocaleString()} L
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          value={tank.current}
                          onChange={(e) => handleLevelChange(tank.id, +e.target.value)}
                          style={{
                            width: "110px",
                            padding: "6px 10px",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            outline: "none",
                            background: "#F8FAFC"
                          }}
                        />
                        <span className="mono" style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>({pct}%)</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <input
                        type="number"
                        value={tank.water}
                        onChange={(e) => handleWaterChange(tank.id, +e.target.value)}
                        style={{
                          width: "80px",
                          padding: "6px 10px",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                          outline: "none",
                          background: "#F8FAFC"
                        }}
                      />
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 600, color: "var(--navy)" }} className="mono">
                      {ullage.toLocaleString()} L
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span style={{
                        color: tank.statusColor,
                        fontWeight: 600,
                        fontSize: "13px"
                      }}>
                        {tank.statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Calibration & Submission Bar */}
      <div style={{
        background: "#FAF9FB",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Calibration Time */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
          <Icon name="info" size={14} style={{ color: "var(--text-subtle)" }} />
          <span>System calibrated at 04:00 AM Today</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "10px 24px",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--text)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer"
          }}>
            <Icon name="save" size={14} />
            Save Draft
          </button>
          <button style={{
            background: "var(--navy-deep)",
            border: "1px solid var(--navy-deep)",
            borderRadius: "6px",
            padding: "10px 24px",
            fontSize: "13.5px",
            fontWeight: 600,
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(30, 34, 56, 0.15)"
          }}>
            <Icon name="check" size={14} />
            Submit Dips
          </button>
        </div>
      </div>
    </div>
  );
};
