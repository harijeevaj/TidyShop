import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

const SECRET_KEY = "TidyPharmaKey123";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
const sessionData = localStorage.getItem("user_session");
const user_id = sessionData ? JSON.parse(sessionData).user_id : null;
  const navigate = useNavigate();

  // 🔹 Fetch cart items
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${user_id}`);
      const decrypted = JSON.parse(
        CryptoJS.AES.decrypt(res.data.payload, SECRET_KEY).toString(
          CryptoJS.enc.Utf8
        )
      );
      if (decrypted.success) {
        setCartItems(decrypted.data);
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Calculate total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage({ type: "warning", text: "Your cart is empty!" });
      return;
    }

    const payload = CryptoJS.AES.encrypt(
      JSON.stringify({ user_id }),
      SECRET_KEY
    ).toString();

    try {
      const res = await axios.post("http://localhost:5000/api/order/checkout", {
        payload,
      });

      const decrypted = JSON.parse(
        CryptoJS.AES.decrypt(res.data.payload, SECRET_KEY).toString(
          CryptoJS.enc.Utf8
        )
      );

      if (decrypted.success) {
        // clear cart + redirect
        const totalItems = cartItems.length;
        setCartItems([]);
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("storage"));

        navigate("/order-success", {
          state: { totalAmount, totalItems },
        });
      } else {
        setMessage({ type: "danger", text: decrypted.message });
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setMessage({
        type: "danger",
        text: "⚠️ Something went wrong during checkout.",
      });
    }
  };

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-success">
        <div className="spinner-border text-success" role="status"></div>
        <span className="ms-2">Loading your cart...</span>
      </div>
    );
  }

  // 🛒 Main UI
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 fw-bold text-success">🛒 Your Cart</h2>

      {/* ✅ Message */}
      {message && (
        <div
          className={`alert alert-${message.type} text-center fw-semibold`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* 🛍 Empty Cart */}
      {cartItems.length === 0 ? (
        <div className="text-center mt-5">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty cart"
            style={{ width: "120px", opacity: 0.7 }}
          />
          <h5 className="mt-3 text-muted">Your cart is empty!</h5>
          <Link
            to="/OrderMedicinePage"
            className="btn btn-success mt-3 px-4 rounded-pill"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          {/* 🧾 Cart Table */}
          <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
            <table className="table align-middle mb-0">
              <thead className="bg-success text-white">
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col">Medicine Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cart_id}>
                    <td>
                      <img
                        src={
                          item.image
                            ? item.image.startsWith("http")
                              ? item.image
                              : `http://localhost:5000${item.image}`
                            : "https://cdn-icons-png.flaticon.com/512/706/706164.png"
                        }
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/706/706164.png";
                        }}
                      />
                    </td>
                    <td className="fw-semibold">{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>{item.quantity}</td>
                    <td className="fw-bold text-success">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📦 Summary */}
          <div className="cart-summary-box p-4 mt-4 shadow-sm rounded-4 bg-light">
            <h5 className="text-success fw-bold">Cart Summary</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <p className="fw-semibold">Total Items:</p>
              <p>{cartItems.length}</p>
            </div>
            <div className="d-flex justify-content-between">
              <p className="fw-semibold">Total Amount:</p>
              <p className="fw-bold text-success">₹{totalAmount}</p>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-3">
              <Link
                to="/OrderMedicinePage"
                className="btn btn-outline-success rounded-pill px-4"
              >
                ← Continue Shopping
              </Link>
              <button
                className="btn btn-success rounded-pill px-4"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </>
      )}

      {/* 💅 Styles */}
      <style>{`
        .table thead th {
          border: none;
          font-weight: 600;
          text-transform: uppercase;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
          transition: background 0.3s;
        }
        .cart-summary-box {
          border: 2px solid #e2f2e9;
        }
        .btn-outline-success:hover {
          background-color: #28a745;
          color: white;
        }
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
