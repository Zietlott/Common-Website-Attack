
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const db = require("./src/config/database");

const databaseDir = path.resolve(__dirname, "../database");

try {
  const schema = fs.readFileSync(
    path.join(databaseDir, "schema.sql"),
    "utf8"
  );

  const seed = fs.readFileSync(
    path.join(databaseDir, "seed.sql"),
    "utf8"
  );

  db.transaction(() => {
    db.exec(schema);
    db.exec(seed);
  })();

  console.log("Database initialized successfully!");

  const users = db.prepare(
    "SELECT COUNT(*) AS total FROM users"
  ).get();

  const comments = db.prepare(
    "SELECT COUNT(*) AS total FROM comments"
  ).get();

  console.log("Users:", users.total);
  console.log("Comments:", comments.total);

} catch (error) {
  console.error("Database initialization failed:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
