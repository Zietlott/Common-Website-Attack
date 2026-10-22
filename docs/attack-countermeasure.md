# Bảng ánh xạ Tấn công và Biện pháp phòng chống

| Tấn công      | Lỗ hổng                                              | Biện pháp phòng chống                          | Demo                                                   |
| ------------- | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| XSS           | Dữ liệu người dùng không được hiển thị an toàn       | Output Encoding và hiển thị nội dung an toàn   | XSS Comment Lab                                        |
| SQL Injection | Truy vấn SQL nối trực tiếp dữ liệu đầu vào           | Prepared Statements / Parameterized Queries    | SQL Injection Lab – Tìm kiếm user theo username        |
| CSRF          | Request thay đổi dữ liệu không được xác minh đầy đủ  | CSRF Token và kiểm tra tính hợp lệ của request | CSRF Lab – So sánh endpoint có và không kiểm tra token |
| Phishing      | Người dùng bị lừa bởi nội dung hoặc liên kết giả mạo | Awareness và xác minh nguồn liên kết           | Phishing Awareness Lab – Nhận diện tình huống          |
