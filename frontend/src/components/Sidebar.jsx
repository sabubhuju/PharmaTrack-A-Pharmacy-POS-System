import { LayoutDashboard, ShoppingCart, Users, Boxes, AlertTriangle, Brain, BarChart3, Receipt, Settings, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const topMenuItems = [
  { name: "Overview", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { name: "Point of Sale", icon: <ShoppingCart size={18} />, path: "/pos" },
  { name: "Customers", icon: <Users size={18} />, path: "/customers" },
  { name: "Stock Management", icon: <Boxes size={18} />, path: "/stock" },
  { name: "Stock Alerts", icon: <AlertTriangle size={18} />, path: "/alerts" },
  { name: "Analytics & Reports", icon: <BarChart3 size={18} />, path: "/reports" },
  { name: "Transaction History", icon: <Receipt size={18} />, path: "/transactions" },
];

const bottomMenuItems = [
  { name: "User Profile", icon: <User size={18} />, path: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
    
      <nav className="flex-1 flex flex-col justify-between mt-22 px-4">
      
        <div className="flex flex-col">
          {topMenuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-4 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col mb-4">
          {bottomMenuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-4 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
