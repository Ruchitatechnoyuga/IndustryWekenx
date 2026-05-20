import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { invoicesApi, type Invoice, type InvoiceSummary } from "../services/api";

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invList, sumData] = await Promise.all([
        invoicesApi.list(),
        invoicesApi.getSummary(),
      ]);
      setInvoices(invList);
      setSummary(sumData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = filterStatus ? invoices.filter(i => i.status === filterStatus) : invoices;

  const toggleInvoice = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedInvoices(prev =>
      prev.length === filtered.length ? [] : filtered.map(i => i.id)
    );
  };

  const handleStatusChange = async (id: string, status: string) => {
    await invoicesApi.updateStatus(id, status);
    loadData();
  };

  const fmt = (n: number) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

  return (
    <>
      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} onStatusChange={handleStatusChange} />}
      {showCreateModal && <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onSave={loadData} />}
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
            <button className="btn primary" onClick={() => setShowCreateModal(true)}>
              <Icon name="plus" size={14} /> Create Invoice
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="label"><Icon name="invoice" size={12} /> Total Outstanding</div>
            <div className="value">{fmt(summary?.total_outstanding ?? 0)}</div>
            <div className="delta">Across all customers</div>
          </div>
          <div className="kpi">
            <div className="label"><Icon name="alert" size={12} /> Total Overdue</div>
            <div className="value" style={{ color: "var(--red)" }}>{fmt(summary?.total_overdue ?? 0)}</div>
            <div className="delta down">Requires immediate action</div>
          </div>
          <div className="kpi">
            <div className="label"><Icon name="calendar" size={12} /> Last 30 Days</div>
            <div className="value">{fmt(summary?.last_30_days ?? 0)}</div>
            <div className="delta up">Revenue collected</div>
          </div>
          <div className="kpi">
            <div className="label"><Icon name="check" size={12} /> Invoices This Period</div>
            <div className="value">{summary?.invoice_count ?? 0}</div>
            <div className="delta">{summary?.paid_count ?? 0} paid · {summary?.overdue_count ?? 0} overdue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-2">
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="field" style={{ margin: 0, flex: 1, maxWidth: 180 }}>
              <select className="select" style={{ minWidth: 0 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button className="btn sm" onClick={loadData}>
                <Icon name="refresh" size={12} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="card mb-2">
          <div className="card-head">
            <div>
              <h3>Customer Invoices</h3>
              <div className="sub">{loading ? "Loading…" : `${filtered.length} invoices`}</div>
            </div>
            <div className="row">
              <span className="small muted">{selectedInvoices.length} selected</span>
              {selectedInvoices.length > 0 && (
                <button className="btn sm"><Icon name="send" size={12} /> Send Reminders</button>
              )}
            </div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <div className={`cbox ${selectedInvoices.length === filtered.length && filtered.length > 0 ? "checked" : ""}`} onClick={toggleAll} style={{ cursor: "pointer" }} />
                  </th>
                  <th>INV #</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>SUBTOTAL</th>
                  <th>GST</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th style={{ width: 60 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No invoices found. Create your first invoice!</td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div className={`cbox ${selectedInvoices.includes(inv.id) ? "checked" : ""}`} onClick={() => toggleInvoice(inv.id)} style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ fontWeight: 500 }} className="mono">{inv.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inv.customer}</div>
                      <div className="small muted">{inv.customer_id}</div>
                    </td>
                    <td className="muted">{inv.invoice_date || "—"}</td>
                    <td className="num mono">{fmt(inv.subtotal)}</td>
                    <td className="num mono">{fmt(inv.gst)}</td>
                    <td className="num mono" style={{ fontWeight: 600 }}>{fmt(inv.total)}</td>
                    <td>
                      {inv.status === "paid" && <span className="chip green"><span className="dot" />Paid</span>}
                      {inv.status === "overdue" && <span className="chip red"><span className="dot" />Overdue</span>}
                      {inv.status === "pending" && <span className="chip orange"><span className="dot" />Pending</span>}
                      {inv.status === "draft" && <span className="chip"><span className="dot" />Draft</span>}
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
        </div>

        {/* Monthly Revenue Chart */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Monthly Revenue Trend</h3>
                <div className="sub">Last 6 months</div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, paddingTop: 20 }}>
                {["Dec","Jan","Feb","Mar","Apr","May"].map((month, i) => {
                  const vals = [85, 92, 78, 95, 88, 100];
                  const labels = ["$8.5k","$9.2k","$7.8k","$9.5k","$8.8k","$11.5k"];
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div className="small muted" style={{ fontSize: 11 }}>{labels[i]}</div>
                      <div style={{ width: "100%", height: `${(vals[i] / 100) * 160}px`, background: i === 5 ? "var(--blue)" : "#6b7694", borderRadius: "6px 6px 0 0" }} />
                      <div className="small muted" style={{ fontWeight: 500, fontSize: 11 }}>{month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div><h3>Financial Alerts</h3><div className="sub">Recent notifications</div></div></div>
            <div className="card-body" style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(summary?.overdue_count ?? 0) > 0 && (
                  <div className="banner red" style={{ margin: 0 }}>
                    <Icon name="alert" size={14} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{summary!.overdue_count} invoice(s) overdue</div>
                      <div className="small">Total {fmt(summary!.total_overdue)} pending</div>
                    </div>
                  </div>
                )}
                {(summary?.pending_count ?? 0) > 0 && (
                  <div className="banner" style={{ margin: 0 }}>
                    <Icon name="clock" size={14} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{summary!.pending_count} payment(s) pending</div>
                      <div className="small">Follow up to confirm payment received</div>
                    </div>
                  </div>
                )}
                {(summary?.paid_count ?? 0) > 0 && (
                  <div className="banner" style={{ margin: 0, background: "var(--green-soft)", borderColor: "#b9e0c6", color: "#0f6b33" }}>
                    <Icon name="check" size={14} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{summary!.paid_count} invoice(s) paid</div>
                      <div className="small">Great collection rate this period</div>
                    </div>
                  </div>
                )}
                {!loading && invoices.length === 0 && (
                  <div className="banner" style={{ margin: 0 }}><Icon name="invoice" size={14} /><div>No invoices yet. Create your first!</div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Create Invoice Modal ──────────────────────────────────────────────────────
const CreateInvoiceModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ customer: "", invoice_date: new Date().toISOString().split("T")[0], subtotal: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.customer) return;
    setSaving(true);
    const subtotal = parseFloat(form.subtotal) || 0;
    const gst = subtotal * 0.1;
    await invoicesApi.create({ customer: form.customer, invoice_date: form.invoice_date, subtotal, gst, total: subtotal + gst, status: "pending", notes: form.notes });
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:480,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Create Invoice</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          <div className="field"><label>Customer Name *</label><input className="input" placeholder="e.g. Shell Albion" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} /></div>
          <div className="field"><label>Invoice Date</label><input className="input" type="date" value={form.invoice_date} onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))} /></div>
          <div className="field"><label>Subtotal (AUD)</label><input className="input" type="number" placeholder="0.00" value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value }))} /></div>
          {form.subtotal && <div className="small muted">GST (10%): ${(parseFloat(form.subtotal) * 0.1 || 0).toFixed(2)} · Total: ${(parseFloat(form.subtotal) * 1.1 || 0).toFixed(2)}</div>}
          <div className="field"><label>Notes</label><textarea className="input" rows={2} placeholder="Optional notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.customer}>{saving ? "Saving…" : "Create Invoice"}</button>
        </div>
      </div>
    </div>
  );
};

// ── Invoice Detail Modal ──────────────────────────────────────────────────────
const InvoiceDetailModal = ({ invoice, onClose, onStatusChange }: { invoice: Invoice; onClose: () => void; onStatusChange: (id: string, status: string) => void }) => {
  const fmt = (n: number) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:680,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Invoice {invoice.id}</h2>
              {invoice.status === "paid" && <span className="chip green"><span className="dot" />Paid</span>}
              {invoice.status === "overdue" && <span className="chip red"><span className="dot" />Overdue</span>}
              {invoice.status === "pending" && <span className="chip orange"><span className="dot" />Pending</span>}
              {invoice.status === "draft" && <span className="chip"><span className="dot" />Draft</span>}
            </div>
            <div className="small" style={{ color:"var(--text-muted)",marginTop:2 }}>Issued to {invoice.customer}</div>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ padding:24,display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:24 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div>
              <h3 style={{ fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>Billing Summary</h3>
              <div style={{ background:"#F8FAFC",padding:12,borderRadius:8,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span className="muted">Date:</span><span style={{ fontWeight:600 }}>{invoice.invoice_date || "—"}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span className="muted">Subtotal:</span><span style={{ fontWeight:600 }} className="mono">{fmt(invoice.subtotal)}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span className="muted">GST (10%):</span><span style={{ fontWeight:600 }} className="mono">{fmt(invoice.gst)}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,borderTop:"1px solid var(--border)",paddingTop:8 }}><span style={{ fontWeight:700 }}>Total:</span><span style={{ fontWeight:700 }} className="mono">{fmt(invoice.total)}</span></div>
              </div>
            </div>
            {invoice.notes && (
              <div>
                <h3 style={{ fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8 }}>Notes</h3>
                <p style={{ fontSize:13,color:"var(--text-muted)",margin:0 }}>{invoice.notes}</p>
              </div>
            )}
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div>
              <h3 style={{ fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>Financial Status</h3>
              <div style={{ background: invoice.status==="paid" ? "var(--green-soft)" : invoice.status==="overdue" ? "#fef2f2" : "#fffbeb", border:"1px solid "+(invoice.status==="paid"?"#b9e0c6":invoice.status==="overdue"?"#fee2e2":"#fef3c7"), borderRadius:8, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:12,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.03em" }}>Total Due</div>
                <div style={{ fontSize:28,fontWeight:800,color:invoice.status==="overdue"?"var(--red)":"var(--navy-deep)",margin:"4px 0" }} className="mono">{invoice.status==="paid" ? "$0.00" : fmt(invoice.total)}</div>
                <div style={{ fontSize:12,color:invoice.status==="paid"?"#16a34a":invoice.status==="overdue"?"var(--red)":"var(--text-muted)",fontWeight:500 }}>
                  {invoice.status==="paid" ? "Paid in Full" : invoice.status==="overdue" ? "Immediate payment required" : "Awaiting payment"}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>Update Status</h3>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {["paid","pending","overdue","draft"].filter(s => s !== invoice.status).map(s => (
                  <button key={s} className="btn" style={{ width:"100%",justifyContent:"center" }} onClick={() => { onStatusChange(invoice.id, s); onClose(); }}>
                    Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"16px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"center",background:"#F8FAFC" }}>
          <button onClick={onClose} style={{ background:"#fff",border:"1px solid var(--border)",borderRadius:6,padding:"8px 28px",fontSize:13.5,fontWeight:500,cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
};
