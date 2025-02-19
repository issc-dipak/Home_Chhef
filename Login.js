const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    console.log("MySQL Connected..login");
  }
});

app.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format."
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required."
    })
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  con.query(query, [email], async (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      "asdfghjklqwertyuiopzxcvbnm12345678900987654321",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});