const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt module
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Route to render the create article form
router.get('/create', (req, res) => {
    res.render('createArticle');
});

// Route to create a new article (draft)
router.post('/create', (req, res) => {
    const userId = req.session.userId;
    const { title, content } = req.body;
    const status = 'draft';

    db.run('INSERT INTO posts (user_id, title, content, status) VALUES (?, ?, ?, ?)', [userId, title, content, status], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            res.redirect('/author/home');
        }
    });
});

// Route to render edit article form
router.get('/edit/:id', (req, res) => {
    const { id } = req.params;

    // Fetch article from database by id
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, article) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            if (!article) {
                res.status(404).send("Article not found");
            } else {
                // Render edit form with article data
                res.render('editArticle', { article });
            }
        }
    });
});

// Route to update an article
router.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // Update article in the database
    db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            res.redirect('/author/home'); // Redirect to author home page after successful update
        }
    });
});

// Route to delete an article
router.post('/delete/:id', (req, res) => {
    const { id } = req.params;

    // Delete article from the database
    db.run('DELETE FROM posts WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            res.redirect('/author/home');
        }
    });
});

// Route to publish an article
router.post('/publish/:id', (req, res) => {
    const { id } = req.params;

    // Update article status to "published" in the database
    db.run('UPDATE posts SET status = ? WHERE id = ?', ['published', id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            res.redirect('/author/home');
        }
    });
});

// Route to handle logout
router.post('/logout', (req, res) => {
    // Clear session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send("Internal Server Error");
        } else {
            res.redirect('/login'); // Redirect to login page after logout
        }
    });
});

// Route to handle password change
router.post('/change-password', (req, res) => {
    const { newPassword } = req.body;
    const userId = req.session.userId; // Assuming userId is stored in session

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send("Internal Server Error");
        }

        // Update user's password in the database
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function (err) {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).send("Internal Server Error");
            }
            res.redirect('/login'); // Redirect after password change
        });
    });
});



module.exports = router;
