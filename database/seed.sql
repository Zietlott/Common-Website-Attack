
-- Sample users for Security Lab
-- Passwords are hashed using bcrypt (cost factor 12)
INSERT OR IGNORE INTO users (id, username, password, email)
VALUES
(1, 'admin', '$2b$12$YSTV1sSEmgxB9rFpyZaRc.seweGRSJ.Rv/Y/gWe7rgy8V8tX60TWK', 'admin@example.com'),
(2, 'student', '$2b$12$OQm8ppUO4dEt0VTGILOvOOy4nnXlFg6wwzcpIwI3v/JGWIxRu5tiC', 'student@example.com');

-- Sample comments for XSS Lab
INSERT OR IGNORE INTO comments (id, user_id, content)
VALUES
(1, 1, 'Bình luận thử nghiệm của admin.'),
(2, 2, 'Bình luận thử nghiệm của student.');
