
-- Sample users for Security Lab
-- Passwords are hashed using bcrypt (cost factor 12)
INSERT OR IGNORE INTO users (id, username, password, email)
VALUES
(1, 'student', '$2b$12$OQm8ppUO4dEt0VTGILOvOOy4nnXlFg6wwzcpIwI3v/JGWIxRu5tiC', 'student@example.com');
