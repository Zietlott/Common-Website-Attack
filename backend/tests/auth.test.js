const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("POST /api/comments - Reject unauthenticated users", async () => {
  const response = await request(app)
    .post("/api/comments")
    .send({
      user_id: 1,
      content: "Unauthorized comment test",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Authentication required"
  );
});


test("POST /api/auth/login - Login successfully", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "student123",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.id, 2);
  assert.equal(response.body.data.username, "student");
  assert.ok(response.headers["set-cookie"]);
});


test("POST /api/auth/login - Reject incorrect password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "wrongpassword123",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Invalid username or password"
  );
  assert.equal(response.headers["set-cookie"], undefined);
});


test("POST /api/comments - Prevent user impersonation", async () => {
  const agent = request.agent(app);

  // Đăng nhập bằng tài khoản student (ID = 2)
  const loginResponse = await agent
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "student123",
    });

  assert.equal(loginResponse.status, 200);

  // Cố tình gửi user_id = 1 (admin)
  const response = await agent
    .post("/api/comments")
    .send({
      user_id: 1,
      content: "Automated impersonation test",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);

  // Server phải lấy ID từ session, không lấy từ request
  assert.equal(response.body.data.user_id, 2);

  // Xóa bình luận thử nghiệm khỏi database
  const db = require("../src/config/database");
  db.prepare("DELETE FROM comments WHERE id = ?").run(
    response.body.data.id
  );
});

