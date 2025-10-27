
import React from "react";
import "../App.css";

export default function HealthProducts() {
  const products = [
    {
      name: "Vitamin C Tablets",
      img: "https://cdn-icons-png.flaticon.com/512/2966/2966482.png",
      desc: "Vitamin C plays a crucial role in supporting your immune system. It helps protect cells and keeps your skin, bones, and cartilage healthy. A daily dose of Vitamin C can help fight fatigue and strengthen your overall wellness.",
    },
    {
      name: "Protein Powder",
      img: "https://cdn-icons-png.flaticon.com/512/4320/4320384.png",
      desc: "Protein powders are a convenient way to add protein to your diet. They support muscle growth, repair tissues, and promote overall fitness. Ideal for athletes and those looking to maintain a healthy body mass.",
    },
    {
      name: "Digital Thermometer",
      img: "https://cdn-icons-png.flaticon.com/512/2966/2966502.png",
      desc: "A digital thermometer is an essential home health device. It provides accurate readings in seconds and is safe for all ages. Monitoring body temperature regularly helps in early detection of fever or illness.",
    },
    {
      name: "First Aid Kit",
      img: "https://cdn-icons-png.flaticon.com/512/4320/4320403.png",
      desc: "Every household should have a well-equipped first aid kit. It allows you to treat minor injuries, cuts, and burns immediately. Keeping one handy can make a huge difference in emergencies.",
    },
    {
      name: "Blood Pressure Monitor",
      img: "https://cdn-icons-png.flaticon.com/512/4333/4333623.png",
      desc: "A digital blood pressure monitor helps track your BP levels regularly at home. Early detection and monitoring can prevent serious cardiovascular conditions and help manage your health effectively.",
    },
    {
      name: "Multivitamin Capsules",
      img: "https://cdn-icons-png.flaticon.com/512/2966/2966505.png",
      desc: "Multivitamin capsules are formulated to fill nutritional gaps in your diet. They improve energy, focus, and immunity. A great way to ensure your body gets all essential vitamins and minerals daily.",
    },
  ];

  return (
    <div className="health-blog-page">
      <header className="health-blog-header">
        <h1>💊 TidyPharma Wellness Blog</h1>
        <p>Discover insights, tips, and trusted health products to improve your everyday life.</p>
      </header>

      <section className="health-blog-grid">
        {products.map((p, i) => (
          <div className="health-blog-card" key={i}>
            <img src={p.img} alt={p.name} />
            <div className="health-blog-content">
              <h2>{p.name}</h2>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
