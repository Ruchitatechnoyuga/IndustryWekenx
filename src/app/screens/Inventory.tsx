import { Icon } from "../components/Icon";

const WAREHOUSE_STOCK = [
  { product: "2KG Bags", stock: 1240, status: "ok" },
  { product: "5KG Bags", stock: 412, status: "low" },
  { product: "10KG Bags", stock: 85, status: "critical" },
  { product: "Blocks", stock: 2100, status: "ok" },
];

const TRUCK_STOCK = [
  { truck: "TR-8042", driver: "John Doe", bags: 450, status: "Active" },
  { truck: "TR-9115", driver: "Sarah Smith", bags: 320, status: "Active" },
  { truck: "TR-4421", driver: "Mike Wilson", bags: 0, status: "Returned" },
  { truck: "TR-5580", driver: "Elena Rodriguez", bags: 180, status: "Active" },
];

const STOCK_MOVEMENTS = [
  {
    id: 1,
    date: "2023-11-24",
    time: "09:15 AM",
    type: "Stock In",
    product: "5KG Bags",
    quantity: "+500",
    location: "Main Warehouse",
    recordedBy: "Admin User",
    avatarBg: "linear-gradient(135deg, #FF5E62 0%, #FF9966 100%)", // Coral Sunset
    initials: "AU"
  },
  {
    id: 2,
    date: "2023-11-24",
    time: "08:45 AM",
    type: "Truck Load",
    product: "2KG Bags",
    quantity: "-120",
    location: "TR-8042",
    recordedBy: "John Doe",
    avatarBg: "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)", // Cool Ocean
    initials: "JD"
  },
  {
    id: 3,
    date: "2023-11-23",
    time: "05:20 PM",
    type: "Return",
    product: "Blocks",
    quantity: "+15",
    location: "Main Warehouse",
    recordedBy: "Mike Wilson",
    avatarBg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", // Fresh Garden
    initials: "MW"
  },
  {
    id: 4,
    date: "2023-11-23",
    time: "02:30 PM",
    type: "Delivery",
    product: "10KG Bags",
    quantity: "-50",
    location: "Client: Metro Chill",
    recordedBy: "John Doe",
    avatarBg: "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)", // Cool Ocean
    initials: "JD"
  },
  {
    id: 5,
    date: "2023-11-23",
    time: "11:10 AM",
    type: "Manual Adjustment",
    product: "2KG Bags",
    quantity: "-5",
    location: "Main Warehouse",
    recordedBy: "Ops Manager",
    avatarBg: "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)", // Sunset Glow
    initials: "OM"
  },
];

export const Inventory = () => {
  return (
    <div className="page" style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--navy-deep)", margin: 0, letterSpacing: "-0.02em" }}>
            Inventory
          </h1>
          <div className="sub" style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "4px" }}>
            Real-time stock monitoring and movement tracking across the organization.
          </div>
        </div>
        <div className="actions">
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
            <Icon name="plus" size={14} /> Record Stock In
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        
        {/* Warehouse Stock Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
              <Icon name="inventory" size={18} style={{ color: "var(--navy)", verticalAlign: "middle" }} />
              Warehouse Stock
            </h3>
            <a href="#" style={{ color: "var(--blue)", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
              View All Locations
            </a>
          </div>
          <div className="table-wrap" style={{ flex: 1 }}>
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>PRODUCT</th>
                  <th style={{ textAlign: "center", width: "30%" }}>CURRENT STOCK (BAGS)</th>
                  <th style={{ textAlign: "center", width: "25%" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {WAREHOUSE_STOCK.map((item) => (
                  <tr key={item.product}>
                    <td style={{ fontWeight: 500, color: "var(--text)" }}>{item.product}</td>
                    <td style={{ textAlign: "center", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {item.stock.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {item.status === "ok" && (
                        <span className="chip green" style={{ padding: "4px 10px", borderRadius: "12px", border: "1px solid #b9e0c6", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <span className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                          OK
                        </span>
                      )}
                      {item.status === "low" && (
                        <span className="chip orange" style={{ padding: "4px 10px", borderRadius: "12px", border: "1px solid #f0d6a9", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <span className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ea8a1a" }} />
                          Low
                        </span>
                      )}
                      {item.status === "critical" && (
                        <span className="chip red" style={{ padding: "4px 10px", borderRadius: "12px", border: "1px solid #f3c4c4", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <span className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#dc2626" }} />
                          Critical
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock on Trucks Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
              <Icon name="truck" size={18} style={{ color: "var(--navy)", verticalAlign: "middle" }} />
              Stock on Trucks
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--text-muted)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B4170", display: "inline-block" }} />
              4 Trucks En Route
            </div>
          </div>
          <div className="table-wrap" style={{ flex: 1 }}>
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>TRUCK ID</th>
                  <th style={{ width: "35%" }}>DRIVER</th>
                  <th style={{ width: "20%" }}>TOTAL BAGS</th>
                  <th style={{ textAlign: "center", width: "20%" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {TRUCK_STOCK.map((item) => (
                  <tr key={item.truck}>
                    <td>
                      <span style={{ color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>{item.truck}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{item.driver}</td>
                    <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{item.bags}</td>
                    <td style={{ textAlign: "center" }}>
                      {item.status === "Active" ? (
                        <span className="chip blue" style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #d4d8e6" }}>
                          Active
                        </span>
                      ) : (
                        <span className="chip grey" style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #e6e8ec", color: "var(--text-subtle)", background: "#f7f8fa" }}>
                          Returned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Recent Stock Movements Card */}
      <div className="card">
        <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
            <Icon name="clock" size={18} style={{ color: "var(--navy)", verticalAlign: "middle" }} />
            Recent Stock Movements
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn sm" style={{
              background: "#F1F2F4",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}>
              Filter by Type
            </button>
            <button className="btn sm" style={{
              background: "#F1F2F4",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>DATE & TIME</th>
                <th style={{ width: "15%" }}>TYPE</th>
                <th style={{ width: "18%" }}>PRODUCT</th>
                <th style={{ width: "12%" }}>QUANTITY</th>
                <th style={{ width: "18%" }}>LOCATION</th>
                <th style={{ width: "15%" }}>RECORDED BY</th>
              </tr>
            </thead>
            <tbody>
              {STOCK_MOVEMENTS.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {item.date} <span style={{ color: "#cbced4", margin: "0 6px" }}>|</span> <span style={{ fontSize: "12px" }}>{item.time}</span>
                  </td>
                  <td>
                    {item.type === "Stock In" && (
                      <span className="chip green" style={{ padding: "3px 10px", borderRadius: "12px", border: "1px solid #b9e0c6", fontSize: "11px", fontWeight: 500 }}>
                        Stock In
                      </span>
                    )}
                    {item.type === "Truck Load" && (
                      <span className="chip blue" style={{ padding: "3px 10px", borderRadius: "12px", border: "1px solid #d4d8e6", fontSize: "11px", fontWeight: 500 }}>
                        Truck Load
                      </span>
                    )}
                    {item.type === "Return" && (
                      <span className="chip" style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: "#E6F4F8",
                        color: "#007B83",
                        border: "1px solid #C2EBEC"
                      }}>
                        Return
                      </span>
                    )}
                    {item.type === "Delivery" && (
                      <span className="chip blue" style={{ padding: "3px 10px", borderRadius: "12px", border: "1px solid #d4d8e6", fontSize: "11px", fontWeight: 500 }}>
                        Delivery
                      </span>
                    )}
                    {item.type === "Manual Adjustment" && (
                      <span className="chip" style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: "#f1f3f4",
                        color: "#5f6368",
                        border: "1px solid #dadce0"
                      }}>
                        Manual Adjustment
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 500, color: "var(--text)" }}>{item.product}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: item.quantity.startsWith("+")
                        ? "var(--green)"
                        : item.quantity.startsWith("-") && item.quantity !== "-5"
                        ? "var(--red)"
                        : "var(--text)",
                      fontVariantNumeric: "tabular-nums"
                    }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{item.location}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: item.avatarBg,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}>
                        {item.initials}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{item.recordedBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fbfbfc"
        }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing 1 to 5 of 124 movements
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn sm" style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 16px",
              fontSize: "12.5px",
              fontWeight: 500,
              cursor: "pointer",
              color: "var(--text-muted)"
            }}>
              Previous
            </button>
            <button className="btn sm" style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 16px",
              fontSize: "12.5px",
              fontWeight: 500,
              cursor: "pointer",
              color: "var(--text)"
            }}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
