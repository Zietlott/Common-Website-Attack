
const Database = require("better-sqlite3");
const path = require("node:path");

const dbPath = path.resolve(
  __dirname,
  "../..",
  process.env.DB_PATH || "../database/security_lab.db"
);

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

module.exports = db;
