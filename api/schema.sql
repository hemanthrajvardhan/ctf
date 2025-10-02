-- CONVERGE PRESENTS OpenCipher - CTF Platform Database Schema
-- Compatible with PostgreSQL and MySQL
-- Last Updated: 2025-10-02

-- Drop tables if they exist (PostgreSQL specific CASCADE)
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS hints CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL,
    flag_hash VARCHAR(255) NOT NULL,
    round VARCHAR(50),
    image_url VARCHAR(512),
    external_link VARCHAR(512),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hints table
CREATE TABLE hints (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    cost INTEGER DEFAULT 0,
    unlock_time INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    flag_submitted VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_submissions_correct ON submissions(is_correct);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_challenges_slug ON challenges(slug);
CREATE INDEX idx_challenges_visible ON challenges(is_visible);
CREATE INDEX idx_challenges_round ON challenges(round);
CREATE INDEX idx_hints_challenge ON hints(challenge_id);

-- Create default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, name, password_hash, role, is_banned) VALUES 
('admin@ctf.local', 'Admin User', '$2y$10$/XqyicevePLG8tDC/JTlpuB7nvY73dtmenQm47Tkz2RcGfCQaOaVO', 'admin', FALSE);

-- Sample challenges for testing (optional - can be removed for production)
-- Uncomment below to add sample challenges

/*
INSERT INTO challenges (title, slug, description, category, points, flag_hash, round, is_visible) VALUES
('Git Basics', 'git-basics', 'Learn the fundamentals of Git version control.', 'git', 100, 'flag{git_is_awesome}', 'round1', TRUE),
('Caesar Cipher', 'caesar-cipher', 'Decode a classic Caesar cipher.', 'cryptography', 150, 'flag{caesar_decoded}', 'round1', TRUE),
('SQL Injection', 'sql-injection', 'Find and exploit a SQL injection vulnerability.', 'web', 200, 'flag{sqli_found}', 'round2', TRUE);

-- Add hints for first challenge
INSERT INTO hints (challenge_id, content, cost, unlock_time, position) VALUES
(1, 'Start by running git init in your directory.', 0, 0, 1),
(1, 'Use git status to see the current state.', 10, 5, 2);
*/
