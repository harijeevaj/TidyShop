import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const SECRET_KEY = "TidyPharmaKey123"; 

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

 
  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  };


  const decryptPayload = (payload) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(payload, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error("Decryption error:", err);
      return null;
    }
  };


  const showAlert = (msg, type = "danger") => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "info" }), 2500);
  };


  const checkEmailExists = async (emailToCheck) => {
    try {
      const encrypted = encryptData({ email: emailToCheck });
      const res = await axios.post("http://localhost:5000/api/check-email", { payload: encrypted });
      if (!res?.data?.payload) return false;
      const data = decryptPayload(res.data.payload);
      return !!(data && data.exists);
    } catch (err) {
      console.error("checkEmailExists error:", err);
      return false;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.includes("@")) {
      showAlert("Invalid email address!");
      setLoading(false);
      return;
    }
    if (password.length < 5) {
      showAlert("Password must be at least 5 characters!");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
      
        const encrypted = encryptData({ email, password });
        const res = await axios.post("http://localhost:5000/api/login", { payload: encrypted });

        if (!res?.data?.payload) {
          showAlert("Invalid server response. Try again later.");
          setLoading(false);
          return;
        }

        const userSession = decryptPayload(res.data.payload);
        if (!userSession) {
          showAlert("Failed to read server response. Try again later.");
          setLoading(false);
          return;
        }

        const mockToken = "mock-" + Math.random().toString(36).substr(2, 10);
        localStorage.setItem("user_session", JSON.stringify({ ...userSession, token: mockToken }));

        showAlert(`Welcome ${userSession.role === "admin" ? "Admin" : "User"}!`, "success");

        setTimeout(() => {
          if (userSession.role === "admin") {
            window.location.href = "/admin-home";
          } else {
            onLogin(userSession.email, userSession.role || "user", mockToken);
          }
        }, 1000);

      } else {

        const exists = await checkEmailExists(email);
        if (exists) {
          showAlert("Email is already registered!", "warning");
          setLoading(false);
          return;
        }

        const role = "user";
        const encrypted = encryptData({ name, email, password, role });
        const res = await axios.post("http://localhost:5000/api/register", { payload: encrypted });

        if (!res?.data?.payload) {
          showAlert("Invalid server response. Try again later.");
          setLoading(false);
          return;
        }

        const result = decryptPayload(res.data.payload);
        if (result && result.success) {
          showAlert("Registration Successful! Please Login.", "success");
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setName("");
        } else {
          showAlert(result?.message || "Registration failed! Try again.");
        }
      }
    } catch (err) {
      console.error(err);
      showAlert("Server error. Please try again later!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative">

  
      {alert.show && (
        <div
          className={`alert alert-${alert.type} text-center fw-semibold shadow fade show position-fixed top-50 start-50 translate-middle`}
          style={{
            minWidth: "350px",
            zIndex: 2000,
            borderRadius: "12px",
            fontSize: "1rem",
            animation: "fadeInOut 2.5s ease-in-out",
          }}
        >
          {alert.message}
        </div>
      )}


      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 3000 }}
        >
          <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}></div>
          <p className="mt-3 text-white fw-semibold fs-5">Processing...</p>
        </div>
      )}

      <div className="row w-100 align-items-center justify-content-center">

        <div className="col-md-6 text-center mb-4 mb-md-0">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966489.png"
            alt="TidyPharmacy"
            className="img-fluid mb-3"
            style={{ width: "260px" }}
          />
          <p className="text-muted fs-5 fst-italic">
            “Stay healthy. Shop smart with{" "}
            <span className="fw-bold text-success">TidyPharma</span>.”
          </p>
        </div>

    
        <div className="col-md-4">
          <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
            <h2 className="text-center mb-4 text-success fw-bold">
              {isLogin ? "Login " : "Register "}
            </h2>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="mb-3 text-start">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-3 text-start">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4 text-start">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-success btn-lg w-100 shadow-sm"
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
                <button
                  className="btn btn-link p-0 fw-semibold text-decoration-none text-success"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Register here" : "Login here"}
                </button>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Animation CSS */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
