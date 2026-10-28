const db = require("../config/database");

// Get comments with pagination and usernames
function findAll(limit = 10, offset = 0) {
  const sql = `
    SELECT
      c.id,
      c.user_id,
      u.username,
      c.content,
      c.created_at
    FROM comments c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.id ASC
    LIMIT ? OFFSET ?
  `;

  return db.prepare(sql).all(limit, offset);
}

// Create a new comment
function create(userId, content) {
  const sql = `
    INSERT INTO comments (user_id, content)
    VALUES (?, ?)
  `;

  const result = db.prepare(sql).run(userId, content);

  return db
    .prepare(`
      SELECT id, user_id, content, created_at
      FROM comments
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

module.exports = {
  findAll,
  create,
};