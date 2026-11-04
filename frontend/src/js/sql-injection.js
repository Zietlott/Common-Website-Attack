const sqlLoginForm = document.getElementById("sqlLoginForm");
const sqlDemoUsername = document.getElementById("sqlDemoUsername");
const sqlDemoPassword = document.getElementById("sqlDemoPassword");
const sqlDefenseMode = document.getElementById("sqlDefenseMode");
const sqlLoadScenarioBtn = document.getElementById("sqlLoadScenarioBtn");
const sqlRunLoginBtn = document.getElementById("sqlRunLoginBtn");
const sqlResetBtn = document.getElementById("sqlResetBtn");
const sqlDemoStatus = document.getElementById("sqlDemoStatus");
const sqlModeBadge = document.getElementById("sqlModeBadge");
const sqlResultBadge = document.getElementById("sqlResultBadge");
const sqlLoginResult = document.getElementById("sqlLoginResult");
const sqlExecutedQuery = document.getElementById("sqlExecutedQuery");

const localSqlPayload = "' OR '1'='1' -- ";
let sqlRequestInProgress = false;

function setSqlStatus(message, state = "") {
  sqlDemoStatus.textContent = message;
  sqlDemoStatus.classList.remove("is-danger", "is-safe");
  if (state) {
    sqlDemoStatus.classList.add(state);
  }
}

function updateSqlMode() {
  const isVulnerable = sqlDefenseMode.value === "vulnerable";
  sqlModeBadge.textContent = isVulnerable
    ? "Chế độ dễ bị tấn công"
    : "Prepared statement đang bật";
  sqlModeBadge.classList.toggle("is-danger", isVulnerable);
  sqlModeBadge.classList.toggle("is-safe", !isVulnerable);
  sqlLoginResult.textContent =
    "Gửi thông tin đăng nhập để xem kết quả ở chế độ này.";
  sqlExecutedQuery.textContent = "Chưa có truy vấn.";
  sqlResultBadge.textContent = "Chưa chạy";
  sqlResultBadge.className = "sql-result-badge";
  setSqlStatus(
    isVulnerable
      ? "Chế độ này nối input vào câu SQL. Nạp kịch bản rồi gửi để xem lỗ hổng."
      : "Cùng input sẽ được gửi riêng như một giá trị; mật khẩu vẫn phải khớp.",
  );
}

function renderSqlLogin(result, mode, attackBypassed) {
  sqlLoginResult.replaceChildren();

  const outcome = document.createElement("strong");
  outcome.className = result.authenticated
    ? "sql-login-outcome is-success"
    : "sql-login-outcome is-rejected";
  outcome.textContent = result.authenticated
    ? "Đăng nhập giả lập thành công"
    : "Đăng nhập bị từ chối";
  sqlLoginResult.appendChild(outcome);

  const explanation = document.createElement("p");
  if (result.authenticated && result.user) {
    explanation.textContent = attackBypassed
      ? `Website demo đã chấp nhận tài khoản ${result.user.username} ` +
        `(${result.user.email}) dù mật khẩu nhập không đúng. ` +
        "OR làm điều kiện đúng; -- biến phần kiểm tra mật khẩu phía sau thành comment. " +
        "Đây chỉ là kết quả giả lập; không tạo session thật."
      : mode === "secure"
        ? `Thông tin hợp lệ cho tài khoản demo ${result.user.username}. ` +
          "Prepared statement tra username riêng; bcrypt xác minh mật khẩu."
        : `Website demo xác thực tài khoản ${result.user.username} ` +
          "bằng thông tin đăng nhập hợp lệ. Không có bypass bằng payload.";
  } else {
    explanation.textContent =
      "Website demo không chấp nhận thông tin đăng nhập này.";
  }
  sqlLoginResult.appendChild(explanation);
}

function createQueryPreview(mode, username) {
  if (mode === "vulnerable") {
    return (
      "SELECT id, username, email FROM users\n" +
      `WHERE username = '${username}' AND bcrypt_compare('[mật khẩu đã ẩn]', password) = 1`
    );
  }

  return (
    "SELECT id, username, password, email\n" +
    "FROM users\n" +
    "WHERE username = ?\n\n" +
    "Giá trị bind: username (dữ liệu, không phải SQL)\n" +
    "Sau đó: bcrypt.compare(password, user.password)"
  );
}

function setSqlButtonsDisabled(disabled) {
  sqlRunLoginBtn.disabled = disabled;
  sqlLoadScenarioBtn.disabled = disabled;
  sqlResetBtn.disabled = disabled;
  sqlDefenseMode.disabled = disabled;
  sqlDemoUsername.disabled = disabled;
  sqlDemoPassword.disabled = disabled;
}

async function runSqlLogin() {
  const username = sqlDemoUsername.value;
  const password = sqlDemoPassword.value;
  const mode = sqlDefenseMode.value;

  if (!username.trim() || !password) {
    setSqlStatus("Nhập username và mật khẩu giả trước.", "is-danger");
    (!username.trim() ? sqlDemoUsername : sqlDemoPassword).focus();
    return;
  }

  if (sqlRequestInProgress) {
    return;
  }

  sqlRequestInProgress = true;
  setSqlButtonsDisabled(true);
  sqlRunLoginBtn.setAttribute("aria-busy", "true");
  sqlLoginResult.textContent = "Website giả lập đang kiểm tra thông tin...";
  sqlExecutedQuery.textContent = "Đang chờ database demo...";
  sqlResultBadge.textContent = "Đang xử lý";
  sqlResultBadge.className = "sql-result-badge is-running";
  setSqlStatus("Đang gửi thông tin đến backend SQLi lab local...");

  try {
    const endpoint =
      mode === "vulnerable"
        ? "/labs/sqli/login-vulnerable"
        : "/labs/sqli/login-secure";
    const response = await apiPost(endpoint, { username, password });

    if (typeof response.authenticated !== "boolean") {
      throw new Error("Backend trả về trạng thái đăng nhập không hợp lệ.");
    }

    const attackBypassed =
      mode === "vulnerable" &&
      username === localSqlPayload &&
      response.authenticated;
    renderSqlLogin(response, mode, attackBypassed);
    sqlExecutedQuery.textContent = createQueryPreview(mode, username);
    if (attackBypassed) {
      sqlResultBadge.textContent = "Đăng nhập bị vượt qua";
      sqlResultBadge.className = "sql-result-badge is-danger";
      setSqlStatus(
        "Tấn công thành công trong lab: input đã làm thay đổi logic WHERE nên mật khẩu sai vẫn được chấp nhận.",
        "is-danger",
      );
    } else if (response.authenticated) {
      sqlResultBadge.textContent = "Đăng nhập thành công";
      sqlResultBadge.className = "sql-result-badge is-safe";
      setSqlStatus(
        mode === "secure"
          ? "Tài khoản và mật khẩu demo hợp lệ; prepared statement cho phép đăng nhập bình thường."
          : "Đăng nhập thành công bằng thông tin demo hợp lệ; không có bypass bằng payload.",
        "is-safe",
      );
    } else if (mode === "secure") {
      sqlResultBadge.textContent = "Payload bị vô hiệu hóa";
      sqlResultBadge.className = "sql-result-badge is-safe";
      setSqlStatus(
        "Phòng thủ hoạt động: payload chỉ được xem là username; mật khẩu sai nên đăng nhập bị từ chối.",
        "is-safe",
      );
    } else {
      sqlResultBadge.textContent = "Đăng nhập bị từ chối";
      sqlResultBadge.className = "sql-result-badge";
      setSqlStatus(
        "Payload chưa làm thay đổi điều kiện truy vấn. Nạp kịch bản mẫu để thử luồng minh họa.",
      );
    }
  } catch (error) {
    sqlLoginResult.textContent = `Không thể hoàn tất mô phỏng: ${error.message}`;
    sqlExecutedQuery.textContent = "Không có truy vấn được xác nhận.";
    sqlResultBadge.textContent = "Không hoàn tất";
    sqlResultBadge.className = "sql-result-badge is-danger";
    setSqlStatus(`Yêu cầu thất bại: ${error.message}`, "is-danger");
  } finally {
    sqlRequestInProgress = false;
    sqlRunLoginBtn.removeAttribute("aria-busy");
    setSqlButtonsDisabled(false);
  }
}

if (
  sqlLoginForm &&
  sqlDemoUsername &&
  sqlDemoPassword &&
  sqlDefenseMode &&
  sqlLoadScenarioBtn &&
  sqlRunLoginBtn &&
  sqlResetBtn &&
  sqlDemoStatus &&
  sqlModeBadge &&
  sqlResultBadge &&
  sqlLoginResult &&
  sqlExecutedQuery
) {
  sqlDefenseMode.addEventListener("change", updateSqlMode);

  sqlLoadScenarioBtn.addEventListener("click", function () {
    sqlDemoUsername.value = localSqlPayload;
    sqlDemoPassword.value = "khong-phai-mat-khau-that";
    sqlDefenseMode.value = "vulnerable";
    updateSqlMode();
    setSqlStatus(
      "Đã nạp payload an toàn cho lab và mật khẩu giả sai. Gửi đăng nhập để xem truy vấn dễ bị tấn công.",
    );
    sqlRunLoginBtn.focus();
  });

  sqlLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    runSqlLogin();
  });

  sqlResetBtn.addEventListener("click", function () {
    sqlDemoUsername.value = "student";
    sqlDemoPassword.value = "khong-phai-mat-khau-that";
    sqlDefenseMode.value = "vulnerable";
    updateSqlMode();
    setSqlStatus("Đã đặt lại. Nạp kịch bản rồi gửi đăng nhập để bắt đầu.");
  });

  updateSqlMode();
}
