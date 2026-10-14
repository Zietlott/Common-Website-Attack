
const db = require("../config/database");

// Vulnerable mode - intentionally unsafe query
// LOCAL SECURITY LAB ONLY
function searchVulnerable(username) {
  const sql = `
    SELECT id, username, email
    FROM users
    WHERE username = '${username}'
  `;

  const users = db.prepare(sql).all();

  return {
    query: sql,
    users,
  };
}

// Secure mode - parameterized query
function searchSecure(username) {
  const sql = `
    SELECT id, username, email
    FROM users
    WHERE username = ?
  `;

  const users = db.prepare(sql).all(username);

  return {
    query: sql,
    users,
  };
}

module.exports = {
  searchVulnerable,
  searchSecure,
};
