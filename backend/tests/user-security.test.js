const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("Users API - Authentication and access control", async () => {
  // Chưa đăng nhập không được xem danh sách
  const unauthenticated = await request(app).get("/api/users");

  assert.equal(unauthenticated.status, 401);

  // Đăng nhập bằng tài khoản student
  const agent = request.agent(app);

  const login = await agent
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "student123",
    });

  assert.equal(login.status, 200);

  // Được xem hồ sơ của chính mình
  const ownProfile = await agent.get("/api/users/2");

  assert.equal(ownProfile.status, 200);
  assert.equal(ownProfile.body.data.id, 2);

  // Không được xem hồ sơ của admin
  const otherProfile = await agent.get("/api/users/1");

  assert.equal(otherProfile.status, 403);

  // ID không hợp lệ
  const invalidId = await agent.get("/api/users/abc");

  assert.equal(invalidId.status, 400);
});

test("Users API - Pagination and data protection", async () => {
  const agent = request.agent(app);

  const login = await agent
    .post("/api/auth/login")
    .send({
      username: "student",
      password: "student123",
    });

  assert.equal(login.status, 200);

  // Kiểm tra trang đầu tiên
  const page1 = await agent.get("/api/users?page=1&limit=1");

  assert.equal(page1.status, 200);
  assert.equal(page1.body.page, 1);
  assert.equal(page1.body.limit, 1);
  assert.equal(page1.body.data.length, 1);
  assert.equal(page1.body.data[0].id, 1);

  // Không để lộ mật khẩu hoặc email trong danh sách
  assert.equal(page1.body.data[0].password, undefined);
  assert.equal(page1.body.data[0].email, undefined);

  // Kiểm tra trang thứ hai
  const page2 = await agent.get("/api/users?page=2&limit=1");

  assert.equal(page2.status, 200);
  assert.equal(page2.body.data.length, 1);
  assert.equal(page2.body.data[0].id, 2);

  // Kiểm tra tham số phân trang không hợp lệ
  const invalidLimit = await agent.get("/api/users?limit=101");
  assert.equal(invalidLimit.status, 400);

  const invalidPage = await agent.get("/api/users?page=0");
  assert.equal(invalidPage.status, 400);
});