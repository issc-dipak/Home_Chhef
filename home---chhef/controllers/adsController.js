const con = require("../config/db");

// Add Advertisement
exports.addAd = (req, res) => {
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
};

// Get All Advertisements
exports.getAllAds = (req, res) => {
    con.query("SELECT * FROM advertisements", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching advertisements", error: err });
        res.json(results);
    });
};

// Get Single Advertisement
exports.getAdById = (req, res) => {
    const { id } = req.params;
    con.query("SELECT * FROM advertisements WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching advertisement", error: err });
        if (result.length === 0) return res.status(404).json({ message: "Advertisement not found" });
        res.json(result[0]);
    });
};

// Update Advertisement
exports.updateAd = (req, res) => {
    const { id } = req.params;
    const { name, description, link } = req.body;
    const image = req.file ? req.file.filename : req.body.image;

    con.query(
        "UPDATE advertisements SET name=?, description=?, image=?, link=? WHERE id=?",
        [name, description, image, link, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating advertisement", error: err });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Advertisement not found" });
            res.json({ message: "Advertisement updated successfully" });
        }
    );
};

// Delete Advertisement
exports.deleteAd = (req, res) => {
    const { id } = req.params;
    con.query("DELETE FROM advertisements WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting advertisement", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Advertisement not found" });
        res.json({ message: "Advertisement deleted successfully" });
    });
};
