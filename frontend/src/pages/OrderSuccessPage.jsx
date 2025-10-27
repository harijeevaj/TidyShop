import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OrderSuccessPage() {
  const location = useLocation();
  const { totalAmount = 0, totalItems = 0 } = location.state || {};

  return (
    <div className="container text-center my-5">
      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "500px", borderRadius: "20px" }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/148/148767.png"
          alt="Success"
          style={{ width: "100px", margin: "20px auto" }}
        />
        <h3 className="text-success fw-bold mb-3">Order Placed Successfully! 🎉</h3>
        <p className="text-muted mb-4">
          Thank you for your purchase. Your order has been placed and is currently{" "}
          <span className="fw-bold text-warning">Pending</span>.
        </p>

        <div className="border rounded p-3 mb-4 bg-light">
          <p className="mb-1"><strong>Total Items:</strong> {totalItems}</p>
          <p className="mb-0"><strong>Total Amount:</strong> ₹{totalAmount}</p>
        </div>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/order-history" className="btn btn-outline-success rounded-pill px-4">
            View Order History
          </Link>
          <Link to="/" className="btn btn-success rounded-pill px-4">
            Go Home
          </Link>
        </div>
      </div>

      <style>{`
        .btn-success {
          background: linear-gradient(90deg, #00c6ff, #0072ff);
          border: none;
          font-weight: 600;
        }
        .btn-success:hover {
          background: linear-gradient(90deg, #0090ff, #0059d6);
        }
      `}</style>
    </div>
  );
}
