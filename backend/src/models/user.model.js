
const db = require("../config/database");

// Get all users without exposing passwords
function findAll() {
  const sql = `
    SELECT id, username, email, created_at
    FROM users
    ORDER BY id ASC
  `;

  return db.prepare(sql).all();
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

module.exports = {
  findAll,
  findById,
};
