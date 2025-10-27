import React, { useState, useEffect, use } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "animate.css";
import "./App.css";


import HomePage from "./pages/HomePage";
import OrderPage from "./pages/OrderPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import AuthPage from "./components/AuthPage";
import HealthProducts from "./pages/HealthProduct";
import AdminHome from "./pages/AdminHome";
import AddMedicineForm from "./pages/AddMedicine";
import MedicineStockPage from "./pages/TotalStock";
import CartPage from "./pages/CartPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminOrderPage from "./pages/AdminOrderPage";
import ContactPage from "./pages/ContactPage";

function AnimatedRoutes({ isLoggedIn }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<HealthProducts />} />
        <Route path="/CartPage" element={<CartPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route
          path="/order"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [cartCount, setCartCount] = useState(0);


  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const sessionData = localStorage.getItem("user_session");
        if (!sessionData) return;
        const { user_id } = JSON.parse(sessionData);
        if (!user_id) return;
console.log(user_id)
        const response = await fetch(
          `http://localhost:5000/api/cart/count?user_id=${user_id}`
        );
        const data = await response.json();
        setCartCount(data.count || 0);
      } catch (err) {
        console.error("Error fetching cart count:", err);
      }
    };

    fetchCartCount();
  }, []);


  useEffect(() => {
    const sessionData = localStorage.getItem("user_session");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setUserSession(parsed);
      if (parsed.token) setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setIsLoggedIn(false);
    setUserSession(null);
    window.location.href = "/";
  };

  const toggleProfile = () => setShowProfile(!showProfile);

  if (!isLoggedIn) {
    return (
      <AuthPage
        onLogin={async (email, role, mockToken) => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/user/id?email=${email}`
            );
            const data = await response.json();

            const session = {
              email,
              role,
              user_id: data.user_id, 
              token: mockToken,
              loginTime: new Date().toISOString(),
            };

            localStorage.setItem("user_session", JSON.stringify(session));
            setUserSession(session);
            setIsLoggedIn(true);

            if (role === "admin") window.location.href = "/admin-home";
          } catch (err) {
            console.error("Error fetching user_id:", err);
          }
        }}
      />
    );
  }

  const Header = () => (
    <motion.header
      className="TidyPharma-header"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="TidyPharma-logo"
        whileHover={{ scale: 1.1, rotate: 3 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        💊 TidyPharma
      </motion.div>

      <motion.nav className="TidyPharma-nav">
        <Link className="nav-link" to="/">
          Home
        </Link>
        <Link className="nav-link" to="/order">
          Medicines
        </Link>
        {userSession?.role === "user" && (
          <>
            <Link className="nav-link" to="/medicines">
              Health Products
            </Link>
            <Link className="nav-link" to="/ContactPage">
              Contact
            </Link>
          </>
        )}
      </motion.nav>

      <div className="TidyPharma-actions">
        {/* 🛒 Cart Icon */}
        {userSession?.role === "user" && (
          <motion.div whileHover={{ scale: 1.2 }} className="cart-container">
            <Link to="/CartPage" className="cart-icon">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4906/4906355.png"
                alt="Cart"
                className="cart-image"
              />
            </Link>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </motion.div>
        )}
        <motion.div
          className="profile-container"
          onClick={toggleProfile}
          whileHover={{ rotate: 10, scale: 1.15 }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="profile-avatar"
          />
        </motion.div>
        <motion.button
          className="logout-btn"
          onClick={handleLogout}
          whileHover={{ scale: 1.05, backgroundColor: "#004d40" }}
          whileTap={{ scale: 0.9 }}
        >
          Logout
        </motion.button>
      </div>
    </motion.header>
  );

  const ProfilePopup = () =>
    showProfile && (
      <motion.div
        className="profile-popup"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="profile-box"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="profile-avatar-large"
          />
          <h3>
            👤 {userSession?.role === "admin" ? "Admin Profile" : "User Profile"}
          </h3>
          <p>
            <strong>Email:</strong> {userSession?.email}
          </p>
          <p>
            <strong>Role:</strong> {userSession?.role || "Customer"}
          </p>
          <p>
            <strong>Login Time:</strong>{" "}
            {new Date(userSession?.loginTime).toLocaleString()}
          </p>
          <motion.button
            className="close-profile-btn"
            onClick={() => setShowProfile(false)}
            whileHover={{ scale: 1.05 }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    );

  const isAdmin = userSession?.role === "admin";

  return (
    <Router>
      <Header />
      <ProfilePopup />
      <main
        className={`TidyPharma-content animate__animated animate__fadeIn ${
          isAdmin ? "admin-mode" : ""
        }`}
      >
        <AnimatedRoutes isLoggedIn={isLoggedIn} />
      </main>
    </Router>
  );
}
