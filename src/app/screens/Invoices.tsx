import { useState } from "react";
import { Icon } from "../components/Icon";

export const Invoices = () => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  const invoices = [
    { id: "INV-0001", customer: "Shell Albion", custId: "C-0141", date: "May 15", due: "$0.00", subtotal: "$932.50", gst: "$93.25", total: "$1,025.75", status: "paid" },
    { id: "INV-0002", customer: "BP Dapto", custId: "C-5429", date: "May 14", due: "$0.00", subtotal: "$1,090.00", gst: "$109.00", total: "$1,199.00", status: "paid" },
    { id: "INV-0003", customer: "7-Eleven", custId: "L1733", date: "May 13", due: "$0.00", subtotal: "$195.00", gst: "$19.50", total: "$214.50", status: "paid" },
    { id: "INV-0004", customer: "Miranda", custId: "S-0102", date: "May 12", due: "$0.00", subtotal: "$456.00", gst: "$45.60", total: "$501.60", status: "paid" },
    { id: "INV-0005", customer: "Figtree", custId: "S-0444", date: "May 11", due: "$0.00", subtotal: "$543.00", gst: "$54.30", total: "$597.30", status: "overdue" },
    { id: "INV-0006", customer: "Bulli", custId: "S-3021", date: "May 10", due: "$0.00", subtotal: "$210.00", gst: "$21.00", total: "$231.00", status: "overdue" },
    { id: "INV-0007", customer: "Warrawong", custId: "S-4809", date: "May 9", due: "$0.00", subtotal: "$732.50", gst: "$73.25", total: "$805.75", status: "paid" },
    { id: "INV-0008", customer: "Unanderra", custId: "S-7211", date: "May 8", due: "$0.00", subtotal: "$654.00", gst: "$65.40", total: "$719.40", status: "paid" },
    { id: "INV-0009", customer: "Port Kembla", custId: "S-1198", date: "May 7", due: "$0.00", subtotal: "$123.50", gst: "$12.35", total: "$135.85", status: "paid" },
    { id: "INV-0010", customer: "Dapto", custId: "D8438", date: "May 6", due: "28d", subtotal: "$890.00", gst: "$89.00", total: "$989.00", status: "pending" },
  ];

  const toggleInvoice = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedInvoices(prev =>
      prev.length === invoices.length ? [] : invoices.map(i => i.id)
    );
  };

  const totalOutstanding = 32850;
  const totalOverdue = 8580;
  const last30Days = 11500;

  return (
    <>
      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
      <div className="page">
      <div className="breadcrumbs">
        <span>Finance</span>
        <span className="here">Invoices & Payments</span>
      </div>

      <div className="page-head">
        <div>
          <h1>Invoices & Financials</h1>
          <div className="sub">Track payments, manage invoices, and monitor revenue</div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn primary">
            <Icon name="plus" size={14} /> Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label">
            <Icon name="invoice" size={12} /> Total Outstanding
          </div>
          <div className="value">${totalOutstanding.toLocaleString()}</div>
          <div className="delta">Across all customers</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="alert" size={12} /> Total Overdue
          </div>
          <div className="value" style={{ color: "var(--red)" }}>${totalOverdue.toLocaleString()}</div>
          <div className="delta down">Requires immediate action</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="calendar" size={12} /> Last 30 Days
          </div>
          <div className="value">${last30Days.toLocaleString()}</div>
          <div className="delta up">+8% vs previous month</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="check" size={12} /> Payment Rate
          </div>
          <div className="value">94%</div>
          <div className="delta up">On-time payments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-2">
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 200 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>01 May - 31 May 2026</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 180 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>All Customers</option>
              <option>Shell Albion</option>
              <option>BP Dapto</option>
              <option>7-Eleven</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 140 }}>
            <select className="select" style={{ minWidth: 0 }}>
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className="topbar search" style={{ flex: 1, margin: 0, maxWidth: 300 }}>
            <Icon name="search" size={14} />
            <span>Search invoice # or customer...</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn sm">
              <Icon name="filter" size={12} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card mb-2">
        <div className="card-head">
          <div>
            <h3>Customer Invoices</h3>
            <div className="sub">{invoices.length} invoices this period</div>
          </div>
          <div className="row">
            <span className="small muted">{selectedInvoices.length} selected</span>
            {selectedInvoices.length > 0 && (
              <>
                <button className="btn sm">
                  <Icon name="send" size={12} /> Send Reminders
                </button>
                <button className="btn sm">
                  <Icon name="download" size={12} /> Export Selected
                </button>
              </>
            )}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <div
                    className={`cbox ${selectedInvoices.length === invoices.length ? "checked" : ""}`}
                    onClick={toggleAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={{ width: 40 }}>
                  <Icon name="download" size={14} />
                </th>
                <th>INV #</th>
                <th>CUSTOMER</th>
                <th>INV DATE</th>
                <th>DUE</th>
                <th>SUBTOTAL</th>
                <th>GST</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th style={{ width: 60 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div
                      className={`cbox ${selectedInvoices.includes(inv.id) ? "checked" : ""}`}
                      onClick={() => toggleInvoice(inv.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
                    <button className="btn ghost sm icon">
                      <Icon name="download" size={14} />
                    </button>
                  </td>
                  <td style={{ fontWeight: 500 }} className="mono">{inv.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{inv.customer}</div>
                    <div className="small muted">{inv.custId}</div>
                  </td>
                  <td className="muted">{inv.date}</td>
                  <td className="num mono">{inv.due}</td>
                  <td className="num mono">{inv.subtotal}</td>
                  <td className="num mono">{inv.gst}</td>
                  <td className="num mono" style={{ fontWeight: 600 }}>{inv.total}</td>
                  <td>
                    {inv.status === "paid" && (
                      <span className="chip green">
                        <span className="dot" />
                        Paid
                      </span>
                    )}
                    {inv.status === "overdue" && (
                      <span className="chip red">
                        <span className="dot" />
                        Overdue
                      </span>
                    )}
                    {inv.status === "pending" && (
                      <span className="chip orange">
                        <span className="dot" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn ghost sm" onClick={() => setViewInvoice(inv)}>
                      <Icon name="dots" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="small muted">Showing 1-10 of 47 invoices</div>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn sm icon">
              <Icon name="arrow_left" size={14} />
            </button>
            <button className="btn sm" style={{ background: "var(--blue)", color: "white", borderColor: "var(--blue)" }}>1</button>
            <button className="btn sm">2</button>
            <button className="btn sm">3</button>
            <button className="btn sm">4</button>
            <button className="btn sm">5</button>
            <button className="btn sm icon">
              <Icon name="arrow_right" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Charts and Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* Monthly Revenue Trend */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Monthly Revenue Trend</h3>
              <div className="sub">Last 6 months revenue comparison</div>
            </div>
            <div className="segmented">
              <button className="seg active">Revenue</button>
              <button className="seg">Invoices</button>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, paddingTop: 20 }}>
              {[
                { month: "Dec", value: 85, label: "$8.5k" },
                { month: "Jan", value: 92, label: "$9.2k" },
                { month: "Feb", value: 78, label: "$7.8k" },
                { month: "Mar", value: 95, label: "$9.5k" },
                { month: "Apr", value: 88, label: "$8.8k" },
                { month: "May", value: 100, label: "$11.5k" },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div className="small muted" style={{ fontSize: 11 }}>{item.label}</div>
                  <div
                    style={{
                      width: "100%",
                      height: `${(item.value / 100) * 160}px`,
                      background: i === 5 ? "var(--blue)" : "#6b7694",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.3s ease"
                    }}
                  />
                  <div className="small muted" style={{ fontWeight: 500, fontSize: 11 }}>{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Alerts */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Financial Alerts</h3>
              <div className="sub">Recent notifications</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="banner red" style={{ margin: 0 }}>
                <Icon name="alert" size={14} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>2 high-value invoices overdue</div>
                  <div className="small">Total $8,580 pending from Figtree & Bulli</div>
                </div>
              </div>
              <div className="banner" style={{ margin: 0, background: "var(--green-soft)", borderColor: "#b9e0c6", color: "#0f6b33" }}>
                <Icon name="check" size={14} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Bulk payment received</div>
                  <div className="small">Shell Albion paid 3 invoices ($4,250)</div>
                </div>
              </div>
              <div className="banner" style={{ margin: 0 }}>
                <Icon name="clock" size={14} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Payment due tomorrow</div>
                  <div className="small">INV-0010 from Dapto ($989.00)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const InvoiceDetailModal = ({ invoice, onClose }: { invoice: any; onClose: () => void }) => {
  if (!invoice) return null;

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
        width: "680px",
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--navy-deep)", margin: 0 }}>Invoice {invoice.id}</h2>
              {invoice.status === "paid" && (
                <span className="chip green" style={{ margin: 0 }}>
                  <span className="dot" /> Paid
                </span>
              )}
              {invoice.status === "overdue" && (
                <span className="chip red" style={{ margin: 0 }}>
                  <span className="dot" /> Overdue
                </span>
              )}
              {invoice.status === "pending" && (
                <span className="chip orange" style={{ margin: 0 }}>
                  <span className="dot" /> Pending
                </span>
              )}
            </div>
            <div className="small" style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "2px" }}>
              Issued to {invoice.customer} ({invoice.custId})
            </div>
          </div>
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

        {/* Body */}
        <div style={{
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "24px"
        }}>
          {/* Left Column: Details & Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Billing Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Issue Date:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{invoice.date}, 2026</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Due Date:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{invoice.status === "paid" ? "Paid" : invoice.due}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Customer Site:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{invoice.customer} Hub</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Line Items</h3>
              <div style={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                overflow: "hidden"
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "var(--text)" }}>Description</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "var(--text)", width: "80px" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", color: "var(--text)" }}>Bulk Ice Supply (2KG / 5KG / 10KG)</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text)", fontWeight: 500 }} className="mono">{invoice.subtotal}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Logistics & Delivery Surcharge</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 500 }} className="mono">$0.00</td>
                    </tr>
                    <tr style={{ background: "#F8FAFC" }}>
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>GST (10%)</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 500 }} className="mono">{invoice.gst}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Action Plan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Financial Status</h3>
              <div style={{
                background: invoice.status === "paid" ? "var(--green-soft)" : invoice.status === "overdue" ? "#fef2f2" : "#fffbeb",
                border: "1px solid " + (invoice.status === "paid" ? "#b9e0c6" : invoice.status === "overdue" ? "#fee2e2" : "#fef3c7"),
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Total Due</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: invoice.status === "overdue" ? "var(--red)" : "var(--navy-deep)", margin: "4px 0", letterSpacing: "-0.02em" }} className="mono">
                  {invoice.status === "paid" ? "$0.00" : invoice.total}
                </div>
                <div style={{ fontSize: "12px", color: invoice.status === "paid" ? "#16a34a" : invoice.status === "overdue" ? "var(--red)" : "var(--text-muted)", fontWeight: 500 }}>
                  {invoice.status === "paid" ? "Invoice Paid in Full" : invoice.status === "overdue" ? "Immediate payment required" : "Payment due in " + invoice.due}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}>
                  <Icon name="download" size={14} /> Download PDF Invoice
                </button>
                <button style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}>
                  <Icon name="mail" size={14} /> Email Invoice Copy
                </button>
                <button style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}>
                  <Icon name="printer" size={14} /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "center",
          background: "#F8FAFC"
        }}>
          <button onClick={onClose} style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "8px 28px",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--text)",
            cursor: "pointer"
          }}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
