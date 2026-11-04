
const crypto = require("node:crypto");

function startDemo(req, res) {
  req.session.userId = 1;
  req.session.displayName = "Administrator";
  req.session.csrfDemoToken = crypto.randomBytes(32).toString("hex");
  req.session.demoBalance = 5000000;
  req.session.lastTransfer = null;

  return res.status(200).json({
    success: true,
    message: "Demo session started",
    displayName: req.session.displayName,
    csrfToken: req.session.csrfDemoToken,
    balance: req.session.demoBalance,
    lastTransfer: req.session.lastTransfer,
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

function hasTransferFields(body) {
  return (
    body !== null &&
    typeof body === "object" &&
    (Object.prototype.hasOwnProperty.call(body, "recipient") ||
      Object.prototype.hasOwnProperty.call(body, "amount"))
  );
}

function updateVulnerable(req, res) {
  if (hasTransferFields(req.body)) {
    return transferDemoFunds(req, res, "vulnerable");
  }

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
  const expectedToken = req.session.csrfDemoToken;
  if (
    typeof providedToken !== "string" ||
    typeof expectedToken !== "string" ||
    expectedToken.length === 0 ||
    providedToken.length === 0
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  const providedBuffer = Buffer.from(providedToken, "utf8");
  const expectedBuffer = Buffer.from(expectedToken, "utf8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  if (hasTransferFields(req.body)) {
    return transferDemoFunds(req, res, "secure");
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

function transferDemoFunds(req, res, mode) {
  const { recipient, amount } = req.body || {};
  const parsedAmount =
    typeof amount === "string" && /^\d+$/.test(amount)
      ? Number(amount)
      : amount;
  const balance = req.session.demoBalance;

  if (
    typeof recipient !== "string" ||
    !/^\d{6,16}$/.test(recipient) ||
    !Number.isSafeInteger(parsedAmount) ||
    parsedAmount <= 0 ||
    !Number.isSafeInteger(balance) ||
    parsedAmount > balance
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid demo transfer",
    });
  }

  req.session.demoBalance = balance - parsedAmount;
  req.session.lastTransfer = {
    recipient,
    amount: parsedAmount,
    mode,
  };

  return res.status(200).json({
    success: true,
    mode,
    balance: req.session.demoBalance,
    lastTransfer: req.session.lastTransfer,
  });
}

function getDemoState(req, res) {
  return res.status(200).json({
    success: true,
    displayName: req.session.displayName,
    csrfToken: req.session.csrfDemoToken,
    balance: req.session.demoBalance,
    lastTransfer: req.session.lastTransfer,
  });
}

module.exports = {
  startDemo,
  requireDemoSession,
  updateVulnerable,
  updateSecure,
  getDemoState,
};
