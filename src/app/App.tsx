import { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./screens/Dashboard";
import { SpaceInput } from "./screens/SpaceInput";
import { RoutePlanner } from "./screens/RoutePlanner";
import { Shipments } from "./screens/Shipments";
import { Invoices } from "./screens/Invoices";
import { Products } from "./screens/Products";
import { Reports } from "./screens/Reports";
import { Fridges } from "./screens/Fridges";
import { Inventory } from "./screens/Inventory";
import { Placeholder } from "./screens/Placeholder";
import { CustomersSites } from "./screens/CustomersSites";
import { DriversVehicles } from "./screens/DriversVehicles";
import { CreateShipmentPanel } from "./components/CreateShipmentPanel";

const SCREENS: Record<string, { comp: (onNav?: (route: string) => void) => JSX.Element; label: string }> = {
  "dashboard": { comp: (onNav) => <Dashboard onNav={onNav} />, label: "Home / Dashboard" },
  "space-input": { comp: () => <SpaceInput />, label: "Daily Space Input" },
  "route-planner": { comp: () => <RoutePlanner />, label: "Route Planner" },
  "active-routes": { comp: () => <Shipments />, label: "Shipments" },
  "customers": { comp: () => <CustomersSites />, label: "Customers & Sites" },
  "drivers": { comp: () => <DriversVehicles />, label: "Drivers & Vehicles" },
  "invoices": { comp: () => <Invoices />, label: "Invoices & Payments" },
  "fridges": { comp: () => <Fridges />, label: "Fridges & Capacity" },
  "products": { comp: () => <Products />, label: "Products & Pallets" },
  "inventory": { comp: () => <Inventory />, label: "Inventory" },
  "reports": { comp: () => <Reports />, label: "Reports & Analytics" },
  "wastage": { comp: () => <Placeholder title="Wastage" sub="Damaged or melted stock recorded by drivers & warehouse staff" module="Wastage Recording (part of Module 05)" />, label: "Wastage" }
};

export default function App() {
  const [route, setRoute] = useState(() => localStorage.getItem("wkx_route") || "dashboard");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("wkx_route", route);
  }, [route]);

  const handleNav = (target: string) => {
    if (target === "create-shipment") {
      setIsCreateOpen(true);
    } else {
      setRoute(target);
    }
  };

  const S = SCREENS[route] || SCREENS.dashboard;

  return (
    <div className="app">
      <TopBar current={route} onNav={handleNav} />
      <Sidebar current={route} onNav={handleNav} />
      <div className="main" key={route}>{S.comp(handleNav)}</div>

      {isCreateOpen && (
        <CreateShipmentPanel 
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            window.dispatchEvent(new Event("shipment-created"));
          }}
        />
      )}
    </div>
  );
}