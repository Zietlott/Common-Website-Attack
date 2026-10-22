const express = require("express");

const {
  getAllComments,
  createComment,
} = require("../controllers/comment.controller");

const requireAuth = require("../middleware/require-auth");

const router = express.Router();

// Public: Read comments for XSS Lab
router.get("/", getAllComments);

// Protected: Only authenticated users can create comments
router.post("/", requireAuth, createComment);

module.exports = router;
