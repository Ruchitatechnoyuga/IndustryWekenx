// api.ts – ArcticStream frontend API service layer
// All components should import from here instead of using hardcoded data.ts

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = <T>(path: string)                      => apiFetch<T>(path);
const post = <T>(path: string, body: unknown)       => apiFetch<T>(path, { method: "POST",  body: JSON.stringify(body) });
const put  = <T>(path: string, body: unknown)       => apiFetch<T>(path, { method: "PUT",   body: JSON.stringify(body) });
const patch= <T>(path: string, body?: unknown)      => apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del  = <T>(path: string)                      => apiFetch<T>(path, { method: "DELETE" });

// ═════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
export const dashboardApi = {
  getOverview: () => get<DashboardData>("/dashboard"),
};

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ═════════════════════════════════════════════════════════════════════════════
export const customersApi = {
  list:   ()              => get<Customer[]>("/customers"),
  get:    (id: string)    => get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => post<{ id: string }>("/customers", data),
  update: (id: string, data: Partial<Customer>) => put<{ updated: boolean }>(`/customers/${id}`, data),
  remove: (id: string)    => del<{ deleted: boolean }>(`/customers/${id}`),
};

// ═════════════════════════════════════════════════════════════════════════════
//  SITES
// ═════════════════════════════════════════════════════════════════════════════
export const sitesApi = {
  list:        (status?: string) => get<Site[]>(`/sites${status ? `?status=${status}` : ""}`),
  get:         (id: string)      => get<Site>(`/sites/${id}`),
  create:      (data: Partial<Site>) => post<{ id: string }>("/sites", data),
  update:      (id: string, data: Partial<Site>) => put<{ updated: boolean }>(`/sites/${id}`, data),
  updateStock: (id: string, stock: number, status: string) =>
    patch<{ updated: boolean }>(`/sites/${id}/stock`, { current_stock: stock, status }),
  remove:      (id: string) => del<{ deleted: boolean }>(`/sites/${id}`),
};

// ═════════════════════════════════════════════════════════════════════════════
//  DRIVERS
// ═════════════════════════════════════════════════════════════════════════════
export const driversApi = {
  list:               (availability?: string) =>
    get<Driver[]>(`/drivers${availability ? `?availability=${availability}` : ""}`),
  get:                (id: string)    => get<Driver>(`/drivers/${id}`),
  create:             (data: Partial<Driver>) => post<{ id: string }>("/drivers", data),
  update:             (id: string, data: Partial<Driver>) => put<{ updated: boolean }>(`/drivers/${id}`, data),
  updateAvailability: (id: string, availability: string, assigned_route?: string | null) =>
    patch<{ updated: boolean }>(`/drivers/${id}/availability`, { availability, assigned_route }),
};

// ═════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═════════════════════════════════════════════════════════════════════════════
export const routesApi = {
  list:         (date?: string, status?: string) => {
    const params = new URLSearchParams();
    if (date)   params.set("date", date);
    if (status) params.set("status", status);
    const qs = params.toString();
    return get<Route[]>(`/routes${qs ? `?${qs}` : ""}`);
  },
  get:          (id: string)     => get<Route>(`/routes/${id}`),
  create:       (data: Partial<Route>) => post<{ id: string }>("/routes", data),
  publish:      (route_ids: string[]) => post<{ published: number }>("/routes/publish", { route_ids }),
  suggest:      ()               => post<RouteSuggestion>("/routes/suggest", {}),
  updateStop:   (routeId: string, stopId: number, status: string) =>
    patch<StopUpdateResult>(`/routes/${routeId}/stops/${stopId}`, { status }),
};

// ═════════════════════════════════════════════════════════════════════════════
//  PRODUCTS & PALLETS
// ═════════════════════════════════════════════════════════════════════════════
export const productsApi = {
  list:         (params?: { category?: string; status?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string,string>).toString() : "";
    return get<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },
  get:          (id: string)     => get<Product>(`/products/${id}`),
  create:       (data: Partial<Product>) => post<{ id: string }>("/products", data),
  update:       (id: string, data: Partial<Product>) => put<{ updated: boolean }>(`/products/${id}`, data),
  adjustStock:  (id: string, delta: number) => patch<{ stock: number; status: string }>(`/products/${id}/stock`, { delta }),
  remove:       (id: string)     => del<{ deleted: boolean }>(`/products/${id}`),
};

export const palletsApi = {
  list:   ()              => get<Pallet[]>("/pallets"),
  update: (id: string, data: Partial<Pallet>) => put<{ updated: boolean }>(`/pallets/${id}`, data),
};

// ═════════════════════════════════════════════════════════════════════════════
//  INVENTORY
// ═════════════════════════════════════════════════════════════════════════════
export const inventoryApi = {
  getWarehouse:   ()              => get<WarehouseStock[]>("/inventory/warehouse"),
  getTrucks:      ()              => get<TruckStock[]>("/inventory/trucks"),
  getMovements:   (params?: { limit?: number; type?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string,string>).toString() : "";
    return get<InventoryMovement[]>(`/inventory/movements${qs ? `?${qs}` : ""}`);
  },
  addMovement:    (data: Partial<InventoryMovement>) => post<{ id: number }>("/inventory/movements", data),
  updateTruck:    (id: number, bags: number, status: string) =>
    put<{ updated: boolean }>(`/inventory/trucks/${id}`, { bags, status }),
};

// ═════════════════════════════════════════════════════════════════════════════
//  INVOICES
// ═════════════════════════════════════════════════════════════════════════════
export const invoicesApi = {
  list:         (status?: string) => get<Invoice[]>(`/invoices${status ? `?status=${status}` : ""}`),
  get:          (id: string)      => get<Invoice>(`/invoices/${id}`),
  create:       (data: Partial<Invoice>) => post<{ id: string }>("/invoices", data),
  updateStatus: (id: string, status: string) =>
    patch<{ updated: boolean; status: string }>(`/invoices/${id}/status`, { status }),
  remove:       (id: string)      => del<{ deleted: boolean }>(`/invoices/${id}`),
  getSummary:   ()                => get<InvoiceSummary>("/invoices/stats/summary"),
};

// ═════════════════════════════════════════════════════════════════════════════
//  FRIDGES
// ═════════════════════════════════════════════════════════════════════════════
export const fridgesApi = {
  list:         (active?: boolean) =>
    get<Fridge[]>(`/fridges${active !== undefined ? `?active=${active}` : ""}`),
  getStats:     ()                 => get<FridgeStats>("/fridges/stats"),
  update:       (id: string, data: Partial<Fridge>) => put<{ updated: boolean }>(`/fridges/${id}`, data),
  updateStock:  (id: string, current: number) =>
    patch<{ updated: boolean; status: string; occupancy: number }>(`/fridges/${id}/stock`, { current }),
};

// ═════════════════════════════════════════════════════════════════════════════
//  FUEL TANKS (Space Input)
// ═════════════════════════════════════════════════════════════════════════════
export const tanksApi = {
  list:        ()              => get<FuelTank[]>("/tanks"),
  update:      (id: string, current: number, water_mm?: number, recorded_by?: string) =>
    patch<{ updated: boolean; status: string; percentage: number }>(
      `/tanks/${id}`, { current, water_mm, recorded_by }
    ),
  getHistory:  (id: string, days?: number) =>
    get<SpaceReading[]>(`/tanks/${id}/history${days ? `?limit=${days}` : ""}`),
  bulkSave:    (readings: { tank_id: string; current: number; water_mm?: number }[], recorded_by?: string) =>
    post<{ saved: number }>("/tanks/bulk-save", { readings, recorded_by }),
};

// ═════════════════════════════════════════════════════════════════════════════
//  REPORTS
// ═════════════════════════════════════════════════════════════════════════════
export const reportsApi = {
  getDailyStats:       (days?: number)  => get<DailyStat[]>(`/reports/daily-stats${days ? `?days=${days}` : ""}`),
  getSummary:          ()               => get<ReportSummary>("/reports/summary"),
  getTopCustomers:     (limit?: number) => get<TopCustomer[]>(`/reports/top-customers${limit ? `?limit=${limit}` : ""}`),
  getDriverPerformance:()               => get<DriverPerformance[]>("/reports/driver-performance"),
};

// ═════════════════════════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════════
export interface Customer {
  id: string; name: string; po: string; hours: string; contact: string; phone: string;
}
export interface Site {
  id: string; customer_id: string; name: string; suburb: string;
  status: "red" | "orange" | "green" | "hold";
  capacity: number; current_stock: number; required: number;
  pallets_desc: string; last_delivered: string; eta: string; scheduled: string;
  has_po: number; emergency: number;
  map_top: number; map_left: number;
  allocation_cap: number; stock_reliability: string;
}
export interface Driver {
  id: string; name: string; type: "employee" | "contractor";
  availability: "available" | "on-route" | "on-leave" | "unavailable";
  shift: string; truck: string; phone: string;
  certifications: string[]; assigned_route: string | null;
}
export interface Route {
  id: string; driver_id: string; driver_name?: string; truck: string;
  status: "planned" | "active" | "completed" | "cancelled";
  stops_total: number; stops_done: number;
  distance_km: number; duration: string; utilisation: number;
  route_date: string; published: number;
  stops?: RouteStop[];
}
export interface RouteStop {
  id: number; route_id: string; site_id: string; site_name?: string;
  stop_order: number; eta: string; bags: number;
  status: "pending" | "delivered" | "skipped";
}
export interface RouteSuggestion {
  routes: Array<{ driver_id: string; driver_name: string; truck: string; stops: RouteStop[]; total_bags: number; utilisation: number }>;
  sites_covered: number; drivers_used: number;
}
export interface StopUpdateResult { updated: boolean; stops_done: number; route_status: string; }
export interface Product {
  id: string; name: string; sku: string; category: string; unit: string;
  price: number; cost: number; stock: number; min_stock: number;
  status: "active" | "low-stock" | "out-of-stock" | "discontinued";
  pallet_qty: number; supplier: string;
}
export interface Pallet {
  id: string; type: string; code: string; capacity: number;
  dimensions: string; weight_kg: number; in_stock: number; last_used: string;
  products?: { id: string; name: string; sku: string }[];
}
export interface WarehouseStock {
  id: string; name: string; stock: number; min_stock: number; status: string;
}
export interface TruckStock {
  id: number; truck_code: string; driver_name: string; bags: number; status: string;
}
export interface InventoryMovement {
  id?: number; movement_date: string; movement_time: string; type: string;
  product_id?: string; product_name: string; quantity: number;
  location: string; recorded_by: string; notes?: string;
}
export interface Invoice {
  id: string; customer_id?: string; customer: string; invoice_date: string;
  due_days: string; subtotal: number; gst: number; total: number;
  status: "draft" | "pending" | "paid" | "overdue";
  notes?: string; items?: InvoiceItem[];
}
export interface InvoiceItem {
  id?: number; description: string; product_id?: string;
  quantity: number; unit_price: number; line_total: number;
}
export interface InvoiceSummary {
  outstanding: number; overdue: number; last_30_days: number;
  total_count: number; total_paid: number;
}
export interface Fridge {
  id: string; customer: string; branch: string; label: string; room: string;
  current: number; total: number; status: string; status_color: string; active: number;
}
export interface FridgeStats {
  total_fridges: number; total_capacity: number; current_stock: number;
  occupancy_pct: number; low_stock_alerts: number;
}
export interface FuelTank {
  id: string; name: string; product: string; color: string;
  capacity: number; current: number; water_mm: number; status: string;
  latest_reading?: SpaceReading | null;
}
export interface SpaceReading {
  id: number; tank_id: string; reading: number; water_mm: number;
  recorded_by: string; reading_date: string; reading_time: string;
}
export interface DashboardData {
  sites: Site[]; routes: Route[];
  kpis: { urgent_sites: number; order_soon_sites: number; active_routes: number; total_routes: number; bags_delivered: number; bags_yesterday: number };
}
export interface DailyStat {
  stat_date: string; bags_delivered: number; routes_total: number;
  routes_completed: number; revenue: number; sites_urgent: number; sites_order_soon: number;
}
export interface ReportSummary {
  total_revenue_month: number; bags_delivered_today: number; routes_today: number;
  active_routes: number; urgent_sites: number; order_soon_sites: number;
  total_outstanding_invoices: number; low_stock_products: number;
}
export interface TopCustomer { customer: string; revenue: number; invoice_count: number; }
export interface DriverPerformance {
  id: string; name: string; routes_total: number; deliveries: number; on_time_pct: number;
}

// ═════════════════════════════════════════════════════════════════════════════
//  SHIPMENTS
// ═════════════════════════════════════════════════════════════════════════════
export interface Shipment {
  id: string;
  customer_id: string;
  customer_name: string;
  site_id: string;
  site_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  pallet_type: string;
  delivery_date: string;
  time_window: string;
  priority: "Normal" | "Urgent" | "Emergency" | "normal" | "urgent" | "emergency";
  assigned_driver_id?: string | null;
  assigned_driver_name?: string | null;
  po_number?: string;
  special_instructions?: string;
  status: "new" | "queued" | "assigned" | "in-transit" | "delivered" | "invoiced";
  route_id?: string | null;
  invoice_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const shipmentsApi = {
  list:   (status?: string) => get<Shipment[]>(`/shipments${status ? `?status=${status}` : ""}`),
  get:    (id: string)      => get<Shipment>(`/shipments/${id}`),
  create: (data: Partial<Shipment>) => post<{ id: string }>("/shipments", data),
  updateStatus: (id: string, status: string, route_id?: string | null) => 
    patch<{ updated: boolean; status: string }>(`/shipments/${id}/status`, { status, route_id }),
  remove: (id: string)    => del<{ deleted: boolean }>(`/shipments/${id}`),
};

