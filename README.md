TidyPharma - Online Pharmacy Management System
==============================================

TidyPharma is a full-stack pharmacy web application that enables users to browse medicines, add them to a cart, and securely place orders.
Admins can manage inventory, track orders, and monitor stock efficiently.
Built using React.js, Node.js (Express), and PostgreSQL, it ensures smooth performance and secure data handling.

Tech Stack
Frontend: React.js (Hooks, React Router, Bootstrap) 
Backend: Node.js + Express
Database: PostgreSQL
Authentication: JWT (JSON Web Tokens) Encryption: CryptoJS (AES-based data encryption) Styling: Bootstrap + Custom CSS

Installation and Setup

    1. Clone the Repository
git clone https://github.com/your-username/tidypharma.git cd tidypharma

    2. Backend Setup cd backend npm install

Create .env file inside /backend:


DB_USER=postgres DB_HOST=localhost DB_NAME=tidypharma DB_PASS=my_secure_password DB_PORT=5432
SECRET_KEY=TidyPharmaKey123 PORT=5000

Start Backend Server:
npm start


The server runs on http://localhost:5000


    3. Frontend Setup cd ../frontend npm install
    4. Start React App:
npm start


The frontend runs on http://localhost:3000


Features



User Side
    • Login and registration with JWT and CryptoJS encryption
    • Browse and search medicines
    • Add medicines to cart
    • Secure checkout process
    • View order history and order success pages
    • Contact page for queries


Admin Side
    • Add, edit, and delete medicines
    • View all customer orders
    • Manage stock and inventory
    • Track total orders and status
    • Access admin dashboard (AdminHome.jsx)


Debugging Task Explanation



Issue Introduced:
In CartPage.jsx, user_id was not being passed correctly, causing cart data fetch failure.

Buggy Code:
const user_id = decryptData(req.body.payload); // Incorrect extraction


Fixed Code:
const { user_id } = decryptData(req.body.payload);


Explanation:
decryptData() returns an object containing multiple fields. Destructuring ensures that user_id is extracted correctly before querying the database.

Database Setup
CREATE DATABASE tidypharma;


CREATE TABLE users (
id SERIAL PRIMARY KEY, name VARCHAR(100),
email VARCHAR(100) UNIQUE,
password VARCHAR(200)
);


CREATE TABLE medicines ( id SERIAL PRIMARY KEY, name VARCHAR(100),
description TEXT, price DECIMAL(10,2),
max_stock INT
);


CREATE TABLE cart (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id), medicine_id INT REFERENCES medicines(id), quantity INT DEFAULT 1
);


CREATE TABLE orders (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id), total_amount DECIMAL(10,2), order_date TIMESTAMP DEFAULT NOW()
);


Security Highlights



    • Sensitive data such as user_id is encrypted using CryptoJS (AES)
    • JWT is used for authentication
    • Parameterized SQL queries are implemented to prevent SQL Injection


Future Enhancements



    • Add admin analytics dashboard with sales chartIntegrate payment gateway (Stripe or Razorpay)
    • Add pharmacy staff roles
    • Implement notifications for low stock alerts


Scripts



npm start	- Runs the app in development mode npm run build	- Builds the React app for production npm run test	- Runs test suite
npm run dev	- Runs backend using nodemon (if configured)


Author



Author: Hari Shanmuga PrasadJ
Email:harijeeva62@gmail.com
Project: TidyPharma - Online Medicine Store
