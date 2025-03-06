const db = require("../config/db");

const searchRecipes = async (req, res) => {
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

  db.query(searchQuery, [searchValue, searchValue, searchValue], (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json({ success: true, msg: "Recipes Found", results });
    } else {
      return res.status(404).json({ success: false, msg: "No recipes found" });
    }
  });
};

module.exports = { searchRecipes };
