/* =========================================================
   SQL INJECTION LAB
   Demo gọi Backend API + kiểm tra kiến thức
   ========================================================= */

// ----- Demo gọi Backend -----
const sqlUsername = document.getElementById("sqlUsername");
const sqlPassword = document.getElementById("sqlPassword");
const sqlVulnerableBtn = document.getElementById("sqlVulnerableBtn");
const sqlSecureBtn = document.getElementById("sqlSecureBtn");
const sqlDemoStatus = document.getElementById("sqlDemoStatus");
const sqlDemoResult = document.getElementById("sqlDemoResult");
const sqlDemoSummary = document.getElementById("sqlDemoSummary");

/**
 * Hiển thị trạng thái của demo.
 */
function setSqlDemoStatus(message) {
  if (sqlDemoStatus) {
    sqlDemoStatus.textContent = message;
  }
}

/**
 * Hiển thị kết quả trả về từ Backend.
 * Dùng textContent để tránh diễn giải dữ liệu thành HTML.
 */
function renderSqlDemoResult(result) {
  if (!sqlDemoResult) return;

  sqlDemoResult.textContent = JSON.stringify(result, null, 2);

  if (!sqlDemoSummary) return;

  sqlDemoSummary.classList.remove(
    "is-success",
    "is-failure",
    "is-error",
  );

  if (result.mode === "vulnerable") {
    sqlDemoSummary.classList.add("is-failure");
    sqlDemoSummary.textContent = result.authenticated
      ? "Chế độ vulnerable đã xác thực yêu cầu. Đây là luồng cố ý không an toàn vì dữ liệu được ghép vào SQL; không dùng cách này cho ứng dụng thật."
      : "Đăng nhập không thành công. Dù kết quả này bị từ chối, chế độ vulnerable vẫn ghép đầu vào vào SQL và không an toàn.";
    return;
  }

  sqlDemoSummary.classList.add(
    result.authenticated ? "is-success" : "is-failure",
  );
  sqlDemoSummary.textContent = result.authenticated
    ? "Đăng nhập thành công ở chế độ secure. Username được truy vấn bằng tham số; password được kiểm tra riêng."
    : "Đăng nhập không thành công ở chế độ secure. Đầu vào được xử lý như dữ liệu, không làm thay đổi cấu trúc truy vấn.";
}

/**
 * Gửi tài khoản thử nghiệm đến API và hiển thị kết quả đăng nhập.
 */
async function runSqlDemo(mode) {
  if (!sqlUsername || !sqlPassword || !sqlDemoStatus || !sqlDemoResult) {
    return;
  }

  const username = sqlUsername.value.trim();
  const password = sqlPassword.value;

  if (!username || !password) {
    setSqlDemoStatus("Vui lòng nhập cả tên đăng nhập và mật khẩu thử nghiệm.");
    (username ? sqlPassword : sqlUsername).focus();
    return;
  }

  // Ngăn gửi nhiều yêu cầu liên tục khi đang chờ phản hồi.
  if (sqlVulnerableBtn) sqlVulnerableBtn.disabled = true;
  if (sqlSecureBtn) sqlSecureBtn.disabled = true;

  setSqlDemoStatus("Đang gửi yêu cầu đến Backend...");
  sqlDemoResult.textContent = "Đang tải kết quả...";
  if (sqlDemoSummary) {
    sqlDemoSummary.classList.remove(
      "is-success",
      "is-failure",
      "is-error",
    );
    sqlDemoSummary.textContent = "Đang chờ kết quả xác thực từ backend...";
  }

  try {
    const endpoint =
      mode === "vulnerable"
        ? "/labs/sqli/login-vulnerable"
        : "/labs/sqli/login-secure";

    const result = await apiPost(endpoint, { username, password });

    renderSqlDemoResult(result);

    setSqlDemoStatus(
      result.authenticated
        ? `Đăng nhập mô phỏng thành công (${mode}).`
        : `Đăng nhập mô phỏng thất bại (${mode}).`,
    );
  } catch (error) {
    sqlDemoResult.textContent = "Không có kết quả.";
    setSqlDemoStatus(error.message);
    if (sqlDemoSummary) {
      sqlDemoSummary.classList.remove("is-success", "is-failure");
      sqlDemoSummary.classList.add("is-error");
      sqlDemoSummary.textContent = error.message;
    }
  } finally {
    if (sqlVulnerableBtn) sqlVulnerableBtn.disabled = false;
    if (sqlSecureBtn) sqlSecureBtn.disabled = false;
  }
}

if (sqlVulnerableBtn) {
  sqlVulnerableBtn.addEventListener("click", function () {
    runSqlDemo("vulnerable");
  });
}

if (sqlSecureBtn) {
  sqlSecureBtn.addEventListener("click", function () {
    runSqlDemo("secure");
  });
}

// ----- Quiz kiểm tra kiến thức -----
const checkSqlBtn = document.getElementById("checkSqlBtn");
const resetSqlBtn = document.getElementById("resetSqlBtn");
const sqlResult = document.getElementById("sqlResult");
const sqlAnswers = document.querySelectorAll('input[name="sqlAnswer"]');

if (checkSqlBtn && resetSqlBtn && sqlResult && sqlAnswers.length > 0) {
  checkSqlBtn.addEventListener("click", function () {
    const selectedAnswer = document.querySelector(
      'input[name="sqlAnswer"]:checked',
    );

    sqlResult.classList.remove("is-correct", "is-wrong", "is-empty");

    if (!selectedAnswer) {
      sqlResult.classList.add("is-empty");
      sqlResult.textContent = "Hãy chọn một đáp án trước khi kiểm tra.";
      return;
    }

    if (selectedAnswer.value === "b") {
      sqlResult.classList.add("is-correct");
      sqlResult.textContent =
        "Chính xác! Truy vấn tham số hóa tách dữ liệu đầu vào khỏi cấu trúc SQL. Đây là biện pháp quan trọng giúp giảm nguy cơ SQL Injection.";
      return;
    }

    sqlResult.classList.add("is-wrong");
    sqlResult.textContent =
      "Chưa chính xác. Hãy ưu tiên truy vấn tham số hóa và kiểm soát quyền của tài khoản cơ sở dữ liệu.";
  });

  resetSqlBtn.addEventListener("click", function () {
    sqlAnswers.forEach(function (answer) {
      answer.checked = false;
    });

    sqlResult.classList.remove("is-correct", "is-wrong", "is-empty");
    sqlResult.textContent = "Kết quả sẽ hiển thị tại đây.";
  });
}
