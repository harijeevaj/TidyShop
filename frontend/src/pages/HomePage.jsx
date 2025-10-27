import React from "react";

import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="TidyPharma-home">

      <div className="TidyPharma-quote">
        <h1>Your Health, Our Priority</h1>
        <p>Order trusted medicines & health essentials with one click.</p>
      </div>

      <div className="TidyPharma-buttons">
        <div className="TidyPharma-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966487.png"
            alt="Order Medicine"
          />
          <h3>Order Medicine</h3>
                  <button className="TidyPharma-btn" onClick={() => navigate("/order")}>
            Explore
          </button>
        </div>

        <div className="TidyPharma-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
            alt="My Orders"
          />
          <h3>My Orders</h3>
           <button className="TidyPharma-btn" onClick={() => navigate("/order-history")}>
            Explore
          </button>
        </div>

        <div className="TidyPharma-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966482.png"
            alt="Health Products"
          />
          <h3>Health Products</h3>
          <button className="TidyPharma-btn" onClick={() => navigate("/medicines")}>
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}
