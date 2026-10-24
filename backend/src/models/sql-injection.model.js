
const db = require("../config/database");
const bcrypt = require("bcryptjs");

db.function(
  "bcrypt_compare",
  { deterministic: true },
  (password, passwordHash) =>
    bcrypt.compareSync(password, passwordHash) ? 1 : 0,
);

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

function loginVulnerable(username, password) {
  const sql = `
    SELECT id, username, email
    FROM users
    WHERE username = '${username}'
      AND bcrypt_compare('${password}', password) = 1
  `;

  return db.prepare(sql).get();
}

async function loginSecure(username, password) {
  const sql = `
    SELECT id, username, password, email
    FROM users
    WHERE username = ?
  `;
  const user = db.prepare(sql).get(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return undefined;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

module.exports = {
  searchVulnerable,
  searchSecure,
  loginVulnerable,
  loginSecure,
};
