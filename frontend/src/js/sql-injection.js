/* =========================================================
   SQL INJECTION LAB
   Demo gọi Backend API + kiểm tra kiến thức
   ========================================================= */

// ----- Demo gọi Backend -----
const sqlUsername = document.getElementById("sqlUsername");
const sqlVulnerableBtn = document.getElementById("sqlVulnerableBtn");
const sqlSecureBtn = document.getElementById("sqlSecureBtn");
const sqlDemoStatus = document.getElementById("sqlDemoStatus");
const sqlDemoResult = document.getElementById("sqlDemoResult");

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
}

/**
 * Gửi tên người dùng đến API và hiển thị kết quả.
 */
async function runSqlDemo(mode) {
  if (!sqlUsername || !sqlDemoStatus || !sqlDemoResult) {
    return;
  }

  const username = sqlUsername.value.trim();

  if (!username) {
    setSqlDemoStatus("Vui lòng nhập tên người dùng.");
    sqlUsername.focus();
    return;
  }

  const button = mode === "vulnerable" ? sqlVulnerableBtn : sqlSecureBtn;

  // Ngăn gửi nhiều yêu cầu liên tục khi đang chờ phản hồi.
  if (sqlVulnerableBtn) sqlVulnerableBtn.disabled = true;
  if (sqlSecureBtn) sqlSecureBtn.disabled = true;

  setSqlDemoStatus("Đang gửi yêu cầu đến Backend...");
  sqlDemoResult.textContent = "Đang tải kết quả...";

  try {
    const endpoint =
      mode === "vulnerable" ? "/labs/sqli/vulnerable" : "/labs/sqli/secure";

    const result = await apiPost(endpoint, { username });

    renderSqlDemoResult(result);

    setSqlDemoStatus(
      mode === "vulnerable"
        ? "Đã nhận kết quả từ mô hình truy vấn không an toàn."
        : "Đã nhận kết quả từ mô hình truy vấn an toàn.",
    );
  } catch (error) {
    sqlDemoResult.textContent = "Không có kết quả.";
    setSqlDemoStatus(error.message);
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
