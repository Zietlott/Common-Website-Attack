
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

module.exports = {
  vulnerableSearch,
  secureSearch,
};
