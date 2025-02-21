const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "md181023",
  database: "Home",
});

con.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
  console.log("MySQL Connected..feedback");
});

// ✅ Feedback Schema Validation
const feedbackSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  recipe_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().required(),
});

// ✅ Add New Feedback
app.post("/api/feedback", async (req, res) => {
  try {
    await feedbackSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { user_id, recipe_id, rating, comment } = req.body;
  const query = "INSERT INTO feedback (user_id, recipe_id, rating, comment) VALUES (?, ?, ?, ?)";
  con.query(query, [user_id, recipe_id, rating, comment], (err, result) => {
    if (err) return res.status(500).json({ message: "Error adding feedback" });
    res.status(201).json({ message: "Feedback added successfully", id: result.insertId });
  });
});

// ✅ Fetch all feedback
app.get("/api/feedback", (req, res) => {
  con.query("SELECT * FROM feedback", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching feedback" });
    res.json(results);
  });
});

// ✅ Get a single feedback by ID
app.get("/api/feedback/:id", (req, res) => {
  con.query("SELECT * FROM feedback WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching feedback" });
    if (result.length === 0) return res.status(404).json({ message: "Feedback not found" });
    res.json(result[0]);
  });
});

// ✅ Update feedback
app.put("/api/feedback/:id", async (req, res) => {
  try {
    await feedbackSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { user_id, recipe_id, rating, comment } = req.body;
  const query = "UPDATE feedback SET user_id=?, recipe_id=?, rating=?, comment=? WHERE id=?";
  con.query(query, [user_id, recipe_id, rating, comment, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating feedback" });
    res.json({ message: "Feedback updated successfully" });
  });
});

// ✅ Delete feedback
app.delete("/api/feedback/:id", (req, res) => {
  con.query("DELETE FROM feedback WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting feedback" });
    res.json({ message: "Feedback deleted successfully" });
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
