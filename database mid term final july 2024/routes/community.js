const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route to render the Community Page
router.get('/', (req, res) => {
    const query = `SELECT * FROM pictures`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error.");
        } else {
            res.render('community', { pictures: rows });
        }
    });
});

// Route to handle picture uploads
router.post('/upload', upload.single('picture'), (req, res) => {
    const file = req.file;
    const description = req.body.description;
    
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const query = `INSERT INTO pictures (filename, description) VALUES (?, ?)`;
    db.run(query, [file.filename, description], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error.");
        } else {
            res.redirect('/community');
        }
    });
});

// Route to handle likes
router.post('/like/:id', (req, res) => {
    const id = req.params.id;
    const query = `UPDATE pictures SET likes = likes + 1 WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error.");
        } else {
            res.redirect('/community');
        }
    });
});

module.exports = router;
