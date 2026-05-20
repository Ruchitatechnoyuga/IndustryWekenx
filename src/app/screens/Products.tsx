import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { productsApi, palletsApi, type Product, type Pallet } from "../services/api";

export const Products = () => {
  const [selectedView, setSelectedView] = useState<"products" | "pallets">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddPallet, setShowAddPallet] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, pl] = await Promise.all([productsApi.list(), palletsApi.list()]);
      setProducts(p);
      setPallets(pl);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleProduct = (id: string) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const toggleAll = () => setSelectedProducts(prev => prev.length === products.length ? [] : products.map(p => p.id));

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const lowStockProducts = products.filter(p => p.status === "low-stock").length;
  const totalStockValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost || 0)), 0);

  return (
    <div className="page">
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSave={loadData} />}
      {showAddPallet && <AddPalletModal onClose={() => setShowAddPallet(false)} onSave={loadData} />}

      <div className="breadcrumbs"><span>Master Data</span><span className="here">Products & Pallets</span></div>

      <div className="page-head">
        <div>
          <h1>Products & Pallets</h1>
          <div className="sub">Manage product catalog, pricing, and pallet configurations</div>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="download" size={14} /> Export Catalog</button>
          <button className="btn primary" onClick={() => selectedView === "products" ? setShowAddProduct(true) : setShowAddPallet(true)}>
            <Icon name="plus" size={14} /> {selectedView === "products" ? "Add Product" : "Add Pallet"}
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="label"><Icon name="box" size={12} /> Total Products</div>
          <div className="value">{totalProducts}</div>
          <div className="delta">{activeProducts} active in catalog</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="alert" size={12} /> Low Stock Items</div>
          <div className="value" style={{ color: lowStockProducts > 0 ? "var(--orange)" : undefined }}>{lowStockProducts}</div>
          <div className="delta down">{lowStockProducts > 0 ? "Needs restocking" : "All stocked"}</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="box" size={12} /> Pallet Types</div>
          <div className="value">{pallets.length}</div>
          <div className="delta">Configurations available</div>
        </div>
        <div className="kpi">
          <div className="label"><Icon name="invoice" size={12} /> Total Stock Value</div>
          <div className="value">${totalStockValue.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="delta">At cost price</div>
        </div>
      </div>

      <div className="card mb-2">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="segmented">
            <button className={`seg ${selectedView === "products" ? "active" : ""}`} onClick={() => setSelectedView("products")}>Products ({products.length})</button>
            <button className={`seg ${selectedView === "pallets" ? "active" : ""}`} onClick={() => setSelectedView("pallets")}>Pallets ({pallets.length})</button>
          </div>
        </div>

        {selectedView === "products" && (
          <>
            <div className="card-head">
              <div><h3>Product Catalog</h3><div className="sub">{loading ? "Loading…" : `${products.length} products`}</div></div>
              <div className="row">
                {selectedProducts.length > 0 && <span className="small muted">{selectedProducts.length} selected</span>}
              </div>
            </div>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}><div className={`cbox ${selectedProducts.length === products.length && products.length > 0 ? "checked" : ""}`} onClick={toggleAll} style={{ cursor: "pointer" }} /></th>
                    <th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>UNIT PRICE</th><th>COST</th><th>STOCK</th><th>PALLET QTY</th><th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Loading…</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No products yet. Add your first product!</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td><div className={`cbox ${selectedProducts.includes(p.id) ? "checked" : ""}`} onClick={() => toggleProduct(p.id)} style={{ cursor: "pointer" }} /></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div className="small muted">{p.supplier || "—"}</div>
                      </td>
                      <td className="mono small">{p.sku || "—"}</td>
                      <td className="small muted">{p.category || "—"}</td>
                      <td className="num mono">${(p.price || 0).toFixed(2)}</td>
                      <td className="num mono muted">${(p.cost || 0).toFixed(2)}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{(p.stock || 0).toLocaleString()}</td>
                      <td className="num muted">{p.pallet_qty || "—"}</td>
                      <td>
                        {p.status === "active" && <span className="chip green"><span className="dot" />Active</span>}
                        {p.status === "low-stock" && <span className="chip orange"><span className="dot" />Low Stock</span>}
                        {p.status === "discontinued" && <span className="chip red"><span className="dot" />Discontinued</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedView === "pallets" && (
          <>
            <div className="card-head">
              <div><h3>Pallet Configurations</h3><div className="sub">{loading ? "Loading…" : `${pallets.length} types`}</div></div>
            </div>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>PALLET TYPE</th><th>CODE</th><th>CAPACITY</th><th>DIMENSIONS</th><th>WEIGHT</th><th>IN STOCK</th><th>LAST USED</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Loading…</td></tr>
                  ) : pallets.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No pallets configured yet.</td></tr>
                  ) : pallets.map(plt => (
                    <tr key={plt.id}>
                      <td style={{ fontWeight: 500 }}>{plt.type}</td>
                      <td className="mono small">{plt.code || "—"}</td>
                      <td className="num">{plt.capacity} bags</td>
                      <td className="small muted">{plt.dimensions || "—"}</td>
                      <td className="small muted">{plt.weight_kg ? `${plt.weight_kg} kg` : "—"}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{plt.in_stock}</td>
                      <td className="small muted">{plt.last_used || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Add Product Modal ─────────────────────────────────────────────────────────
const AddProductModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ name: "", sku: "", category: "", unit: "Bag", price: "", cost: "", stock: "", min_stock: "", pallet_qty: "", supplier: "" });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    await productsApi.create({ name: form.name, sku: form.sku, category: form.category, unit: form.unit, price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0, stock: parseInt(form.stock) || 0, min_stock: parseInt(form.min_stock) || 0, pallet_qty: parseInt(form.pallet_qty) || 0, supplier: form.supplier, status: "active" });
    onSave(); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:540,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Add Product</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div className="field" style={{ gridColumn:"1/-1" }}><label>Product Name *</label><input className="input" value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Ice Bag 5kg" /></div>
          <div className="field"><label>SKU</label><input className="input" value={form.sku} onChange={e => f("sku", e.target.value)} placeholder="ICE-5KG-STD" /></div>
          <div className="field"><label>Category</label><input className="input" value={form.category} onChange={e => f("category", e.target.value)} placeholder="Standard Ice" /></div>
          <div className="field"><label>Unit</label><select className="select" value={form.unit} onChange={e => f("unit", e.target.value)}><option>Bag</option><option>Block</option><option>Pallet</option></select></div>
          <div className="field"><label>Supplier</label><input className="input" value={form.supplier} onChange={e => f("supplier", e.target.value)} /></div>
          <div className="field"><label>Price (AUD)</label><input className="input" type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="0.00" /></div>
          <div className="field"><label>Cost (AUD)</label><input className="input" type="number" value={form.cost} onChange={e => f("cost", e.target.value)} placeholder="0.00" /></div>
          <div className="field"><label>Current Stock</label><input className="input" type="number" value={form.stock} onChange={e => f("stock", e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Min Stock Level</label><input className="input" type="number" value={form.min_stock} onChange={e => f("min_stock", e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Pallet Qty</label><input className="input" type="number" value={form.pallet_qty} onChange={e => f("pallet_qty", e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.name}>{saving ? "Saving…" : "Add Product"}</button>
        </div>
      </div>
    </div>
  );
};

// ── Add Pallet Modal ──────────────────────────────────────────────────────────
const AddPalletModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ type: "", code: "", capacity: "", dimensions: "", weight_kg: "", in_stock: "" });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.type) return;
    setSaving(true);
    await palletsApi.create({ type: form.type, code: form.code, capacity: parseInt(form.capacity) || 0, dimensions: form.dimensions, weight_kg: parseFloat(form.weight_kg) || 0, in_stock: parseInt(form.in_stock) || 0 });
    onSave(); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background:"#fff",borderRadius:12,width:460,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.15)",overflow:"hidden" }}>
        <div style={{ padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontSize:17,fontWeight:700,margin:0 }}>Add Pallet Configuration</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          <div className="field"><label>Pallet Type *</label><input className="input" value={form.type} onChange={e => f("type", e.target.value)} placeholder="e.g. Standard Pallet" /></div>
          <div className="field"><label>Code</label><input className="input" value={form.code} onChange={e => f("code", e.target.value)} placeholder="e.g. Pallet-195" /></div>
          <div className="field"><label>Capacity (bags)</label><input className="input" type="number" value={form.capacity} onChange={e => f("capacity", e.target.value)} /></div>
          <div className="field"><label>Dimensions</label><input className="input" value={form.dimensions} onChange={e => f("dimensions", e.target.value)} placeholder="1165 × 1165 mm" /></div>
          <div className="field"><label>Weight (kg)</label><input className="input" type="number" value={form.weight_kg} onChange={e => f("weight_kg", e.target.value)} /></div>
          <div className="field"><label>In Stock</label><input className="input" type="number" value={form.in_stock} onChange={e => f("in_stock", e.target.value)} /></div>
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving || !form.type}>{saving ? "Saving…" : "Add Pallet"}</button>
        </div>
      </div>
    </div>
  );
};
