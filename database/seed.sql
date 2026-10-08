USE common_website_attack;

INSERT INTO users (username, password, email)
VALUES
('admin', 'admin123', 'admin@example.com'),
('student', 'student123', 'student@example.com');

INSERT INTO comments (user_id, content)
VALUES
(1, 'Bình luận thử nghiệm của admin.'),
(2, 'Bình luận thử nghiệm của student.');