import { useState } from "react";
import { Icon } from "../components/Icon";

export const Reports = () => {
  const [dateRange, setDateRange] = useState("May 2025");

  const topCustomers = [
    { name: "Shell Albion", revenue: 45250, color: "var(--blue)" },
    { name: "BP Dapto", revenue: 32100, color: "#6b7694" },
    { name: "7-Eleven", revenue: 28450, color: "#8a909b" },
    { name: "Miranda", revenue: 24300, color: "#a4a9b8" },
    { name: "Figtree", revenue: 18200, color: "#c4c7d0" },
  ];

  const productMix = [
    { name: "Ice Bag 5Kg", percentage: 45, value: 4208, color: "var(--blue)" },
    { name: "Ice Bag 10Kg", percentage: 30, value: 2805, color: "#6b7694" },
    { name: "Premium Ice", percentage: 12, value: 1122, color: "#8a909b" },
    { name: "Crushed Ice", percentage: 8, value: 748, color: "#a4a9b8" },
    { name: "Other", percentage: 5, value: 467, color: "#c4c7d0" },
  ];

  const drivers = [
    { id: "DRV-001", name: "RT Shawmy", lastVisited: "04 May 2025", daysSince: 3, trend: "up" },
    { id: "DRV-002", name: "Timoru Kangroo", lastVisited: "05 May 2025", daysSince: 2, trend: "up" },
    { id: "DRV-003", name: "Share Studios", lastVisited: "01 May 2025", daysSince: 6, trend: "down" },
  ];

  const driverPerformance = [
    { name: "Luka M.", deliveries: 156, onTime: 98, rating: 4.8 },
    { name: "Priya S.", deliveries: 142, onTime: 96, rating: 4.9 },
    { name: "Devon K.", deliveries: 128, onTime: 94, rating: 4.7 },
    { name: "Aisha R.", deliveries: 134, onTime: 97, rating: 4.8 },
    { name: "Marcus C.", deliveries: 98, onTime: 92, rating: 4.6 },
  ];

  const maxRevenue = Math.max(...topCustomers.map(c => c.revenue));

  return (
    <div className="page">
      <div className="breadcrumbs">
        <span>Insights</span>
        <span className="here">Reports & Analytics</span>
      </div>

      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <div className="sub">Revenue, deliveries, and performance insights</div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="download" size={14} /> Export Report
          </button>
          <button className="btn primary">
            <Icon name="calendar" size={14} /> Schedule Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-2">
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 180 }}>
            <select className="select" style={{ minWidth: 0 }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option>May 2025</option>
              <option>April 2025</option>
              <option>March 2025</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 140 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>All</option>
              <option>Employees</option>
              <option>Contractors</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 140 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>All</option>
              <option>Standard Ice</option>
              <option>Premium Ice</option>
              <option>Crushed Ice</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 140 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>All</option>
              <option>Morning Shift</option>
              <option>Afternoon Shift</option>
              <option>Full Day</option>
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn primary">
              <Icon name="filter" size={12} /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label">
            <Icon name="truck" size={12} /> Total Deliveries
          </div>
          <div className="value">$32,850</div>
          <div className="delta">May 2025 revenue</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="box" size={12} /> Total Bags
          </div>
          <div className="value">9,350</div>
          <div className="delta up">+15% vs last month</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="invoice" size={12} /> Revenue
          </div>
          <div className="value">$124,000</div>
          <div className="delta up">+12% vs last month</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="chart" size={12} /> Avg Utilization
          </div>
          <div className="value">88%</div>
          <div className="delta">Fleet efficiency</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Daily Deliveries Chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Daily Deliveries - {dateRange}</h3>
            </div>
            <div className="segmented">
              <button className="seg active">Deliveries</button>
              <button className="seg">Revenue</button>
            </div>
          </div>
          <div className="card-body">
            <svg viewBox="0 0 500 200" style={{ width: "100%", height: 200 }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 35}
                  x2="480"
                  y2={40 + i * 35}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              ))}

              {/* Line chart path */}
              <path
                d="M 60,120 L 90,100 L 120,110 L 150,85 L 180,95 L 210,70 L 240,80 L 270,60 L 300,75 L 330,65 L 360,90 L 390,80 L 420,70 L 450,85"
                stroke="var(--blue)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area under curve */}
              <path
                d="M 60,120 L 90,100 L 120,110 L 150,85 L 180,95 L 210,70 L 240,80 L 270,60 L 300,75 L 330,65 L 360,90 L 390,80 L 420,70 L 450,85 L 450,180 L 60,180 Z"
                fill="var(--blue)"
                opacity="0.1"
              />

              {/* X-axis labels */}
              <text x="60" y="195" fontSize="11" fill="var(--text-muted)" textAnchor="middle">1</text>
              <text x="150" y="195" fontSize="11" fill="var(--text-muted)" textAnchor="middle">8</text>
              <text x="240" y="195" fontSize="11" fill="var(--text-muted)" textAnchor="middle">15</text>
              <text x="330" y="195" fontSize="11" fill="var(--text-muted)" textAnchor="middle">22</text>
              <text x="420" y="195" fontSize="11" fill="var(--text-muted)" textAnchor="middle">29</text>

              {/* Y-axis labels */}
              <text x="30" y="45" fontSize="11" fill="var(--text-muted)" textAnchor="end">100</text>
              <text x="30" y="80" fontSize="11" fill="var(--text-muted)" textAnchor="end">75</text>
              <text x="30" y="115" fontSize="11" fill="var(--text-muted)" textAnchor="end">50</text>
              <text x="30" y="150" fontSize="11" fill="var(--text-muted)" textAnchor="end">25</text>
              <text x="30" y="180" fontSize="11" fill="var(--text-muted)" textAnchor="end">0</text>
            </svg>
          </div>
        </div>

        {/* Revenue by Customer */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Revenue by Customer (Top 5)</h3>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topCustomers.map((customer, i) => (
                <div key={i}>
                  <div className="between mb-1">
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</div>
                    <div className="mono" style={{ fontWeight: 600 }}>${customer.revenue.toLocaleString()}</div>
                  </div>
                  <div style={{ position: "relative", height: 8, background: "var(--bg-soft)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: `${(customer.revenue / maxRevenue) * 100}%`,
                        background: customer.color,
                        borderRadius: 4,
                        transition: "width 0.5s ease"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Donut Chart and Driver Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginBottom: 16 }}>
        {/* Deliveries by Product - Donut Chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Deliveries by Product</h3>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {/* Donut Chart */}
              <div style={{ position: "relative", width: 140, height: 140 }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="var(--bg-soft)" strokeWidth="15" />

                  {/* Segments */}
                  {(() => {
                    let currentAngle = 0;
                    return productMix.map((product, i) => {
                      const angle = (product.percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;

                      const startX = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
                      const startY = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
                      const endX = 50 + 35 * Math.cos((endAngle * Math.PI) / 180);
                      const endY = 50 + 35 * Math.sin((endAngle * Math.PI) / 180);

                      const largeArcFlag = angle > 180 ? 1 : 0;

                      const path = `M 50 50 L ${startX} ${startY} A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                      currentAngle = endAngle;

                      return (
                        <path
                          key={i}
                          d={path}
                          fill={product.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    });
                  })()}

                  {/* Center white circle */}
                  <circle cx="50" cy="50" r="20" fill="white" />
                </svg>

                {/* Center text */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--blue)" }}>88%</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Total</div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1 }}>
                {productMix.map((product, i) => (
                  <div key={i} className="between" style={{ padding: "8px 0", borderBottom: i < productMix.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: product.color }} />
                      <div style={{ fontSize: 13 }}>{product.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{product.percentage}%</div>
                      <div className="small muted">{product.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Driver Performance</h3>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>DRIVER</th>
                    <th>DELIVERIES</th>
                    <th>ON-TIME %</th>
                    <th>RATING</th>
                    <th>PERFORMANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {driverPerformance.map((driver, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{driver.name}</td>
                      <td className="num mono">{driver.deliveries}</td>
                      <td className="num">
                        <span className="chip green" style={{ padding: "2px 8px" }}>{driver.onTime}%</span>
                      </td>
                      <td className="num">
                        <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                          <span style={{ color: "#fbbf24" }}>★</span>
                          <span style={{ fontWeight: 600 }}>{driver.rating}</span>
                        </div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: 80 }}>
                          <div className="bar-fill green" style={{ width: `${driver.onTime}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Not Visited */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Sites Not Visited - 7+ Days</h3>
            <div className="sub">Customers requiring attention</div>
          </div>
          <div className="row">
            <span className="chip red">3 sites</span>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Icon name="alert" size={14} />
                  </th>
                  <th>SITE</th>
                  <th>LAST VISITED</th>
                  <th>DAYS SINCE</th>
                  <th>TREND</th>
                  <th style={{ width: 120 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", margin: "0 auto" }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{driver.name}</div>
                      <div className="small muted">{driver.id}</div>
                    </td>
                    <td className="muted">{driver.lastVisited}</td>
                    <td className="num">
                      <span className="chip red" style={{ padding: "2px 8px" }}>{driver.daysSince} days</span>
                    </td>
                    <td>
                      {driver.trend === "up" ? (
                        <div className="row" style={{ gap: 4, color: "var(--green)" }}>
                          <Icon name="arrow_right" size={12} style={{ transform: "rotate(-45deg)" }} />
                          <span className="small" style={{ fontWeight: 500 }}>Improving</span>
                        </div>
                      ) : (
                        <div className="row" style={{ gap: 4, color: "var(--red)" }}>
                          <Icon name="arrow_right" size={12} style={{ transform: "rotate(45deg)" }} />
                          <span className="small" style={{ fontWeight: 500 }}>Declining</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="btn primary sm">
                        <Icon name="calendar" size={12} />
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
