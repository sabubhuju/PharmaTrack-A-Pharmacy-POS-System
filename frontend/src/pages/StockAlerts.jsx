import React, { useEffect, useState } from "react"; 
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axios from "axios";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function StockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  const API_URL = "http://localhost/pharmatrack/backend/products.php";

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Heuristic function to calculate priority
  const heuristicPriority = (product) => {
    const today = new Date();
    const expiryDate = new Date(product.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    let score = 0;

    // Stock urgency heuristic
    if (product.stock_quantity <= 20) score += 50;

    // Expiry urgency heuristic
    if (daysToExpiry <= 0) score += 100; // expired
    else if (daysToExpiry <= 14) score += 80; // expiring within 2 weeks

    score += Math.max(0, 20 - product.stock_quantity); // extra for very low stock
    score += Math.max(0, 14 - daysToExpiry); // extra for soon-to-expire

    return score;
  };

  const getAlertType = (product) => {
    const today = new Date();
    const expiryDate = new Date(product.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysToExpiry <= 0) return "expired";
    if (daysToExpiry <= 14) return "expiringSoon";
    if (product.stock_quantity <= 20) return "lowStock";
    return "normal";
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(API_URL);
      const products = res.data;

      const alertsList = products
        .map((p) => {
          const priority = heuristicPriority(p);
          const alertType = getAlertType(p);

          if (priority > 0) return { ...p, priority, alertType };
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority); // highest heuristic first

      setAlerts(alertsList);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const markResolved = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.alertType === filter);

  const getAlertColor = (type) => {
    switch (type) {
      case "expired":
        return "bg-red-50 border border-red-200";
      case "expiringSoon":
        return "bg-yellow-50 border border-yellow-200";
      case "lowStock":
        return "bg-orange-50 border border-orange-200";
      default:
        return "bg-gray-50 border border-gray-200";
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case "expired":
        return <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">CRITICAL</span>;
      case "expiringSoon":
        return <span className="bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded">EXPIRING SOON</span>;
      case "lowStock":
        return <span className="bg-orange-400 text-black text-xs font-semibold px-2 py-1 rounded">LOW STOCK</span>;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "expired":
        return <XCircle className="text-red-600 w-5 h-5" />;
      case "expiringSoon":
        return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
      case "lowStock":
        return <AlertTriangle className="text-orange-500 w-5 h-5" />;
      default:
        return <CheckCircle className="text-green-600 w-5 h-5" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-1">⚠️ Stock Alerts</h1>
          <p className="text-gray-500 mb-4">Monitor low stock, expiring, and expired products</p>

          <div className="flex gap-2 mb-6">
            {[
              { label: "All Alerts", value: "all" },
              { label: "Low Stock", value: "lowStock" },
              { label: "Expiring Soon", value: "expiringSoon" },
              { label: "Expired", value: "expired" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded border text-sm font-medium ${
                  filter === tab.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">🎉 No alerts at the moment!</p>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg flex justify-between items-center ${getAlertColor(alert.alertType)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.alertType)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-gray-800">{alert.name}</h2>
                        {getAlertBadge(alert.alertType)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {alert.alertType === "expired"
                          ? `EXPIRED: ${alert.name} expired on ${alert.expiry_date}`
                          : alert.alertType === "expiringSoon"
                          ? `Expiring soon: ${alert.name} expires on ${alert.expiry_date}`
                          : `Low stock alert for ${alert.name}`}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Stock: {alert.stock_quantity}</p>
                        <p>Expires: {new Date(alert.expiry_date).toLocaleDateString()}</p>
                        <p>Checked: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
