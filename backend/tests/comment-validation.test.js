const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("POST /api/comments - Reject invalid content", async () => {
  const agent = request.agent(app);

  // Đăng nhập bằng tài khoản student
  const loginResponse = await agent
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "student123",
    });

  assert.equal(loginResponse.status, 200);

  const invalidContents = [
    "",
    "   ",
    null,
    123,
    true,
    "a".repeat(2001),
  ];

  for (const content of invalidContents) {
    const response = await agent
      .post("/api/comments")
      .send({ content });

    assert.equal(
      response.status,
      400,
      `Expected 400 for content: ${String(content).slice(0, 30)}`
    );

    assert.equal(response.body.success, false);
    assert.equal(
      response.body.message,
      "Content must be 1-2000 characters"
    );
  }
});