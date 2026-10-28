const db = require("../config/database");

// Get all users without exposing passwords
function findAll(limit = 10, offset = 0) {
  const sql = `
    SELECT id, username, created_at
    FROM users
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `;

  return db.prepare(sql).all(limit, offset);
}

// Find a user by ID
function findById(id) {
  const sql = `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = ?
  `;

  return db.prepare(sql).get(id);
}

// Find a user by username
function findByUsername(username) {
  const sql = `
    SELECT id, username, password, email
    FROM users
    WHERE username = ?
  `;

  return db.prepare(sql).get(username);
}

module.exports = {
  findAll,
  findById,
  findByUsername,
};