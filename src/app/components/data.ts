// Mock data for the wireframes

export const CUSTOMERS = [
  { id: "C-001", name: "Coles Express — Miranda", po: "PO-44821", hours: "06:00 – 22:00", contact: "Jamie Welsh", phone: "0412 008 441" },
  { id: "C-002", name: "BP Roadhouse — Port Kembla", po: "PO-44822", hours: "24 hours", contact: "Rhea Tan", phone: "0433 112 908" },
  { id: "C-003", name: "IGA — Bulli", po: "", hours: "07:00 – 21:00", contact: "Mark Petrov", phone: "0411 665 290" },
  { id: "C-004", name: "Ampol — Warrawong", po: "PO-44903", hours: "05:00 – 23:00", contact: "Yasmin Lee", phone: "0478 330 114" },
  { id: "C-005", name: "7-Eleven — Figtree", po: "", hours: "24 hours", contact: "Dan Okafor", phone: "0421 500 018" }
];

export const SITES = [
  { id: "S-2044", name: "Coles Express — Miranda", suburb: "Miranda", status: "red" as const, capacity: 480, current: 32, space: 448, required: 448, pallets: "2 × Pallet-195 + 58", lastDelivered: "2 days ago", eta: "Today 11:20", scheduled: "Today", hasPO: true, emergency: false, top: 34, left: 42, allocationCap: 100, stockReliability: "reliable" },
  { id: "S-1198", name: "BP Roadhouse — Port Kembla", suburb: "Port Kembla", status: "red" as const, capacity: 720, current: 96, space: 624, required: 624, pallets: "3 × Pallet-195 + 39", lastDelivered: "3 days ago", eta: "Today 12:45", scheduled: "Today", hasPO: true, emergency: true, top: 62, left: 28, allocationCap: 60, stockReliability: "unreliable" },
  { id: "S-3021", name: "IGA — Bulli", suburb: "Bulli", status: "orange" as const, capacity: 360, current: 142, space: 218, required: 218, pallets: "1 × Pallet-195 + 23", lastDelivered: "Yesterday", eta: "Today 14:10", scheduled: "Today", hasPO: false, emergency: false, top: 48, left: 68, allocationCap: 100, stockReliability: "reliable" },
  { id: "S-4809", name: "Ampol — Warrawong", suburb: "Warrawong", status: "orange" as const, capacity: 300, current: 112, space: 188, required: 188, pallets: "Loose: 188 × 5kg", lastDelivered: "Yesterday", eta: "Today 15:25", scheduled: "Today", hasPO: true, emergency: false, top: 54, left: 48, allocationCap: 50, stockReliability: "unreliable" },
  { id: "S-5502", name: "7-Eleven — Figtree", suburb: "Figtree", status: "green" as const, capacity: 240, current: 188, space: 52, required: 0, pallets: "—", lastDelivered: "Today 07:10", eta: "—", scheduled: "Apr 22", hasPO: false, emergency: false, top: 72, left: 58, allocationCap: 100, stockReliability: "reliable" },
  { id: "S-6140", name: "Coles — Wollongong Central", suburb: "Wollongong", status: "green" as const, capacity: 600, current: 410, space: 190, required: 0, pallets: "—", lastDelivered: "Today 08:30", eta: "—", scheduled: "Apr 23", hasPO: true, emergency: false, top: 42, left: 24, allocationCap: 100, stockReliability: "reliable" },
  { id: "S-7211", name: "Metro Petroleum — Unanderra", suburb: "Unanderra", status: "hold" as const, capacity: 480, current: 120, space: 360, required: 0, pallets: "—", lastDelivered: "Apr 14", eta: "—", scheduled: "On hold", hasPO: false, emergency: false, top: 58, left: 38, allocationCap: 100, stockReliability: "reliable" },
  { id: "S-8055", name: "Shell Coles Express — Albion Park", suburb: "Albion Park", status: "orange" as const, capacity: 360, current: 144, space: 216, required: 216, pallets: "1 × Pallet-195 + 21", lastDelivered: "Yesterday", eta: "Today 16:05", scheduled: "Today", hasPO: false, emergency: false, top: 76, left: 44, allocationCap: 100, stockReliability: "reliable" }
];

export const ROUTES = [
  { id: "RT-101", driver: "Luka M.", truck: "T-02", stops: 4, distance: "92 km", duration: "3h 20m", status: "active" as const, progress: 2, utilisation: 94 },
  { id: "RT-102", driver: "Priya S.", truck: "T-05", stops: 5, distance: "118 km", duration: "4h 05m", status: "active" as const, progress: 1, utilisation: 87 },
  { id: "RT-103", driver: "Devon K.", truck: "T-01", stops: 3, distance: "64 km", duration: "2h 15m", status: "planned" as const, progress: 0, utilisation: 72 },
  { id: "RT-104", driver: "Aisha R.", truck: "T-04", stops: 6, distance: "145 km", duration: "5h 10m", status: "completed" as const, progress: 6, utilisation: 91 }
];

// Employee and Contractor availability data (from roster system)
export const DRIVERS = [
  { id: "DRV-001", name: "Luka Martinovic", type: "contractor" as const, availability: "available" as const, shift: "Morning (6am-2pm)", truck: "T-02", phone: "0422 445 667", certifications: ["HC License", "Forklift"], assigned: "RT-101" },
  { id: "DRV-002", name: "Priya Singh", type: "employee" as const, availability: "available" as const, shift: "Full Day (8am-4pm)", truck: "T-05", phone: "0411 332 998", certifications: ["HC License"], assigned: "RT-102" },
  { id: "DRV-003", name: "Devon Kim", type: "employee" as const, availability: "available" as const, shift: "Afternoon (12pm-8pm)", truck: "T-01", phone: "0433 776 221", certifications: ["HC License", "Dangerous Goods"], assigned: null },
  { id: "DRV-004", name: "Aisha Rahman", type: "employee" as const, availability: "on-route" as const, shift: "Full Day (8am-4pm)", truck: "T-04", phone: "0488 554 332", certifications: ["HC License"], assigned: "RT-104" },
  { id: "DRV-005", name: "Marcus Chen", type: "contractor" as const, availability: "available" as const, shift: "Morning (6am-2pm)", truck: "T-03", phone: "0455 889 443", certifications: ["HC License", "Forklift"], assigned: null },
  { id: "DRV-006", name: "Sarah O'Brien", type: "employee" as const, availability: "on-leave" as const, shift: "—", truck: "—", phone: "0421 667 889", certifications: ["HC License"], assigned: null },
  { id: "DRV-007", name: "Jake Morrison", type: "contractor" as const, availability: "unavailable" as const, shift: "Off roster", truck: "—", phone: "0434 221 556", certifications: ["HC License"], assigned: null },
  { id: "DRV-008", name: "Nina Patel", type: "employee" as const, availability: "available" as const, shift: "Afternoon (12pm-8pm)", truck: "T-06", phone: "0466 332 114", certifications: ["HC License", "Dangerous Goods"], assigned: null },
];

export const NAV = [
  { group: "Overview", items: [
    { id: "dashboard", label: "Home / Dashboard", icon: "home" }]
  },
  { group: "Daily Ops", items: [
    { id: "space-input", label: "Daily Space Input", icon: "clipboard", count: "8" },
    { id: "route-planner", label: "Route Planner", icon: "sparkles", badge: "AI" },
    { id: "active-routes", label: "Active Routes", icon: "truck", count: "2" }]
  },
  { group: "Master Data", items: [
    { id: "customers", label: "Customers & Sites", icon: "building" },
    { id: "fridges", label: "Fridges & Capacity", icon: "fridge" },
    { id: "products", label: "Products & Pallets", icon: "box" },
    { id: "inventory", label: "Inventory", icon: "inventory" }]
  },
  { group: "Finance", items: [
    { id: "invoices", label: "Invoices & Payments", icon: "invoice" }]
  },
  { group: "Insights", items: [
    { id: "reports", label: "Reports & Analytics", icon: "chart" },
    { id: "wastage", label: "Wastage", icon: "bin" }]
  }
];
