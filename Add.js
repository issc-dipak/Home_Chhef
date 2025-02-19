const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());

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
    console.log("MySQL Connected..add-recipe");
  }
});

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Recipe Schema Validation
const recipeSchema = Joi.object({
  title: Joi.string().required(),
  pre_time: Joi.string().required(),
  cook_time: Joi.string().required(),
  ingredients: Joi.string().required(),
  description: Joi.string().required()
});

// Add Recipe API
app.post("/add-recipe", upload.single("add_image"), async (req, res) => {
  try {
    await recipeSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { title, pre_time, cook_time, ingredients, description } = req.body;
  const add_image = req.file ? req.file.filename : null;

  const query = "INSERT INTO recipes (title, pre_time, cook_time, ingredients, description, add_image) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(query, [title, pre_time, cook_time, ingredients, description, add_image], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(201).json({
      status: "success",
      message: "Recipe added successfully",
      recipe: {
        id: results.insertId,
        title,
        pre_time,
        cook_time,
        ingredients,
        description,
        add_image
      }
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

