import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { customersApi, sitesApi, productsApi, driversApi, shipmentsApi, Customer, Site, Product, Driver } from "../services/api";

interface CreateShipmentPanelProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateShipmentPanel = ({ onClose, onCreated }: CreateShipmentPanelProps) => {
  // Data loading states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Searchable Customer State
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Form Field States
  const [siteName, setSiteName] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [productName, setProductName] = useState("Ice Bag 5kg");
  const [quantity, setQuantity] = useState(195);
  const [palletType, setPalletType] = useState("Standard Pallet");
  const [deliveryDate, setDeliveryDate] = useState("Today");
  const [customDate, setCustomDate] = useState("");
  const [timeWindow, setTimeWindow] = useState("Any");
  const [priority, setPriority] = useState("Normal");
  const [driverId, setDriverId] = useState("auto");
  const [poNumber, setPoNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load backend data
  useEffect(() => {
    async function loadData() {
      try {
        const [cList, sList, pList, dList] = await Promise.all([
          customersApi.list(),
          sitesApi.list(),
          productsApi.list(),
          driversApi.list("available")
        ]);
        setCustomers(cList);
        setSites(sList);
        setProducts(pList);
        setDrivers(dList);
        if (pList.length > 0) {
          setProductName(pList[0].name);
        }
      } catch (err) {
        console.error("Failed to load options for shipment creation:", err);
      }
    }
    loadData();
  }, []);

  // Handle outside click to close customer dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update site automatically when customer is selected
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setCustomerSearch(cust.name);
    setIsCustomerDropdownOpen(false);
    
    // Find first site of this customer
    const matchingSites = sites.filter(s => s.customer_id === cust.id);
    if (matchingSites.length > 0) {
      setSiteName(matchingSites[0].name);
      setSelectedSiteId(matchingSites[0].id);
    } else {
      setSiteName(cust.name);
      setSelectedSiteId("");
    }

    if (cust.po) {
      setPoNumber(cust.po);
    }
  };

  // Determine suggested pallet based on product
  const getSuggestedPallet = () => {
    const prodLower = productName.toLowerCase();
    if (prodLower.includes("5kg") && !prodLower.includes("premium")) return "Standard Pallet (Pallet-195)";
    if (prodLower.includes("10kg")) return "Half Pallet (Pallet-120)";
    if (prodLower.includes("crushed")) return "Crushed Ice Pallet (Pallet-180)";
    if (prodLower.includes("block")) return "Block Pallet (Pallet-80)";
    if (prodLower.includes("premium")) return "Premium Mix Pallet (Pallet-150)";
    if (prodLower.includes("dry")) return "Dry Ice Pallet (Pallet-60)";
    return "Standard Pallet (Pallet-195)";
  };

  // Auto-set pallet type suggestion on product selection
  useEffect(() => {
    setPalletType(getSuggestedPallet().split(" (")[0]);
  }, [productName]);

  // Filtered customer list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter sites associated with selected customer
  const customerSites = selectedCustomer
    ? sites.filter(s => s.customer_id === selectedCustomer.id)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setErrorMsg("Please select a valid customer.");
      return;
    }
    if (!siteName.trim()) {
      setErrorMsg("Please provide a delivery site name.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const finalDate = deliveryDate === "Custom" ? customDate : deliveryDate;
      const finalDriverId = driverId === "auto" ? null : driverId;

      await shipmentsApi.create({
        customer_name: selectedCustomer.name,
        site_name: siteName,
        product_name: productName,
        quantity: quantity,
        pallet_type: palletType,
        delivery_date: finalDate,
        time_window: timeWindow.toLowerCase(),
        priority: priority.toLowerCase() as any,
        assigned_driver_id: finalDriverId || undefined,
        po_number: poNumber || undefined,
        special_instructions: specialInstructions || undefined
      });

      onCreated();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create shipment.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: 600, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Create Shipment</h2>
            <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "2px" }}>Add a new shipment to dispatch board</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="x" size={18} /></button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14
        }}>
          {errorMsg && (
            <div style={{
              gridColumn: "1/-1",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#DC2626",
              borderRadius: "6px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500
            }}>
              {errorMsg}
            </div>
          )}

          {/* 1. Customer Searchable Dropdown */}
          <div ref={dropdownRef} className="field" style={{ gridColumn: "1/-1", position: "relative" }}>
            <label>Customer *</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setIsCustomerDropdownOpen(true);
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                placeholder="Search customers..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  outline: "none",
                  fontWeight: 500,
                  color: "var(--text)"
                }}
              />
              <Icon name="search" size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            </div>

            {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                marginTop: "4px",
                maxHeight: "180px",
                overflowY: "auto",
                boxShadow: "var(--shadow-lg)",
                zIndex: 1000
              }}>
                {filteredCustomers.map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    style={{
                      padding: "10px 14px",
                      fontSize: "13.5px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f3f5",
                      fontWeight: 500,
                      color: "var(--text)"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    {cust.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Site */}
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Site / Delivery Location *</label>
            {selectedCustomer ? (
              customerSites.length > 0 ? (
                <select
                  className="select"
                  value={siteName}
                  onChange={(e) => {
                    const selectedSite = customerSites.find(s => s.name === e.target.value);
                    setSiteName(e.target.value);
                    setSelectedSiteId(selectedSite ? selectedSite.id : "");
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none",
                    fontWeight: 600,
                    color: "var(--text)",
                    cursor: "pointer"
                  }}
                >
                  <option value="" disabled>Select a site...</option>
                  {customerSites.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.suburb})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: "13px", color: "#DC2626", fontWeight: 500, padding: "10px 14px", background: "#FEF2F2", borderRadius: "6px", border: "1px solid #FCA5A5" }}>
                  ⚠️ No sites registered for this customer. Please add a site first.
                </div>
              )
            ) : (
              <select
                disabled
                className="select"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "#F1F5F9",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  color: "var(--text-subtle)",
                  cursor: "not-allowed"
                }}
              >
                <option>First, select a customer above...</option>
              </select>
            )}
          </div>

          {/* 3. Product */}
          <div className="field">
            <label>Product *</label>
            <select
              className="select"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#F8FAFC",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13.5px",
                outline: "none",
                fontWeight: 600,
                color: "var(--text)",
                cursor: "pointer"
              }}
            >
              {products.length === 0 ? (
                <option value="" disabled>No products available</option>
              ) : (
                products.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 4. Quantity */}
          <div className="field">
            <label>Quantity *</label>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 5))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "white",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-muted)"
                }}
              >
                <Icon name="minus" size={14} />
              </button>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="number"
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, +e.target.value))}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "9px 40px 9px 12px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    outline: "none",
                    color: "var(--navy-deep)"
                  }}
                />
                <span style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "12px",
                  color: "var(--text-subtle)",
                  pointerEvents: "none"
                }}>bags</span>
              </div>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 5)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "white",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-muted)"
                }}
              >
                <Icon name="plus" size={14} />
              </button>
            </div>
          </div>

          {/* 5. Pallet Type */}
          <div className="field">
            <label>Pallet Type</label>
            <input
              type="text"
              className="input"
              value={palletType}
              onChange={(e) => setPalletType(e.target.value)}
              placeholder="e.g. Standard Pallet"
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#F8FAFC",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13.5px",
                outline: "none",
                fontWeight: 500,
                color: "var(--text)"
              }}
            />
            <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "4px" }}>
              Suggested:{" "}
              <span 
                onClick={() => setPalletType(getSuggestedPallet().split(" (")[0])}
                style={{ color: "var(--blue)", cursor: "pointer", textDecoration: "underline" }}
              >
                {getSuggestedPallet()}
              </span>
            </div>
          </div>

          {/* 6. Delivery Date */}
          <div className="field">
            <label>Delivery Date *</label>
            <div style={{ display: "flex", background: "#f1f3f5", padding: "3px", borderRadius: "8px", marginBottom: deliveryDate === "Custom" ? "4px" : "0" }}>
              {["Today", "Tomorrow", "Custom"].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDeliveryDate(option)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: deliveryDate === option ? "white" : "transparent",
                    color: deliveryDate === option ? "var(--navy)" : "var(--text-muted)",
                    boxShadow: deliveryDate === option ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {deliveryDate === "Custom" && (
              <input
                type="date"
                className="input"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  outline: "none",
                  color: "var(--text)"
                }}
              />
            )}
          </div>

          {/* 7. Time Window */}
          <div className="field">
            <label>Time Window</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Morning", "Afternoon", "Any"].map(win => (
                <button
                  key={win}
                  type="button"
                  onClick={() => setTimeWindow(win)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: timeWindow === win ? "1.5px solid var(--navy)" : "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: timeWindow === win ? "var(--blue-soft)" : "white",
                    color: timeWindow === win ? "var(--navy)" : "var(--text-muted)",
                    transition: "all 0.15s ease"
                  }}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Priority */}
          <div className="field">
            <label>Priority</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { name: "Normal", color: "var(--text-subtle)", bg: "white", activeBg: "#F1F2F4", activeBorder: "#9ca3af" },
                { name: "Urgent", color: "#d97706", bg: "white", activeBg: "#FEF3C7", activeBorder: "#f59e0b" },
                { name: "Emergency", color: "#dc2626", bg: "white", activeBg: "#FEE2E2", activeBorder: "#ef4444" }
              ].map(prio => {
                const active = priority === prio.name;
                return (
                  <button
                    key={prio.name}
                    type="button"
                    onClick={() => setPriority(prio.name)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      border: active ? `1.5px solid ${prio.activeBorder}` : "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: active ? prio.activeBg : "white",
                      color: prio.color,
                      transition: "all 0.15s ease"
                    }}
                  >
                    {prio.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 9. Assign Driver */}
          <div className="field">
            <label>Assign Driver (Optional)</label>
            <select
              className="select"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#F8FAFC",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13.5px",
                outline: "none",
                fontWeight: 500,
                color: "var(--text)",
                cursor: "pointer"
              }}
            >
              <option value="auto">Auto — let Route Planner decide</option>
              {drivers.map(drv => (
                <option key={drv.id} value={drv.id}>
                  {drv.name} ({drv.shift} · {drv.truck || "No truck"})
                </option>
              ))}
            </select>
          </div>

          {/* 10. PO Number */}
          <div className="field">
            <label>PO Number (Optional)</label>
            <input
              type="text"
              className="input"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-44821"
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#F8FAFC",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13.5px",
                outline: "none",
                fontWeight: 500,
                color: "var(--text)"
              }}
            />
          </div>

          {/* 11. Special Instructions */}
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Special Instructions (Optional)</label>
            <textarea
              className="input"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Instructions for driver or warehouse staff..."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "#F8FAFC",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
                color: "var(--text)",
                resize: "none",
                minHeight: "64px"
              }}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end",
          gap: 8
        }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Creating..." : "Create Shipment"}</button>
        </div>
      </div>
    </div>
  );
};
