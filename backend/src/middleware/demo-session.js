
const session = require("express-session");

const demoSession = session({
  name: "security_lab.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 30 * 60 * 1000,
  },
});

module.exports = demoSession;
