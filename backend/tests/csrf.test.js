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

  const stateResponse = await agent
    .get("/api/labs/csrf/state");

  assert.equal(stateResponse.status, 200);
  assert.equal(stateResponse.body.csrfToken, token);
  const originalName = stateResponse.body.displayName;

  // Missing token
  const missing = await agent
    .post("/api/labs/csrf/secure")
    .send({ displayName: "Missing Token" });

  assert.equal(missing.status, 403);
  const afterMissing = await agent.get("/api/labs/csrf/state");
  assert.equal(afterMissing.body.displayName, originalName);

  // Invalid token
  const invalid = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", "invalid-token")
    .send({ displayName: "Invalid Token" });

  assert.equal(invalid.status, 403);
  const afterInvalid = await agent.get("/api/labs/csrf/state");
  assert.equal(afterInvalid.body.displayName, originalName);

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
  const afterValid = await agent.get("/api/labs/csrf/state");
  assert.equal(afterValid.body.displayName, "Secure User");
});

test("CSRF Lab - Unprotected endpoint accepts the simulated cross-site change", async () => {
  const agent = request.agent(app);
  await agent.post("/api/labs/csrf/start");

  const response = await agent
    .post("/api/labs/csrf/vulnerable")
    .send({ displayName: "Changed without token" });

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "vulnerable");
  assert.equal(response.body.displayName, "Changed without token");
});

test("CSRF Lab - Form-encoded transfer changes only the fake demo balance", async () => {
  const agent = request.agent(app);
  const start = await agent.post("/api/labs/csrf/start");
  assert.equal(start.body.balance, 5000000);

  const response = await agent
    .post("/api/labs/csrf/vulnerable")
    .type("form")
    .send({ recipient: "9988776655", amount: "500000" });

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "vulnerable");
  assert.equal(response.body.balance, 4500000);
  assert.deepEqual(response.body.lastTransfer, {
    recipient: "9988776655",
    amount: 500000,
    mode: "vulnerable",
  });
  const state = await agent.get("/api/labs/csrf/state");
  assert.equal(state.body.balance, 4500000);
});

test("CSRF Lab - Secure form transfer without token is rejected without changing balance", async () => {
  const agent = request.agent(app);
  await agent.post("/api/labs/csrf/start");

  const response = await agent
    .post("/api/labs/csrf/secure")
    .type("form")
    .send({ recipient: "9988776655", amount: "500000" });

  assert.equal(response.status, 403);
  assert.equal(response.body.message, "Invalid CSRF token");
  const state = await agent.get("/api/labs/csrf/state");
  assert.equal(state.body.balance, 5000000);
  assert.equal(state.body.lastTransfer, null);
});

test("CSRF Lab - Secure demo transfer requires a valid token and sufficient balance", async () => {
  const agent = request.agent(app);
  const start = await agent.post("/api/labs/csrf/start");
  const token = start.body.csrfToken;

  const response = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", token)
    .send({ recipient: "9988776655", amount: 500000 });

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "secure");
  assert.equal(response.body.balance, 4500000);

  const overdraft = await agent
    .post("/api/labs/csrf/secure")
    .set("X-CSRF-Token", token)
    .send({ recipient: "9988776655", amount: 5000000 });
  assert.equal(overdraft.status, 400);
});