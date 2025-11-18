import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    generic_name: "",
    category: "other",
    unit_price: "",
    cost_price: "",
    stock_quantity: "",
    reorder_level: "",
    expiry_date: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost/pharmatrack/backend/products.php";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(API_URL, form, {
          headers: { "Content-Type": "application/json" },
        });
        setIsEditing(false);
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "application/json" },
        });
      }

      setForm({
        id: "",
        name: "",
        generic_name: "",
        category: "other",
        unit_price: "",
        cost_price: "",
        stock_quantity: "",
        reorder_level: "",
        expiry_date: "",
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to add/update product. Check console for error.");
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(API_URL, { data: { id }, headers: { "Content-Type": "application/json" } });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Fuzzy search: first 3 letters must match
  const similarity = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    const longerLength = longer.length;

    const editDistance = (a, b) => {
      const dp = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          dp[i][j] =
            a[i - 1] === b[j - 1]
              ? dp[i - 1][j - 1]
              : Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
        }
      }
      return dp[a.length][b.length];
    };
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  };

  const handleSearch = (term) => {
    if (!term) {
      setFilteredProducts(products);
      return;
    }

    const results = products
      .map((p) => {
        const fields = [p.name, p.category, p.generic_name];
        let maxScore = 0;
        fields.forEach((field) => {
          if (field && field.toLowerCase().startsWith(term.slice(0, 3).toLowerCase())) {
            const score = similarity(field, term);
            if (score > maxScore) maxScore = score;
          }
        });
        return { ...p, searchScore: maxScore };
      })
      .filter((p) => p.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);

    setFilteredProducts(results);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-6">
       
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">📦 Stock Management</h1>
            <div className="flex gap-3 flex-col md:flex-row w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name, category, or generic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showForm ? "Close Form" : "Add Product"}
              </button>
            </div>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg p-6 rounded-lg mb-6 grid grid-cols-2 gap-4"
            >
              {Object.keys(form).map(
                (key) =>
                  key !== "id" && (
                    <div key={key}>
                      <label className="block text-sm font-medium capitalize mb-1">
                        {key.replace("_", " ")}
                      </label>
                      <input
                        type={key.includes("date") ? "date" : "text"}
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )
              )}
              <div className="col-span-2 text-right mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isEditing ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="w-full min-w-max text-left border-collapse">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredProducts.length > 0 ? filteredProducts : products).map(
                  (p) => (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3">{p.stock_quantity}</td>
                      <td className="p-3">₨ {p.unit_price}</td>
                      <td className="p-3">{p.expiry_date}</td>
                      <td className="p-3 flex gap-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      No products available.
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
