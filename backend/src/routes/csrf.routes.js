const express = require("express");

const {
  startDemo,
  requireDemoSession,
  updateVulnerable,
  updateSecure,
  getDemoState,
} = require("../controllers/csrf.controller");

const router = express.Router();

router.use(express.urlencoded({ extended: false, limit: "10kb" }));
router.post("/start", startDemo);

router.use(requireDemoSession);

router.get("/state", getDemoState);
router.post("/vulnerable", updateVulnerable);
router.post("/secure", updateSecure);

module.exports = router;
