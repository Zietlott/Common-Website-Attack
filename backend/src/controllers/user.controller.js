
const UserModel = require("../models/user.model");

// GET /api/users
function getAllUsers(req, res) {
  const users = UserModel.findAll();

  return res.status(200).json({
    success: true,
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
