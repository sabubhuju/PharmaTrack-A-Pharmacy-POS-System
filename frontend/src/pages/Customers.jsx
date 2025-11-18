import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost/pharmatrack/backend/customers.php";

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(API_URL);
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
     document.title = "PharmaTrack";
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((c) =>
      [c.name, c.email, c.phone].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await axios.put(API_URL, form);
        setIsEditing(false);
      } else {
        await axios.post(API_URL, form);
      }

      setForm({ id: "", name: "", email: "", phone: "" });
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error.response?.data || error);
      alert("Failed to save customer. Check console.");
    }
  };

  const handleEdit = (customer) => {
    setForm(customer);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(API_URL, { data: { id } });
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error);
      alert("Failed to delete customer.");
    }
  };

  return (
    
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">👥 Customer Management</h1>
            <div className="flex gap-3 flex-col md:flex-row w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showForm ? "Close Form" : "Add Customer"}
              </button>
            </div>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg p-6 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="col-span-2 text-right mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isEditing ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="w-full min-w-max text-left border-collapse">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredCustomers.length > 0 ? filteredCustomers : customers).map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      No customers available.
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
