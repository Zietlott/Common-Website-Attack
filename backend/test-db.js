
require("dotenv").config();

const db = require("./src/config/database");

const result = db.prepare("SELECT sqlite_version() AS version").get();

console.log("SQLite connected successfully!");
console.log("SQLite version:", result.version);

db.close();

