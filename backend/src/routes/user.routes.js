const express = require("express");

const {
  getAllUsers,
  getUserById,
} = require("../controllers/user.controller");

const requireAuth = require("../middleware/require-auth");

const router = express.Router();

// Require authentication for all user APIs
router.use(requireAuth);

// GET /api/users
router.get("/", getAllUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

module.exports = router;
