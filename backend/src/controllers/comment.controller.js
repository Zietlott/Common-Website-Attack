
const CommentModel = require("../models/comment.model");
const UserModel = require("../models/user.model");

// GET /api/comments
function getAllComments(req, res) {
  const comments = CommentModel.findAll();

  return res.status(200).json({
    success: true,
    data: comments,
  });
}

// POST /api/comments
function createComment(req, res) {
  const { user_id, content } = req.body || {};
  const userId = Number(user_id);

  // Validate user ID
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  // Check whether user exists
  const user = UserModel.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Validate comment content
  if (
    typeof content !== "string" ||
    content.trim().length === 0 ||
    content.length > 2000
  ) {
    return res.status(400).json({
      success: false,
      message: "Content must be 1-2000 characters",
    });
  }

  const comment = CommentModel.create(
    userId,
    content.trim()
  );

  return res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
}

module.exports = {
  getAllComments,
  createComment,
};
