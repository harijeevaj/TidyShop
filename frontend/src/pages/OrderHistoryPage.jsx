import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const SECRET_KEY = "TidyPharmaKey123";
  const sessionData = localStorage.getItem("user_session");
const user_id = sessionData ? JSON.parse(sessionData).user_id : null;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/order/history/${user_id}`);
      const bytes = CryptoJS.AES.decrypt(response.data.payload, SECRET_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData.success) {
        setOrders(decryptedData.data);
      } else {
        console.error("Decryption failed:", decryptedData.message);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="container my-5">
      <div className="order-card p-4 shadow-lg rounded-4">
        <h2 className="text-center text-primary fw-bold mb-4">
          🛍️ Order History
        </h2>

        {loading ? (
          <p className="text-center text-muted fs-5">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted fs-5">
            You haven’t placed any orders yet.
          </p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Medicine Name</th>
                    <th>Quantity</th>
                    <th>Total Amount (₹)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, visibleCount).map((order) => (
                    <tr
                      key={order.id}
                      className="order-row"
                    >
                      <td className="fw-semibold text-primary">#{order.id}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>{order.name}</td>
                      <td>{order.quantity}</td>
                      <td className="fw-bold">₹{order.total_price}</td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            order.status === "Delivered"
                              ? "bg-success"
                              : order.status === "Pending"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill me-2"
                          onClick={() =>
                            alert(`Viewing details for Order #${order.id}`)
                          }
                        >
                          🔍 View
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm rounded-pill"
                          onClick={() =>
                            alert(`Reordering medicine ID #${order.medicine_id}`)
                          }
                        >
                          🔄 Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleCount < orders.length && (
              <div className="text-center mt-4">
                <button
                  className="btn btn-primary rounded-pill px-5 py-2 shadow-sm"
                  onClick={handleLoadMore}
                >
                  Load More ⬇
                </button>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-5">
          <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
            ⬅ Go Back Home
          </Link>
        </div>
      </div>

      <style jsx="true">{`
        .order-card {
          background: #ffffff;
          border-radius: 1.5rem;
          transition: all 0.3s ease;
        }

        .order-row:hover {
          background-color: #f1f8ff;
          transform: scale(1.01);
          transition: 0.2s ease;
        }

        table {
          border-radius: 0.75rem;
          overflow: hidden;
        }

        th {
          background-color: #007bff;
          color: white;
          font-weight: 600;
        }

        td {
          vertical-align: middle !important;
        }

        .btn-outline-primary:hover,
        .btn-outline-success:hover {
          transform: scale(1.05);
          transition: 0.2s ease;
        }

        @media (max-width: 768px) {
          th,
          td {
            font-size: 14px;
          }
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
