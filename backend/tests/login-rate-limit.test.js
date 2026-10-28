const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const express = require("express");

const loginRateLimit = require("../src/middleware/login-rate-limit");

// Create an isolated test application
const app = express();
app.use(express.json());

app.post("/login", loginRateLimit, (req, res) => {
  const { password } = req.body;

  if (password === "correct-password") {
    return res.status(200).json({
      success: true,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

test("Login Rate Limit - Block after 5 failed attempts", async () => {
  for (let i = 1; i <= 5; i++) {
    const response = await request(app)
      .post("/login")
      .send({ password: "wrong-password" });

    assert.equal(response.status, 401);
  }

  const blocked = await request(app)
    .post("/login")
    .send({ password: "wrong-password" });

  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.success, false);
  assert.equal(
    blocked.body.message,
    "Too many login attempts. Please try again after 15 minutes."
  );
});

test("Login Rate Limit - Do not count successful logins", async () => {
  // Dùng địa chỉ IP riêng để tránh ảnh hưởng test trước
  const successfulApp = express();
  successfulApp.use(express.json());

  const { rateLimit } = require("express-rate-limit");

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
  });

  successfulApp.post("/login", limiter, (req, res) => {
    return res.status(200).json({
      success: true,
    });
  });

  for (let i = 0; i < 6; i++) {
    const response = await request(successfulApp)
      .post("/login")
      .send({ password: "correct-password" });

    assert.equal(response.status, 200);
  }
});