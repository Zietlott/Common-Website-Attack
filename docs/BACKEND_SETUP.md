# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY BACKEND

## 1. Giới thiệu

Backend của dự án **Common Website Attacks and Countermeasures** được xây dựng bằng:

- Node.js
- Express.js
- SQLite (thư viện `better-sqlite3`)

Backend cung cấp API cho các chức năng User, Comment và các bài thực hành bảo mật SQL Injection, CSRF.

Dự án phục vụ mục đích học tập và mô phỏng trong môi trường local.

## 2. Yêu cầu trước khi cài đặt

Máy tính cần cài đặt:

- Node.js và npm
- Git
- Visual Studio Code 

## 3. Cài đặt thư viện Backend

Sau khi tải project từ GitHub, mở Terminal tại thư mục gốc của dự án và chạy:

```bash
cd backend
npm install
```

Lệnh `npm install` sẽ cài đặt các thư viện được khai báo trong `package.json`.

## 4. Cấu hình môi trường

Trong thư mục `backend`, tạo file `.env` dựa trên file `.env.example`.

Nội dung cấu hình:

```dotenv
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5500
DB_PATH=../database/security_lab.db
SESSION_SECRET=replace-with-a-long-random-secret
```

Tạo khóa bí mật bằng lệnh:

```bash
openssl rand -hex 32
```

Sao chép kết quả và thay vào giá trị `SESSION_SECRET` trong file `.env`.

**Lưu ý:** Không đưa file `.env` lên GitHub.

## 5. Khởi tạo Database

Tại thư mục `backend`, chạy:

```bash
node init-db.js
```

Nếu thành công, Terminal sẽ hiển thị:

```text
Database initialized successfully!
Users: 2
Comments: 2
```

Đối với database mới, hệ thống tạo hai tài khoản mẫu và hai bình luận mẫu.

Nếu database đã có dữ liệu thử nghiệm, số lượng bản ghi có thể lớn hơn.

## 6. Kiểm tra Database

Chạy lần lượt:

```bash
node test-db.js
```

Lệnh này kiểm tra kết nối SQLite.

Tiếp theo:

```bash
node check-db.js
```

Lệnh này hiển thị danh sách Users và Comments đang có trong database.

## 7. Khởi động Backend

Tại thư mục `backend`, chạy:

```bash
npm run dev
```

Nếu thành công:

```text
Backend running at http://localhost:3000
```

Giữ Terminal này hoạt động trong khi sử dụng website.

## 8. Kiểm tra API

Mở trình duyệt và truy cập:

http://localhost:3000/api/health

Kết quả mong đợi:

```json
{
  "success": true,
  "message": "Backend server is running"
}
```

Nếu nhận được phản hồi trên, Backend đã khởi động thành công.

## 9. Danh sách API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/health` | Kiểm tra trạng thái Backend |
| GET | `/api/users` | Lấy danh sách người dùng |
| GET | `/api/users/:id` | Lấy thông tin người dùng theo ID |
| GET | `/api/comments` | Lấy danh sách bình luận |
| POST | `/api/comments` | Tạo bình luận mới |
| POST | `/api/labs/sqli/vulnerable` | Mô phỏng SQL Injection không an toàn |
| POST | `/api/labs/sqli/secure` | Mô phỏng SQL Injection có bảo vệ |
| POST | `/api/labs/csrf/start` | Khởi tạo phiên CSRF demo |
| GET | `/api/labs/csrf/state` | Kiểm tra trạng thái phiên |
| POST | `/api/labs/csrf/vulnerable` | Mô phỏng thay đổi dữ liệu không kiểm tra CSRF token |
| POST | `/api/labs/csrf/secure` | Thay đổi dữ liệu có xác minh CSRF token |

Các API mô phỏng SQL Injection và CSRF chỉ được bật khi `NODE_ENV=development`.

## 10. Lưu ý khi kết nối Frontend

Frontend mặc định chạy tại:

```text
http://localhost:5500
```

Backend chạy tại:

```text
http://localhost:3000
```

Khi gọi các API CSRF bằng `fetch()`, cần thêm:

```javascript
credentials: "include"
```

Đối với API CSRF Secure, cần gửi CSRF token hợp lệ trong header:

```text
X-CSRF-Token
```

Nên sử dụng thống nhất hostname `localhost` cho cả Frontend và Backend.

CSRF Lab chỉ so sánh hai endpoint local: endpoint Vulnerable chấp nhận session mà không kiểm tra token, còn endpoint Secure yêu cầu token hợp lệ. Đây không phải mô phỏng đầy đủ request cross-site trong trình duyệt. Cookie demo dùng `SameSite=Lax` và `secure: false` cho HTTP local; CORS giới hạn origin được phép đọc response nhưng không thay thế CSRF token hay biện pháp chống CSRF.

## 11. Xử lý lỗi thường gặp

**Lỗi không kết nối được Backend:**

- Kiểm tra `npm run dev` có đang chạy không.
- Kiểm tra cổng 3000.
- Kiểm tra file `.env`.

**Lỗi Database:**

- Kiểm tra `DB_PATH`.
- Kiểm tra file `database/schema.sql` và `database/seed.sql`.
- Chạy `node init-db.js` nếu chưa khởi tạo database.

**Lỗi CORS:**

- Kiểm tra `FRONTEND_ORIGIN` có trùng với địa chỉ Frontend thực tế không.
- Khởi động lại Backend sau khi thay đổi `.env`.

**Lỗi CSRF Session:**

- Kiểm tra đã gọi `/api/labs/csrf/start` chưa.
- Đảm bảo request dùng `credentials: "include"`.
- Kiểm tra CSRF token khi gọi endpoint Secure.

## 12. Lưu ý bảo mật

Các chức năng Vulnerable chỉ phục vụ mục đích minh họa trong môi trường thử nghiệm.

Không triển khai công khai các endpoint cố ý có lỗ hổng.

Chỉ sử dụng tài khoản và dữ liệu giả lập; không dùng thông tin đăng nhập thật.