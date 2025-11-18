import { useEffect, useState } from "react";
import OverviewCards from "../components/OverviewCards";
import DashboardCharts from "../components/DashboardCharts";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sales: 0,
    transactions: 0,
    products: 0,
    customers: 0,
    stockAlerts: 0,
    criticalAlerts: 0,
  });
  const [weeklySales, setWeeklySales] = useState([]); // <-- for line chart
  const [user, setUser] = useState(null);

  useEffect(() => {

    document.title = "PharmaTrack";
    // Get logged-in user
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser) {
      navigate("/"); 
    } else {
      setUser(loggedInUser);
    }

    // Fetch dashboard stats
    axios
      .get("http://localhost/pharmatrack/backend/get_dashboard_data.php")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));

    // Fetch weekly sales for line chart
    axios
      .get("http://localhost/pharmatrack/backend/get_weekly_sales.php")
      .then((res) => setWeeklySales(res.data))
      .catch((err) => console.error("Error fetching weekly sales:", err));
  }, [navigate]);

  if (!user) return null; 

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Topbar />

        <main className="p-8">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-gray-800" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 mb-3">
            Welcome back, {user.name}! Here's what's happening today.
          </p>

          <OverviewCards stats={stats} />

          <DashboardCharts weeklySales={weeklySales} />
        </main>
      </div>
    </div>
  );
}
