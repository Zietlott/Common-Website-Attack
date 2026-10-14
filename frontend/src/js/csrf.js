/* =========================================================
   CSRF LAB
   Demo gọi Backend API + phân tích tình huống
   ========================================================= */

// ----- Các phần tử giao diện demo -----
const csrfStartBtn = document.getElementById("csrfStartBtn");
const csrfStateBtn = document.getElementById("csrfStateBtn");
const csrfVulnerableBtn = document.getElementById("csrfVulnerableBtn");
const csrfSecureBtn = document.getElementById("csrfSecureBtn");
const csrfDisplayName = document.getElementById("csrfDisplayName");
const csrfDemoStatus = document.getElementById("csrfDemoStatus");
const csrfDemoResult = document.getElementById("csrfDemoResult");

// Token chỉ được giữ trong bộ nhớ của trang demo.
let csrfToken = null;

/**
 * Cập nhật thông báo.
 */
function setCsrfStatus(message) {
  if (csrfDemoStatus) {
    csrfDemoStatus.textContent = message;
  }
}

/**
 * Hiển thị dữ liệu trả về.
 */
function renderCsrfResult(result) {
  if (csrfDemoResult) {
    csrfDemoResult.textContent = JSON.stringify(result, null, 2);
  }
}

/**
 * Khóa/mở các nút gửi yêu cầu khi đang xử lý.
 */
function setCsrfButtonsDisabled(disabled) {
  if (csrfStartBtn) csrfStartBtn.disabled = disabled;
  if (csrfStateBtn) csrfStateBtn.disabled = disabled;
  if (csrfVulnerableBtn) csrfVulnerableBtn.disabled = disabled;
  if (csrfSecureBtn) csrfSecureBtn.disabled = disabled;
}

/**
 * Thực hiện tác vụ và xử lý lỗi chung.
 */
async function executeCsrfAction(action, successMessage) {
  setCsrfButtonsDisabled(true);
  setCsrfStatus("Đang gửi yêu cầu đến Backend...");
  if (csrfDemoResult) csrfDemoResult.textContent = "Đang tải kết quả...";

  try {
    const result = await action();
    renderCsrfResult(result);
    setCsrfStatus(successMessage);
  } catch (error) {
    renderCsrfResult({
      success: false,
      message: error.message,
    });
    setCsrfStatus(`Yêu cầu thất bại: ${error.message}`);
  } finally {
    setCsrfButtonsDisabled(false);
  }
}

/**
 * Khởi tạo phiên demo và nhận CSRF token từ Backend.
 */
if (csrfStartBtn) {
  csrfStartBtn.addEventListener("click", function () {
    executeCsrfAction(async function () {
      const result = await apiPost("/labs/csrf/start", {});

      csrfToken = result.csrfToken || null;

      if (!csrfToken) {
        throw new Error("Backend không trả về CSRF token.");
      }

      return {
        success: result.success,
        message: result.message,
        displayName: result.displayName,
        tokenReceived: true,
      };
    }, "Đã khởi tạo phiên demo. Có thể thử hai cách gửi yêu cầu.");
  });
}

/**
 * Xem trạng thái hiện tại của phiên.
 */
if (csrfStateBtn) {
  csrfStateBtn.addEventListener("click", function () {
    executeCsrfAction(async function () {
      return await apiRequest("/labs/csrf/state");
    }, "Đã lấy trạng thái phiên.");
  });
}

/**
 * Gửi yêu cầu mô phỏng không có CSRF token.
 * Endpoint này chỉ dùng trong môi trường demo được kiểm soát.
 */
if (csrfVulnerableBtn) {
  csrfVulnerableBtn.addEventListener("click", function () {
    const displayName = csrfDisplayName?.value.trim();

    if (!displayName) {
      setCsrfStatus("Vui lòng nhập tên hiển thị.");
      csrfDisplayName?.focus();
      return;
    }

    executeCsrfAction(async function () {
      return await apiPost("/labs/csrf/vulnerable", {
        displayName,
      });
    }, "Backend đã xử lý yêu cầu mô phỏng không có token.");
  });
}

/**
 * Gửi yêu cầu có CSRF token.
 */
if (csrfSecureBtn) {
  csrfSecureBtn.addEventListener("click", function () {
    const displayName = csrfDisplayName?.value.trim();

    if (!displayName) {
      setCsrfStatus("Vui lòng nhập tên hiển thị.");
      csrfDisplayName?.focus();
      return;
    }

    if (!csrfToken) {
      setCsrfStatus("Hãy khởi tạo phiên demo để nhận CSRF token trước.");
      return;
    }

    executeCsrfAction(async function () {
      return await apiPost(
        "/labs/csrf/secure",
        { displayName },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        },
      );
    }, "Backend đã xử lý yêu cầu có CSRF token.");
  });
}

// ----- Phân tích tình huống A/B hiện có -----
const csrfButtons = document.querySelectorAll(".csrf-analyze-btn");
const csrfResult = document.getElementById("csrfResult");

if (csrfButtons.length > 0 && csrfResult) {
  csrfButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const requestType = button.dataset.request;

      csrfResult.classList.remove("is-warning", "is-safe");
      csrfResult.replaceChildren();

      const title = document.createElement("span");
      title.className = "csrf-result-title";

      const text = document.createElement("span");
      text.className = "csrf-result-text";

      if (requestType === "A") {
        csrfResult.classList.add("is-safe");
        title.textContent = "Yêu cầu A — đọc dữ liệu";

        text.textContent =
          "Đọc dữ liệu thường không làm thay đổi trạng thái. Vẫn cần kiểm soát quyền truy cập phù hợp.";
      } else if (requestType === "B") {
        csrfResult.classList.add("is-warning");
        title.textContent = "Yêu cầu B — thay đổi dữ liệu";

        text.textContent =
          "Yêu cầu làm thay đổi trạng thái cần xác minh ý định của người dùng và áp dụng biện pháp chống CSRF phù hợp.";
      } else {
        return;
      }

      csrfResult.append(title, text);
    });
  });
}
