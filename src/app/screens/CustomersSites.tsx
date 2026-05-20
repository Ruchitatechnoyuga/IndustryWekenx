import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/Icon";
import { customersApi, sitesApi } from "../services/api";

// ─── TypeScript Interfaces ────────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  poRequired: boolean;
  hours: string;
  notes?: string;
}

interface Site {
  id: string;
  customer_id?: string;
  name: string;
  suburb: string;
  customerName: string;
  status: "red" | "orange" | "green" | "hold";
  capacity: number;
  current: number;
  palletDesc: string;
  lastDelivered: string;
  scheduled: string;
  deliveryHours: string;
  hasPO: boolean;
  emergency: boolean;
  stockReliability: "reliable" | "unreliable";
  notes?: string;
}

// ─── API ↔ Frontend Mappers ───────────────────────────────────────────────────
function mapApiCustomer(c: any): Customer {
  return {
    id: c.id,
    name: c.name || "",
    contact: c.contact || "",
    phone: c.phone || "",
    poRequired: c.po === "Yes" || c.po === "true" || c.po === true || c.po === 1,
    hours: c.hours || "",
    notes: c.notes || "",
  };
}

function mapApiSite(s: any): Site {
  return {
    id: s.id,
    customer_id: s.customer_id || "",
    name: s.name || "",
    suburb: s.suburb || "",
    customerName: s.customer_name || "",
    status: (s.status as Site["status"]) || "green",
    capacity: s.capacity || 0,
    current: s.current_stock || 0,
    palletDesc: s.pallets_desc || "",
    lastDelivered: s.last_delivered || "",
    scheduled: s.scheduled || "",
    deliveryHours: s.eta || "",
    hasPO: s.has_po === 1 || s.has_po === true,
    emergency: s.emergency === 1 || s.emergency === true,
    stockReliability: (s.stock_reliability as "reliable" | "unreliable") || "reliable",
    notes: s.notes || "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CustomersSites = () => {
  // ── Tab State ──
  const [activeTab, setActiveTab] = useState<"customers" | "sites">("customers");

  // ── Data State ──
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load Data ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiCustomers, apiSites] = await Promise.all([
        customersApi.list(),
        sitesApi.list(),
      ]);
      setCustomers((apiCustomers as any[]).map(mapApiCustomer));
      setSites((apiSites as any[]).map(mapApiSite));
    } catch (e: any) {
      setError("Could not load data. Is the server running on port 3001?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("All Customers");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses");
  const [statusChipFilters, setStatusChipFilters] = useState<Record<string, boolean>>({
    red: true, orange: true, green: true, hold: true,
  });

  // ── Drawer States ──
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isSiteDrawerOpen, setIsSiteDrawerOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [stockEditingSite, setStockEditingSite] = useState<Site | null>(null);

  // ── Customer Form Fields ──
  const [custCompanyName, setCustCompanyName] = useState("");
  const [custContact, setCustContact] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custHours, setCustHours] = useState("");
  const [custPO, setCustPO] = useState(false);
  const [custNotes, setCustNotes] = useState("");
  const [custAddSiteInline, setCustAddSiteInline] = useState(false);

  // ── Inline Site Fields (inside Customer Drawer) ──
  const [inlineSiteName, setInlineSiteName] = useState("");
  const [inlineSiteSuburb, setInlineSiteSuburb] = useState("");
  const [inlineSiteCapacity, setInlineSiteCapacity] = useState(80);
  const [inlineSiteCurrent, setInlineSiteCurrent] = useState(40);
  const [inlineSitePallets, setInlineSitePallets] = useState("1 × Standard Pallet");
  const [inlineSiteLastDelivered, setInlineSiteLastDelivered] = useState("2026-05-18");
  const [inlineSiteScheduled, setInlineSiteScheduled] = useState("2026-05-23");
  const [inlineSiteETA, setInlineSiteETA] = useState("Mon–Fri 6am–6pm");
  const [inlineSiteStatus, setInlineSiteStatus] = useState<Site["status"]>("green");
  const [inlineSiteHasPO, setInlineSiteHasPO] = useState(true);
  const [inlineSiteEmergency, setInlineSiteEmergency] = useState(false);
  const [inlineSiteReliability, setInlineSiteReliability] = useState<"reliable" | "unreliable">("reliable");
  const [inlineSiteNotes, setInlineSiteNotes] = useState("");

  // ── Site Form Fields ──
  const [siteName, setSiteName] = useState("");
  const [siteSuburb, setSiteSuburb] = useState("");
  const [siteCustomer, setSiteCustomer] = useState("");
  const [siteCapacity, setSiteCapacity] = useState(100);
  const [siteCurrent, setSiteCurrent] = useState(50);
  const [siteRequired, setSiteRequired] = useState(50);
  const [sitePalletDesc, setSitePalletDesc] = useState("");
  const [siteLastDelivered, setSiteLastDelivered] = useState("");
  const [siteScheduled, setSiteScheduled] = useState("");
  const [siteETA, setSiteETA] = useState("");
  const [siteStatus, setSiteStatus] = useState<Site["status"]>("green");
  const [siteHasPO, setSiteHasPO] = useState(true);
  const [siteEmergency, setSiteEmergency] = useState(false);
  const [siteReliability, setSiteReliability] = useState<"reliable" | "unreliable">("reliable");
  const [siteNotes, setSiteNotes] = useState("");
  const [siteAddCustomerInline, setSiteAddCustomerInline] = useState(false);

  // ── Inline Customer Fields (inside Site Drawer) ──
  const [inlineCustContact, setInlineCustContact] = useState("");
  const [inlineCustPhone, setInlineCustPhone] = useState("");
  const [inlineCustPO, setInlineCustPO] = useState(false);

  // ── Stock Modal ──
  const [quickStockCurrent, setQuickStockCurrent] = useState(0);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getSitesCountForCustomer = (customerName: string) =>
    sites.filter((s) => s.customerName.toLowerCase() === customerName.toLowerCase()).length;

  const getCustomerIdByName = (name: string): string =>
    customers.find((c) => c.name.toLowerCase() === name.toLowerCase())?.id || "";

  const handleViewSites = (customerName: string) => {
    setSelectedCustomerFilter(customerName);
    setSelectedStatusFilter("All Statuses");
    setStatusChipFilters({ red: true, orange: true, green: true, hold: true });
    setActiveTab("sites");
  };

  const toggleStatusChip = (status: string) =>
    setStatusChipFilters((prev) => ({ ...prev, [status]: !prev[status] }));

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "—";
    if (/hold|today|yesterday|day/i.test(dateStr)) return dateStr;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    } catch { return dateStr; }
  };

  // ─── Filtered Lists ───────────────────────────────────────────────────────
  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.contact.toLowerCase().includes(q) ||
      cust.phone.includes(q) ||
      cust.hours.toLowerCase().includes(q) ||
      (cust.notes && cust.notes.toLowerCase().includes(q))
    );
  });

  const filteredSites = sites.filter((site) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !site.name.toLowerCase().includes(q) &&
        !site.suburb.toLowerCase().includes(q) &&
        !site.customerName.toLowerCase().includes(q) &&
        !site.palletDesc.toLowerCase().includes(q) &&
        !(site.notes && site.notes.toLowerCase().includes(q))
      ) return false;
    }
    if (selectedCustomerFilter !== "All Customers" &&
        site.customerName.toLowerCase() !== selectedCustomerFilter.toLowerCase()) return false;
    if (selectedStatusFilter !== "All Statuses") {
      const statusMap: Record<string, string> = { Red: "red", Orange: "orange", Green: "green", Hold: "hold" };
      if (site.status !== statusMap[selectedStatusFilter]) return false;
    }
    if (!statusChipFilters[site.status]) return false;
    return true;
  });

  // ─── Summary Stats ────────────────────────────────────────────────────────
  const totalCustomersCount = customers.length;
  const totalSitesCount = sites.length;
  const urgentSitesCount = sites.filter((s) => s.status === "red").length;
  const onHoldSitesCount = sites.filter((s) => s.status === "hold").length;

  // ─── Customer Drawer Handlers ─────────────────────────────────────────────
  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustCompanyName(""); setCustContact(""); setCustPhone("");
    setCustHours("Mon–Fri 6am–6pm"); setCustPO(false); setCustNotes("");
    setCustAddSiteInline(false);
    setInlineSiteName(""); setInlineSiteSuburb(""); setInlineSiteCapacity(80);
    setInlineSiteCurrent(40); setInlineSitePallets("1 × Standard Pallet");
    setInlineSiteLastDelivered("2026-05-18"); setInlineSiteScheduled("2026-05-23");
    setInlineSiteETA("Mon–Fri 6am–6pm"); setInlineSiteStatus("green");
    setInlineSiteHasPO(true); setInlineSiteEmergency(false);
    setInlineSiteReliability("reliable"); setInlineSiteNotes("");
    setIsCustomerDrawerOpen(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustCompanyName(customer.name); setCustContact(customer.contact);
    setCustPhone(customer.phone); setCustHours(customer.hours);
    setCustPO(customer.poRequired); setCustNotes(customer.notes || "");
    setCustAddSiteInline(false);
    setIsCustomerDrawerOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custCompanyName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, {
          name: custCompanyName, contact: custContact, phone: custPhone,
          po: custPO ? "Yes" : "No", hours: custHours, notes: custNotes,
        } as any);
      } else {
        const newCustId = `C-${Date.now()}`;
        await customersApi.create({
          id: newCustId, name: custCompanyName, contact: custContact,
          phone: custPhone, po: custPO ? "Yes" : "No", hours: custHours, notes: custNotes,
        } as any);

        // Also create inline site if checkbox ticked
        if (custAddSiteInline && inlineSiteName.trim()) {
          await sitesApi.create({
            id: `S-${Date.now()}`,
            customer_id: newCustId,
            name: inlineSiteName, suburb: inlineSiteSuburb,
            status: inlineSiteStatus,
            capacity: Number(inlineSiteCapacity),
            current_stock: Number(inlineSiteCurrent),
            required: Math.max(0, Number(inlineSiteCapacity) - Number(inlineSiteCurrent)),
            pallets_desc: inlineSitePallets,
            last_delivered: formatDateString(inlineSiteLastDelivered),
            eta: inlineSiteETA,
            scheduled: inlineSiteStatus === "hold" ? "On hold" : formatDateString(inlineSiteScheduled),
            has_po: inlineSiteHasPO ? 1 : 0,
            emergency: inlineSiteEmergency ? 1 : 0,
            stock_reliability: inlineSiteReliability,
            allocation_cap: 100,
          } as any);
        }
      }

      await loadData();
      setIsCustomerDrawerOpen(false);
      setEditingCustomer(null);
    } catch (e: any) {
      setError(e.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Site Drawer Handlers ─────────────────────────────────────────────────
  const openAddSite = () => {
    setEditingSite(null);
    setSiteName(""); setSiteSuburb("");
    setSiteCustomer(customers[0]?.name || "");
    setSiteCapacity(100); setSiteCurrent(50); setSiteRequired(50);
    setSitePalletDesc("2 × Standard Pallets");
    setSiteLastDelivered("2026-05-18"); setSiteScheduled("2026-05-23");
    setSiteETA("Mon–Fri 6am–6pm"); setSiteStatus("green");
    setSiteHasPO(true); setSiteEmergency(false);
    setSiteReliability("reliable"); setSiteNotes("");
    setSiteAddCustomerInline(false);
    setInlineCustContact(""); setInlineCustPhone(""); setInlineCustPO(false);
    setIsSiteDrawerOpen(true);
  };

  const openEditSite = (site: Site) => {
    setEditingSite(site);
    setSiteName(site.name); setSiteSuburb(site.suburb);
    setSiteCustomer(site.customerName);
    setSiteCapacity(site.capacity); setSiteCurrent(site.current);
    setSiteRequired(site.capacity - site.current);
    setSitePalletDesc(site.palletDesc);
    setSiteLastDelivered(site.lastDelivered); setSiteScheduled(site.scheduled);
    setSiteETA(site.deliveryHours); setSiteStatus(site.status);
    setSiteHasPO(site.hasPO); setSiteEmergency(site.emergency);
    setSiteReliability(site.stockReliability); setSiteNotes(site.notes || "");
    setSiteAddCustomerInline(false);
    setIsSiteDrawerOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      let customerId = getCustomerIdByName(siteCustomer);

      // If "+ New Customer" or inline billing checkbox — create customer first
      if ((siteCustomer === "+ New Customer" || siteAddCustomerInline) && !customerId) {
        const newCustId = `C-${Date.now()}`;
        await customersApi.create({
          id: newCustId, name: siteName,
          contact: inlineCustContact || "Main Office",
          phone: inlineCustPhone || "—",
          po: inlineCustPO ? "Yes" : "No",
          hours: siteETA || "Mon–Fri 6am–6pm",
          notes: `Auto-created from Site: ${siteName}.`,
        } as any);
        customerId = newCustId;
      }

      const sitePayload: any = {
        name: siteName, suburb: siteSuburb,
        customer_id: customerId,
        status: siteStatus,
        capacity: Number(siteCapacity),
        current_stock: Number(siteCurrent),
        required: Math.max(0, Number(siteCapacity) - Number(siteCurrent)),
        pallets_desc: sitePalletDesc,
        last_delivered: formatDateString(siteLastDelivered),
        eta: siteETA,
        scheduled: siteStatus === "hold" ? "On hold" : formatDateString(siteScheduled),
        has_po: siteHasPO ? 1 : 0,
        emergency: siteEmergency ? 1 : 0,
        stock_reliability: siteReliability,
        allocation_cap: 100,
      };

      if (editingSite) {
        await sitesApi.update(editingSite.id, sitePayload);
      } else {
        await sitesApi.create({ id: `S-${Date.now()}`, ...sitePayload } as any);
      }

      await loadData();
      setIsSiteDrawerOpen(false);
      setEditingSite(null);
    } catch (e: any) {
      setError(e.message || "Failed to save site.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Stock Modal Handler ──────────────────────────────────────────────────
  const openStockModal = (site: Site) => {
    setStockEditingSite(site);
    setQuickStockCurrent(site.current);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockEditingSite) return;
    setSaving(true);
    try {
      const newCurrent = Number(quickStockCurrent);
      const pct = (newCurrent / stockEditingSite.capacity) * 100;
      let newStatus: Site["status"] = stockEditingSite.status;
      if (stockEditingSite.status !== "hold") {
        newStatus = pct < 25 ? "red" : pct <= 50 ? "orange" : "green";
      }
      await sitesApi.updateStock(stockEditingSite.id, newCurrent, newStatus);
      await loadData();
      setIsStockModalOpen(false);
      setStockEditingSite(null);
    } catch (e: any) {
      setError(e.message || "Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page customers-sites-page">
      <style>{`
        .customers-sites-page {
          --blue: #0EA5E9 !important;
          --blue-hover: #0284c7 !important;
          --blue-soft: #f0f9ff !important;
          --blue-ink: #075985 !important;
          --navy: #0EA5E9 !important;
          --navy-2: #0284c7 !important;
          --navy-3: #0369a1 !important;
          --navy-deep: #0369a1 !important;
          --accent: #0EA5E9 !important;
          --accent-soft: #f0f9ff !important;
        }
        .tab.active { color: var(--blue) !important; border-bottom-color: var(--blue) !important; }
        .btn.primary { background-color: var(--blue) !important; border-color: var(--blue) !important; color: white !important; }
        .btn.primary:hover { background-color: var(--blue-hover) !important; border-color: var(--blue-hover) !important; }
        .drawer-overlay { position:fixed;inset:0;background-color:rgba(15,20,25,0.4);backdrop-filter:blur(4px);z-index:1000;opacity:0;pointer-events:none;transition:opacity 0.25s cubic-bezier(0.4,0,0.2,1); }
        .drawer-overlay.open { opacity:1;pointer-events:auto; }
        .drawer-container { position:fixed;top:0;right:0;height:100%;width:100%;max-width:520px;background-color:#ffffff;box-shadow:-8px 0 32px rgba(15,20,25,0.15);z-index:1001;transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;border-left:1px solid var(--border); }
        .drawer-container.open { transform:translateX(0); }
        .drawer-header { padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background-color:#ffffff; }
        .drawer-header h2 { margin:0;font-size:18px;font-weight:600;color:var(--text); }
        .drawer-body { padding:24px;overflow-y:auto;flex:1;background-color:var(--bg-soft); }
        .drawer-footer { padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:12px;background-color:#ffffff; }
        .switch { position:relative;display:inline-block;width:38px;height:20px; }
        .switch input { opacity:0;width:0;height:0; }
        .slider { position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#cbd5e1;transition:.2s;border-radius:20px; }
        .slider:before { position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background-color:white;transition:.2s;border-radius:50%; }
        input:checked + .slider { background-color:var(--blue); }
        input:checked + .slider:before { transform:translateX(18px); }
        .drawer-expand-section { background-color:#ffffff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-top:14px;display:flex;flex-direction:column;gap:14px;animation:slideDown 0.2s ease-out; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .filters-container { display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid var(--border);background-color:#ffffff; }
        .status-chip-btn { cursor:pointer;user-select:none;transition:all 0.1s ease; }
        .status-chip-btn.inactive { opacity:0.45;background-color:var(--bg-soft) !important;border-color:var(--border) !important;color:var(--text-subtle) !important; }
        .summary-strip { margin-top:24px;padding:14px 20px;background-color:#ffffff;border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;align-items:center;gap:20px;font-size:13px;font-weight:500;color:var(--text-muted);box-shadow:var(--shadow-sm); }
        .summary-dot { width:6px;height:6px;border-radius:50%;background-color:var(--border-strong); }
        tr.emergency-row td { background-color:#fef2f2 !important;border-bottom-color:#fca5a5 !important; }
        tr.emergency-row:hover td { background-color:#fee2e2 !important; }
        .action-link { color:var(--blue);font-weight:500;cursor:pointer;transition:opacity 0.1s; }
        .action-link:hover { text-decoration:underline;opacity:0.85; }
        .modal-overlay { position:fixed;inset:0;background-color:rgba(15,20,25,0.4);backdrop-filter:blur(4px);z-index:2000;display:grid;place-items:center;padding:24px; }
        .modal-card { width:100%;max-width:400px;background:#ffffff;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);border:1px solid var(--border);overflow:hidden;animation:scaleUp 0.15s ease-out; }
        @keyframes scaleUp { from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1} }
      `}</style>

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span>Master Data</span>
        <span className="here">Customers & Sites</span>
      </div>

      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1>Customers & Sites</h1>
          <div className="sub">Wekenx – Stock Industry Ops</div>
        </div>
        <div className="actions">
          {activeTab === "customers" ? (
            <button className="btn primary" onClick={openAddCustomer}>
              <Icon name="plus" size={14} /> Add Customer
            </button>
          ) : (
            <button className="btn primary" onClick={openAddSite}>
              <Icon name="plus" size={14} /> Add Site
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius)", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: "#b91c1c", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}>✕</button>
        </div>
      )}

      {/* Main Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        {/* Tabs + Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px", borderBottom: "1px solid var(--border)", backgroundColor: "#ffffff" }}>
          <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
            <div className={`tab ${activeTab === "customers" ? "active" : ""}`} onClick={() => { setActiveTab("customers"); setSearchQuery(""); }}>
              Customers {!loading && <span style={{ marginLeft: 4, fontSize: "11px", color: "var(--text-subtle)" }}>({customers.length})</span>}
            </div>
            <div className={`tab ${activeTab === "sites" ? "active" : ""}`} onClick={() => { setActiveTab("sites"); setSearchQuery(""); }}>
              Sites {!loading && <span style={{ marginLeft: 4, fontSize: "11px", color: "var(--text-subtle)" }}>({sites.length})</span>}
            </div>
          </div>
          <div style={{ padding: "8px 0", width: "100%", maxWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)" }}>
              <Icon name="search" size={14} />
              <input type="text" placeholder="Search by name, suburb or contact…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: "transparent", border: "none", padding: 0, margin: 0, width: "100%", fontSize: "12.5px" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0 }}><Icon name="x" size={12} /></button>}
            </div>
          </div>
        </div>

        {/* Sites Filter Bar */}
        {activeTab === "sites" && (
          <div className="filters-container">
            <select value={selectedCustomerFilter} onChange={(e) => setSelectedCustomerFilter(e.target.value)} className="select" style={{ minWidth: "160px", padding: "5px 8px", fontSize: "12.5px" }}>
              <option value="All Customers">All Customers</option>
              {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="select" style={{ minWidth: "140px", padding: "5px 8px", fontSize: "12.5px" }}>
              <option value="All Statuses">All Statuses</option>
              <option value="Red">🔴 Urgent</option>
              <option value="Orange">🟠 Order Soon</option>
              <option value="Green">🟢 Good</option>
              <option value="Hold">⏸ Hold</option>
            </select>
            <div style={{ display: "flex", gap: "8px", marginLeft: "8px", alignItems: "center" }}>
              {(["red","orange","green","hold"] as const).map((s) => (
                <span key={s} onClick={() => toggleStatusChip(s)} className={`chip ${s} status-chip-btn ${statusChipFilters[s] ? "" : "inactive"}`}>
                  <span className="dot" /> {s === "red" ? "Urgent" : s === "orange" ? "Order Soon" : s === "green" ? "Good" : "Hold"}
                </span>
              ))}
            </div>
            {(selectedCustomerFilter !== "All Customers" || selectedStatusFilter !== "All Statuses" || !Object.values(statusChipFilters).every(Boolean)) && (
              <button onClick={() => { setSelectedCustomerFilter("All Customers"); setSelectedStatusFilter("All Statuses"); setStatusChipFilters({ red:true,orange:true,green:true,hold:true }); }} className="btn ghost sm" style={{ marginLeft: "auto", fontSize: "12px", padding: "4px 8px" }}>Clear Filters</button>
            )}
          </div>
        )}

        {/* Tables */}
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-subtle)" }}>
              <div style={{ marginBottom: "8px", fontSize: "20px" }}>⏳</div>
              Loading from server…
            </div>
          ) : activeTab === "customers" ? (
            // ── CUSTOMERS TABLE ──
            <table className="data">
              <thead>
                <tr>
                  <th>Company Name</th><th>Contact Person</th><th>Phone</th>
                  <th style={{ width: "120px" }}>PO Required</th>
                  <th style={{ width: "100px" }}>Sites</th><th>Hours</th>
                  <th style={{ width: "160px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-subtle)" }}>No customers match your search.</td></tr>
                ) : filteredCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{cust.name}</td>
                    <td>{cust.contact}</td>
                    <td className="mono">{cust.phone}</td>
                    <td>{cust.poRequired ? <span style={{ color: "var(--green)", fontWeight: 500 }}>✅ Yes</span> : <span style={{ color: "var(--text-subtle)" }}>❌ No</span>}</td>
                    <td style={{ fontWeight: 500 }}>
                      <span className="chip blue" style={{ padding: "1px 6px", fontSize: "11px" }}>
                        {getSitesCountForCustomer(cust.name)} {getSitesCountForCustomer(cust.name) === 1 ? "site" : "sites"}
                      </span>
                    </td>
                    <td className="muted">{cust.hours}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "12px" }}>
                        <span className="action-link" onClick={() => openEditCustomer(cust)}>Edit</span>
                        <span style={{ color: "var(--border-strong)" }}>·</span>
                        <span className="action-link" onClick={() => handleViewSites(cust.name)}>View Sites</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // ── SITES TABLE ──
            <table className="data">
              <thead>
                <tr>
                  <th>Site Name</th><th>Suburb</th><th>Customer</th>
                  <th style={{ width: "130px" }}>Stock Status</th>
                  <th style={{ width: "180px" }}>Stock Level</th>
                  <th>Last Delivered</th><th>Scheduled</th>
                  <th style={{ width: "100px" }}>Emergency</th>
                  <th style={{ width: "180px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-subtle)" }}>No sites match your filters.</td></tr>
                ) : filteredSites.map((site) => {
                  const stockPercent = Math.round((site.current / site.capacity) * 100);
                  const barColor = stockPercent < 25 ? "red" : stockPercent <= 50 ? "orange" : "green";
                  return (
                    <tr key={site.id} className={site.emergency ? "emergency-row" : ""}>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>{site.name}</td>
                      <td>{site.suburb}</td>
                      <td className="muted">{site.customerName}</td>
                      <td>
                        {site.status === "red" && <span className="chip red"><span className="dot" /> Urgent</span>}
                        {site.status === "orange" && <span className="chip orange"><span className="dot" /> Order Soon</span>}
                        {site.status === "green" && <span className="chip green"><span className="dot" /> Good</span>}
                        {site.status === "hold" && <span className="chip hold"><span className="dot" /> Hold</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 500 }}>
                            <span className="mono">{site.current} / {site.capacity} bags</span>
                            <span className="muted">{stockPercent}%</span>
                          </div>
                          <div className="bar" style={{ height: "5px", border: "none", background: "#e2e8f0" }}>
                            <div className={`bar-fill ${barColor}`} style={{ width: `${Math.min(stockPercent, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="muted">{site.lastDelivered}</td>
                      <td className="mono">{site.scheduled}</td>
                      <td>
                        {site.emergency ? <span className="chip red" style={{ padding: "2px 6px" }}>🚨 Yes</span> : <span className="muted" style={{ fontSize: "12px", paddingLeft: "8px" }}>No</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "12px" }}>
                          <span className="action-link" onClick={() => openEditSite(site)}>Edit</span>
                          <span style={{ color: "var(--border-strong)" }}>·</span>
                          <span className="action-link" onClick={() => openStockModal(site)}>Update Stock</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="summary-strip">
        <span style={{ color: "var(--text)" }}>{totalCustomersCount} customers</span>
        <span className="summary-dot" />
        <span style={{ color: "var(--text)" }}>{totalSitesCount} sites</span>
        <span className="summary-dot" />
        <span style={{ color: "var(--red)", fontWeight: 600 }}>{urgentSitesCount} urgent</span>
        <span className="summary-dot" />
        <span style={{ color: "var(--grey-hold)", fontWeight: 600 }}>{onHoldSitesCount} on hold</span>
      </div>

      {/* ── CUSTOMER DRAWER ─────────────────────────────────────────── */}
      <div className={`drawer-overlay ${isCustomerDrawerOpen ? "open" : ""}`} onClick={() => setIsCustomerDrawerOpen(false)} />
      <div className={`drawer-container ${isCustomerDrawerOpen ? "open" : ""}`}>
        <form onSubmit={handleSaveCustomer} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="drawer-header">
            <h2>{editingCustomer ? "Edit Customer Details" : "Add New Customer"}</h2>
            <button type="button" className="btn ghost icon" onClick={() => setIsCustomerDrawerOpen(false)}><Icon name="x" size={16} /></button>
          </div>
          <div className="drawer-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="field"><label>Company Name *</label><input type="text" required placeholder="e.g. Woolworths Metro" value={custCompanyName} onChange={(e) => setCustCompanyName(e.target.value)} /></div>
              <div className="field"><label>Contact Person *</label><input type="text" required placeholder="e.g. James Harrington" value={custContact} onChange={(e) => setCustContact(e.target.value)} /></div>
              <div className="field"><label>Phone *</label><input type="text" required placeholder="e.g. 0412 345 678" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} /></div>
              <div className="field"><label>Operating Hours *</label><input type="text" required placeholder="e.g. Mon–Fri 6am–6pm" value={custHours} onChange={(e) => setCustHours(e.target.value)} /></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>Purchase Order Required?</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Drivers will prompt for PO before completing delivery</div>
                </div>
                <label className="switch"><input type="checkbox" checked={custPO} onChange={(e) => setCustPO(e.target.checked)} /><span className="slider" /></label>
              </div>
              <div className="field"><label>Notes (Optional)</label><textarea placeholder="Any special instructions or billing requirements..." value={custNotes} onChange={(e) => setCustNotes(e.target.value)} /></div>

              {!editingCustomer && (
                <div style={{ marginTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                    <input type="checkbox" checked={custAddSiteInline} onChange={(e) => setCustAddSiteInline(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--blue)" }} />
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>This customer also has a site — add site details below</span>
                  </label>
                  {custAddSiteInline && (
                    <div className="drawer-expand-section">
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "13.5px", fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>Site Details</h4>
                      <div className="field"><label>Site Name *</label><input type="text" required={custAddSiteInline} placeholder="e.g. City Ice CBD" value={inlineSiteName} onChange={(e) => setInlineSiteName(e.target.value)} /></div>
                      <div className="field"><label>Suburb *</label><input type="text" required={custAddSiteInline} placeholder="e.g. Melbourne CBD" value={inlineSiteSuburb} onChange={(e) => setInlineSiteSuburb(e.target.value)} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="field"><label>Capacity (Bags)</label><input type="number" min={1} value={inlineSiteCapacity} onChange={(e) => setInlineSiteCapacity(Number(e.target.value))} /></div>
                        <div className="field"><label>Current Stock (Bags)</label><input type="number" min={0} value={inlineSiteCurrent} onChange={(e) => setInlineSiteCurrent(Number(e.target.value))} /></div>
                      </div>
                      <div className="field"><label>Pallet Description</label><input type="text" placeholder="e.g. 2 × Euro Pallets" value={inlineSitePallets} onChange={(e) => setInlineSitePallets(e.target.value)} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="field"><label>Last Delivered</label><input type="date" value={inlineSiteLastDelivered} onChange={(e) => setInlineSiteLastDelivered(e.target.value)} /></div>
                        <div className="field"><label>Scheduled Delivery</label><input type="date" value={inlineSiteScheduled} onChange={(e) => setInlineSiteScheduled(e.target.value)} /></div>
                      </div>
                      <div className="field"><label>Delivery Hours / ETA</label><input type="text" placeholder="e.g. 24/7 or Mon–Fri 6am" value={inlineSiteETA} onChange={(e) => setInlineSiteETA(e.target.value)} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="field"><label>Stock Status</label><select value={inlineSiteStatus} onChange={(e) => setInlineSiteStatus(e.target.value as any)}><option value="green">🟢 Good</option><option value="orange">🟠 Order Soon</option><option value="red">🔴 Urgent</option><option value="hold">⏸ Hold</option></select></div>
                        <div className="field"><label>Reliability</label><select value={inlineSiteReliability} onChange={(e) => setInlineSiteReliability(e.target.value as any)}><option value="reliable">Reliable</option><option value="unreliable">Unreliable</option></select></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "6px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: "12.5px", fontWeight: 500 }}>Has PO?</span><label className="switch"><input type="checkbox" checked={inlineSiteHasPO} onChange={(e) => setInlineSiteHasPO(e.target.checked)} /><span className="slider" /></label></div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--red)" }}>Emergency Flag</span><label className="switch"><input type="checkbox" checked={inlineSiteEmergency} onChange={(e) => setInlineSiteEmergency(e.target.checked)} /><span className="slider" /></label></div>
                      </div>
                      <div className="field"><label>Site Notes</label><textarea placeholder="Loading dock passcode, clearance issues..." value={inlineSiteNotes} onChange={(e) => setInlineSiteNotes(e.target.value)} /></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="drawer-footer">
            <button type="button" className="btn ghost" onClick={() => setIsCustomerDrawerOpen(false)}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save Customer"}</button>
          </div>
        </form>
      </div>

      {/* ── SITE DRAWER ──────────────────────────────────────────────── */}
      <div className={`drawer-overlay ${isSiteDrawerOpen ? "open" : ""}`} onClick={() => setIsSiteDrawerOpen(false)} />
      <div className={`drawer-container ${isSiteDrawerOpen ? "open" : ""}`}>
        <form onSubmit={handleSaveSite} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="drawer-header">
            <h2>{editingSite ? "Edit Site Details" : "Add New Site"}</h2>
            <button type="button" className="btn ghost icon" onClick={() => setIsSiteDrawerOpen(false)}><Icon name="x" size={16} /></button>
          </div>
          <div className="drawer-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="field"><label>Site Name *</label><input type="text" required placeholder="e.g. City Ice CBD" value={siteName} onChange={(e) => setSiteName(e.target.value)} /></div>
              <div className="field"><label>Suburb *</label><input type="text" required placeholder="e.g. Melbourne CBD" value={siteSuburb} onChange={(e) => setSiteSuburb(e.target.value)} /></div>
              <div className="field">
                <label>Customer *</label>
                <select value={siteCustomer} onChange={(e) => setSiteCustomer(e.target.value)} required>
                  {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="+ New Customer">+ New Customer (Bill site directly)</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field"><label>Capacity (Bags)</label><input type="number" min={1} value={siteCapacity} onChange={(e) => { setSiteCapacity(Number(e.target.value)); setSiteRequired(Math.max(0, Number(e.target.value) - siteCurrent)); }} /></div>
                <div className="field"><label>Current Stock (Bags)</label><input type="number" min={0} max={siteCapacity} value={siteCurrent} onChange={(e) => { setSiteCurrent(Number(e.target.value)); setSiteRequired(Math.max(0, siteCapacity - Number(e.target.value))); }} /></div>
              </div>
              <div className="field"><label>Required Stock (auto-calculated)</label><input type="number" readOnly disabled value={siteRequired} style={{ background: "var(--bg-soft)", cursor: "not-allowed" }} /></div>
              <div className="field"><label>Pallet Description</label><input type="text" placeholder="e.g. 2 × Euro Pallets" value={sitePalletDesc} onChange={(e) => setSitePalletDesc(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field"><label>Last Delivered Date</label><input type="text" placeholder="e.g. 14 May" value={siteLastDelivered} onChange={(e) => setSiteLastDelivered(e.target.value)} /></div>
                <div className="field"><label>Scheduled Delivery</label><input type="text" placeholder="e.g. 19 May" value={siteScheduled} disabled={siteStatus === "hold"} onChange={(e) => setSiteScheduled(e.target.value)} style={siteStatus === "hold" ? { background: "var(--bg-soft)", cursor: "not-allowed" } : undefined} /></div>
              </div>
              <div className="field"><label>Delivery Hours / ETA</label><input type="text" placeholder="e.g. Mon–Fri 6am–6pm" value={siteETA} onChange={(e) => setSiteETA(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field"><label>Status</label><select value={siteStatus} onChange={(e) => { const v = e.target.value as any; setSiteStatus(v); if (v === "hold") setSiteScheduled("On hold"); }}><option value="green">🟢 Good</option><option value="orange">🟠 Order Soon</option><option value="red">🔴 Urgent</option><option value="hold">⏸ Hold</option></select></div>
                <div className="field"><label>Stock Reliability</label><select value={siteReliability} onChange={(e) => setSiteReliability(e.target.value as any)}><option value="reliable">Reliable</option><option value="unreliable">Unreliable</option></select></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: "13px", fontWeight: 600 }}>Has Active PO?</div><div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Budget authorized under customer's PO</div></div>
                  <label className="switch"><input type="checkbox" checked={siteHasPO} onChange={(e) => setSiteHasPO(e.target.checked)} /><span className="slider" /></label>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)" }}>Emergency Flag</div><div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Flags for immediate priority routing</div></div>
                  <label className="switch"><input type="checkbox" checked={siteEmergency} onChange={(e) => setSiteEmergency(e.target.checked)} /><span className="slider" /></label>
                </div>
              </div>
              <div className="field"><label>Notes (Optional)</label><textarea placeholder="Gate code, forklift locations, contact schedule..." value={siteNotes} onChange={(e) => setSiteNotes(e.target.value)} /></div>

              {!editingSite && (siteCustomer === "+ New Customer" || siteAddCustomerInline) && (
                <div style={{ marginTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                    <input type="checkbox" checked={siteAddCustomerInline} onChange={(e) => setSiteAddCustomerInline(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--blue)" }} />
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>This site is also a customer (bill directly)</span>
                  </label>
                  {siteAddCustomerInline && (
                    <div className="drawer-expand-section">
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "13.5px", fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>Billing Customer Details</h4>
                      <div className="field"><label>Contact Person *</label><input type="text" required={siteAddCustomerInline} placeholder="e.g. Sandra Liu" value={inlineCustContact} onChange={(e) => setInlineCustContact(e.target.value)} /></div>
                      <div className="field"><label>Phone *</label><input type="text" required={siteAddCustomerInline} placeholder="e.g. 0498 221 009" value={inlineCustPhone} onChange={(e) => setInlineCustPhone(e.target.value)} /></div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: 500 }}>PO Required?</span>
                        <label className="switch"><input type="checkbox" checked={inlineCustPO} onChange={(e) => setInlineCustPO(e.target.checked)} /><span className="slider" /></label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="drawer-footer">
            <button type="button" className="btn ghost" onClick={() => setIsSiteDrawerOpen(false)}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save Site"}</button>
          </div>
        </form>
      </div>

      {/* ── STOCK MODAL ───────────────────────────────────────────────── */}
      {isStockModalOpen && stockEditingSite && (
        <div className="modal-overlay" onClick={() => setIsStockModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveStock}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Update Current Stock</h3>
                <button type="button" className="btn ghost icon" onClick={() => setIsStockModalOpen(false)} style={{ padding: 4 }}><Icon name="x" size={14} /></button>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12.5px", color: "var(--text-subtle)" }}>Site Name</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "2px" }}>{stockEditingSite.name} ({stockEditingSite.suburb})</div>
                </div>
                <div className="field">
                  <label>Current Stock (Bags, max {stockEditingSite.capacity})</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                    <button type="button" className="btn icon" onClick={() => setQuickStockCurrent(Math.max(0, quickStockCurrent - 5))} style={{ padding: 6 }}><Icon name="minus" size={14} /></button>
                    <input type="number" min={0} max={stockEditingSite.capacity} required value={quickStockCurrent} onChange={(e) => setQuickStockCurrent(Number(e.target.value))} style={{ textAlign: "center", fontSize: "16px", fontWeight: 600, width: "100px" }} />
                    <button type="button" className="btn icon" onClick={() => setQuickStockCurrent(Math.min(stockEditingSite.capacity, quickStockCurrent + 5))} style={{ padding: 6 }}><Icon name="plus" size={14} /></button>
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 18px", background: "var(--bg-soft)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="btn ghost sm" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary sm" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
