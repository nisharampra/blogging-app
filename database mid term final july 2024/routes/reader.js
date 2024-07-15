const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

// Function to promisify db.all
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

// Function to promisify db.get for fetching a single row
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Route to render reader home page
router.get('/home', async (req, res) => {
    try {
        const articles = await dbAll(`
            SELECT p.*, u.username, 
                   (SELECT COUNT(*) FROM likes WHERE article_id = p.id) AS likes,
                   (SELECT GROUP_CONCAT(c.content, ';;') FROM comments c WHERE c.article_id = p.id) AS comments
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'published'
        `);

        // Process comments for each article
        articles.forEach(article => {
            if (article.comments) {
                article.comments = article.comments.split(';;').map(comment => {
                    return { content: comment };
                });
            } else {
                article.comments = [];
            }
        });

        res.render('readerHome', { articles });
    } catch (err) {
        console.error('Error fetching articles for reader home:', err);
        res.render('readerHome', { articles: [] });
    }
});

// Route to render individual article page
router.get('/article/:id', async (req, res) => {
    const articleId = req.params.id;

    try {
        const article = await dbGet(`
            SELECT p.*, u.username,
                   (SELECT COUNT(*) FROM likes WHERE article_id = p.id) AS likes,
                   (SELECT GROUP_CONCAT(c.username || ';;' || c.content, ';;') FROM comments c WHERE c.article_id = p.id) AS comments
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [articleId]);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        // Process comments for the article
        if (article.comments) {
            article.comments = article.comments.split(';;').map(comment => {
                const [username, content] = comment.split(';;');
                return { username, content };
            });
        } else {
            article.comments = [];
        }

        // Update views count in real application
        db.run('UPDATE posts SET views = views + 1 WHERE id = ?', [articleId]);

        res.render('readerArticle', { article });
    } catch (err) {
        console.error('Error fetching article:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/comments', (req, res) => {
    const { articleId, username, comment } = req.body;
    const created_at = new Date().toISOString(); // Or use database-specific function like `CURRENT_TIMESTAMP`

    console.log('Received comment:', { articleId, username, comment });

    db.run('INSERT INTO comments (article_id, username, content, created_at) VALUES (?, ?, ?, ?)', [articleId, username, comment, created_at], (err) => {
        if (err) {
            console.error('Error adding comment:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Comment added successfully.');
            res.redirect(`/reader/article/${articleId}`);
        }
    });
});

// Route to handle liking articles
router.post('/like', (req, res) => {
    const { articleId } = req.body;

    console.log(`Liking article ${articleId}`);

    db.run('INSERT INTO likes (article_id) VALUES (?)', [articleId], (err) => {
        if (err) {
            console.error('Error liking article:', err.message); // Log the error message
            return res.status(500).send('Error liking article'); // Send a generic error message to the client
        }

        console.log(`Article ${articleId} liked`);
        res.redirect(`/reader/article/${articleId}`);
    });
});

module.exports = router;
