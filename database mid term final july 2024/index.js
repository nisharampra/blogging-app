// index.js
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// SQLite database setup
global.db = new sqlite3.Database('./database.db', function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON");
    }
});

// Routes setup
const authRoutes = require('./routes/auth'); // Import authentication routes
app.use('/', authRoutes); // Use authentication routes

// Example homepage route - requires authentication
app.get('/home', (req, res) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        db.all('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching posts:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('index', { username: req.session.username, posts: rows });
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Routes
const authorRoutes = require('./routes/author');
app.use('/author', authorRoutes);

// Import article routes
const articleRoutes = require('./routes/articles');
app.use('/articles', articleRoutes);

const readerRoutes = require('./routes/reader');
app.use('/reader', readerRoutes);

// Import community routes
const communityRoute = require('./routes/community');
app.use('/community', communityRoute);

// Redirect root path to home page
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
