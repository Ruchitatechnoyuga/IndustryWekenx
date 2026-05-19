import { Icon } from "./Icon";

export const TopBar = ({ current = "fridges", onNav }: { current?: string; onNav: (route: string) => void }) => {
  return (
    <div className="topbar" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "56px",
      borderBottom: "1px solid var(--border)",
      background: "#ffffff",
      padding: "0 24px",
      gap: "24px"
    }}>
      {/* Search Input Capsule */}
      <div style={{
        position: "relative",
        width: "360px"
      }}>
        <div style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-subtle)",
          display: "flex",
          alignItems: "center"
        }}>
          <Icon name="search" size={16} />
        </div>
        <input
          type="text"
          placeholder="Search shipments, fridges..."
          style={{
            padding: "8px 12px 8px 36px",
            background: "#F1F2F4",
            border: "none",
            borderRadius: "6px",
            fontSize: "13.5px",
            width: "100%",
            outline: "none",
            color: "var(--text)"
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Bell Button */}
        <button className="btn icon ghost" style={{ position: "relative", color: "var(--text-muted)", padding: "6px" }}>
          <Icon name="bell" size={18} />
          <span style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--red)"
          }} />
        </button>

        {/* Help/Question Button */}
        <button className="btn icon ghost" style={{ color: "var(--text-muted)", padding: "6px" }}>
          <Icon name="help" size={18} />
        </button>
      </div>
    </div>
  );
};
