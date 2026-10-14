
-- Sample users for Security Lab
INSERT OR IGNORE INTO users (id, username, password, email)
VALUES
(1, 'admin', 'admin123', 'admin@example.com'),
(2, 'student', 'student123', 'student@example.com');

-- Sample comments for XSS Lab
INSERT OR IGNORE INTO comments (id, user_id, content)
VALUES
(1, 1, 'Bình luận thử nghiệm của admin.'),
(2, 2, 'Bình luận thử nghiệm của student.');
