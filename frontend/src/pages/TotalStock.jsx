import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const SECRET_KEY = "TidyPharmaKey123";

export default function MedicineStockPage() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const showAlert = (msg, type = "danger") => {
    const alertBox = document.createElement("div");
    alertBox.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
    alertBox.style.width = "60%";
    alertBox.innerText = msg;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
  };

  const decryptResponse = (payload) => {
    const decrypted = CryptoJS.AES.decrypt(payload, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicine/all");
      const result = decryptResponse(res.data.payload);
      if (result.success) {
        setMedicines(result.data);
        setFilteredMedicines(result.data);
      }
    } catch (err) {
      console.error(err);
      showAlert("Error fetching medicines!");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ id }), SECRET_KEY).toString();
      const res = await axios.post("http://localhost:5000/api/medicine/delete", { payload: encrypted });
      const result = decryptResponse(res.data.payload);
      showAlert(result.message, result.success ? "success" : "danger");
      if (result.success) fetchMedicines();
    } catch (err) {
      console.error(err);
      showAlert("Error deleting medicine!");
    }
  };

  const handleView = (medicine) => {
    setSelectedMedicine({ ...medicine });
    setEditMode(false);
  };

  const handleChange = (e) => {
    setSelectedMedicine({ ...selectedMedicine, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(selectedMedicine), SECRET_KEY).toString();
      const res = await axios.post("http://localhost:5000/api/medicine/update", { payload: encrypted });
      const result = decryptResponse(res.data.payload);
      showAlert(result.message, result.success ? "success" : "danger");
      if (result.success) {
        setSelectedMedicine(null);
        fetchMedicines();
      }
    } catch (err) {
      console.error(err);
      showAlert("Error updating medicine!");
    }
  };

  const formatDate = (dateString) => (dateString ? dateString.substring(0, 10) : "—");

  // 🔍 Filter Medicines by ID or Name
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = medicines.filter(
      (m) =>
        m.id.toString().includes(term) ||
        m.name.toLowerCase().includes(term)
    );
    setFilteredMedicines(filtered);
  };

  return (
    <div className="container py-5 classy-font">
      <h2 className="text-center fw-bold text-success mb-4">💊 Medicine Inventory</h2>

      {/* 🔍 Centered Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <div className="search-box shadow-sm rounded-4 p-2 bg-white d-flex align-items-center" style={{ width: "60%" }}>
          <i className="bi bi-search text-success fs-5 ms-3"></i>
          <input
            type="text"
            className="form-control border-0 shadow-none ms-2"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* 📋 Table */}
      <div className="table-responsive shadow-lg rounded-4 overflow-hidden bg-white">
        <table className="table align-middle text-center mb-0">
          <thead className="bg-success text-white">
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Dosage</th>
              <th>Total Stock</th>
              <th>Manufacture Date</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-muted py-4">
                  No medicines found 😕
                </td>
              </tr>
            ) : (
              filteredMedicines.map((m) => (
                <tr key={m.id} className="hover-row">
                  <td className="fw-semibold text-secondary">{m.id}</td>
                  <td>
                    {m.image ? (
                      <img
                        src={
                          m.image.startsWith("data:image")
                            ? m.image
                            : `data:image/png;base64,${m.image}`
                        }
                        alt="medicine"
                        className="medicine-img"
                      />
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td>
                  <td className="fw-semibold">{m.name}</td>
                  <td>{m.mg}</td>
                  <td>
                    <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                      {m.max_stock}
                    </span>
                  </td>
                  <td>{formatDate(m.manuf_date)}</td>
                  <td>{formatDate(m.expiry_date)}</td>
                  <td>
                    <button
                      className="btn btn-outline-info btn-sm me-2"
                      onClick={() => handleView(m)}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(m.id)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧾 Modal */}
      {selectedMedicine && (
        <div className="modal-overlay">
          <div className="medicine-modal animate-popup">
            <div className="modal-header bg-success text-white rounded-top-3 px-4 py-3">
              <h5 className="modal-title fw-bold">
                {editMode ? "Edit Medicine" : "Medicine Details"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setSelectedMedicine(null)}
              ></button>
            </div>

            <div className="modal-body scrollable-body px-4 py-3">
              <div className="text-center mb-3">
                {selectedMedicine.image && (
                  <img
                    src={
                      selectedMedicine.image.startsWith("data:image")
                        ? selectedMedicine.image
                        : `data:image/png;base64,${selectedMedicine.image}`
                    }
                    alt="preview"
                    className="modal-img"
                  />
                )}
              </div>

              {[
                "id",
                "name",
                "chemical_name",
                "uses",
                "description",
                "mg",
                "max_stock",
                "price",
                "manuf_date",
                "expiry_date",
              ].map((field) => (
                <div className="mb-2" key={field}>
                  <label className="form-label fw-semibold text-capitalize small">
                    {field.replace("_", " ")}
                  </label>
                  {field === "description" ? (
                    <textarea
                      rows="2"
                      name={field}
                      value={selectedMedicine[field] || ""}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      disabled={!editMode || field === "id"}
                    ></textarea>
                  ) : (
                    <input
                      type={field.includes("date") ? "date" : "text"}
                      name={field}
                      value={
                        field.includes("date")
                          ? formatDate(selectedMedicine[field])
                          : selectedMedicine[field] || ""
                      }
                      onChange={handleChange}
                      className="form-control rounded-3"
                      disabled={!editMode || field === "id"}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="modal-footer border-0 px-4 py-3">
              {editMode ? (
                <>
                  <button className="btn btn-success px-4" onClick={handleUpdate}>
                    Update
                  </button>
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary px-4"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .classy-font { font-family: 'Poppins', sans-serif; }
        .hover-row { transition: all 0.25s ease; }
        .hover-row:hover { background-color: #f4fff6 !important; transform: scale(1.01); }
        .medicine-img { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; box-shadow: 0 0 8px rgba(0,0,0,0.15); }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1050; backdrop-filter: blur(4px); }
        .medicine-modal { width: 75%; max-width: 850px; height: 70vh; background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; animation: popupScale 0.4s ease forwards; }
        .scrollable-body { overflow-y: auto; flex-grow: 1; }
        @keyframes popupScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .modal-img { width: 120px; height: 120px; border-radius: 14px; object-fit: cover; box-shadow: 0 0 10px rgba(0,0,0,0.25); }
        textarea { resize: none; }
      `}</style>
    </div>
  );
}
