// Static demo data shown on Vercel (no backend needed)

export const MOCK_CUSTOMERS = [
  { id:"C-001", name:"Shell Albion Park", contact:"James Wilson", phone:"0412 345 678", poRequired:true, hours:"Mon-Sun 6am-10pm", notes:"Large volume client" },
  { id:"C-002", name:"BP Dapto", contact:"Sarah Chen", phone:"0423 456 789", poRequired:false, hours:"24/7", notes:"" },
  { id:"C-003", name:"7-Eleven Wollongong", contact:"Mike Torres", phone:"0434 567 890", poRequired:false, hours:"24/7", notes:"" },
];

export const MOCK_SITES = [
  { id:"S-001", customer_id:"C-001", name:"Shell Albion Park", suburb:"Albion Park", customerName:"Shell Albion Park", status:"red", capacity:500, current:80, palletDesc:"Pallet-195", lastDelivered:"2 days ago", scheduled:"Today", deliveryHours:"6am-10pm", hasPO:true, emergency:true, stockReliability:"reliable", notes:"", map_top:42, map_left:38 },
  { id:"S-002", customer_id:"C-001", name:"Shell Shellharbour", suburb:"Shellharbour", customerName:"Shell Albion Park", status:"orange", capacity:300, current:110, palletDesc:"Pallet-120", lastDelivered:"Yesterday", scheduled:"Tomorrow", deliveryHours:"6am-8pm", hasPO:true, emergency:false, stockReliability:"reliable", notes:"", map_top:62, map_left:55 },
  { id:"S-003", customer_id:"C-002", name:"BP Dapto", suburb:"Dapto", customerName:"BP Dapto", status:"green", capacity:400, current:320, palletDesc:"Pallet-195", lastDelivered:"Today", scheduled:"In 3 days", deliveryHours:"24/7", hasPO:false, emergency:false, stockReliability:"reliable", notes:"", map_top:35, map_left:62 },
  { id:"S-004", customer_id:"C-003", name:"7-Eleven Crown St", suburb:"Wollongong", customerName:"7-Eleven Wollongong", status:"orange", capacity:200, current:55, palletDesc:"Pallet-120", lastDelivered:"3 days ago", scheduled:"Today", deliveryHours:"24/7", hasPO:false, emergency:false, stockReliability:"sometimes-off", notes:"", map_top:28, map_left:45 },
];

export const MOCK_DRIVERS = [
  { id:"D-001", name:"Luka Martinovic", type:"contractor" as const, availability:"available" as const, shift:"Morning (6am-2pm)", truck:"T-01", phone:"0411 111 111", certifications:["HC","FR"], assigned_route:null },
  { id:"D-002", name:"Priya Singh", type:"employee" as const, availability:"available" as const, shift:"Morning (6am-2pm)", truck:"T-02", phone:"0422 222 222", certifications:["HC"], assigned_route:null },
  { id:"D-003", name:"Devon Kim", type:"employee" as const, availability:"on-route" as const, shift:"Afternoon (2pm-10pm)", truck:"T-03", phone:"0433 333 333", certifications:["MR"], assigned_route:"RT-001" },
  { id:"D-004", name:"Nina Patel", type:"contractor" as const, availability:"on-leave" as const, shift:"Morning (6am-2pm)", truck:"T-04", phone:"0444 444 444", certifications:["HC","FR"], assigned_route:null },
];

export const MOCK_VEHICLES = [
  { id:"V-001", code:"T-01", type:"Refrigerated Truck", capacity:100, status:"Active" },
  { id:"V-002", code:"T-02", type:"Refrigerated Truck", capacity:100, status:"Active" },
  { id:"V-003", code:"T-03", type:"Van", capacity:40, status:"On Road" },
  { id:"V-004", code:"T-04", type:"Refrigerated Truck", capacity:100, status:"Inactive" },
];

export const MOCK_ROUTES = [
  {
    id:"RT-001", driver_id:"D-003", driver_name:"Devon Kim", truck:"T-03",
    status:"active" as const, stops_total:4, stops_done:2,
    distance_km:92, duration:"3h 20m", utilisation:88,
    route_date:new Date().toISOString().split("T")[0], published:1,
    stops: [
      { id:1, route_id:"RT-001", site_id:"S-004", site_name:"7-Eleven Crown St",  stop_order:1, bags:55,  eta:"09:15", status:"delivered" as const, notes:"" },
      { id:2, route_id:"RT-001", site_id:"S-001", site_name:"Shell Albion Park",   stop_order:2, bags:195, eta:"10:10", status:"delivered" as const, notes:"" },
      { id:3, route_id:"RT-001", site_id:"S-003", site_name:"BP Dapto",             stop_order:3, bags:120, eta:"11:30", status:"pending"   as const, notes:"" },
      { id:4, route_id:"RT-001", site_id:"S-002", site_name:"Shell Shellharbour",   stop_order:4, bags:120, eta:"12:45", status:"pending"   as const, notes:"" },
    ]
  },
  {
    id:"RT-002", driver_id:"D-002", driver_name:"Priya Singh", truck:"T-02",
    status:"planned" as const, stops_total:3, stops_done:0,
    distance_km:67, duration:"2h 30m", utilisation:72,
    route_date:new Date().toISOString().split("T")[0], published:0,
    stops: [
      { id:5, route_id:"RT-002", site_id:"S-001", site_name:"Shell Albion Park",  stop_order:1, bags:120, eta:"13:00", status:"pending" as const, notes:"" },
      { id:6, route_id:"RT-002", site_id:"S-004", site_name:"7-Eleven Crown St",  stop_order:2, bags:40,  eta:"13:45", status:"pending" as const, notes:"" },
      { id:7, route_id:"RT-002", site_id:"S-003", site_name:"BP Dapto",            stop_order:3, bags:80,  eta:"14:30", status:"pending" as const, notes:"" },
    ]
  },
];

export const MOCK_PRODUCTS = [
  { id:"PRD-001", name:"Ice Bag 5kg", sku:"ICE-5KG-STD", category:"Standard Ice", unit:"Bag", price:4.50, cost:2.20, stock:12450, min_stock:5000, status:"active" as const, pallet_qty:195, supplier:"IceCo Pty Ltd" },
  { id:"PRD-002", name:"Ice Bag 10kg", sku:"ICE-10KG-STD", category:"Standard Ice", unit:"Bag", price:8.50, cost:4.10, stock:8920, min_stock:3000, status:"active" as const, pallet_qty:120, supplier:"IceCo Pty Ltd" },
  { id:"PRD-003", name:"Crushed Ice 5kg", sku:"ICE-5KG-CRUSH", category:"Crushed Ice", unit:"Bag", price:5.25, cost:2.50, stock:1850, min_stock:2500, status:"low-stock" as const, pallet_qty:180, supplier:"IceCo Pty Ltd" },
  { id:"PRD-004", name:"Ice Block 10kg", sku:"ICE-10KG-BLK", category:"Ice Blocks", unit:"Block", price:9.50, cost:4.50, stock:2100, min_stock:1500, status:"active" as const, pallet_qty:80, supplier:"Arctic Ice Supply" },
];

export const MOCK_PALLETS = [
  { id:"PLT-001", type:"Standard Pallet", code:"Pallet-195", capacity:195, dimensions:"1165 × 1165 mm", weight_kg:975, in_stock:45, last_used:"Today" },
  { id:"PLT-002", type:"Half Pallet", code:"Pallet-120", capacity:120, dimensions:"800 × 1165 mm", weight_kg:600, in_stock:28, last_used:"Today" },
  { id:"PLT-003", type:"Block Pallet", code:"Pallet-80", capacity:80, dimensions:"1000 × 1200 mm", weight_kg:800, in_stock:18, last_used:"Yesterday" },
];

export const MOCK_INVOICES = [
  { id:"INV-0001", customer_id:"C-001", customer:"Shell Albion Park", invoice_date:"2026-05-15", due_days:"30d", subtotal:932.50, gst:93.25, total:1025.75, status:"paid" as const, notes:"" },
  { id:"INV-0002", customer_id:"C-002", customer:"BP Dapto", invoice_date:"2026-05-14", due_days:"30d", subtotal:1090.00, gst:109.00, total:1199.00, status:"paid" as const, notes:"" },
  { id:"INV-0003", customer_id:"C-003", customer:"7-Eleven Wollongong", invoice_date:"2026-05-13", due_days:"30d", subtotal:195.00, gst:19.50, total:214.50, status:"overdue" as const, notes:"" },
  { id:"INV-0004", customer_id:"C-001", customer:"Shell Albion Park", invoice_date:"2026-05-10", due_days:"30d", subtotal:456.00, gst:45.60, total:501.60, status:"pending" as const, notes:"" },
];

export const MOCK_INVOICE_SUMMARY = {
  total_outstanding:716.10, total_overdue:214.50, last_30_days:2940.85,
  invoice_count:4, paid_count:2, overdue_count:1, pending_count:1, draft_count:0,
};

export const MOCK_WAREHOUSE = [
  { product_name:"Ice Bag 5kg", stock:12450, min_stock:5000 },
  { product_name:"Ice Bag 10kg", stock:8920, min_stock:3000 },
  { product_name:"Crushed Ice 5kg", stock:1850, min_stock:2500 },
  { product_name:"Ice Block 10kg", stock:2100, min_stock:1500 },
];

export const MOCK_TRUCKS = [
  { id:1, truck_code:"T-01", driver_name:"Luka Martinovic", bags:450, status:"Active" },
  { id:2, truck_code:"T-02", driver_name:"Priya Singh", bags:320, status:"Active" },
  { id:3, truck_code:"T-03", driver_name:"Devon Kim", bags:180, status:"Active" },
];

export const MOCK_MOVEMENTS = [
  { id:1, movement_date:"2026-05-20", movement_time:"09:15", type:"Stock In", product_id:"PRD-001", product_name:"Ice Bag 5kg", quantity:500, location:"Main Warehouse", recorded_by:"Admin", notes:"" },
  { id:2, movement_date:"2026-05-20", movement_time:"08:45", type:"Truck Load", product_id:"PRD-001", product_name:"Ice Bag 5kg", quantity:-120, location:"T-01", recorded_by:"Luka Martinovic", notes:"" },
  { id:3, movement_date:"2026-05-19", movement_time:"05:20", type:"Return", product_id:"PRD-002", product_name:"Ice Bag 10kg", quantity:15, location:"Main Warehouse", recorded_by:"Devon Kim", notes:"" },
];

export const MOCK_FRIDGES = [
  { id:"F-001", customer:"Shell Albion Park", branch:"Albion Park", label:"Fridge A", room:"Main", current:320, total:500, status:"Well Stocked", status_color:"green", active:1 },
  { id:"F-002", customer:"BP Dapto", branch:"Dapto", label:"Fridge B", room:"Cold Room", current:85, total:300, status:"Low Stock", status_color:"orange", active:1 },
  { id:"F-003", customer:"7-Eleven Wollongong", branch:"Crown St", label:"Fridge C", room:"Main", current:20, total:200, status:"Critical", status_color:"red", active:1 },
];

export const MOCK_FRIDGE_STATS = { total_fridges:3, total_capacity:1000, current_stock:425, occupancy_pct:43, low_stock_alerts:2 };

export const MOCK_TANKS = [
  { id:"TK-001", name:"T1: ULP91", product:"ULP91", color:"#3b82f6", capacity:20000, current:15200, water_mm:0, status:"Normal" },
  { id:"TK-002", name:"T2: Diesel", product:"Diesel", color:"#ef4444", capacity:20000, current:7800, water_mm:2, status:"Low" },
  { id:"TK-003", name:"T3: ULP98", product:"ULP98", color:"#10b981", capacity:15000, current:12400, water_mm:0, status:"Normal" },
];

export const MOCK_DASHBOARD = {
  kpis:{ urgent_sites:2, order_soon_sites:1, active_routes:1, total_routes:2, bags_delivered:1068, bags_yesterday:2340 },
  attention_sites: MOCK_SITES.filter(s => s.status === "red" || s.status === "orange"),
  todays_routes: MOCK_ROUTES,
  sites: MOCK_SITES,
};

export const MOCK_REPORT_SUMMARY = { bags_delivered:2340, revenue:2940.85, routes_completed:1, routes_total:2, active_customers:3 };
export const MOCK_TOP_CUSTOMERS = [
  { customer:"Shell Albion Park", revenue:1527.35, invoice_count:2 },
  { customer:"BP Dapto", revenue:1199.00, invoice_count:1 },
  { customer:"7-Eleven Wollongong", revenue:214.50, invoice_count:1 },
];
export const MOCK_DRIVER_PERF = [
  { driver_name:"Devon Kim", routes_count:1, stops_done:2, stops_total:4 },
  { driver_name:"Priya Singh", routes_count:1, stops_done:0, stops_total:3 },
];

export const MOCK_SHIPMENTS = [
  {
    id:"SHP-001", customer_id:"C-001", customer_name:"Shell Albion Park",
    site_id:"S-001", site_name:"Shell Albion Park",
    product_id:"PRD-001", product_name:"Ice Bag 5kg",
    quantity:195, pallet_type:"Pallet-195",
    delivery_date:new Date().toISOString().split("T")[0],
    time_window:"6am-10pm", priority:"Emergency" as const,
    assigned_driver_id:"D-003", assigned_driver_name:"Devon Kim",
    po_number:"PO-4421", special_instructions:"Leave at side entrance if unattended",
    status:"in-transit" as const, route_id:"RT-001", invoice_id:null,
    created_at:new Date(Date.now()-3*3600000).toISOString(),
    updated_at:new Date(Date.now()-30*60000).toISOString(),
  },
  {
    id:"SHP-002", customer_id:"C-001", customer_name:"Shell Albion Park",
    site_id:"S-002", site_name:"Shell Shellharbour",
    product_id:"PRD-001", product_name:"Ice Bag 5kg",
    quantity:120, pallet_type:"Pallet-195",
    delivery_date:new Date().toISOString().split("T")[0],
    time_window:"6am-8pm", priority:"Urgent" as const,
    assigned_driver_id:"D-003", assigned_driver_name:"Devon Kim",
    po_number:"PO-4422", special_instructions:"",
    status:"in-transit" as const, route_id:"RT-001", invoice_id:null,
    created_at:new Date(Date.now()-3*3600000).toISOString(),
    updated_at:new Date(Date.now()-30*60000).toISOString(),
  },
  {
    id:"SHP-003", customer_id:"C-003", customer_name:"7-Eleven Wollongong",
    site_id:"S-004", site_name:"7-Eleven Crown St",
    product_id:"PRD-001", product_name:"Ice Bag 5kg",
    quantity:55, pallet_type:"Pallet-120",
    delivery_date:new Date().toISOString().split("T")[0],
    time_window:"24/7", priority:"Urgent" as const,
    assigned_driver_id:null, assigned_driver_name:null,
    po_number:undefined, special_instructions:"Call ahead — site manager required",
    status:"queued" as const, route_id:null, invoice_id:null,
    created_at:new Date(Date.now()-2*3600000).toISOString(),
    updated_at:new Date(Date.now()-2*3600000).toISOString(),
  },
  {
    id:"SHP-004", customer_id:"C-002", customer_name:"BP Dapto",
    site_id:"S-003", site_name:"BP Dapto",
    product_id:"PRD-002", product_name:"Ice Bag 10kg",
    quantity:120, pallet_type:"Pallet-120",
    delivery_date:new Date().toISOString().split("T")[0],
    time_window:"24/7", priority:"Normal" as const,
    assigned_driver_id:"D-002", assigned_driver_name:"Priya Singh",
    po_number:undefined, special_instructions:"",
    status:"assigned" as const, route_id:"RT-002", invoice_id:null,
    created_at:new Date(Date.now()-2.5*3600000).toISOString(),
    updated_at:new Date(Date.now()-1.5*3600000).toISOString(),
  },
  {
    id:"SHP-005", customer_id:"C-003", customer_name:"7-Eleven Wollongong",
    site_id:"S-004", site_name:"7-Eleven Crown St",
    product_id:"PRD-001", product_name:"Ice Bag 5kg",
    quantity:40, pallet_type:"Pallet-120",
    delivery_date:new Date().toISOString().split("T")[0],
    time_window:"24/7", priority:"Normal" as const,
    assigned_driver_id:null, assigned_driver_name:null,
    po_number:undefined, special_instructions:"",
    status:"new" as const, route_id:null, invoice_id:null,
    created_at:new Date(Date.now()-30*60000).toISOString(),
    updated_at:new Date(Date.now()-30*60000).toISOString(),
  },
  {
    id:"SHP-006", customer_id:"C-002", customer_name:"BP Dapto",
    site_id:"S-003", site_name:"BP Dapto",
    product_id:"PRD-003", product_name:"Crushed Ice 5kg",
    quantity:80, pallet_type:"Pallet-80",
    delivery_date:new Date(Date.now()-86400000).toISOString().split("T")[0],
    time_window:"24/7", priority:"Normal" as const,
    assigned_driver_id:"D-001", assigned_driver_name:"Luka Martinovic",
    po_number:undefined, special_instructions:"",
    status:"delivered" as const, route_id:"RT-003", invoice_id:null,
    created_at:new Date(Date.now()-27*3600000).toISOString(),
    updated_at:new Date(Date.now()-16*3600000).toISOString(),
  },
  {
    id:"SHP-007", customer_id:"C-001", customer_name:"Shell Albion Park",
    site_id:"S-001", site_name:"Shell Albion Park",
    product_id:"PRD-002", product_name:"Ice Bag 10kg",
    quantity:240, pallet_type:"Pallet-120",
    delivery_date:new Date(Date.now()-86400000).toISOString().split("T")[0],
    time_window:"6am-10pm", priority:"Normal" as const,
    assigned_driver_id:"D-001", assigned_driver_name:"Luka Martinovic",
    po_number:"PO-4418", special_instructions:"",
    status:"invoiced" as const, route_id:"RT-003", invoice_id:"INV-0001",
    created_at:new Date(Date.now()-28*3600000).toISOString(),
    updated_at:new Date(Date.now()-14*3600000).toISOString(),
  },
];
