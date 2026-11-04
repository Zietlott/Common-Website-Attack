const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "development";
process.env.ENABLE_SECURITY_LABS = "true";

const SqlInjectionModel = require("../src/models/sql-injection.model");

const loginBypassPayload = "' OR '1'='1' -- ";

test("SQL Injection Lab - Login payload bypasses only the vulnerable query", async () => {
  const vulnerable = SqlInjectionModel.loginVulnerable(
    loginBypassPayload,
    "not-a-real-password",
  );
  const secure = await SqlInjectionModel.loginSecure(
    loginBypassPayload,
    "not-a-real-password",
  );

  assert.ok(vulnerable);
  assert.equal(typeof vulnerable.username, "string");
  assert.equal(secure, undefined);
  assert.equal(Object.hasOwn(vulnerable, "password"), false);
});

test("SQL Injection Lab - Parameterized login accepts the demo account", async () => {
  const user = await SqlInjectionModel.loginSecure("student", "student123");

  assert.equal(user.username, "student");
  assert.equal(user.email, "student@example.com");
  assert.equal(Object.hasOwn(user, "password"), false);
});
