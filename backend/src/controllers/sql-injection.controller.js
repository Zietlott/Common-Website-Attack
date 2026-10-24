
const SqlInjectionModel = require("../models/sql-injection.model");

function validateUsername(username) {
  return (
    typeof username === "string" &&
    username.length > 0 &&
    username.length <= 200
  );
}

// POST /api/labs/sqli/vulnerable
function vulnerableSearch(req, res) {
  const { username } = req.body || {};

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username must be 1-200 characters",
    });
  }

  const result = SqlInjectionModel.searchVulnerable(username);

  return res.status(200).json({
    success: true,
    mode: "vulnerable",
    query: result.query,
    data: result.users,
  });
}

// POST /api/labs/sqli/secure
function secureSearch(req, res) {
  const { username } = req.body || {};

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username must be 1-200 characters",
    });
  }

  const result = SqlInjectionModel.searchSecure(username);

  return res.status(200).json({
    success: true,
    mode: "secure",
    query: result.query,
    data: result.users,
  });
}

function validateCredentials(username, password) {
  return (
    typeof username === "string" &&
    username.length > 0 &&
    username.length <= 200 &&
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= 200
  );
}

function renderLoginResult(res, mode, user) {
  return res.status(200).json({
    success: true,
    mode,
    authenticated: Boolean(user),
    user: user || null,
    message: user ? "Demo login successful" : "Invalid username or password",
  });
}

function vulnerableLogin(req, res, next) {
  const { username, password } = req.body || {};

  if (!validateCredentials(username, password)) {
    return res.status(400).json({
      success: false,
      message: "Username and password must each be 1-200 characters",
    });
  }

  try {
    const user = SqlInjectionModel.loginVulnerable(username, password);
    return renderLoginResult(res, "vulnerable", user);
  } catch (error) {
    return next(error);
  }
}

async function secureLogin(req, res, next) {
  const { username, password } = req.body || {};

  if (!validateCredentials(username, password)) {
    return res.status(400).json({
      success: false,
      message: "Username and password must each be 1-200 characters",
    });
  }

  try {
    const user = await SqlInjectionModel.loginSecure(username, password);
    return renderLoginResult(res, "secure", user);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  vulnerableSearch,
  secureSearch,
  vulnerableLogin,
  secureLogin,
};
