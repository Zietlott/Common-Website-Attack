const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const databaseDir = path.resolve(__dirname, "../../database");

const schemaPath = path.join(databaseDir, "schema.sql");
const seedPath = path.join(databaseDir, "seed.sql");
const testDbPath = path.join(databaseDir, "security_lab_test.db");
const testSessionDbPath = path.join(databaseDir, "sessions_test.db");

// Chỉ được phép khởi tạo database trong môi trường test
if (process.env.NODE_ENV !== "test") {
  throw new Error("Test database setup requires NODE_ENV=test");
}

if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}
// Xóa session test cũ để tránh ảnh hưởng giữa các lần kiểm thử
if (fs.existsSync(testSessionDbPath)) {
  fs.unlinkSync(testSessionDbPath);
}

const db = new Database(testDbPath);

try {
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(schemaPath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");

  db.exec(schema);
  db.exec(seed);

  console.log("Test database initialized successfully");
} finally {
  db.close();
}