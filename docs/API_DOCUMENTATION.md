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

Lưu ý: Các endpoint mô phỏng SQL Injection và CSRF chỉ hoạt động khi `NODE_ENV=development` và `ENABLE_SECURITY_LABS=true`. Chỉ bật với dữ liệu demo local; không bật trong production.

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
const csrfToken = loginResult.csrfToken;
const response = await fetch("http://localhost:3000/api/health");
const result = await response.json();
console.log(result);
```

---

## API đăng nhập — Authentication

### POST /api/auth/login

**Mục đích:** Xác thực tài khoản và tạo phiên đăng nhập bằng session cookie.

**URL:**

`http://localhost:3000/api/auth/login`

**Request headers:**
```text
Content-Type: application/json
```

**Request body:**
```json
{
  "username": "student",
  "password": "student123"
}
```

**Tài khoản trên chỉ dùng để kiểm thử với database mẫu.**

**Response thành công — HTTP 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 2,
    "username": "student",
    "email": "student@example.com"
  },
  "csrfToken": "<session-bound token>"
}
```

**Các trường hợp lỗi:**

| HTTP | Trường hợp |

|---|---|

| 400 | Thiếu hoặc sai kiểu dữ liệu username/password |

| 401 | Username hoặc password không chính xác |

| 429 | Quá nhiều lần đăng nhập thất bại trong khoảng thời gian giới hạn |

| 500 | Lỗi nội bộ của server |

**Ví dụ gọi từ Frontend:**
```javascript
const response = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "student",
    password: "student123"
  })
});
const result = await response.json();
if (!response.ok) {
  throw new Error(result.message || "Đăng nhập thất bại");
}
const csrfToken = result.csrfToken;
console.log(result.data);
```

**Lưu ý bảo mật:**

- Backend sử dụng `bcrypt` để kiểm tra mật khẩu.

- Sau khi đăng nhập thành công, backend tạo lại session và lưu ID người dùng vào `req.session.authUserId`.
- Response đăng nhập trả thêm CSRF token gắn với session mới. Gửi token trong header `X-CSRF-Token` khi tạo bình luận.

- Frontend cần sử dụng `credentials: "include"` khi gửi các request cần xác thực bằng session cookie.

- Không gửi `user_id` để tự xác định danh tính người dùng.

- Login API giới hạn 5 lần đăng nhập thất bại trong 15 phút theo cấu hình hiện tại.

- Không lưu mật khẩu hoặc session cookie vào log của ứng dụng.

---

## 3. User API

Các API người dùng yêu cầu đăng nhập bằng session cookie. Frontend cần dùng `credentials: "include"`.

### 3.1. GET /api/users

**Mục đích:** Lấy danh sách tài khoản mẫu theo trang, không trả về email hoặc mật khẩu.

**URL:** `http://localhost:3000/api/users?page=1&limit=10`

**Query:** `page` (mặc định 1), `limit` (mặc định 10, tối đa 100). Cả hai phải là số nguyên dương hợp lệ.

**Response — HTTP 200:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "data": [
    { "id": 1, "username": "admin", "created_at": "2026-10-16 10:00:00" },
    { "id": 2, "username": "student", "created_at": "2026-10-16 10:00:00" }
  ]
}
```

**Lỗi:** `401` chưa đăng nhập; `400` tham số phân trang không hợp lệ.
```javascript
const response = await fetch("http://localhost:3000/api/users?page=1&limit=10", {
  credentials: "include"
});
const result = await response.json();
console.log(result.data);
```

### 3.2. GET /api/users/:id

**Mục đích:** Xem hồ sơ **của chính người dùng đã đăng nhập**; không được xem hồ sơ của người khác.

**Ví dụ URL:** `http://localhost:3000/api/users/2`

**Response — HTTP 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "student",
    "email": "student@example.com",
    "created_at": "2026-10-16 10:00:00"
  }
}
```

**Lỗi:** `401` chưa đăng nhập; `400` ID không hợp lệ; `403` truy cập hồ sơ người khác; `404` không tìm thấy hồ sơ được phép truy cập.
```javascript
const userId = 2; // ID của người dùng đang đăng nhập
const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
  credentials: "include"
});
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

**Mục đích:** Lấy danh sách bình luận kèm tên người dùng, có phân trang.

**URL:** `http://localhost:3000/api/comments?page=1&limit=10`

**Query:** `page` mặc định 1; `limit` mặc định 10, tối đa 100. Chỉ nhận số nguyên dương hợp lệ.

**Response — HTTP 200:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "content": "Bình luận thử nghiệm của admin.",
      "created_at": "2026-10-16 10:00:00"
    }
  ]
}
```

**Lỗi:** `400` khi tham số phân trang không hợp lệ. Thời gian và dữ liệu chỉ là ví dụ.
```javascript
const response = await fetch("http://localhost:3000/api/comments?page=1&limit=10");
const result = await response.json();
if (!response.ok) throw new Error(result.message || "Không thể tải bình luận");
console.log(result.data);
```

### 5.2. POST /api/comments

**Mục đích:** Người dùng đã đăng nhập tạo bình luận mới. Backend lấy `user_id` từ `req.session.authUserId`, **không lấy từ request body**.

**URL:** `http://localhost:3000/api/comments`

**Request headers:** `Content-Type: application/json`, `X-CSRF-Token: <token nhận từ đăng nhập>`

**Request body:**
```json
{
  "content": "Bình luận kiểm thử API"
}
```

**Response — HTTP 201:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": 10,
    "user_id": 2,
    "content": "Bình luận kiểm thử API",
    "created_at": "2026-10-16 10:00:00"
  }
}
```

ID và thời gian chỉ là ví dụ. Response tạo bình luận không có trường `username`.

**Quy tắc kiểm tra:** `content` phải là chuỗi không rỗng sau khi trim, dài tối đa 2.000 ký tự; backend loại bỏ khoảng trắng đầu/cuối trước khi lưu.

**Lỗi:** `401` chưa đăng nhập hoặc tài khoản trong session không hợp lệ; `403` CSRF token thiếu/sai; `400` nội dung không hợp lệ.
```javascript
const response = await fetch("http://localhost:3000/api/comments", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken
  },
  body: JSON.stringify({ content: "Bình luận kiểm thử API" })
});
const result = await response.json();
if (!response.ok) throw new Error(result.message || "Không thể tạo bình luận");
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

Trong dự án này, preview XSS trên giao diện chính minh họa cách một số thẻ định dạng được diễn giải nhưng không dùng sink `innerHTML` trực tiếp. Chỉ các thẻ định dạng trong allow-list được dựng thành phần tử; thuộc tính và nội dung hoạt động không được đưa vào DOM. Vùng so sánh an toàn dùng `textContent`. Demo bình luận local đăng nhập bằng tài khoản giả, tạo bình luận qua `POST /api/comments` (session + CSRF token bắt buộc), rồi tải lại từ `/api/comments`. Nội dung lưu trong SQLite không được thực thi ở cả hai cách hiển thị.

---

## 6. SQL Injection API

### 6.1. Giới thiệu

SQL Injection là hình thức tấn công trong đó dữ liệu đầu vào không đáng tin cậy làm thay đổi cấu trúc hoặc logic của câu truy vấn SQL.

Trong giao diện, SQL Injection Lab mô phỏng đăng nhập vào website giả lập: endpoint cố ý dễ bị tấn công ghép username trực tiếp vào điều kiện SQL, còn input crafted có thể làm điều kiện luôn đúng và comment phần kiểm tra mật khẩu. Đây chỉ là kết quả xác thực giả lập trên database demo chỉ đọc; không tạo session hay đăng nhập vào website thật.

Lab sử dụng hai chế độ:

- **Vulnerable Mode:** Ghép trực tiếp dữ liệu đầu vào vào câu truy vấn SQL để minh họa nguy cơ.

- **Secure Mode:** Sử dụng truy vấn tham số hóa (Parameterized Query) để ngăn dữ liệu đầu vào thay đổi logic SQL.

Giao diện gọi `/login-vulnerable` hoặc `/login-secure` với `username` và `password` giả. Endpoint vulnerable là mô phỏng cố ý không an toàn và chỉ được bật trong môi trường development. Các endpoint `/vulnerable` và `/secure` bên dưới vẫn giữ chức năng tìm kiếm username.

Các API lab chỉ hoạt động khi `NODE_ENV=development` và `ENABLE_SECURITY_LABS=true`, sử dụng database demo SQLite riêng.

Luồng login nhận JSON có hai trường `username` và `password`, mỗi trường 1–200 ký tự. Endpoint vulnerable trả `authenticated: true` nếu truy vấn bị thay đổi; endpoint secure bind username qua placeholder rồi xác minh mật khẩu bằng bcrypt. Cả hai chỉ đọc tài khoản demo; không trả mật khẩu hoặc tạo phiên đăng nhập.

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
const response = await fetch("http://localhost:3000/api/labs/sqli/vulnerable", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "admin",
  }),
});
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
const response = await fetch("http://localhost:3000/api/labs/sqli/secure", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "admin",
  }),
});
const result = await response.json();
console.log(result);
```

### 6.4. So sánh hai chế độ

Trong giao diện, nút **Nạp kịch bản tấn công** đặt cùng một input thử nghiệm và mật khẩu giả không hợp lệ. Chế độ nối chuỗi có thể chấp nhận đăng nhập vì input làm thay đổi điều kiện SQL; chuyển sang prepared statement rồi gửi lại thì input được bind như username thông thường và mật khẩu giả bị từ chối.

| Nội dung                       | Vulnerable Mode                   | Secure Mode                       |

| ------------------------------ | --------------------------------- | --------------------------------- |

| Xử lý đầu vào                  | Nối chuỗi trực tiếp vào SQL       | Sử dụng tham số `?`               |

| Username hợp lệ                | Trả về người dùng phù hợp         | Trả về người dùng phù hợp         |

| Login với input thử nghiệm | Có thể vượt qua kiểm tra mật khẩu | Input chỉ là giá trị username |

| Cơ chế bảo vệ                  | Không có tham số hóa              | Parameterized Query               |

**Ví dụ truy vấn không an toàn trong luồng login:**
```javascript
const sql =
  `SELECT id, username, email FROM users ` +
  `WHERE username = '${username}' ` +
  `AND bcrypt_compare('${password}', password) = 1`;
```

**Ví dụ xử lý an toàn:**
```javascript
const user = db.prepare(
  "SELECT id, username, password, email FROM users WHERE username = ?"
).get(username);

if (!user || !(await bcrypt.compare(password, user.password))) {
  return loginRejected;
}
```

SQL preview của giao diện ẩn giá trị mật khẩu; chỉ dùng để quan sát cách ghép input, không phải dữ liệu đăng nhập thật.

### 6.5. Các trường hợp cần xử lý

| Trường hợp                                | HTTP                   | Thông báo                                           |

| ----------------------------------------- | ---------------------- | --------------------------------------------------- |

| Username hợp lệ và tìm thấy tài khoản     | 200                    | success: true, trả về dữ liệu người dùng trong data |

| Username không tồn tại                    | 200                    | success: true, data là mảng rỗng                    |

| Thiếu username                            | 400                    | Username must be 1-200 characters                   |

| Username sai kiểu dữ liệu                 | 400                    | Username must be 1-200 characters                   |

| Username vượt quá 200 ký tự               | 400                    | Username must be 1-200 characters                   |

| Backend không chạy hoặc không thể kết nối | Không có HTTP response | Frontend hiển thị thông báo lỗi kết nối             |

### 6.6. Lưu ý khi tích hợp Frontend

Thành viên Frontend cần:

1\. Mở lab và nạp kịch bản login giả.

2\. Chọn nối chuỗi hoặc prepared statement.

3\. Gửi cùng input tới endpoint login tương ứng.

4\. Quan sát kết quả đăng nhập giả và SQL preview.

5\. Không dùng tài khoản, mật khẩu hoặc database thật.

Không sử dụng `innerHTML` để hiển thị trực tiếp dữ liệu không đáng tin cậy trong response.

**Lưu ý bảo mật:** Endpoint Vulnerable chỉ được sử dụng trong môi trường phát triển local với dữ liệu mẫu; không triển khai công khai.

---

## 7. CSRF API

### 7.1. Giới thiệu

CSRF (Cross-Site Request Forgery) là hình thức tấn công lợi dụng phiên đăng nhập của người dùng để gửi yêu cầu thay đổi dữ liệu mà người dùng không chủ động thực hiện.

CSRF Lab trong dự án minh họa hai cơ chế:

- **Vulnerable Mode:** Endpoint cập nhật `displayName` hoặc trừ tiền trong tài khoản giả khi có session demo hợp lệ nhưng không xác minh CSRF token.

- **Secure Mode:** Endpoint chỉ cập nhật `displayName` hoặc số dư giả khi có session demo hợp lệ và CSRF token hợp lệ; thiếu hoặc sai token sẽ bị từ chối với HTTP `403`.

Lab sử dụng `express-session` và cookie `security_lab.sid`. Giao diện gửi form `application/x-www-form-urlencoded` từ origin frontend đến backend; trình duyệt tự đính kèm cookie phiên. Server demo chỉ trừ số dư giả trong session. Các API chỉ hoạt động khi `NODE_ENV=development` và `ENABLE_SECURITY_LABS=true`.

Hai cổng localhost khác origin nhưng cùng site, nên cookie `SameSite=Lax` vẫn được gửi trong mô phỏng; đây không phải domain Internet bên ngoài. Same-Origin Policy ngăn trang giả đọc response, nhưng không ngăn form gửi request. CORS không thay thế CSRF token. Trong triển khai thật, `SameSite`, scheme, hostname, Origin/Referer và cấu hình trình duyệt đều ảnh hưởng việc gửi cookie; không suy rộng kết quả local thành kết luận cho mọi môi trường.

### 7.2. POST /api/labs/csrf/start

**Mục đích:** Khởi tạo phiên demo và tạo CSRF token.

**Phương thức:** `POST`

**URL:**
```text
http://localhost:3000/api/labs/csrf/start
```

**Request body:** Không cần.

**Kết quả thành công:** HTTP `200 OK`.

Response chứa thông tin phiên demo, `csrfToken` và số dư giả ban đầu `5.000.000` VND. Trình duyệt nhận session cookie thông qua header `Set-Cookie`.

**Ví dụ gọi từ Frontend:**
```javascript
const response = await fetch("http://localhost:3000/api/labs/csrf/start", {
  method: "POST",
  credentials: "include",
});
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
  "displayName": "Administrator",
  "csrfToken": "<session-bound token>",
  "balance": 5000000,
  "lastTransfer": null
}
```

`csrfToken` chỉ được dùng bởi giao diện ngân hàng tin cậy; trang giả không thể đọc response cross-origin để lấy token.

**Ví dụ gọi từ Frontend:**
```javascript
const response = await fetch("http://localhost:3000/api/labs/csrf/state", {
  credentials: "include",
});
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

Ngoài `displayName`, lab nhận form chuyển tiền giả với `recipient` (6–16 chữ số) và `amount` (số nguyên dương không vượt số dư). Request form không có token được dùng để mô phỏng trang giả:

```text
Content-Type: application/x-www-form-urlencoded
recipient=9988776655&amount=500000
```

Server chỉ trừ số dư demo trong session và trả số dư/giao dịch giả mới.

**Ví dụ gọi từ Frontend:**
```javascript
const response = await fetch("http://localhost:3000/api/labs/csrf/vulnerable", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    displayName: "CSRF Vulnerable Test",
  }),
});
const result = await response.json();
console.log(result);
```

### 7.5. POST /api/labs/csrf/secure

**Mục đích:** Thay đổi trạng thái khi request cung cấp CSRF token hợp lệ.

**Phương thức:** `POST`

**Request headers:**
```text
Content-Type: application/json
X-CSRF-Token: \<CSRF token từ API /start>
```

**Request body:**
```json
{
  "displayName": "CSRF Secure Test"
}
```

Giao dịch giả dùng cùng endpoint với body `{"recipient":"9988776655","amount":500000}`. Giao diện gửi token phiên trong `X-CSRF-Token`; form HTML từ trang giả không thể thêm header này và bị từ chối.

**Kết quả mong đợi:**

| Trường hợp                              | HTTP | Thông báo             |

| --------------------------------------- | ---- | --------------------- |

| Có session và CSRF token hợp lệ         | 200  | Cập nhật thành công   |

| Thiếu CSRF token                        | 403  | Invalid CSRF token    |

| CSRF token không hợp lệ                 | 403  | Invalid CSRF token    |

| Không có session demo                   | 401  | Demo session required |

| Tên hiển thị không hợp lệ, token hợp lệ | 400  | Invalid display name  |

**Ví dụ gọi từ Frontend:**
```javascript
const response = await fetch("http://localhost:3000/api/labs/csrf/secure", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({
    displayName: "CSRF Secure Test",
  }),
});
const result = await response.json();
if (!response.ok) {
  throw new Error(result.message || "Yêu cầu bị từ chối");
}
console.log(result);
```

### 7.6. Quy trình tích hợp CSRF Lab

Frontend cần thực hiện theo thứ tự:

1\. Gọi `/api/labs/csrf/start` để khởi tạo phiên và nhận token.

2\. Lưu token vào biến JavaScript phục vụ phiên demo.

3\. Gọi `/api/labs/csrf/state` để hiển thị trạng thái ban đầu.

4\. Gửi form-urlencoded không token tới `/api/labs/csrf/vulnerable` và quan sát số dư giả thay đổi.

5\. Gửi cùng form tới `/api/labs/csrf/secure` để xác nhận request thiếu token bị từ chối; gửi thao tác hợp lệ với token trong header để so sánh.

6\. Gọi lại `/api/labs/csrf/state` để xem trạng thái có thay đổi hay không.

### 7.7. Lưu ý bảo mật và tích hợp

- Sử dụng `credentials: "include"` trong các request cần session cookie.

- Sử dụng thống nhất `localhost` cho Frontend và Backend.

- Không đọc session cookie bằng JavaScript vì cookie được cấu hình `HttpOnly`.

- Nếu phiên demo mất hiệu lực, gọi lại `/api/labs/csrf/start`.

- Không sử dụng endpoint Vulnerable trong môi trường production.

- Endpoint Vulnerable trả về thành công khi có session và input hợp lệ mà không cần CSRF token; endpoint Secure yêu cầu token đúng và từ chối token thiếu/sai bằng HTTP `403`.

- Demo kiểm tra hành vi của hai endpoint trong môi trường local, không tạo request từ một website cross-site độc hại.

- Cookie demo dùng `SameSite=Lax` và `secure: false` cho HTTP local. Kết quả về việc trình duyệt gửi cookie có thể khác với môi trường HTTPS, hostname khác hoặc cấu hình cookie khác.

- CORS kiểm soát origin được phép đọc response trong trình duyệt; CORS tự nó không phải cơ chế thay thế CSRF token.
