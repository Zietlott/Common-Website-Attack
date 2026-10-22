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

- **SQL Injection → SQL Injection Lab:** Người dùng nhập username, frontend gửi request đến endpoint demo, backend thực hiện truy vấn và trả về kết quả tìm kiếm. Vulnerable Mode minh họa truy vấn nối chuỗi không an toàn; Secure Mode sử dụng truy vấn tham số hóa.
- **Comment → XSS Demo:** Minh họa rủi ro khi hiển thị nội dung bình luận không đáng tin cậy và cách hiển thị an toàn.
- **Update Profile → CSRF Demo:** So sánh endpoint cập nhật trạng thái demo có và không xác minh CSRF token. Đây là mô phỏng kiểm tra token, không phải mô phỏng đầy đủ mọi kịch bản cross-site trên trình duyệt.
- **Phishing Awareness → Bài nhận diện tình huống phishing:** Nếu giao diện hiện tại chỉ cung cấp nội dung nhận diện, không gọi đây là Fake Login trừ khi dự án thực sự có trang đăng nhập giả tương ứng.

Lưu ý: Các tên và mô tả trên cần được đối chiếu với route, controller và giao diện đang có trước khi chốt tài liệu. Không suy ra rằng dự án có chức năng đăng nhập hoặc xác thực người dùng chỉ từ tên một demo.
