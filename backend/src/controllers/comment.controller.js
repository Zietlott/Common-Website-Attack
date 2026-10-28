const CommentModel = require("../models/comment.model");
const UserModel = require("../models/user.model");

// GET /api/comments
function getAllComments(req, res) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  // Validate pagination parameters
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  const comments = CommentModel.findAll(limit, offset);

  return res.status(200).json({
    success: true,
    page,
    limit,
    data: comments,
  });
}

function createComment(req, res) {
  // Get authenticated user ID from session
  const userId = req.session.authUserId;
  const { content } = req.body || {};

  // Validate authenticated user ID
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Check whether authenticated user exists
  const user = UserModel.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid authenticated user",
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
