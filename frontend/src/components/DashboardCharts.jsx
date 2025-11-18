import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardCharts({ weeklySales }) {
  if (!weeklySales || weeklySales.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 text-center text-gray-500">
        No sales data available for the chart.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Sales</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={weeklySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `₨ ${parseFloat(value).toFixed(2)}`} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
