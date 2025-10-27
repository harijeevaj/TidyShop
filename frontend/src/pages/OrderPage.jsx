import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const SECRET_KEY = "TidyPharmaKey123";

export default function OrderMedicinePage() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [cart, setCart] = useState({});
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
const sessionData = localStorage.getItem("user_session");
const user_id = sessionData ? JSON.parse(sessionData).user_id : null;

  // 🔹 Fetch all medicines
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/medicine/all")
      .then((res) => {
        const decrypted = JSON.parse(
          CryptoJS.AES.decrypt(res.data.payload, SECRET_KEY).toString(
            CryptoJS.enc.Utf8
          )
        );
        if (decrypted.success) {
          setMedicines(decrypted.data);
          setFilteredMedicines(decrypted.data);
        }
      })
      .catch((err) => console.error("❌ Error fetching medicines:", err));
  }, []);

  // 🔹 Search Functionality (Filter by name)
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = medicines.filter((m) =>
      m.name.toLowerCase().includes(term)
    );
    setFilteredMedicines(results);
  }, [searchTerm, medicines]);

  // 🔹 Quantity Handlers
  const increment = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setCart((prev) => {
      const newCount = (prev[id] || 0) - 1;
      if (newCount <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  // 🔹 Add to Cart (Encrypted)
  const addToCart = async (medicine_id) => {
    const quantity = cart[medicine_id] || 1;

    const payload = CryptoJS.AES.encrypt(
      JSON.stringify({ user_id, medicine_id, quantity }),
      SECRET_KEY
    ).toString();

    try {
      const res = await axios.post("http://localhost:5000/api/cart/add", {
        payload,
      });
      const decrypted = JSON.parse(
        CryptoJS.AES.decrypt(res.data.payload, SECRET_KEY).toString(
          CryptoJS.enc.Utf8
        )
      );
      if (decrypted.success) alert("✅ Added to cart!");
      else alert("⚠️ Failed: " + decrypted.message);
    } catch (err) {
      console.error("❌ Add to cart error:", err);
    }
  };

  // 🔹 Show Medicine Details Modal
  const showMedicineDetails = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const closeModal = () => {
    setSelectedMedicine(null);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3 fw-bold text-success">
        🩺 Order Medicines
      </h2>

      {/* 🔍 Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <input
          type="text"
          className="form-control w-50 shadow-sm rounded-pill px-3"
          placeholder="Search medicine by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🔹 Medicine Cards */}
      <div className="row">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((m) => (
            <div className="col-md-3 mb-4" key={m.id}>
              <div
                className="card medicine-card shadow-sm text-center border-0"
                style={{
                  borderRadius: "15px",
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                }}
              >
                <img
                  src={m.image}
                  alt={m.name}
                  style={{
                    height: "150px",
                    objectFit: "contain",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                  }}
                  className="p-3"
                  onClick={() => showMedicineDetails(m)}
                />
                <div className="card-body">
                  <h6 className="fw-bold text-dark">{m.name}</h6>
                  <p className="text-success fw-semibold mb-1">₹{m.price}</p>

                  {/* 🔹 Quantity Selector */}
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => decrement(m.id)}
                    >
                      -
                    </button>
                    <span className="mx-3 fs-6 fw-bold">
                      {cart[m.id] || 0}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => increment(m.id)}
                    >
                      +
                    </button>
                  </div>

                  {/* 🔹 Add to Cart */}
                  <button
                    className="btn btn-success btn-sm w-100 rounded-pill"
                    onClick={() => addToCart(m.id)}
                  >
                    Add to Bag 🛍️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted fs-5 mt-4">
            No medicines found for "<strong>{searchTerm}</strong>"
          </p>
        )}
      </div>

      {/* 🔹 Medicine Modal */}
      {selectedMedicine && (
        <div
          className="custom-modal d-flex justify-content-center align-items-center"
          onClick={closeModal}
        >
          <div
            className="modal-dialog bg-white p-4 rounded-4 shadow-lg"
            style={{ width: "90%", maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-success mb-0">
                {selectedMedicine.name}
              </h5>
              <button
                className="btn-close"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>

            <div className="row">
              <div className="col-md-5 text-center">
                <img
                  src={selectedMedicine.image}
                  alt={selectedMedicine.name}
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
              </div>
              <div className="col-md-7">
                <p>
                  <strong>Uses:</strong> {selectedMedicine.uses || "N/A"}
                </p>
                <p>
                  <strong>Chemical Name:</strong>{" "}
                  {selectedMedicine.chemical_name || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedMedicine.description || "N/A"}
                </p>
                <p>
                  <strong>Manufacture Date:</strong>{" "}
                  {selectedMedicine.manuf_date || "N/A"}
                </p>
                <p>
                  <strong>Expiry Date:</strong>{" "}
                  {selectedMedicine.expiry_date || "N/A"}
                </p>
                <h5 className="text-success fw-bold">
                  ₹{selectedMedicine.price}
                </h5>
                <button
                  className="btn btn-success w-100 rounded-pill mt-3"
                  onClick={() => addToCart(selectedMedicine.id)}
                >
                  Add to Bag 🛍️
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 Modal Styles */}
          <style>{`
            .custom-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0,0,0,0.6);
              z-index: 1050;
              animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .medicine-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
