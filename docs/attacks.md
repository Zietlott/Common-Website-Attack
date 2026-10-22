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
## 5. Sự cố thực tế và bài học phòng chống

### 5.1. XSS – Samy Worm trên MySpace (2005)

- **Sự việc:** Tháng 10/2005, một đoạn JavaScript được chèn vào hồ sơ MySpace đã khai thác lỗ hổng Stored XSS. Khi người dùng xem hồ sơ bị ảnh hưởng, mã tự sao chép sang hồ sơ của họ.
- **Ảnh hưởng:** Sâu Samy lan tới hơn một triệu hồ sơ trong chưa đầy 24 giờ, buộc MySpace phải tạm ngừng dịch vụ để xử lý và khắc phục.
- **Bài học phòng chống:** Không đưa dữ liệu người dùng vào HTML một cách không an toàn; cần output encoding phù hợp với ngữ cảnh, sanitization khi cho phép HTML và kiểm thử các bộ lọc đầu vào. Không nên chỉ dựa vào danh sách chặn ký tự hoặc thẻ.
- **Nguồn:** Web Application Security Consortium, “Cross Site Scripting” – https://projects.webappsec.org/w/page/13246920/Cross%20Site%20Scripting ; USENIX, “Spectator: Detection and Containment of JavaScript Worms” – https://www.usenix.org/legacy/event/usenix08/tech/full_papers/livshits/livshits_html/

### 5.2. SQL Injection – vụ rò rỉ dữ liệu TalkTalk (2015)

- **Sự việc:** Trong khoảng ngày 15–21/10/2015, kẻ tấn công khai thác lỗ hổng SQL Injection trên các trang web của nhà cung cấp viễn thông TalkTalk tại Anh để truy cập cơ sở dữ liệu khách hàng.
- **Ảnh hưởng:** Dữ liệu của 156.959 khách hàng bị truy cập, trong đó thông tin tài khoản ngân hàng và mã sort code của 15.656 khách hàng cũng bị ảnh hưởng. Năm 2016, cơ quan ICO phạt TalkTalk 400.000 bảng Anh vì các thiếu sót về bảo mật.
- **Bài học phòng chống:** Dùng prepared statements/parameterized queries, cập nhật phần mềm cơ sở dữ liệu, giới hạn quyền tài khoản database và theo dõi log để phát hiện sớm dấu hiệu khai thác.
- **Nguồn:** UK Information Commissioner's Office (ICO), “TalkTalk cyber attack – how the ICO’s investigation unfolded” – https://ico.org.uk/about-the-ico/media-centre/talktalk-cyber-attack-how-the-ico-investigation-unfolded

### 5.3. CSRF – lỗ hổng Gmail được công bố năm 2007

- **Sự việc:** Một nghiên cứu học thuật về CSRF ghi nhận vào tháng 11/2007, kẻ tấn công đã khai thác lỗ hổng CSRF trong Gmail để thêm bộ lọc email vào tài khoản của David Airey, khiến email được chuyển tiếp đến địa chỉ do kẻ tấn công kiểm soát.
- **Ảnh hưởng:** Việc chuyển tiếp email có thể làm lộ thư riêng tư và góp phần khiến kẻ tấn công chiếm quyền kiểm soát tên miền của nạn nhân, do nhà đăng ký tên miền sử dụng email để xác thực.
- **Bài học phòng chống:** Với các thao tác làm thay đổi dữ liệu, máy chủ cần xác minh CSRF token hoặc áp dụng cơ chế chống CSRF tương đương; kết hợp cookie SameSite và kiểm tra Origin khi phù hợp. Chỉ kiểm tra trạng thái đăng nhập là chưa đủ.
- **Nguồn:** Stanford Security Lab, “Robust Defenses for Cross-Site Request Forgery” – https://seclab.stanford.edu/websec/csrf/csrf.pdf

### 5.4. Phishing – các vụ lừa đảo được báo cáo tại FBI IC3 (2023)

- **Sự việc:** Báo cáo năm 2023 của Internet Crime Complaint Center (IC3) thuộc FBI ghi nhận hơn 298.000 đơn khiếu nại thuộc nhóm phishing/spoofing. Các hình thức này thường giả mạo tổ chức hoặc dịch vụ đáng tin cậy để dụ nạn nhân tiết lộ thông tin hoặc thực hiện giao dịch.
- **Ảnh hưởng:** Phishing/spoofing nằm trong nhóm loại tội phạm mạng được báo cáo thường xuyên nhất; các vụ lừa đảo trực tuyến nói chung gây tổn thất tài chính đáng kể. Số liệu là tổng hợp khiếu nại được báo cáo tại Mỹ, không phải số vụ đã được xác minh đầy đủ trên toàn thế giới.
- **Bài học phòng chống:** Kiểm tra tên miền và người gửi qua kênh độc lập, không đăng nhập từ liên kết bất ngờ, bật MFA và đào tạo người dùng nhận biết yêu cầu khẩn cấp hoặc bất thường.
- **Nguồn:** FBI, “FBI’s Internet Crime Complaint Center Annual Report Released for 2023” – https://www.fbi.gov/contact-us/field-offices/philadelphia/news/fbis-internet-crime-complaint-center-annual-report-released-for-2023
