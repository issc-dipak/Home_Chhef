const express = require("express");
const path = require("path"); // Add this line
const { addAd, getAllAds, getAdById, updateAd, deleteAd } = require("../controllers/adsController");
const multer = require("multer");
const router = express.Router();

// ✅ Multer Setup
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ✅ Define Routes
router.post("/add", upload.single("image"), addAd);
router.get("/", getAllAds);
router.get("/:id", getAdById);
router.put("/:id", upload.single("image"), updateAd);
router.delete("/:id", deleteAd);

module.exports = router;