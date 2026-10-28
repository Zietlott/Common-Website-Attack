const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("Comments API - Pagination and validation", async () => {
  // Trang 1: lấy 1 bình luận
  const page1 = await request(app)
    .get("/api/comments?page=1&limit=1");

  assert.equal(page1.status, 200);
  assert.equal(page1.body.success, true);
  assert.equal(page1.body.page, 1);
  assert.equal(page1.body.limit, 1);
  assert.equal(page1.body.data.length, 1);
  assert.equal(page1.body.data[0].id, 1);

  // Trang 2: lấy bình luận tiếp theo
  const page2 = await request(app)
    .get("/api/comments?page=2&limit=1");

  assert.equal(page2.status, 200);
  assert.equal(page2.body.data.length, 1);
  assert.equal(page2.body.data[0].id, 2);

  // Trang không có dữ liệu
  const emptyPage = await request(app)
    .get("/api/comments?page=100&limit=10");

  assert.equal(emptyPage.status, 200);
  assert.deepEqual(emptyPage.body.data, []);

  // Kiểm tra tham số không hợp lệ
  const invalidQueries = [
    "?page=0",
    "?page=abc",
    "?limit=0",
    "?limit=101",
    "?limit=abc",
  ];

  for (const query of invalidQueries) {
    const response = await request(app).get(`/api/comments${query}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  }
});