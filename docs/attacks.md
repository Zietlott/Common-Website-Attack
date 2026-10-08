# Các dạng tấn công phổ biến trên Website

## 1. Cross-Site Scripting (XSS)

### XSS là gì?
XSS là lỗ hổng bảo mật cho phép kẻ tấn công chèn mã độc, thường là JavaScript, vào nội dung của website. Khi người dùng khác truy cập vào trang có chứa mã độc, trình duyệt có thể thực thi đoạn mã đó.

### XSS hoạt động như thế nào?
1. Người dùng nhập dữ liệu vào website.
2. Website nhận dữ liệu nhưng không xử lý hoặc mã hóa an toàn.
3. Dữ liệu được hiển thị trực tiếp lên giao diện.
4. Nếu dữ liệu chứa JavaScript độc hại, trình duyệt có thể thực thi đoạn mã này.

### Các dạng XSS
- Stored XSS
- Reflected XSS
- DOM-based XSS

### Lỗ hổng nằm ở đâu?
Lỗ hổng thường xuất hiện khi dữ liệu từ người dùng được đưa trực tiếp vào HTML mà không thực hiện escaping hoặc sanitization.

### Tác động
- Đánh cắp session hoặc cookie.
- Thực thi JavaScript trái phép.
- Thay đổi nội dung trang web.
- Chuyển hướng người dùng.
- Giả mạo hành động của người dùng.

### Biện pháp phòng chống
- Output Escaping.
- Input Validation.
- Sanitization.
- Content Security Policy.


## 2. SQL Injection

### SQL Injection là gì?
SQL Injection là lỗ hổng xảy ra khi dữ liệu đầu vào của người dùng được ghép trực tiếp vào câu lệnh SQL mà không được xử lý an toàn.

### User input đi vào SQL như thế nào?
Ví dụ một câu truy vấn đăng nhập:

SELECT * FROM users
WHERE username = '$username'
AND password = '$password';

Nếu giá trị username hoặc password được nối trực tiếp vào câu SQL, kẻ tấn công có thể chèn thêm nội dung làm thay đổi logic của câu truy vấn.

### Tại sao query dễ bị khai thác?
- Nối chuỗi trực tiếp với dữ liệu người dùng.
- Không kiểm tra đầu vào.
- Không dùng Prepared Statement.
- Quyền truy cập Database quá lớn.

### Tác động
- Bypass đăng nhập.
- Đọc dữ liệu trái phép.
- Thay đổi dữ liệu.
- Xóa dữ liệu.
- Chiếm quyền truy cập hệ thống.

### Biện pháp phòng chống
- Prepared Statement.
- Parameterized Query.
- Input Validation.
- Giới hạn quyền của tài khoản Database.


## 3. Cross-Site Request Forgery (CSRF)

### CSRF là gì?
CSRF là kiểu tấn công lợi dụng trạng thái đăng nhập hợp lệ của người dùng để gửi một yêu cầu ngoài ý muốn đến website.

### Luồng tấn công
1. Người dùng đăng nhập vào website.
2. Trình duyệt lưu cookie đăng nhập.
3. Người dùng truy cập một website độc hại.
4. Website độc hại tạo một request gửi đến website mục tiêu.
5. Trình duyệt tự động gửi cookie đăng nhập kèm theo request.
6. Server tưởng request đến từ người dùng hợp lệ và thực hiện hành động.

### Tại sao server chấp nhận request?
Server chỉ kiểm tra cookie hoặc session đăng nhập nhưng không xác minh request có thực sự do người dùng chủ động gửi hay không.

### Biện pháp phòng chống
- CSRF Token.
- SameSite Cookie.
- Kiểm tra Origin.
- Kiểm tra Referer.


## 4. Phishing

### Phishing là gì?
Phishing là hình thức tấn công Social Engineering, trong đó kẻ tấn công giả mạo một tổ chức hoặc dịch vụ đáng tin cậy để lừa người dùng cung cấp thông tin nhạy cảm.

### Các hình thức phổ biến
- Website giả mạo.
- Trang đăng nhập giả.
- Email giả mạo.
- Link độc hại.

### Dấu hiệu nhận biết
- Domain bất thường.
- URL đáng ngờ.
- Nội dung yêu cầu đăng nhập khẩn cấp.
- Sai chính tả hoặc trình bày không chuyên nghiệp.
- Yêu cầu nhập thông tin nhạy cảm bất thường.

### Biện pháp phòng chống
- Kiểm tra domain trước khi đăng nhập.
- Không mở link đáng ngờ.
- Sử dụng MFA.
- Nâng cao nhận thức người dùng.