import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { reportsApi, type ReportSummary, type TopCustomer, type DriverPerformance } from "../services/api";

export const Reports = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [driverPerf, setDriverPerf] = useState<DriverPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, c, d] = await Promise.all([
          reportsApi.getSummary(),
          reportsApi.getTopCustomers(),
          reportsApi.getDriverPerformance(),
        ]);
        setSummary(s);
        setTopCustomers(c);
        setDriverPerf(d);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const maxRevenue = topCustomers.length > 0 ? Math.max(...topCustomers.map(c => c.revenue)) : 1;
  const barColors = ["var(--blue)", "#6b7694", "#8a909b", "#a4a9b8", "#c4c7d0"];

  return (
    <div className="page">
      <div className="breadcrumbs"><span>Analytics</span><span className="here">Reports & Analytics</span></div>
      <div className="page-head">
        <div>
          <h1>Reports & Analytics</h1>
          <div className="sub">Business performance overview and delivery insights</div>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="download" size={14} /> Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label"><Icon name="box" size={12} /> Bags Delivered</div>
          <div className="value">{loading ? "—" : (summary?.bags_delivered ?? 0).toLocaleString()}</div>
          <div className="delta">Total this period</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="invoice" size={12} /> Revenue</div>
          <div className="value">${loading ? "—" : (summary?.revenue ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 0 })}</div>
          <div className="delta up">From paid invoices</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="route" size={12} /> Routes Completed</div>
          <div className="value">{loading ? "—" : summary?.routes_completed ?? 0}</div>
          <div className="delta">of {summary?.routes_total ?? 0} total</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="users" size={12} /> Active Customers</div>
          <div className="value">{loading ? "—" : summary?.active_customers ?? 0}</div>
          <div className="delta">With invoices this period</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Top Customers */}
        <div className="card">
          <div className="card-head">
            <div><h3>Top Customers by Revenue</h3><div className="sub">Ranked by invoice total</div></div>
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading…</div>
            ) : topCustomers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No invoice data yet. Create invoices to see customer rankings.</div>
            ) : topCustomers.map((c, i) => (
              <div key={c.customer} style={{ marginBottom: 14 }}>
                <div className="between small mb-1">
                  <span style={{ fontWeight: 500 }}>{c.customer}</span>
                  <span className="mono">${c.revenue.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${(c.revenue / maxRevenue) * 100}%`, background: barColors[i % barColors.length] }} />
                </div>
                <div className="small muted mt-1">{c.invoice_count} invoice{c.invoice_count !== 1 ? "s" : ""}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Performance */}
        <div className="card">
          <div className="card-head">
            <div><h3>Driver Performance</h3><div className="sub">Routes and deliveries per driver</div></div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>DRIVER</th><th>ROUTES</th><th>STOPS</th><th>COMPLETION</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading…</td></tr>
                ) : driverPerf.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No route data yet.</td></tr>
                ) : driverPerf.map(d => (
                  <tr key={d.driver_name}>
                    <td style={{ fontWeight: 500 }}>{d.driver_name}</td>
                    <td className="num">{d.routes_count}</td>
                    <td className="num">{d.stops_done}/{d.stops_total}</td>
                    <td>
                      <div className="bar" style={{ width: 80 }}>
                        <div className="bar-fill green" style={{ width: `${d.stops_total > 0 ? (d.stops_done / d.stops_total) * 100 : 0}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="card">
        <div className="card-body">
          <div className="banner" style={{ margin: 0 }}>
            <Icon name="sparkles" size={14} />
            <span>Reports pull live data from invoices, routes, and deliveries. Add customers, create invoices, and run routes to see full analytics here.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
