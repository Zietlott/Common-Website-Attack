# TÀI LIỆU API BACKEND

## 1. Giới thiệu

Tài liệu này mô tả các API của Backend trong dự án **Common Website Attacks and Countermeasures**, giúp thành viên Frontend kết nối và sử dụng đúng các chức năng.

**Công nghệ sử dụng:**
- Node.js
- Express.js
- SQLite

**Địa chỉ Backend:**

```text
http://localhost:3000
```

Các API trả về dữ liệu ở định dạng JSON.

Lưu ý: Các endpoint mô phỏng SQL Injection và CSRF chỉ hoạt động khi `NODE_ENV=development`.

---

## 2. API kiểm tra Server

### GET /api/health

**Mục đích:** Kiểm tra Backend có đang hoạt động không.

**Phương thức:** `GET`

**URL:**

```text
http://localhost:3000/api/health
```

**Response thành công — HTTP 200:**

```json
{
  "success": true,
  "message": "Backend server is running"
}
```

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch("http://localhost:3000/api/health");
const result = await response.json();

console.log(result);
```

---

## 3. User API

### 3.1. GET /api/users

**Mục đích:** Lấy danh sách tài khoản mẫu từ Database.

**Phương thức:** `GET`

**URL:**

```text
http://localhost:3000/api/users
```

**Kết quả:**
- HTTP `200 OK` nếu truy vấn thành công.
- Trả về danh sách user mẫu trong trường `data`.
- Không trả về mật khẩu.

**Ví dụ response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
      "created_at": "2026-10-16 10:00:00"
    },
    {
      "id": 2,
      "username": "student",
      "email": "student@example.com"
      "created_at": "2026-10-16 10:00:00"
    }
  ]
}
```

*Lưu ý: Response thực tế có thể có thêm trường `created_at`.*

**Ví dụ gọi API:**

```javascript
const response = await fetch("http://localhost:3000/api/users");
const result = await response.json();

console.log(result.data);
```

### 3.2. GET /api/users/:id

**Mục đích:** Lấy thông tin một User theo ID.

**Phương thức:** `GET`

**Ví dụ URL:**

```text
http://localhost:3000/api/users/1
```

**Kết quả mong đợi:**
- HTTP `200`: User tồn tại.
- HTTP `400`: ID không hợp lệ.
- HTTP `404`: User không tồn tại.

**Ví dụ response thành công:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

*Lưu ý: Response thực tế có thể có thêm trường `created_at`.*

**Ví dụ gọi API:**

```javascript
const userId = 1;

const response = await fetch(
  `http://localhost:3000/api/users/${userId}`
);

const result = await response.json();

console.log(result);
```

---

## 4. Lưu ý cho thành viên Frontend

- Khởi động Backend trước khi gọi API.
- Đảm bảo Frontend chạy đúng địa chỉ được khai báo trong `FRONTEND_ORIGIN`.
- Kiểm tra `response.ok` trước khi xử lý dữ liệu.
- Không đưa trực tiếp dữ liệu người dùng vào `innerHTML`.
- Sử dụng `textContent` khi hiển thị nội dung không đáng tin cậy.

---

## 5. Comment API

Comment API cho phép Frontend lấy danh sách bình luận và tạo bình luận mới trong Database SQLite.

### 5.1. GET /api/comments

**Mục đích:** Lấy danh sách bình luận đã lưu, kèm tên người dùng.

**Phương thức:** `GET`

**URL:**

```text
http://localhost:3000/api/comments
```

**Request body:** Không cần.

**Kết quả thành công:** HTTP `200 OK`.

**Ví dụ response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "content": "Bình luận thử nghiệm của admin.",
      "created_at": "2026-10-16 10:00:00"
    },
    {
      "id": 2,
      "user_id": 2,
      "username": "student",
      "content": "Bình luận thử nghiệm của student.",
      "created_at": "2026-10-16 10:00:00"
    }
  ]
}
```

*Lưu ý:* Thời gian và số lượng bình luận chỉ là ví dụ. Trường `username` được lấy từ bảng `users` thông qua `JOIN`.

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch("http://localhost:3000/api/comments");
const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Không thể tải bình luận");
}

console.log(result.data);
```

### 5.2. POST /api/comments

**Mục đích:** Tạo một bình luận mới cho người dùng đã tồn tại.

**Phương thức:** `POST`

**URL:**

```text
http://localhost:3000/api/comments
```

**Request headers:**

```text
Content-Type: application/json
```

**Request body mẫu:**

```json
{
  "user_id": 1,
  "content": "Bình luận kiểm thử API"
}
```

**Kết quả thành công:** HTTP `201 Created`.

**Ví dụ response:**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": 10,
    "user_id": 1,
    "content": "Bình luận kiểm thử API",
    "created_at": "2026-10-16 10:00:00"
  }
}
```

*Lưu ý:* ID và thời gian chỉ là ví dụ. Response khi tạo bình luận không có trường `username`.

**Quy tắc kiểm tra dữ liệu:**

- `user_id` phải là ID nguyên dương, hợp lệ và tương ứng với người dùng đang tồn tại.
- `content` phải là chuỗi ký tự, không được rỗng hoặc chỉ chứa khoảng trắng.
- Độ dài `content` không được vượt quá 2.000 ký tự.
- Backend loại bỏ khoảng trắng ở đầu và cuối nội dung trước khi lưu.

**Các trường hợp lỗi:**

| Trường hợp | HTTP | Thông báo |
|---|---|---|
| User ID không hợp lệ | 400 | Invalid user ID |
| User không tồn tại | 404 | User not found |
| Thiếu nội dung bình luận | 400 | Content must be 1-2000 characters |
| Nội dung rỗng hoặc sai kiểu | 400 | Content must be 1-2000 characters |
| Nội dung vượt quá 2.000 ký tự | 400 | Content must be 1-2000 characters |

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch("http://localhost:3000/api/comments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    user_id: 1,
    content: "Bình luận kiểm thử API"
  })
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Không thể tạo bình luận");
}

console.log(result.data);
```

### 5.3. Lưu ý bảo mật Stored XSS

Nội dung bình luận do người dùng cung cấp có thể chứa các chuỗi HTML hoặc JavaScript. Frontend phải hiển thị dữ liệu này an toàn để tránh Stored XSS.

**Cách hiển thị an toàn:**

```javascript
const commentElement = document.createElement("p");
commentElement.textContent = comment.content;
```

**Không dùng trực tiếp:**

```javascript
commentElement.innerHTML = comment.content;
```

với dữ liệu người dùng không đáng tin cậy.

Trong dự án này, khu vực XSS Vulnerable trên giao diện chính chỉ dùng để mô phỏng và giải thích nguy cơ, không thực thi mã JavaScript được nhập vào.

---

## 6. SQL Injection API

### 6.1. Giới thiệu

SQL Injection là hình thức tấn công trong đó dữ liệu đầu vào không đáng tin cậy làm thay đổi cấu trúc hoặc logic của câu truy vấn SQL.

Trong dự án, SQL Injection Lab sử dụng hai chế độ:

- **Vulnerable Mode:** Ghép trực tiếp dữ liệu đầu vào vào câu truy vấn SQL để minh họa nguy cơ.
- **Secure Mode:** Sử dụng truy vấn tham số hóa (Parameterized Query) để ngăn dữ liệu đầu vào thay đổi logic SQL.

Hai API chỉ hoạt động khi `NODE_ENV=development` và sử dụng dữ liệu mẫu trong SQLite.

### 6.2. POST /api/labs/sqli/vulnerable

**Mục đích:** Minh họa cách truy vấn SQL không an toàn xử lý dữ liệu đầu vào.

**Phương thức:** `POST`

**URL:**

```text
http://localhost:3000/api/labs/sqli/vulnerable
```

**Request headers:**

```text
Content-Type: application/json
```

**Request body mẫu:**

```json
{
  "username": "admin"
}
```

**Kết quả thành công:** HTTP `200 OK`, trả về dữ liệu người dùng mẫu khớp với truy vấn.

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/sqli/vulnerable",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "admin"
    })
  }
);

const result = await response.json();
console.log(result);
```

### 6.3. POST /api/labs/sqli/secure

**Mục đích:** Minh họa cách sử dụng truy vấn tham số hóa để phòng chống SQL Injection.

**Phương thức:** `POST`

**URL:**

```text
http://localhost:3000/api/labs/sqli/secure
```

**Request headers:**

```text
Content-Type: application/json
```

**Request body mẫu:**

```json
{
  "username": "admin"
}
```

**Kết quả thành công:** HTTP `200 OK`, trả về dữ liệu người dùng mẫu khớp với tham số truy vấn.

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/sqli/secure",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "admin"
    })
  }
);

const result = await response.json();
console.log(result);
```

### 6.4. So sánh hai chế độ

Ví dụ chuỗi đầu vào dùng trong môi trường thử nghiệm local:

```text
' OR '1'='1
```

| Nội dung | Vulnerable Mode | Secure Mode |
|---|---|---|
| Xử lý đầu vào | Nối chuỗi trực tiếp vào SQL | Sử dụng tham số `?` |
| Username hợp lệ | Trả về người dùng phù hợp | Trả về người dùng phù hợp |
| Chuỗi thử nghiệm SQL Injection | Có thể trả về nhiều tài khoản mẫu | Không làm thay đổi logic truy vấn |
| Cơ chế bảo vệ | Không có tham số hóa | Parameterized Query |

**Ví dụ truy vấn không an toàn:**

```javascript
const sql = `SELECT id, username, email FROM users WHERE username = '${username}'`;
```

**Ví dụ truy vấn an toàn:**

```javascript
const sql = "SELECT id, username, email FROM users WHERE username = ?";
const users = db.prepare(sql).all(username);
```

### 6.5. Các trường hợp cần xử lý

| Trường hợp | HTTP | Thông báo
|---|---|---
| Username hợp lệ và tìm thấy tài khoản | 200 | success: true, trả về dữ liệu người dùng trong data
| Username không tồn tại | 200 | success: true, data là mảng rỗng
| Thiếu username | 400 | Username must be 1-200 characters
| Username sai kiểu dữ liệu | 400 | Username must be 1-200 characters
| Username vượt quá 200 ký tự | 400 | Username must be 1-200 characters
| Backend không chạy hoặc không thể kết nối | Không có HTTP response | Frontend hiển thị thông báo lỗi kết nối

### 6.6. Lưu ý khi tích hợp Frontend

Thành viên Frontend cần:

1. Tạo ô nhập username.
2. Cho phép lựa chọn chế độ Vulnerable hoặc Secure.
3. Gửi request `POST` đến endpoint tương ứng.
4. Hiển thị kết quả trả về từ Backend.
5. Hiển thị giải thích về sự khác nhau giữa hai phương pháp.

Không sử dụng `innerHTML` để hiển thị trực tiếp dữ liệu không đáng tin cậy trong response.

**Lưu ý bảo mật:** Endpoint Vulnerable chỉ được sử dụng trong môi trường phát triển local với dữ liệu mẫu; không triển khai công khai.

---

## 7. CSRF API

### 7.1. Giới thiệu

CSRF (Cross-Site Request Forgery) là hình thức tấn công lợi dụng phiên đăng nhập của người dùng để gửi yêu cầu thay đổi dữ liệu mà người dùng không chủ động thực hiện.

CSRF Lab trong dự án minh họa hai cơ chế:

- **Vulnerable Mode:** Cho phép thay đổi dữ liệu phiên mà không cần xác minh CSRF token.
- **Secure Mode:** Yêu cầu CSRF token hợp lệ trước khi thay đổi dữ liệu.

Lab sử dụng `express-session` và cookie `security_lab.sid`. Các API chỉ hoạt động khi `NODE_ENV=development`.

### 7.2. POST /api/labs/csrf/start

**Mục đích:** Khởi tạo phiên demo và tạo CSRF token.

**Phương thức:** `POST`

**URL:**

```text
http://localhost:3000/api/labs/csrf/start
```

**Request body:** Không cần.

**Kết quả thành công:** HTTP `200 OK`.

Response chứa thông tin phiên demo và `csrfToken`. Trình duyệt nhận session cookie thông qua header `Set-Cookie`.

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/csrf/start",
  {
    method: "POST",
    credentials: "include"
  }
);

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Không thể khởi tạo phiên demo");
}

const csrfToken = result.csrfToken;
```

### 7.3. GET /api/labs/csrf/state

**Mục đích:** Kiểm tra trạng thái phiên demo hiện tại.

**Phương thức:** `GET`

**URL:**

```text
http://localhost:3000/api/labs/csrf/state
```

**Ví dụ response thành công — HTTP 200:**

```json
{
  "success": true,
  "displayName": "Administrator"
}
```

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/csrf/state",
  {
    credentials: "include"
  }
);

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Không thể đọc trạng thái phiên");
}

console.log(result.displayName);
```

### 7.4. POST /api/labs/csrf/vulnerable

**Mục đích:** Minh họa endpoint thay đổi trạng thái nhưng không xác minh CSRF token.

**Phương thức:** `POST`

**Request body:**

```json
{
  "displayName": "CSRF Vulnerable Test"
}
```

**Kết quả mong đợi:** HTTP `200 OK` khi có phiên demo hợp lệ, dù không gửi CSRF token.

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/csrf/vulnerable",
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      displayName: "CSRF Vulnerable Test"
    })
  }
);

const result = await response.json();
console.log(result);
```


### 7.5. POST /api/labs/csrf/secure

**Mục đích:** Thay đổi trạng thái khi request cung cấp CSRF token hợp lệ.

**Phương thức:** `POST`

**Request headers:**

```text
Content-Type: application/json
X-CSRF-Token: <CSRF token từ API /start>
```

**Request body:**

```json
{
  "displayName": "CSRF Secure Test"
}
```

**Kết quả mong đợi:**

| Trường hợp | HTTP | Thông báo
|---|---|---
| Có session và CSRF token hợp lệ | 200 | Cập nhật thành công
| Thiếu CSRF token | 403 | Invalid CSRF token
| CSRF token không hợp lệ | 403 | Invalid CSRF token
| Không có session demo | 401 | Demo session required
| Tên hiển thị không hợp lệ, token hợp lệ | 400 | Invalid display name

**Ví dụ gọi từ Frontend:**

```javascript
const response = await fetch(
  "http://localhost:3000/api/labs/csrf/secure",
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({
      displayName: "CSRF Secure Test"
    })
  }
);

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Yêu cầu bị từ chối");
}

console.log(result);
```

### 7.6. Quy trình tích hợp CSRF Lab

Frontend cần thực hiện theo thứ tự:

1. Gọi `/api/labs/csrf/start` để khởi tạo phiên và nhận token.
2. Lưu token vào biến JavaScript phục vụ phiên demo.
3. Gọi `/api/labs/csrf/state` để hiển thị trạng thái ban đầu.
4. Gọi `/api/labs/csrf/vulnerable` để minh họa request không cần token.
5. Gọi `/api/labs/csrf/secure` với token thiếu, sai hoặc đúng để so sánh.
6. Gọi lại `/api/labs/csrf/state` để xem trạng thái có thay đổi hay không.

### 7.7. Lưu ý bảo mật và tích hợp

- Sử dụng `credentials: "include"` trong các request cần session cookie.
- Sử dụng thống nhất `localhost` cho Frontend và Backend.
- Không đọc session cookie bằng JavaScript vì cookie được cấu hình `HttpOnly`.
- Nếu phiên demo mất hiệu lực, gọi lại `/api/labs/csrf/start`.
- Không sử dụng endpoint Vulnerable trong môi trường production.
- Việc kiểm tra token qua API local minh họa cơ chế xác minh; để đánh giá tấn công CSRF thực tế từ website khác còn phải xét chính sách `SameSite`, CORS và cách trình duyệt gửi cookie.