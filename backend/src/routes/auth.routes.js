const express = require("express");
const { login } = require("../controllers/auth.controller");
const loginRateLimit = require("../middleware/login-rate-limit");

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginRateLimit, login);

module.exports = router;
