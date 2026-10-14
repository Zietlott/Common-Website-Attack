
require("dotenv").config();

const db = require("./src/config/database");

try {
  const users = db
    .prepare("SELECT id, username, email FROM users ORDER BY id")
    .all();

  const comments = db
    .prepare("SELECT id, user_id, content FROM comments ORDER BY id")
    .all();

  console.log("USERS:", users);
  console.log("COMMENTS:", comments);
} finally {
  db.close();
}
