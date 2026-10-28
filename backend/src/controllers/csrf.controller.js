
const crypto = require("node:crypto");

function startDemo(req, res) {
  req.session.userId = 1;
  req.session.displayName = "Administrator";
  req.session.csrfToken = crypto.randomBytes(32).toString("hex");

  return res.status(200).json({
    success: true,
    message: "Demo session started",
    displayName: req.session.displayName,
    csrfToken: req.session.csrfToken,
  });
}

function requireDemoSession(req, res, next) {
  if (req.session.userId !== 1) {
    return res.status(401).json({
      success: false,
      message: "Demo session required",
    });
  }

  next();
}

function updateVulnerable(req, res) {
  const { displayName } = req.body || {};

  if (typeof displayName !== "string" ||
      !displayName.trim() ||
      displayName.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Invalid display name",
    });
  }

  req.session.displayName = displayName.trim();

  return res.status(200).json({
    success: true,
    mode: "vulnerable",
    displayName: req.session.displayName,
  });
}

function updateSecure(req, res) {
  const providedToken = req.get("X-CSRF-Token");
  const expectedToken = req.session.csrfToken;

  const providedBuffer = Buffer.from(providedToken || "", "utf8");
  const expectedBuffer = Buffer.from(expectedToken || "", "utf8");

  // Compare byte lengths before timingSafeEqual
  if (
    typeof providedToken !== "string" ||
    typeof expectedToken !== "string" ||
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  // Validate display name
  const { displayName } = req.body || {};

  if (
    typeof displayName !== "string" ||
    !displayName.trim() ||
    displayName.length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid display name",
    });
  }

  // Update session data
  req.session.displayName = displayName.trim();

  return res.status(200).json({
    success: true,
    mode: "secure",
    displayName: req.session.displayName,
  });
}

function getDemoState(req, res) {
  return res.status(200).json({
    success: true,
    displayName: req.session.displayName,
  });
}

module.exports = {
  startDemo,
  requireDemoSession,
  updateVulnerable,
  updateSecure,
  getDemoState,
};
