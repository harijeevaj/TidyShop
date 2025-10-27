import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import PharmacyLogo from "../assets/jqRrmJyXSm1hdp5m.svg"; // ✅ ensure correct folder name


export default function ContactPage() {
  return (
    <div className="contact-page">
      {/* 🌟 Hero Section */}
      <div className="hero-section">
        <img
          src="https://images.pexels.com/photos/3825529/pexels-photo-3825529.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Pharmacy Banner"
          className="hero-image"
        />
        <div className="hero-overlay">
        
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="hero-title"
          >
            Get in Touch with TidyPharma
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="hero-subtitle"
          >
            Your health, our priority 💚 — Reach out for prescriptions,
            consultations, or pharmacy services.
          </motion.p>
        </div>
      </div>

      {/* 📞 Contact Section */}
      <div className="contact-container">
        {/* Left - Contact Info */}
     <motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
  className="contact-card"
>
  <h2 className="section-title">Pharmacy Contact Information</h2>
  <ul className="contact-list">
    <li><Mail className="icon" /> support@tidypharma.com</li>
    <li><Phone className="icon" /> +91 98765 43210</li>
    <li><MapPin className="icon" /> Plot 22, HealthCare Avenue, Hyderabad, India</li>
    <li><Globe className="icon" /> www.tidypharma.com</li>
  </ul>

  {/* Company Logo Section */}
  <div className="contact-logo-container">
    <img src={PharmacyLogo} alt="TidyPharma Logo" className="contact-logo" />
    <p className="logo-caption">TidyPharma Pvt. Ltd.</p>
  </div>
</motion.div>

        {/* Right - Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="contact-card"
        >
          <h2 className="section-title">Send Us a Message</h2>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea
              rows="4"
              placeholder="Your Message (e.g., prescription inquiry)"
              required
            ></textarea>
            <button type="submit">Submit Message</button>
          </form>
        </motion.div>
      </div>

      {/* 📰 Blog Section */}
      <div className="blog-section">
        <h2 className="section-title center">Pharmacy Insights & Health Tips 💊</h2>
        <div className="blog-grid">
          {[
            {
              title: "Top 5 Over-the-Counter Medicines for Common Ailments",
              img: "https://images.pexels.com/photos/3873172/pexels-photo-3873172.jpeg?auto=compress&cs=tinysrgb&w=800",
              text: "Explore the most trusted OTC medicines for headaches, colds, and allergies.",
            },
            {
              title: "The Importance of Sticking to Your Prescriptions",
              img: "https://images.pexels.com/photos/8460151/pexels-photo-8460151.jpeg?auto=compress&cs=tinysrgb&w=800",
              text: "Adherence to medication schedules can make a huge difference in recovery.",
            },
            {
              title: "How Online Pharmacies Simplify Healthcare Access",
              img: "https://images.pexels.com/photos/3825529/pexels-photo-3825529.jpeg?auto=compress&cs=tinysrgb&w=800",
              text: "Learn how digital pharmacies like TidyPharma make healthcare faster and safer.",
            },
          ].map((post, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="blog-card">
              <img src={post.img} alt={post.title} className="blog-img" />
              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.text}</p>
                <button className="read-more">Read More →</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ⚙️ Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} TidyPharma — Empowering Health Through
          Innovation.
        </p>
      </footer>
    </div>
  );
}
