import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

const SECRET_KEY = "TidyPharmaKey123";

export default function AddMedicineForm() {
  const [form, setForm] = useState({
    name: "",
    chemical_name: "",
    uses: "",
    description: "",
    mg: "",
    max_stock: "",
    price: "",
    manuf_date: "",
    expiry_date: "",
    photo: "",
  });

  const [loading, setLoading] = useState(false);

  const showAlert = (msg, type = "danger") => {
    const alertBox = document.createElement("div");
    alertBox.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
    alertBox.style.width = "60%";
    alertBox.innerText = msg;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
  };

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024) {
      showAlert("Image size must be less than 10KB!");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const {
      name,
      chemical_name,
      uses,
      description,
      mg,
      max_stock,
      price,
      manuf_date,
      expiry_date,
      photo,
    } = form;

    if (!name.trim()) return "Medicine name is required!";
    if (!chemical_name.trim()) return "Chemical name is required!";
    if (!uses.trim()) return "Please mention at least one use!";
    if (!description.trim()) return "Description is required!";
    if (!mg.trim()) return "Dosage (mg) is required!";
    if (!max_stock || max_stock <= 0) return "Max stock must be greater than 0!";
    if (!price || price <= 0) return "Price must be a positive value!";
    if (!manuf_date) return "Manufacture date is required!";
    if (!expiry_date) return "Expiry date is required!";
    if (!photo) return "Medicine photo is required!";

    const today = new Date().toISOString().split("T")[0];
    if (expiry_date <= today) return "Expiry date must be in the future!";
    if (new Date(manuf_date) > new Date(expiry_date))
      return "Manufacture date cannot be after expiry date!";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      showAlert(validationError);
      return;
    }

    setLoading(true);
    try {
      const encrypted = encryptData(form);
      const res = await axios.post("http://localhost:5000/api/medicine/add", {
        payload: encrypted,
      });

      const decrypted = CryptoJS.AES.decrypt(res.data.payload, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const result = JSON.parse(decrypted);

      showAlert(result.message, result.success ? "success" : "danger");

      if (result.success) {
        setForm({
          name: "",
          chemical_name: "",
          uses: "",
          description: "",
          mg: "",
          max_stock: "",
          price: "",
          manuf_date: "",
          expiry_date: "",
          photo: "",
        });
      }
    } catch (err) {
      console.error(err);
      showAlert("Server error while adding medicine!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5 d-flex justify-content-center">
      <div
        className="card shadow-lg border-0 rounded-4 p-4 p-md-5 classy-form"
        style={{ maxWidth: "650px", width: "100%" }}
      >
        <h3 className="text-center mb-4 text-success fw-bold">
          Add New Medicine 💊
        </h3>

        <form onSubmit={handleSubmit}>
          {/* 🧾 Basic Details */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Medicine Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. Paracetamol"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Chemical Name</label>
            <input
              type="text"
              name="chemical_name"
              value={form.chemical_name}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. Acetaminophen"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Uses</label>
            <input
              type="text"
              name="uses"
              value={form.uses}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. Fever, Headache, Cold Relief"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-control form-control-lg"
              rows="3"
              placeholder="Briefly describe the medicine's effects and instructions..."
            ></textarea>
          </div>

          {/* 💊 Medicine Info */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Dosage (mg)</label>
            <input
              type="text"
              name="mg"
              value={form.mg}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. 500mg"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Max Stock</label>
            <input
              type="number"
              name="max_stock"
              value={form.max_stock}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. 100"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="e.g. 29.99"
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Manufacture Date</label>
              <input
                type="date"
                name="manuf_date"
                value={form.manuf_date}
                onChange={handleChange}
                className="form-control form-control-lg"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
                className="form-control form-control-lg"
              />
            </div>
          </div>

          {/* 🖼 Image Upload */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Medicine Photo (≤10KB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control form-control-lg"
            />
            {form.photo && (
              <div className="mt-3 text-center">
                <img
                  src={form.photo}
                  alt="Preview"
                  className="rounded shadow-sm"
                  style={{ maxWidth: "150px", height: "auto" }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success btn-lg w-100 shadow-sm fw-semibold"
          >
            {loading ? "Saving..." : "Add Medicine"}
          </button>
        </form>
      </div>

      {/* ✨ Fancy Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .classy-form {
          font-family: 'Poppins', sans-serif;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .classy-form:hover {
          transform: scale(1.01);
        }
        label {
          color: #198754;
        }
        textarea {
          resize: none;
        }
      `}</style>
    </div>
  );
}
