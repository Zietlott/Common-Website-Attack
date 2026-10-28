const UserModel = require("../models/user.model");

// GET /api/users

function getAllUsers(req, res) {
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

  const users = UserModel.findAll(limit, offset);

  return res.status(200).json({
    success: true,
    page,
    limit,
    data: users,
  });
}


// GET /api/users/:id
function getUserById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  // Users can only view their own profile
  if (req.session.authUserId !== id) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const user = UserModel.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
}

module.exports = {
  getAllUsers,
  getUserById,
};
