//routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        // Redirect to the home page
        res.redirect('/author/home');
    }
}

// Home route - does not require authentication
router.get('/', (req, res) => {
    res.render('index');
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', { message: '' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the email exists in the database
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        if (!user) {
            return res.render('login', { message: 'User not found' });
        }

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Bcrypt error:', err);
                return res.status(500).send('Server error');
            }

            if (!isMatch) {
                return res.render('login', { message: 'Invalid password' });
            }

            // Set session variables upon successful login
            req.session.userId = user.id;
            req.session.username = user.username;

            // Redirect to main home page
            res.redirect('/author/home');
        });
    });
});

// Register route
router.get('/register', (req, res) => {
    res.render('register', { message: '' });
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).send('Server error');

        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (err) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.render('register', { message: 'Username or Email already taken' });
                }
                return res.status(500).send('Server error');
            }
            res.redirect('/login');
        });
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Server error');
        res.redirect('/');
    });
});

// Route to render the change password and email page
router.get('/change-password-email', (req, res) => {
    res.render('changePassword');
});

// Route to handle password and email change form submission
router.post('/change-password-email', (req, res) => {
    const userId = req.session.userId;
    const { newEmail, newPassword } = req.body;

    bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
            console.error('Bcrypt error:', err);
            return res.status(500).send('Server error');
        }

        db.run('UPDATE users SET email = ?, password = ? WHERE id = ?', [newEmail, hash, userId], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Server error');
            }

            // Clear session and redirect to login page
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return res.status(500).send('Server error');
                }
                res.redirect('/login');
            });
        });
    });
});


module.exports = router;
