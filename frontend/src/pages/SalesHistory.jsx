import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_URL = "http://localhost/pharmatrack/backend/get_sales.php";

  // Fetch sales data
  const fetchSales = async () => {
    try {
      const res = await axios.get(API_URL);
      setSales(res.data);
      setFilteredSales(res.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Filter by date
  useEffect(() => {
    document.title = "PharmaTrack";
    let filtered = [...sales];

    if (startDate && endDate) {
      filtered = filtered.filter((sale) => {
        const date = new Date(sale.sale_date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    setFilteredSales(filtered);
  }, [sales, startDate, endDate]);

  // Delete sale
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await axios({
          method: "DELETE",
          url: API_URL,
          data: { id },
          headers: { "Content-Type": "application/json" },
        });
        fetchSales();
      } catch (error) {
        console.error("Error deleting sale:", error);
        alert("Failed to delete sale. Check console for details.");
      }
    }
  };

  // View receipt
  const handleViewReceipt = (saleId) => {
    window.open(`http://localhost/pharmatrack/backend/receipt.php?id=${saleId}`, "_blank");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">💰 Sales History</h1>

          {/* Date Range Filter */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors border-b">
                    <td className="p-3">{s.customer}</td>
                    <td className="p-3">{s.payment_method}</td>
                    <td className="p-3">₨ {parseFloat(s.subtotal).toFixed(2)}</td>
                    <td className="p-3">₨ {parseFloat(s.discount).toFixed(2)}</td>
                    <td className="p-3 font-semibold text-blue-700">₨ {parseFloat(s.total).toFixed(2)}</td>
                    <td className="p-3">{s.sale_date}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleViewReceipt(s.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Invoice"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Sale"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-4">
                      No sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
