const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.json());

// MySQL Database Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "md181023",
  database: "Home"
});

con.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  } else {
    console.log("MySQL Connected...");
  }
});

/* ===============================
    Recipe Approval/Rejection API
   =============================== */
// Approve a recipe
app.put("/api/recipes/:id/approve", (req, res) => {
  const recipeId = req.params.id;
  con.query("UPDATE recipes SET status = 'approved' WHERE id = ?", [recipeId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error approving recipe" });
    res.json({ message: "Recipe approved successfully" });
  });
});

// Reject a recipe
app.put("/api/recipes/:id/reject", (req, res) => {
  const recipeId = req.params.id;
  con.query("UPDATE recipes SET status = 'rejected' WHERE id = ?", [recipeId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error rejecting recipe" });
    res.json({ message: "Recipe rejected successfully" });
  });
});

// Fetch all pending recipes
app.get("/api/recipes/pending", (req, res) => {
  con.query("SELECT * FROM recipes WHERE status = 'pending'", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching pending recipes" });
    res.json(results);
  });
});

// Fetch all approved recipes
app.get("/api/recipes/approved", (req, res) => {
  con.query("SELECT * FROM recipes WHERE status = 'approved'", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching approved recipes" });
    res.json(results);
  });
});

// Fetch all rejected recipes
app.get("/api/recipes/rejected", (req, res) => {
  con.query("SELECT * FROM recipes WHERE status = 'rejected'", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching rejected recipes" });
    res.json(results);
  });
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
