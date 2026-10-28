
const Database = require("better-sqlite3");
const path = require("node:path");

if (
  process.env.NODE_ENV !== "development" ||
  process.env.ENABLE_SECURITY_LABS !== "true"
) {
  throw new Error("Security Lab database is disabled");
}

const dbPath = path.resolve(
  __dirname,
  "../../../database/security_lab_demo.db"
);

const db = new Database(dbPath, {
  fileMustExist: true,
  readonly: true,
});

module.exports = db;
