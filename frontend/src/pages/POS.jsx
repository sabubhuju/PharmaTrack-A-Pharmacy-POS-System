import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const printRef = useRef();

  const API_URL = "http://localhost/pharmatrack/backend/products.php";

  useEffect(() => {
    document.title = "PharmaTrack";
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((p) =>
      [p.name, p.category, p.barcode, p.generic_name].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addToCart = (product) => {
    // Block expired product
    if (new Date(product.expiry_date) < new Date()) {
      alert("This product is expired and cannot be sold!");
      return;
    }

    // Block if out of stock
    if (Number(product.stock_quantity) <= 0) {
      alert("This product is Out of Stock!");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock_quantity) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        alert("No more stock available!");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    const q = parseInt(qty) || 0;
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: q } : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0
  );
  const total = subtotal - Number(discount || 0);

  const completeAndPrint = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    for (const item of cart) {
      if (!item.quantity || item.quantity <= 0) {
        alert(`Invalid quantity for ${item.name}`);
        return;
      }
      if (item.quantity > Number(item.stock_quantity)) {
        alert(`Not enough stock for ${item.name}`);
        return;
      }
    }

    try {
      await axios.patch(API_URL, { items: cart });

      const saleData = {
        customer: customerName,
        payment_method: paymentMethod,
        subtotal: subtotal,
        tax: 0,
        discount: Number(discount || 0),
        total: total,
        products: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
      };

      await axios.post(
        "http://localhost/pharmatrack/backend/record_sale.php",
        saleData
      );

      await fetchProducts();
      handlePrintThermal();

      setCart([]);
      setDiscount(0);
      setCustomerName("Walk-in Customer");
      setPaymentMethod("Cash");
    } catch (error) {
      console.error("Error completing sale and printing:", error.response || error);
      alert("Error completing sale. Check console for details.");
    }
  };

  const handlePrintThermal = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    const now = new Date();
    const dateTime = now.toLocaleString();

    const thermalStyle = `
      body { font-family: monospace; padding: 10px; width: 80mm; }
      h2 { text-align: center; font-size: 14px; margin-bottom: 5px; }
      .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { text-align: left; padding: 2px 0; }
      th { text-align: left; }
      td.right { text-align: right; }
      .total { font-weight: bold; margin-top: 5px; }
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>${thermalStyle}</style>
        </head>
        <body>
          <h2>PharmaTrack Receipt</h2>
          <p>${dateTime}</p>
          <p>---------------------------------</p>
          ${printContent}
          <p>---------------------------------</p>
          <p style="text-align:center; font-size:12px;">Thank you for your purchase!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">💳 Point of Sale</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* LEFT PANEL */}
            <div className="md:w-2/3 bg-white rounded-lg shadow-lg p-4 flex flex-col">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[70vh]">
                {filteredProducts.slice(0, 8).map((p) => {
                  const isExpired = new Date(p.expiry_date) < new Date();

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isExpired && addToCart(p)}
                      className={`border border-gray-200 rounded-lg p-3 transition-shadow flex flex-col justify-between
                        ${
                          Number(p.stock_quantity) <= 0 || isExpired
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : "cursor-pointer hover:shadow-lg"
                        }
                      `}
                    >
                      <h2 className="font-semibold">{p.name}</h2>
                      <p className="text-sm text-gray-500">{p.category}</p>
                      <p className="text-sm text-gray-600 mt-2">₨ {p.unit_price}</p>

                      <p
                        className={`text-xs mt-1 ${
                          Number(p.stock_quantity) > 0
                            ? "text-green-600"
                            : "text-red-600 font-bold"
                        }`}
                      >
                        {Number(p.stock_quantity) > 0
                          ? `In Stock: ${p.stock_quantity}`
                          : "Out of Stock"}
                      </p>

                      {isExpired && (
                        <p className="text-xs text-red-600 font-bold mt-1">
                          Expired
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="md:w-1/3 bg-white rounded-lg shadow-lg p-4 flex flex-col">

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Customer Name"
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Other</option>
              </select>

              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center mt-4">No products in cart.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center mb-3 border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ₨ {item.unit_price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={item.stock_quantity}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, e.target.value)
                          }
                          className="w-16 border border-gray-300 rounded p-1"
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>₨ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Discount:</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-24 border border-gray-300 rounded p-1"
                  />
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₨ {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={completeAndPrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 w-full"
                >
                  Complete & Print Receipt
                </button>
              </div>

              {/* PRINT AREA */}
              <div ref={printRef} className="hidden">
                <p>Customer: {customerName}</p>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="right">Qty</th>
                      <th className="right">Price</th>
                      <th className="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="right">{item.quantity}</td>
                        <td className="right">₨ {item.unit_price}</td>
                        <td className="right">
                          ₨ {(item.unit_price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>---------------------------------</p>
                <p>Subtotal: ₨ {subtotal.toFixed(2)}</p>
                <p>Discount: ₨ {discount.toFixed(2)}</p>
                <p>Total: ₨ {total.toFixed(2)}</p>
                <p>Payment Method: {paymentMethod}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
