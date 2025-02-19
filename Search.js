require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

// Create MySQL Connection Pool (Better Performance)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "md181023",
  database: "Home",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Database Connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected...");
  connection.release();
});

// Search API
app.get("/search", (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ success: false, msg: "Search query is required" });
  }

  const searchQuery = `
    SELECT * FROM recipes 
    WHERE title LIKE ? 
    OR ingredients LIKE ? 
    OR description LIKE ?`;

  const searchValue = `%${search}%`;

  pool.query(searchQuery, [searchValue, searchValue, searchValue], (err, results) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json({ success: true, msg: "Recipes Found", results });
    } else {
      return res.status(404).json({ success: false, msg: "No recipes found" });
    }
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
