const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const express = require("express");
const demoSession = require("../src/middleware/demo-session");
const csrfRoutes = require("../src/routes/csrf.routes");

// Test CSRF controller independently.
// Do not enable Security Labs in the main application.
const app = express();

app.use(express.json());
app.use(demoSession);
app.use("/api/labs/csrf", csrfRoutes);

test("CSRF Lab - Reject requests without demo session", async () => {
  const response = await request(app)
    .post("/api/labs/csrf/secure")
    .send({ displayName: "Test User" });

  assert.equal(response.status, 401);
});

test("CSRF Lab - Validate CSRF tokens", async () => {
  const agent = request.agent(app);

  const startResponse = await agent
    .post("/api/labs/csrf/start");

  assert.equal(startResponse.status, 200);

  const token = startResponse.body.csrfToken;
  assert.equal(typeof token, "string");

  // Missing token
  const missing = await agent
    .post("/api/labs/csrf/secure")
    .send({ displayName: "Missing Token" });

  assert.equal(missing.status, 403);

  // Invalid token
  const invalid = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", "invalid-token")
    .send({ displayName: "Invalid Token" });

  assert.equal(invalid.status, 403);

  // Unicode token
  const unicode = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", "é".repeat(64))
    .send({ displayName: "Unicode Token" });

  assert.equal(unicode.status, 403);

  // Valid token
  const valid = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", token)
    .send({ displayName: "Secure User" });

  assert.equal(valid.status, 200);
  assert.equal(valid.body.success, true);
  assert.equal(valid.body.displayName, "Secure User");
});