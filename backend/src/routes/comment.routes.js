const express = require("express");

const {
  getAllComments,
  createComment,
} = require("../controllers/comment.controller");

const requireAuth = require("../middleware/require-auth");
const requireCsrfToken = require("../middleware/require-csrf-token");

const router = express.Router();

// Public: Read comments for XSS Lab
router.get("/", getAllComments);

// Protected: Only authenticated users can create comments
router.post("/", requireAuth, requireCsrfToken, createComment);

module.exports = router;
