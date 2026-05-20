import { Icon } from "./Icon";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dispatch Board", icon: "grid" },
  { id: "active-routes", label: "Shipment", icon: "truck" },
  { id: "route-planner", label: "Route Planning", icon: "map" },
  { id: "customers", label: "Customers & Sites", icon: "building" },
  { id: "drivers", label: "Drivers & Vehicles", icon: "users" },
  { id: "products", label: "Product Setup", icon: "clipboard" },
  { id: "reports", label: "Analytics", icon: "chart" },
  { id: "invoices", label: "Invoices", icon: "invoice" },
  { id: "fridges", label: "Fridge & Storage", icon: "snowflake" },
  { id: "inventory", label: "Inventory", icon: "inventory" },
  { id: "space-input", label: "Daily Dips", icon: "clipboard" }
];

export const Sidebar = ({ current, onNav }: { current: string; onNav: (route: string) => void }) => (
  <div className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 16px" }}>
    {/* Wekenx Branding */}
    <div style={{
      padding: "0 4px",
      marginBottom: "28px"
    }}>
      <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: "1.2" }}>Wekenx</div>
      <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "2px", fontWeight: 500 }}>Stock Industry</div>
    </div>

    {/* Navigation Links */}
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {SIDEBAR_ITEMS.map((it) => (
        <div
          key={it.id}
          className={`nav-item ${current === it.id ? "active" : ""}`}
          onClick={() => onNav(it.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: current === it.id ? 500 : 400,
            cursor: "pointer",
            background: current === it.id ? "var(--navy)" : "transparent",
            color: current === it.id ? "white" : "var(--text-muted)",
            transition: "all 0.15s ease-in-out"
          }}
        >
          <Icon name={it.icon} size={18} style={{ color: current === it.id ? "white" : "var(--text-muted)" }} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>

    {/* Bottom Create Shipment Button */}
    <div style={{ marginTop: "auto", paddingTop: 16 }}>
      <button 
        onClick={() => onNav("create-shipment")}
        style={{
          width: "100%",
          background: "var(--navy-deep)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 14px",
          fontSize: "13.5px",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "center",
          transition: "background 0.15s ease-in-out",
          boxShadow: "0 2px 6px rgba(30, 34, 56, 0.15)"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "var(--blue-hover)"}
        onMouseOut={(e) => e.currentTarget.style.background = "var(--navy-deep)"}
      >
        Create Shipment
      </button>
    </div>
  </div>
);
