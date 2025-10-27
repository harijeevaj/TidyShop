import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import CryptoJS from "crypto-js";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const SECRET_KEY = "TidyPharmaKey123";

  useEffect(() => {
    fetchOrders();
  }, []);
const fetchOrders = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/admin/orders");
    const bytes = CryptoJS.AES.decrypt(response.data.payload, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    console.log("🟢 Decrypted response:", decryptedText); // Add this
    const decryptedData = JSON.parse(decryptedText);

    if (decryptedData.success) {
      setOrders(decryptedData.data);
    } else {
      console.error("Decryption failed:", decryptedData.message);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
};

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put("http://localhost:5000/api/admin/order/status", {
        order_id: orderId,
        status: newStatus,
      });

      const bytes = CryptoJS.AES.decrypt(response.data.payload, SECRET_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData.success) {
        alert(`✅ Order #${orderId} updated to ${newStatus}`);
        fetchOrders(); // Refresh orders after update
      } else {
        alert("❌ Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-4">
        <h3 className="text-center text-primary fw-bold mb-4">📦 Manage Orders (Admin)</h3>

        {loading ? (
          <p className="text-center text-muted">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted">No orders found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-primary text-center">
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Total (₹)</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_id}</td>
                    <td>{order.name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.total_price}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "Delivered"
                            ? "bg-success"
                            : order.status === "Shipping"
                            ? "bg-info text-dark"
                            : order.status === "Pending"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.status || "Pending"}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
