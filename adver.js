const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// ✅ MySQL Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "md181023", // Change this to your MySQL password
  database: "Home",
});

con.connect(err => {
    if (err) {
        console.error("Database Connection Failed:", err);
        process.exit(1);
    }
    console.log("MySQL Connected...");
});

// ✅ Multer Storage Setup for Image Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ✅ 1️⃣ Add Advertisement (POST)
app.post("/api/ads/add", upload.single("image"), (req, res) => {
    const { name, description, link } = req.body;
    const image = req.file ? req.file.filename : null;

    con.query(
        "INSERT INTO advertisements (name, description, image, link) VALUES (?, ?, ?, ?)",
        [name, description, image, link],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error adding advertisement", error: err });
            res.status(201).json({ message: "Advertisement added successfully" });
        }
    );
});

// ✅ 2️⃣ Get All Advertisements (GET)
app.get("/api/ads", (req, res) => {
    con.query("SELECT * FROM advertisements", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching advertisements", error: err });
        res.json(results);
    });
});

// ✅ 3️⃣ Get Single Advertisement (GET)
app.get("/api/ads/:id", (req, res) => {
    const { id } = req.params;
    con.query("SELECT * FROM advertisements WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching advertisement", error: err });
        if (result.length === 0) return res.status(404).json({ message: "Advertisement not found" });
        res.json(result[0]);
    });
});

// ✅ 4️⃣ Update Advertisement (PUT)
app.put("/api/ads/:id", upload.single("image"), (req, res) => {
    const { id } = req.params;
    const { name, description, link } = req.body;
    const image = req.file ? req.file.filename : req.body.image; // Keep old image if not updated

    con.query(
        "UPDATE advertisements SET name=?, description=?, image=?, link=? WHERE id=?",
        [name, description, image, link, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating advertisement", error: err });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Advertisement not found" });
            res.json({ message: "Advertisement updated successfully" });
        }
    );
});

// ✅ 5️⃣ Delete Advertisement (DELETE)
app.delete("/api/ads/:id", (req, res) => {
    const { id } = req.params;
    con.query("DELETE FROM advertisements WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting advertisement", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Advertisement not found" });
        res.json({ message: "Advertisement deleted successfully" });
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
