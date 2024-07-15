
-- -- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
-- PRAGMA foreign_keys=ON;

-- BEGIN TRANSACTION;

-- -- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

-- CREATE TABLE IF NOT EXISTS users (
--     user_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     user_name TEXT NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS email_accounts (
--     email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     email_address TEXT NOT NULL,
--     user_id  INT, --the user that the email account belongs to
--     FOREIGN KEY (user_id) REFERENCES users(user_id)
-- );

-- -- Insert default data (if necessary here)

-- -- Set up three users
-- INSERT INTO users ('user_name') VALUES ('Simon Star');
-- INSERT INTO users ('user_name') VALUES ('Dianne Dean');
-- INSERT INTO users ('user_name') VALUES ('Harry Hilbert');

-- -- Give Simon two email addresses and Diane one, but Harry has none
-- INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@gmail.com', 1); 
-- INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@hotmail.com', 1); 
-- INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('dianne@yahoo.co.uk', 2); 

-- COMMIT;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES posts(id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES posts(id)
);

-- Create pictures table
CREATE TABLE IF NOT EXISTS pictures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    description TEXT NOT NULL,
    likes INTEGER DEFAULT 0
);

-- The following ALTER TABLE statements are unnecessary as the columns are already included in the create table statements
-- ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'draft';
-- ALTER TABLE comments ADD COLUMN username TEXT NOT NULL;
