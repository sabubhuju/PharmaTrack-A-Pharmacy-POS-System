import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsReports() {
  const [data, setData] = useState({
    summary: {},
    topProducts: [],
    inventory: {},
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
        document.title = "PharmaTrack";

    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost/pharmatrack/backend/analytics.php");
      setData(res.data || { summary: {}, topProducts: [], inventory: {} });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    
      setData({ summary: {}, topProducts: [], inventory: {} });
    } finally {
      setLoading(false);
    }
  };

  const { summary, topProducts, inventory } = data;

  return (
    <div className="flex min-h-screen bg-gray-50">
  
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="ml-64 p-6 flex-1">
          <h1 className="text-2xl font-bold mb-6">📊 Analytics & Reports</h1>

          {loading ? (
            <p className="text-gray-500">Loading analytics...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Total Sales</p>
                  <h2 className="text-3xl font-bold text-blue-600">
                    {summary.total_sales || 0}
                  </h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Total Revenue</p>
                  <h2 className="text-3xl font-bold text-green-600">
                    ₨ {summary.total_revenue ? summary.total_revenue.toFixed(2) : "0.00"}
                  </h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Avg Order Value</p>
                  <h2 className="text-3xl font-bold text-indigo-600">
                    ₨ {summary.avg_order_value ? summary.avg_order_value.toFixed(2) : "0.00"}
                  </h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Total Inventory Value</p>
                  <h2 className="text-3xl font-bold text-amber-600">
                    ₨ {inventory.total_value ? inventory.total_value.toFixed(2) : "0.00"}
                  </h2>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">🔥 Top Selling Products</h2>
                {topProducts && topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_sold" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center">No sales data available yet.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4">📦 Inventory Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Total Products in Stock</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {inventory.total_items || 0}
                    </h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Total Stock Value</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      ₨ {inventory.total_value ? inventory.total_value.toFixed(2) : "0.00"}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
