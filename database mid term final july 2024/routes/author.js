const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Route to render Author Home Page

// Route to render Author Home Page
router.get('/home', checkAuth, (req, res) => {
    const userId = req.session.userId;

    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, userRow) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        } else {
            db.all('SELECT * FROM posts WHERE user_id = ? AND status = "draft"', [userId], (err, draftRows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("Internal Server Error");
                } else {
                    const publishedQuery = `
                        SELECT posts.*, 
                               (SELECT COUNT(*) FROM comments WHERE comments.article_id = posts.id) AS comment_count,
                               (SELECT COUNT(*) FROM likes WHERE likes.article_id = posts.id) AS like_count
                        FROM posts 
                        WHERE user_id = ? AND status = "published"
                    `;
                    db.all(publishedQuery, [userId], (err, publishedRows) => {
                        if (err) {
                            console.error(err.message);
                            res.status(500).send("Internal Server Error");
                        } else {
                            res.render('authorHome', {
                                username: userRow.username,
                                draftArticles: draftRows,
                                publishedArticles: publishedRows
                            });
                        }
                    });
                }
            });
        }
    });
});

// Function to update username in the database
function updateUsername(userId, newUsername, callback) {
    db.run(
        `UPDATE users SET username = ? WHERE id = ?`,
        [newUsername, userId],
        function(err) {
            if (err) {
                callback(err);
            } else {
                // Success
                callback(null);
            }
        }
    );
}

// Route to render the username change page
router.get('/settings', checkAuth, (req, res) => {
    res.render('changeUsername');
});


// Route to handle username update
// Route to handle username update
router.post('/settings', checkAuth, (req, res) => {
    const userId = req.session.userId;
    const { newUsername } = req.body;

    updateUsername(userId, newUsername, (err) => {
        if (err) {
            console.error('Username update error:', err);
            return res.status(500).send('Server error');
        }

        req.session.username = newUsername; // Update session variable

        res.redirect('/author/home'); // Redirect after successful update
    });
});





module.exports = router;
