const express = require("express");

const {
  vulnerableSearch,
  secureSearch,
  vulnerableLogin,
  secureLogin,
} = require("../controllers/sql-injection.controller");

const router = express.Router();

router.post("/vulnerable", vulnerableSearch);
router.post("/secure", secureSearch);
router.post("/login-vulnerable", vulnerableLogin);
router.post("/login-secure", secureLogin);

module.exports = router;
