const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const con = require("../config/db");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

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
};

const loginUser = async (req, res) => {
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
        email: user.email,
      },
    });
  });
};

module.exports = { registerUser, loginUser };
