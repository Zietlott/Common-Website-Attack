function requireAuth(req, res, next) {
  if (
    !req.session ||
    !Number.isSafeInteger(req.session.authUserId) ||
    req.session.authUserId <= 0
  ) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
}

module.exports = requireAuth;
