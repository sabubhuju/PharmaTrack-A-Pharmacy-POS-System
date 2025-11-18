import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function OverviewCards({ stats }) {
  const cardData = [
    { title: "Today's Sales", value: `Rs. ${stats.sales}`, icon: <DollarSign size={20} />, color: "bg-green-500" },
    { title: "Today's Transactions", value: stats.transactions, icon: <ShoppingCart size={20} />, color: "bg-blue-500" },
    { title: "Total Products", value: stats.products, icon: <Package size={20} />, color: "bg-purple-500" },
    { title: "Total Customers", value: stats.customers, icon: <Users size={20} />, color: "bg-cyan-500" },
    { title: "Stock Alerts", value: stats.stockAlerts, icon: <AlertTriangle size={20} />, color: "bg-orange-500" },
    { title: "Critical Alerts", value: stats.criticalAlerts, icon: <TrendingUp size={20} />, color: "bg-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardData.map((item, i) => (
        <div
          key={i}
          className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow duration-300"
        >
          <div>
            <h4 className="text-sm text-gray-500">{item.title}</h4>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
          <div className={`${item.color} text-white p-2 rounded-lg`}>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
