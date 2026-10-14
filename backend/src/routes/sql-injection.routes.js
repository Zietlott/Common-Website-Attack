
const express = require("express");

const {
  vulnerableSearch,
  secureSearch,
} = require("../controllers/sql-injection.controller");

const router = express.Router();

router.post("/vulnerable", vulnerableSearch);
router.post("/secure", secureSearch);

module.exports = router;
