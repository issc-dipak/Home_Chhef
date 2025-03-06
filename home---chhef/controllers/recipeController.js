const con = require("../config/db");
const Joi = require("joi");

// Schema Validation
const recipeSchema = Joi.object({
  title: Joi.string().required(),
  pre_time: Joi.string().required(),
  cook_time: Joi.string().required(),
  ingredients: Joi.string().required(),
  description: Joi.string().required()
});

// ✅ Add Recipe
exports.addRecipe = async (req, res) => {
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
      recipe: { id: results.insertId, title, pre_time, cook_time, ingredients, description, add_image }
    });
  });
};

// ✅ Get all recipes
exports.getAllRecipes = (req, res) => {
  con.query("SELECT * FROM recipes", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching recipes" });
    res.json(results);
  });
};

// ✅ Get a single recipe by ID
exports.getRecipeById = (req, res) => {
  con.query("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching recipe" });
    if (result.length === 0) return res.status(404).json({ message: "Recipe not found" });
    res.json(result[0]);
  });
};

// ✅ Update Recipe
exports.updateRecipe = (req, res) => {
  const { title, description, ingredients } = req.body;
  const add_image = req.file ? req.file.filename : null;

  con.query(
    "UPDATE recipes SET title=?, description=?, ingredients=?, add_image=? WHERE id=?",
    [title, description, ingredients, add_image, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error updating recipe" });
      res.json({ message: "Recipe updated successfully" });
    }
  );
};

// ✅ Delete Recipe
exports.deleteRecipe = (req, res) => {
  con.query("DELETE FROM recipes WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting recipe" });
    res.json({ message: "Recipe deleted successfully" });
  });
};



