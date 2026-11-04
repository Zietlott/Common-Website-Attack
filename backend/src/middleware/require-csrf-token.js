const crypto = require("node:crypto");

function requireCsrfToken(req, res, next) {
  const providedToken = req.get("X-CSRF-Token");
  const expectedToken = req.session?.csrfToken;
  const providedBuffer = Buffer.from(
    typeof providedToken === "string" ? providedToken : "",
    "utf8",
  );
  const expectedBuffer = Buffer.from(
    typeof expectedToken === "string" ? expectedToken : "",
    "utf8",
  );

  if (
    !expectedToken ||
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
}

module.exports = requireCsrfToken;
