# Common Website Attacks and Countermeasures

Dự án học tập về các lỗ hổng bảo mật website phổ biến và biện pháp phòng chống. Ứng dụng có backend Node.js/Express, cơ sở dữ liệu SQLite và giao diện frontend; các bài thực hành dùng dữ liệu giả local. XSS mô phỏng ba dạng trong iframe sandbox; SQL Injection so sánh đăng nhập giả bằng truy vấn nối chuỗi và truy vấn tham số hóa; CSRF so sánh request giả với endpoint yêu cầu token; phishing là bài nhận diện, không thu thập thông tin.

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

- Node.js 22 trở lên và npm (backend dùng `better-sqlite3` 13)
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

Script đọc `database/schema.sql` và `database/seed.sql`, khởi tạo bảng và dữ liệu mẫu rồi in số lượng tài khoản. Database mẫu có tài khoản `student`, được dùng riêng cho lab SQL Injection. Không chạy lại trên database chứa dữ liệu cần bảo toàn khi chưa kiểm tra nội dung seed.

Thông tin đăng nhập dùng trong lab SQL Injection: `student` / `student123`. Đây là dữ liệu giả local; không tái sử dụng mật khẩu cho dịch vụ thật.

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

Mở `frontend/index.html` bằng Live Server để chạy giao diện local (ví dụ tại `http://localhost:5500/frontend/` nếu mở server từ thư mục gốc repo, hoặc `http://localhost:5500/` nếu mở server trực tiếp từ thư mục `frontend`). Session database được lưu ngoài workspace theo mặc định để thao tác phiên không làm Live Server tự tải lại trang; có thể đặt `SESSION_DB_PATH` trong `backend/.env` nếu muốn chọn vị trí khác. Đảm bảo origin frontend khớp `FRONTEND_ORIGIN` trong `backend/.env`. Backend chấp nhận alias loopback `localhost`/`127.0.0.1` trên cùng cổng đã cấu hình. CSRF Lab dùng session cookie; nên dùng hostname nhất quán giữa frontend và backend.

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
| POST | `/api/labs/sqli/vulnerable` | Minh họa truy vấn SQLi cố ý không an toàn (lab local) |
| POST | `/api/labs/sqli/secure` | Minh họa truy vấn tham số hóa (lab local) |
| POST | `/api/labs/csrf/start` | Tạo phiên và CSRF token demo (lab local) |
| GET | `/api/labs/csrf/state` | Đọc trạng thái phiên demo (lab local) |
| POST | `/api/labs/csrf/vulnerable` | Cập nhật không kiểm tra token (lab local) |
| POST | `/api/labs/csrf/secure` | Cập nhật có kiểm tra token (lab local) |

## 7. Chạy kiểm thử tự động

Tại thư mục `backend`:

```bash
npm test
```

Script test tạo database và session **dành riêng cho test**, sau đó chạy các bài kiểm thử Node.js/Supertest. Không dùng database demo để chạy test. Bộ test kiểm tra các luồng SQL Injection, CSRF và việc vô hiệu hóa Security Labs trong production.

## 8. Tài liệu thêm

- `docs/bao-cao-tieng-viet.docx`: báo cáo dự án.

## 9. Lưu ý bảo mật

- Không dùng tài khoản, mật khẩu hay dữ liệu cá nhân thật trong các lab.
- Không bật `ENABLE_SECURITY_LABS=true` trên hệ thống public/production.
- Frontend local đặt CSP bằng meta policy; môi trường production nên cấu hình CSP qua response header tại web server/static host và bổ sung `frame-ancestors`.
- Không commit `.env`, session cookies, khóa bí mật hoặc database nhạy cảm.
- CORS không thay thế cơ chế chống CSRF. Cookie session được cấu hình `HttpOnly` và `SameSite=Lax` cho môi trường demo local.
