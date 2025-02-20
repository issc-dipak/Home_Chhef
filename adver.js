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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "md181023", 
  database: "Home",
});

con.connect((err) => {
  if (err) {
    console.error("Database Connection Failed:", err);
    process.exit(1);
  }
  console.log("MySQL Connected...");
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Advertisement
app.post("/api/ads/add", upload.single("image"), (req, res) => {
  const { name, description, link } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  con.query(
    "INSERT INTO advertisements (name, description, image, link) VALUES (?, ?, ?, ?)",
    [name, description, image, link],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error adding advertisement", error: err });
      }
      res.status(201).json({ message: "Advertisement added successfully", id: result.insertId });
    }
  );
});

// Get All Advertisements
app.get("/api/ads", (req, res) => {
  con.query("SELECT * FROM advertisements", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching advertisements", error: err });
    }
    res.json(results);
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
