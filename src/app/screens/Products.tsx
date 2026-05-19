import { useState } from "react";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";

export const Products = () => {
  const [selectedView, setSelectedView] = useState<"products" | "pallets">("products");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const products = [
    { id: "PRD-001", name: "Ice Bag 5kg", sku: "ICE-5KG-STD", category: "Standard Ice", unit: "Bag", price: 4.50, cost: 2.20, stock: 12450, minStock: 5000, status: "active", palletQty: 195, supplier: "IceCo Pty Ltd" },
    { id: "PRD-002", name: "Ice Bag 10kg", sku: "ICE-10KG-STD", category: "Standard Ice", unit: "Bag", price: 8.50, cost: 4.10, stock: 8920, minStock: 3000, status: "active", palletQty: 120, supplier: "IceCo Pty Ltd" },
    { id: "PRD-003", name: "Ice Bag 5kg Premium", sku: "ICE-5KG-PREM", category: "Premium Ice", unit: "Bag", price: 5.75, cost: 2.80, stock: 3200, minStock: 2000, status: "active", palletQty: 195, supplier: "Crystal Ice Co" },
    { id: "PRD-004", name: "Crushed Ice 5kg", sku: "ICE-5KG-CRUSH", category: "Crushed Ice", unit: "Bag", price: 5.25, cost: 2.50, stock: 1850, minStock: 2500, status: "low-stock", palletQty: 180, supplier: "IceCo Pty Ltd" },
    { id: "PRD-005", name: "Ice Block 10kg", sku: "ICE-10KG-BLOCK", category: "Ice Blocks", unit: "Block", price: 9.50, cost: 4.50, stock: 2100, minStock: 1500, status: "active", palletQty: 80, supplier: "Arctic Ice Supply" },
    { id: "PRD-006", name: "Party Ice Mix 7kg", sku: "ICE-7KG-PARTY", category: "Premium Ice", unit: "Bag", price: 6.95, cost: 3.30, stock: 890, minStock: 1000, status: "low-stock", palletQty: 150, supplier: "Crystal Ice Co" },
    { id: "PRD-007", name: "Dry Ice 5kg", sku: "DRY-5KG-STD", category: "Dry Ice", unit: "Block", price: 15.00, cost: 8.50, stock: 450, minStock: 500, status: "low-stock", palletQty: 60, supplier: "Dry Ice Solutions" },
    { id: "PRD-008", name: "Ice Bag 20kg Commercial", sku: "ICE-20KG-COM", category: "Commercial", unit: "Bag", price: 16.00, cost: 7.80, stock: 1560, minStock: 1000, status: "active", palletQty: 65, supplier: "IceCo Pty Ltd" },
  ];

  const pallets = [
    { id: "PLT-001", type: "Standard Pallet", code: "Pallet-195", capacity: 195, dimensions: "1165 × 1165 mm", weight: "975 kg", inStock: 45, products: ["PRD-001", "PRD-003"], lastUsed: "Today" },
    { id: "PLT-002", type: "Half Pallet", code: "Pallet-120", capacity: 120, dimensions: "800 × 1165 mm", weight: "600 kg", inStock: 28, products: ["PRD-002"], lastUsed: "Today" },
    { id: "PLT-003", type: "Crushed Ice Pallet", code: "Pallet-180", capacity: 180, dimensions: "1165 × 1165 mm", weight: "900 kg", inStock: 12, products: ["PRD-004"], lastUsed: "Yesterday" },
    { id: "PLT-004", type: "Block Pallet", code: "Pallet-80", capacity: 80, dimensions: "1000 × 1200 mm", weight: "800 kg", inStock: 18, products: ["PRD-005"], lastUsed: "Today" },
    { id: "PLT-005", type: "Premium Mix Pallet", code: "Pallet-150", capacity: 150, dimensions: "1165 × 1165 mm", weight: "750 kg", inStock: 8, products: ["PRD-006"], lastUsed: "2 days ago" },
    { id: "PLT-006", type: "Dry Ice Pallet", code: "Pallet-60", capacity: 60, dimensions: "800 × 1200 mm", weight: "300 kg", inStock: 5, products: ["PRD-007"], lastUsed: "Yesterday" },
    { id: "PLT-007", type: "Commercial Pallet", code: "Pallet-65", capacity: 65, dimensions: "1200 × 1200 mm", weight: "1300 kg", inStock: 22, products: ["PRD-008"], lastUsed: "Today" },
  ];

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedProducts(prev =>
      prev.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const lowStockProducts = products.filter(p => p.status === "low-stock").length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <span>Master Data</span>
        <span className="here">Products & Pallets</span>
      </div>

      <div className="page-head">
        <div>
          <h1>Products & Pallets</h1>
          <div className="sub">Manage product catalog, pricing, and pallet configurations</div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="download" size={14} /> Export Catalog
          </button>
          <button className="btn primary">
            <Icon name="plus" size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label">
            <Icon name="box" size={12} /> Total Products
          </div>
          <div className="value">{totalProducts}</div>
          <div className="delta">{activeProducts} active in catalog</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="alert" size={12} /> Low Stock Items
          </div>
          <div className="value" style={{ color: "var(--orange)" }}>{lowStockProducts}</div>
          <div className="delta">Require restock attention</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="invoice" size={12} /> Stock Value
          </div>
          <div className="value">${(totalStockValue / 1000).toFixed(1)}k</div>
          <div className="delta">At cost price</div>
        </div>
        <div className="kpi">
          <div className="label">
            <Icon name="truck" size={12} /> Pallet Types
          </div>
          <div className="value">{pallets.length}</div>
          <div className="delta">Standard configurations</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${selectedView === "products" ? "active" : ""}`}
          onClick={() => setSelectedView("products")}
        >
          <Icon name="box" size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Products Catalog
        </div>
        <div
          className={`tab ${selectedView === "pallets" ? "active" : ""}`}
          onClick={() => setSelectedView("pallets")}
        >
          <Icon name="grid" size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Pallet Configurations
        </div>
      </div>

      {selectedView === "products" ? (
        <>
          {/* Filters */}
          <div className="card mb-2">
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="field" style={{ margin: 0, flex: 1, maxWidth: 200 }}>
                <select className="select" style={{ minWidth: 0 }}>
                  <option>All Categories</option>
                  <option>Standard Ice</option>
                  <option>Premium Ice</option>
                  <option>Crushed Ice</option>
                  <option>Ice Blocks</option>
                  <option>Dry Ice</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0, flex: 1, maxWidth: 180 }}>
                <select className="select" style={{ minWidth: 0 }}>
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0, flex: 1, maxWidth: 180 }}>
                <select className="select" style={{ minWidth: 0 }}>
                  <option>All Suppliers</option>
                  <option>IceCo Pty Ltd</option>
                  <option>Crystal Ice Co</option>
                  <option>Arctic Ice Supply</option>
                  <option>Dry Ice Solutions</option>
                </select>
              </div>
              <div className="topbar search" style={{ flex: 1, margin: 0, maxWidth: 300 }}>
                <Icon name="search" size={14} />
                <span>Search product name or SKU...</span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button className="btn sm">
                  <Icon name="filter" size={12} /> More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Product Catalog</h3>
                <div className="sub">{products.length} products in system</div>
              </div>
              <div className="row">
                <span className="small muted">{selectedProducts.length} selected</span>
                {selectedProducts.length > 0 && (
                  <>
                    <button className="btn sm">
                      <Icon name="edit" size={12} /> Bulk Edit
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
                        className={`cbox ${selectedProducts.length === products.length ? "checked" : ""}`}
                        onClick={toggleAll}
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th>PRODUCT NAME</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>COST</th>
                    <th>MARGIN</th>
                    <th>STOCK</th>
                    <th>PALLET QTY</th>
                    <th>STATUS</th>
                    <th style={{ width: 60 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const margin = ((product.price - product.cost) / product.price * 100).toFixed(0);
                    const stockPercent = (product.stock / product.minStock * 100);

                    return (
                      <tr key={product.id}>
                        <td>
                          <div
                            className={`cbox ${selectedProducts.includes(product.id) ? "checked" : ""}`}
                            onClick={() => toggleProduct(product.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div className="small muted">{product.id}</div>
                        </td>
                        <td className="mono small">{product.sku}</td>
                        <td className="muted small">{product.category}</td>
                        <td className="num mono" style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                        <td className="num mono muted">${product.cost.toFixed(2)}</td>
                        <td className="num">
                          <span className="chip green" style={{ padding: "2px 8px" }}>{margin}%</span>
                        </td>
                        <td className="num">
                          <div className="mono" style={{ fontWeight: 500 }}>{product.stock.toLocaleString()}</div>
                          <div className="small" style={{ color: stockPercent < 100 ? "var(--orange)" : "var(--text-muted)" }}>
                            Min: {product.minStock.toLocaleString()}
                          </div>
                        </td>
                        <td className="num mono">{product.palletQty}</td>
                        <td>
                          {product.status === "active" && (
                            <span className="chip green">
                              <span className="dot" />
                              Active
                            </span>
                          )}
                          {product.status === "low-stock" && (
                            <span className="chip orange">
                              <span className="dot" />
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td>
                          <button className="btn ghost sm">
                            <Icon name="dots" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Insights */}
          <div className="grid-2 mt-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>Top Selling Products</h3>
                  <div className="sub">By volume last 30 days</div>
                </div>
              </div>
              <div className="card-body">
                {products.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="between" style={{ padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <div className="row" style={{ gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--blue-soft)", color: "var(--blue)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                        <div className="small muted">{p.sku}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontWeight: 600 }}>{(Math.random() * 5000 + 1000).toFixed(0)} units</div>
                      <div className="small muted">${(p.price * (Math.random() * 5000 + 1000)).toFixed(0)} revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3>Stock Alerts</h3>
                  <div className="sub">Items requiring attention</div>
                </div>
              </div>
              <div className="card-body">
                {products.filter(p => p.status === "low-stock").map((p) => (
                  <div key={p.id} className="banner orange" style={{ marginBottom: 10 }}>
                    <Icon name="alert" size={14} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                      <div className="small">Stock: {p.stock} bags (Min: {p.minStock}) · Reorder needed</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Pallets View */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Pallet Configurations</h3>
                <div className="sub">{pallets.length} standard pallet types configured</div>
              </div>
              <button className="btn primary sm">
                <Icon name="plus" size={12} /> Add Pallet Type
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, padding: 18 }}>
                {pallets.map((pallet) => (
                  <div key={pallet.id} className="card" style={{ border: "1px solid var(--border)", margin: 0 }}>
                    <div className="card-head" style={{ padding: "12px 14px" }}>
                      <div>
                        <h3 style={{ fontSize: 14 }}>{pallet.type}</h3>
                        <div className="sub mono" style={{ fontSize: 11 }}>{pallet.code}</div>
                      </div>
                      <button className="btn ghost sm icon">
                        <Icon name="edit" size={14} />
                      </button>
                    </div>
                    <div className="card-body" style={{ padding: "12px 14px" }}>
                      <div className="grid-2 mb-2" style={{ gap: 12 }}>
                        <div>
                          <div className="small muted">Capacity</div>
                          <div style={{ fontWeight: 600, fontSize: 16 }} className="mono">{pallet.capacity} bags</div>
                        </div>
                        <div>
                          <div className="small muted">In Stock</div>
                          <div style={{ fontWeight: 600, fontSize: 16 }} className="mono">{pallet.inStock}</div>
                        </div>
                      </div>
                      <div className="divider" style={{ margin: "8px 0" }} />
                      <div className="col" style={{ gap: 6, fontSize: 12 }}>
                        <div className="between">
                          <span className="muted">Dimensions</span>
                          <span className="mono">{pallet.dimensions}</span>
                        </div>
                        <div className="between">
                          <span className="muted">Max Weight</span>
                          <span className="mono">{pallet.weight}</span>
                        </div>
                        <div className="between">
                          <span className="muted">Last Used</span>
                          <span style={{ fontWeight: 500 }}>{pallet.lastUsed}</span>
                        </div>
                      </div>
                      <div className="divider" style={{ margin: "8px 0" }} />
                      <div>
                        <div className="small muted mb-1">Compatible Products</div>
                        <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                          {pallet.products.map(pid => {
                            const prod = products.find(p => p.id === pid);
                            return prod ? (
                              <span key={pid} className="chip blue" style={{ padding: "2px 6px", fontSize: 10 }}>
                                {prod.sku}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pallet Statistics */}
          <div className="grid-2 mt-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>Pallet Usage Overview</h3>
                  <div className="sub">Distribution by type</div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, paddingTop: 20 }}>
                  {pallets.map((pallet, i) => {
                    const maxStock = Math.max(...pallets.map(p => p.inStock));
                    const height = (pallet.inStock / maxStock) * 140;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div className="small muted" style={{ fontSize: 10 }}>{pallet.inStock}</div>
                        <div
                          style={{
                            width: "100%",
                            height: `${height}px`,
                            background: "var(--blue)",
                            borderRadius: "6px 6px 0 0",
                            transition: "height 0.3s ease"
                          }}
                        />
                        <div className="small muted" style={{ fontWeight: 500, fontSize: 9, textAlign: "center", lineHeight: 1.2 }}>
                          {pallet.code}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3>Pallet Efficiency</h3>
                  <div className="sub">Average utilization metrics</div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid-2" style={{ gap: 16 }}>
                  <div>
                    <div className="small muted">Avg Load Capacity</div>
                    <div style={{ fontSize: 24, fontWeight: 600 }} className="mono">94%</div>
                  </div>
                  <div>
                    <div className="small muted">Pallets/Route</div>
                    <div style={{ fontSize: 24, fontWeight: 600 }} className="mono">12.5</div>
                  </div>
                  <div>
                    <div className="small muted">Most Used</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Pallet-195</div>
                  </div>
                  <div>
                    <div className="small muted">Total Capacity</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }} className="mono">23,865 bags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
