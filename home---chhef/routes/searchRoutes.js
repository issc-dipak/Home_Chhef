const express = require("express");
const { searchRecipes } = require("../controllers/searchController");

const router = express.Router();

router.get("/search", searchRecipes);

module.exports = router;
