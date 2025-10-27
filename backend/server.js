
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "TidyPharmaKey123"; 

function decryptData(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

app.post("/api/check-email", async (req, res) => {
  try {
    const decrypted = decryptData(req.body.payload);
    const { email } = decrypted;
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const exists = result.rows.length > 0;
    res.status(200).json({ payload: encryptData({ exists }) });
  } catch (err) {
    console.error("❌ Email Check Error:", err.message);
    res.status(500).json({
      payload: encryptData({ exists: false, message: "Internal server error" }),
    });
  }
});


app.post("/api/register", async (req, res) => {
  try {
    const decrypted = decryptData(req.body.payload);
    const { name, email, password, role } = decrypted;

    if (!email || !password || !name) {
      const msg = "All fields are required";
      return res.status(400).json({ payload: encryptData({ success: false, message: msg }) });
    }

    const check = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (check.rows.length > 0) {
      const msg = "Email already exists!";
      return res.status(400).json({ payload: encryptData({ success: false, message: msg }) });
    }

    const encPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    await pool.query(
      `INSERT INTO users (name, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [name, email, encPassword, role || "user"]
    );

    res.status(200).json({
      payload: encryptData({ success: true, message: "User registered successfully!" }),
    });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Server error. Please try again later." }),
    });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const decrypted = decryptData(req.body.payload);
    const { email, password } = decrypted;

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      const msg = "User not found!";
      return res
        .status(400)
        .json({ payload: encryptData({ success: false, message: msg }) });
    }

    const user = result.rows[0];
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      const msg = "Invalid credentials!";
      return res
        .status(400)
        .json({ payload: encryptData({ success: false, message: msg }) });
    }

 
    const sessionData = {
      user_id: user.id, 
      email,
      role: user.role,
      token: "mock-jwt-" + Date.now(),
      loginTime: new Date().toISOString(),
    };

    res
      .status(200)
      .json({ payload: encryptData({ success: true, ...sessionData }) });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({
      payload: encryptData({
        success: false,
        message: "Internal server error",
      }),
    });
  }
});

app.post("/api/medicine/add", async (req, res) => {
  try {
    const decrypted = decryptData(req.body.payload);
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
    } = decrypted;

    if (
      !name ||
      !chemical_name ||
      !uses ||
      !description ||
      !mg ||
      !max_stock ||
      !price ||
      !manuf_date ||
      !expiry_date ||
      !photo
    ) {
      return res.status(400).json({
        payload: encryptData({ success: false, message: "All fields are required!" }),
      });
    }

    await pool.query(
      `INSERT INTO medicines 
      (name, chemical_name, uses, description, mg, max_stock, price, manuf_date, expiry_date, image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [name, chemical_name, uses, description, mg, max_stock, price, manuf_date, expiry_date, photo]
    );

    res.status(200).json({
      payload: encryptData({ success: true, message: "Medicine added successfully!" }),
    });
  } catch (err) {
    console.error("❌ Error adding medicine:", err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Server error while adding medicine!" }),
    });
  }
});


app.get("/api/medicine/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM medicines ORDER BY id DESC");
    res.json({ payload: encryptData({ success: true, data: result.rows }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Error fetching medicines" }),
    });
  }
});


app.post("/api/medicine/delete", async (req, res) => {
  try {
    const { id } = decryptData(req.body.payload);
    await pool.query("DELETE FROM medicines WHERE id = $1", [id]);
    res.json({
      payload: encryptData({ success: true, message: "Medicine deleted successfully!" }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Error deleting medicine" }),
    });
  }
});


app.post("/api/medicine/update", async (req, res) => {
  try {
    const { id, name, mg, max_stock, price, manuf_date, expiry_date } = decryptData(req.body.payload);

    await pool.query(
      `UPDATE medicines
       SET name=$1, mg=$2, max_stock=$3, price=$4, manuf_date=$5, expiry_date=$6
       WHERE id=$7`,
      [name, mg, max_stock, price, manuf_date, expiry_date, id]
    );

    res.json({
      payload: encryptData({ success: true, message: "Medicine updated successfully!" }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Error updating medicine" }),
    });
  }
});





app.get("/api/user/id", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const result = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ user_id: result.rows[0].id });
  } catch (err) {
    console.error("❌ User ID Fetch Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/api/cart/count", async (req, res) => {
  try {
    let { user_id } = req.query;
    user_id = parseInt(user_id);

    if (isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const result = await pool.query(
      "SELECT COALESCE(SUM(quantity), 0) AS count FROM cart WHERE user_id=$1",
      [user_id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("❌ Cart Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch cart count" });
  }
});


app.post("/api/cart/add", async (req, res) => {
  try {
    const { user_id, medicine_id, quantity } = decryptData(req.body.payload);

    if (!user_id || !medicine_id || !quantity) {
      return res.status(400).json({
        payload: encryptData({ success: false, message: "Invalid data!" }),
      });
    }

    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id=$1 AND medicine_id=$2",
      [user_id, medicine_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE cart SET quantity = quantity + $1 WHERE user_id=$2 AND medicine_id=$3",
        [quantity, user_id, medicine_id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart (user_id, medicine_id, quantity) VALUES ($1,$2,$3)",
        [user_id, medicine_id, quantity]
      );
    }

    res.json({ payload: encryptData({ success: true, message: "Added to cart" }) });
  } catch (err) {
    console.error("❌ Add to Cart Error:", err);
    res.status(500).json({ payload: encryptData({ success: false, message: "Server error" }) });
  }
});


app.get("/api/cart/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id as cart_id, c.user_id, c.medicine_id, c.quantity,
              m.name, m.price, m.image as image_url, m.max_stock
       FROM cart c
       JOIN medicines m ON c.medicine_id = m.id
       WHERE c.user_id = $1`,
      [req.params.userId]
    );
    res.json({ payload: encryptData({ success: true, data: result.rows }) });
  } catch (err) {
    console.error("❌ Cart Fetch Error:", err);
    res.status(500).json({ payload: encryptData({ success: false, message: "Error fetching cart" }) });
  }
});


app.post("/api/cart/remove", async (req, res) => {
  try {
    const { cart_id } = decryptData(req.body.payload);
    await pool.query("DELETE FROM cart WHERE id = $1", [cart_id]);
    res.json({ payload: encryptData({ success: true, message: "Removed from cart" }) });
  } catch (err) {
    console.error("❌ Remove Cart Error:", err);
    res.status(500).json({ payload: encryptData({ success: false, message: "Error removing item" }) });
  }
});

app.post("/api/order/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = decryptData(req.body.payload);
    await client.query("BEGIN");

    const cartItems = await client.query(
      `SELECT c.medicine_id, c.quantity, m.price, m.max_stock 
       FROM cart c 
       JOIN medicines m ON c.medicine_id = m.id 
       WHERE c.user_id=$1 FOR UPDATE`,
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res
        .status(400)
        .json({ payload: encryptData({ success: false, message: "Cart is empty!" }) });
    }

    for (const item of cartItems.rows) {

      if (item.quantity > item.max_stock) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          payload: encryptData({
            success: false,
            message: `Insufficient stock for medicine ID ${item.medicine_id}`,
          }),
        });
      }


      const totalPrice = item.quantity * item.price;

      
      await client.query(
        `INSERT INTO order_history 
         (user_id, medicine_id, quantity, total_price, order_date, status) 
         VALUES ($1, $2, $3, $4, NOW(), 'Pending')`,
        [user_id, item.medicine_id, item.quantity, totalPrice]
      );

      await client.query(
        "UPDATE medicines SET max_stock = max_stock - $1 WHERE id=$2",
        [item.quantity, item.medicine_id]
      );
    }


    await client.query("DELETE FROM cart WHERE user_id=$1", [user_id]);

    await client.query("COMMIT");
    client.release();

    res.json({
      payload: encryptData({ success: true, message: "Order placed successfully!" }),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error("❌ Checkout Error:", err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Checkout failed" }),
    });
  }
});
app.get("/api/cart/count", async (req, res) => {
  try {
    let { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    user_id = parseInt(user_id);

    if (isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    const result = await pool.query(
      "SELECT COALESCE(SUM(quantity), 0) AS count FROM cart WHERE user_id = $1",
      [user_id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("❌ Cart Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch cart count" });
  }
});


app.get("/api/order/history/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT oh.id, oh.user_id, oh.medicine_id, oh.quantity, oh.total_price, oh.order_date, m.name
       FROM order_history oh
       JOIN medicines m ON oh.medicine_id = m.id
       WHERE oh.user_id=$1
       ORDER BY oh.order_date DESC`,
      [req.params.userId]
    );
    res.json({ payload: encryptData({ success: true, data: result.rows }) });
  } catch (err) {
    console.error("❌ Order History Error:", err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Error fetching order history" }),
    });
  }
});

app.put("/api/admin/order/status", async (req, res) => {
  const { order_id, status } = req.body;

  try {
    await pool.query(`UPDATE order_history SET status = $1 WHERE id = $2`, [status, order_id]);
    res.json({ payload: encryptData({ success: true, message: "Status updated successfully" }) });
  } catch (err) {
    console.error("❌ Update Order Status Error:", err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Failed to update order status" }),
    });
  }
});

app.get("/api/admin/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        oh.id, 
        oh.user_id, 
        oh.medicine_id, 
        oh.quantity, 
        oh.total_price, 
        oh.order_date, 
        oh.status,
        m.name
      FROM order_history oh
      JOIN medicines m ON oh.medicine_id = m.id
      ORDER BY oh.order_date DESC
    `);

    res.json({ payload: encryptData({ success: true, data: result.rows }) });
  } catch (err) {
    console.error("❌ Fetch Admin Orders Error:", err);
    res.status(500).json({
      payload: encryptData({ success: false, message: "Error fetching orders" }),
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
