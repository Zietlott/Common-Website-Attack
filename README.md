# Common Website Attacks and Countermeasures

Dự án học tập về các lỗ hổng bảo mật website phổ biến và biện pháp phòng chống. Ứng dụng có backend Node.js/Express, cơ sở dữ liệu SQLite và giao diện frontend; các bài thực hành SQL Injection (SQLi) và Cross-Site Request Forgery (CSRF) chỉ dùng trong môi trường phát triển local với dữ liệu giả lập.

## Cấu trúc dự án

```text
Common-Website-Attack/
├── backend/             # API, cấu hình, scripts và tests
├── database/            # Schema, dữ liệu mẫu và database local
├── docs/                # Tài liệu API, kiến trúc, hướng dẫn và bài thực hành
├── frontend/            # Giao diện website
└── README.md
```

## Yêu cầu

- Node.js và npm
- Git (nếu tải mã nguồn bằng Git)
- Trình duyệt web; có thể dùng VS Code và Live Server để chạy frontend local

## 1. Cài đặt backend

Mở Terminal tại thư mục gốc dự án:

```bash
cd backend
npm install
```

Tạo file `backend/.env` từ `backend/.env.example`:

```bash
cp .env.example .env
```

Cấu hình mẫu trong `.env`:

```dotenv
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5500
DB_PATH=../database/security_lab.db
SESSION_SECRET=replace-with-a-long-random-secret
ENABLE_SECURITY_LABS=false
```

Tạo khóa phiên riêng bằng lệnh `openssl rand -hex 32`, sau đó thay giá trị `SESSION_SECRET` trong `.env`. **Không commit `.env`, khóa phiên, cookie hoặc database chứa dữ liệu nhạy cảm lên GitHub.**

## 2. Khởi tạo database

Vẫn trong thư mục `backend`:

```bash
node init-db.js
```

Script đọc `database/schema.sql` và `database/seed.sql`, khởi tạo bảng và dữ liệu mẫu rồi in số lượng users/comments. Với database mới, dữ liệu mẫu gồm hai tài khoản và hai bình luận. Không chạy lại trên database chứa dữ liệu cần bảo toàn khi chưa kiểm tra nội dung seed.

Có thể kiểm tra bằng:

```bash
node test-db.js
node check-db.js
```

Các lệnh kiểm tra này được mô tả thêm tại `docs/BACKEND_SETUP.md`.

## 3. Chạy backend

```bash
npm run dev
```

Backend mặc định phục vụ tại `http://localhost:3000` (lắng nghe trên `127.0.0.1`). Kiểm tra:

```text
http://localhost:3000/api/health
```

Response mong đợi:

```json
{
  "success": true,
  "message": "Backend server is running"
}
```

Có thể dùng `npm start` để khởi động mà không tự đặt `NODE_ENV=development`; chế độ môi trường vẫn phụ thuộc `.env` hoặc biến môi trường đã khai báo.

## 4. Chạy frontend

Mở giao diện trong thư mục `frontend/` bằng cách chạy frontend trên máy local (ví dụ dùng Live Server tại `http://localhost:5500`). Đảm bảo origin frontend khớp `FRONTEND_ORIGIN` trong `backend/.env`. Backend chấp nhận alias loopback `localhost`/`127.0.0.1` trên cùng cổng đã cấu hình. Đối với API dùng session cookie, `fetch` cần `credentials: "include"`; nên dùng hostname nhất quán giữa frontend và backend.

## 5. Bật các bài thực hành bảo mật (chỉ local)

Mặc định:

```dotenv
ENABLE_SECURITY_LABS=false
```

Để thử SQLi/CSRF trên **máy phát triển**, cấu hình:

```dotenv
NODE_ENV=development
ENABLE_SECURITY_LABS=true
```

Khởi động lại backend sau khi đổi `.env`. Các route `/api/labs/sqli/*` và `/api/labs/csrf/*` chỉ được gắn khi **đồng thời** có `NODE_ENV=development` và `ENABLE_SECURITY_LABS=true`. Backend từ chối khởi động nếu `NODE_ENV=production` nhưng `ENABLE_SECURITY_LABS=true`.

**Lưu ý:** SQLi Lab có truy vấn cố ý không an toàn để minh họa lỗ hổng. Chỉ dùng dữ liệu giả lập và database demo riêng; không triển khai các endpoint vulnerable lên Internet hay dùng dữ liệu thật. CSRF Lab là phép so sánh kiểm tra token ở các endpoint local, không phải mô phỏng đầy đủ một cuộc tấn công cross-site.

## 6. Các API chính

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Kiểm tra backend |
| POST | `/api/auth/login` | Đăng nhập, tạo session |
| GET | `/api/users?page=1&limit=10` | Danh sách user đã lược bỏ email/password; yêu cầu đăng nhập |
| GET | `/api/users/:id` | Xem hồ sơ của chính tài khoản đã đăng nhập |
| GET | `/api/comments?page=1&limit=10` | Danh sách bình luận có phân trang |
| POST | `/api/comments` | Tạo bình luận; yêu cầu đăng nhập, lấy `user_id` từ session |
| POST | `/api/labs/sqli/vulnerable` | Minh họa truy vấn SQLi cố ý không an toàn (lab local) |
| POST | `/api/labs/sqli/secure` | Minh họa truy vấn tham số hóa (lab local) |
| POST | `/api/labs/csrf/start` | Tạo phiên và CSRF token demo (lab local) |
| GET | `/api/labs/csrf/state` | Đọc trạng thái phiên demo (lab local) |
| POST | `/api/labs/csrf/vulnerable` | Cập nhật không kiểm tra token (lab local) |
| POST | `/api/labs/csrf/secure` | Cập nhật có kiểm tra token (lab local) |

Tham số phân trang `page` và `limit` là số nguyên dương, `limit` tối đa 100. Đăng nhập thất bại bị giới hạn số lần thử. Chi tiết request/response và mã lỗi xem `docs/API_DOCUMENTATION.md`.

## 7. Chạy kiểm thử tự động

Tại thư mục `backend`:

```bash
npm test
```

Script test tạo lại database và session **dành riêng cho test**, sau đó chạy các bài kiểm thử Node.js/Supertest. Không dùng database thật để chạy test. Bộ test bao gồm xác thực, chống giả mạo user, kiểm tra dữ liệu bình luận, phân trang, CSRF token, giới hạn đăng nhập và chặn Security Labs trong production.

## 8. Tài liệu thêm

- `docs/API_DOCUMENTATION.md`: chi tiết API và ví dụ tích hợp frontend.
- `docs/BACKEND_SETUP.md`: hướng dẫn backend chi tiết.
- Các tài liệu khác trong `docs/`: kiến trúc, mô phỏng tấn công và biện pháp phòng chống.

## 9. Lưu ý bảo mật

- Không dùng tài khoản, mật khẩu hay dữ liệu cá nhân thật trong các lab.
- Không bật `ENABLE_SECURITY_LABS=true` trên hệ thống public/production.
- Không commit `.env`, session cookies, khóa bí mật hoặc database nhạy cảm.
- Khi hiển thị bình luận hoặc dữ liệu không tin cậy, dùng `textContent` hoặc cơ chế render được kiểm soát; không chèn trực tiếp vào `innerHTML`.
- CORS không thay thế cơ chế chống CSRF. Cookie session được cấu hình `HttpOnly` và `SameSite=Lax` cho môi trường demo local.
