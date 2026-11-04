const session = require("express-session");
const Database = require("better-sqlite3");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SqliteStore = require("better-sqlite3-session-store")(session);

const sessionDbPath = process.env.NODE_ENV === "test"
  ? path.resolve(__dirname, "../../../database/sessions_test.db")
  : process.env.SESSION_DB_PATH ||
    path.join(os.tmpdir(), "common-website-attack", "sessions.db");

fs.mkdirSync(path.dirname(sessionDbPath), { recursive: true });

const sessionDb = new Database(sessionDbPath);

const demoSession = session({
  name: "security_lab.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: new SqliteStore({
    client: sessionDb,
    expired: {
      clear: true,
      intervalMs:
        process.env.NODE_ENV === "test"
          ? 2147483647
          : 15 * 60 * 1000,
    },
  }),

  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 60 * 1000,
  },
});

module.exports = demoSession;
