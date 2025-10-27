import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function AdminHome() {
    const navigate = useNavigate();

    return (
        <div className="admin-home">
            <header className="admin-header">
                <h1>💊 TidyPharma Admin Dashboard</h1>
                <p>Manage your TidyPharmacy efficiently — medicines, orders, and stock at a glance.</p>
            </header>

            <section className="admin-grid">
                
                <div className="admin-card" onClick={() => navigate("/add-medcine")}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2966/2966495.png"
                        alt="Add Medicine"
                    />
                    <h3>Add Medicine</h3>
                    <p>Add new medicines to the database with name, price, and stock quantity.</p>
                </div>

    
                <div className="admin-card" onClick={() => navigate("/AdminOrderPage")}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3595/3595455.png"
                        alt="View Orders"
                    />
                    <h3>View Orders</h3>
                    <p>Check and manage all customer orders placed through the TidyPharmacy system.</p>
                </div>

            
                <div className="admin-card" onClick={() => navigate("/total-stock")}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2966/2966480.png"
                        alt="Total Stock"
                    />
                    <h3>Total Stock</h3>
                    <p>View total available stock, low inventory alerts, and reorder suggestions.</p>
                </div>
            </section>
        </div>
    );
}
