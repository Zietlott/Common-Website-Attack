# Thiết kế Backend

## 1. Kiến trúc tổng thể

Frontend
   ↓
Backend API
   ↓
Security Layer
   ↓
Database

## 2. Cấu trúc thư mục Backend

backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── tests/
└── utils/

## 3. Chức năng từng thư mục

### config
Chứa các cấu hình của hệ thống như cấu hình kết nối Database và các biến môi trường.

### controllers
Tiếp nhận request từ client, xử lý luồng chính và trả response về cho client.

### middleware
Chứa các lớp xử lý trung gian liên quan đến bảo mật và kiểm tra request.

Ví dụ:
- Authentication.
- Input Validation.
- CSRF Protection.
- Security Headers.

### models
Đại diện cho dữ liệu và thực hiện các thao tác liên quan đến Database.

### routes
Định nghĩa các API endpoint và ánh xạ request đến controller tương ứng.

### services
Chứa Business Logic của hệ thống.

### tests
Chứa các file kiểm thử Backend.

### utils
Chứa các hàm tiện ích dùng chung trong hệ thống.

## 4. Ánh xạ Backend với các Demo bảo mật

- Login → SQL Injection Demo.
- Comment → XSS Demo.
- Update Profile → CSRF Demo.
- Fake Login → Phishing Awareness Demo.