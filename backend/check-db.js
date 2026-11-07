
require("dotenv").config();

const db = require("./src/config/database");

try {
  const users = db
    .prepare("SELECT id, username, email FROM users ORDER BY id")
    .all();

  console.log("USERS:", users);
} finally {
  db.close();
}
