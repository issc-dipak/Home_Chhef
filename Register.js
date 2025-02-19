const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

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
  } else {
    console.log("MySQL Connected..registration");
  }
});

app.post("/registration", async (req, res) => {
  // ✅ Define validation schema (NO mobile_no)
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "any.required": "Username is required.",
      "string.empty": "Username cannot be empty.",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string().min(4).required().messages({
      "any.required": "Password is required.",
      "string.min": "Password must be at least 4 characters long.",
    }),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.required": "Confirm password is required.",
        "any.only": "Passwords do not match.",
      }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, email, password } = req.body; // ✅ Use correct variable names

  try {
    const hashedPassword = await bcrypt.hash(password, 5); // ✅ Hash password

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    con.query(query, [username, email, hashedPassword], (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "User already registered with this email." });
        }
        console.error("MySQL error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.status(201).json({
        status: "success",
        message: "Registration successful",
        user: {
          id: results.insertId,
          username,
          email,
        },
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
