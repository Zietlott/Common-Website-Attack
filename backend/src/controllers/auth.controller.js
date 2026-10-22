const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = UserModel.findByUsername(username.trim());

    const validPassword =
      user && await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);

      // Separate real authentication from CSRF demo identity
      req.session.authUserId = user.id;

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      });
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
};
