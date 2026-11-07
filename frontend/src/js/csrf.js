const csrfStartBtn = document.getElementById("csrfStartBtn");
const csrfStateBtn = document.getElementById("csrfStateBtn");
const csrfVulnerableBtn = document.getElementById("csrfVulnerableBtn");
const csrfSecureBtn = document.getElementById("csrfSecureBtn");
const csrfMissingTokenBtn = document.getElementById("csrfMissingTokenBtn");
const csrfAttackForm = document.getElementById("csrfAttackForm");
const csrfResponseFrame = document.querySelector(
  'iframe[name="csrfAttackResponse"]',
);
const csrfRecipient = document.getElementById("csrfRecipient");
const csrfAmount = document.getElementById("csrfAmount");
const csrfFormRecipient = document.getElementById("csrfFormRecipient");
const csrfFormAmount = document.getElementById("csrfFormAmount");
const csrfDemoStatus = document.getElementById("csrfDemoStatus");
const csrfDemoSummary = document.getElementById("csrfDemoSummary");
const csrfDemoResult = document.getElementById("csrfDemoResult");
const csrfBalance = document.getElementById("csrfBalance");
const csrfLastTransfer = document.getElementById("csrfLastTransfer");
const csrfTokenState = document.getElementById("csrfTokenState");

let csrfToken = null;
let csrfActionInProgress = false;

function setCsrfStatus(message, state = "") {
  if (!csrfDemoStatus) {
    return;
  }

  csrfDemoStatus.textContent = message;
  csrfDemoStatus.classList.remove("is-danger", "is-safe");
  if (state) {
    csrfDemoStatus.classList.add(state);
  }
}

function renderCsrfResult(result) {
  if (csrfDemoResult) {
    csrfDemoResult.textContent = JSON.stringify(result, null, 2);
  }
}

function setCsrfButtonsDisabled() {
  const sessionMissing = !csrfToken;
  if (csrfStartBtn) csrfStartBtn.disabled = csrfActionInProgress;
  if (csrfStateBtn) csrfStateBtn.disabled = csrfActionInProgress;
  if (csrfVulnerableBtn) {
    csrfVulnerableBtn.disabled = csrfActionInProgress || sessionMissing;
  }
  if (csrfSecureBtn) {
    csrfSecureBtn.disabled = csrfActionInProgress || sessionMissing;
  }
  if (csrfMissingTokenBtn) {
    csrfMissingTokenBtn.disabled = csrfActionInProgress || sessionMissing;
  }
}

function updateBank(state) {
  if (Number.isSafeInteger(state.balance) && csrfBalance) {
    csrfBalance.textContent = `${new Intl.NumberFormat("vi-VN").format(state.balance)} ₫`;
  }

  if (!csrfLastTransfer) {
    return;
  }

  if (!state.lastTransfer) {
    csrfLastTransfer.textContent = "Chưa có giao dịch trong phiên này.";
    return;
  }

  const { recipient, amount } = state.lastTransfer;
  csrfLastTransfer.textContent =
    `Giao dịch gần nhất: ${new Intl.NumberFormat("vi-VN").format(amount)} ₫ ` +
    `đến tài khoản ${recipient}.`;
}

function setSession(result) {
  if (typeof result.csrfToken !== "string" || !result.csrfToken) {
    throw new Error("Backend không trả về CSRF token cho phiên demo.");
  }

  csrfToken = result.csrfToken;
  if (csrfTokenState) {
    csrfTokenState.textContent = "Token phiên: đã tạo";
    csrfTokenState.classList.add("is-ready");
  }
  updateBank(result);
  setCsrfButtonsDisabled();
}

function validateTransferInput() {
  const recipient = csrfRecipient?.value.trim();
  const amountValue = csrfAmount?.value.trim();
  const amount = Number(amountValue);

  if (!recipient || !/^\d{6,16}$/.test(recipient)) {
    throw new Error("Tài khoản nhận giả phải có từ 6 đến 16 chữ số.");
  }
  if (!/^\d+$/.test(amountValue || "") || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Số tiền phải là số nguyên dương.");
  }

  return { recipient, amount };
}

async function performCsrfAction(action) {
  if (csrfActionInProgress) {
    return;
  }

  csrfActionInProgress = true;
  setCsrfButtonsDisabled();
  setCsrfStatus("Đang gửi request...");
  if (csrfDemoSummary) {
    csrfDemoSummary.textContent = "Đang chờ session demo phản hồi...";
  }
  if (csrfDemoResult) {
    csrfDemoResult.textContent = "Đang tải kết quả...";
  }

  try {
    await action();
  } catch (error) {
    renderCsrfResult({ success: false, message: error.message });
    setCsrfStatus(`Không hoàn tất mô phỏng: ${error.message}`, "is-danger");
    if (csrfDemoSummary) {
      csrfDemoSummary.textContent = `Backend không xác nhận giao dịch: ${error.message}`;
    }
  } finally {
    csrfActionInProgress = false;
    setCsrfButtonsDisabled();
  }
}

function syncAttackerForm(transfer) {
  csrfFormRecipient.value = transfer.recipient;
  csrfFormAmount.value = String(transfer.amount);
}

function submitAttackerForm(endpoint) {
  return new Promise(function (resolve, reject) {
    const timeout = window.setTimeout(function () {
      csrfResponseFrame.removeEventListener("load", handleResponseLoad);
      reject(new Error("Không nhận được phản hồi từ form mô phỏng."));
    }, 10000);

    function handleResponseLoad() {
      window.clearTimeout(timeout);
      resolve();
    }

    csrfResponseFrame.addEventListener("load", handleResponseLoad, { once: true });
    csrfAttackForm.action = `${API_BASE_URL}/labs/csrf/${endpoint}`;
    csrfAttackForm.submit();
  });
}

async function simulateAttackerForm(endpoint) {
  const transfer = validateTransferInput();
  const before = await apiRequest("/labs/csrf/state");
  syncAttackerForm(transfer);
  await submitAttackerForm(endpoint);

  const after = await apiRequest("/labs/csrf/state");
  const wasChanged = after.balance !== before.balance;
  const shouldBeBlocked = endpoint === "secure";

  if (wasChanged === shouldBeBlocked) {
    throw new Error("Trạng thái tài khoản không khớp với kết quả bảo vệ mong đợi.");
  }

  updateBank(after);
  const details = {
    request: {
      method: "POST",
      endpoint: `/api/labs/csrf/${endpoint}`,
      contentType: "application/x-www-form-urlencoded",
      csrfTokenSent: false,
      sessionCookie: "Trình duyệt tự đính kèm theo phiên demo",
    },
    attackerCanReadResponse: false,
    reason: "Trang giả có thể gửi yêu cầu nhưng không thể đọc nội dung phản hồi.",
    balanceBefore: before.balance,
    balanceAfter: after.balance,
    stateChanged: wasChanged,
  };
  renderCsrfResult(details);

  if (shouldBeBlocked) {
    setCsrfStatus("Form giả bị server chặn; số dư được giữ nguyên.", "is-safe");
    if (csrfDemoSummary) {
      csrfDemoSummary.textContent =
        "Endpoint yêu cầu X-CSRF-Token. Form HTML không gửi header này nên server từ chối (HTTP 403); bảng ngân hàng xác nhận số dư không đổi.";
    }
  } else {
    setCsrfStatus("Giao dịch giả đã được thực hiện trên tài khoản demo.", "is-danger");
    if (csrfDemoSummary) {
      csrfDemoSummary.textContent =
        "Endpoint không xác minh token nên chấp nhận POST cùng cookie phiên. Trang giả không đọc được phản hồi; giao dịch chỉ quan sát được trong bảng demo.";
    }
  }
}

if (csrfStartBtn) {
  csrfStartBtn.addEventListener("click", function () {
    performCsrfAction(async function () {
      const result = await apiPost("/labs/csrf/start", {});
      setSession(result);
      renderCsrfResult({
        success: true,
        message: "Demo session started",
        balance: result.balance,
        csrfToken: "Đã tạo trong phiên; không hiển thị giá trị token.",
      });
      setCsrfStatus("Đã đăng nhập ngân hàng demo.", "is-safe");
      if (csrfDemoSummary) {
        csrfDemoSummary.textContent =
          "Phiên local đã có cookie HttpOnly và CSRF token ngẫu nhiên. Số dư bắt đầu là 5.000.000 ₫ giả lập.";
      }
    });
  });
}

if (csrfStateBtn) {
  csrfStateBtn.addEventListener("click", function () {
    performCsrfAction(async function () {
      let state;
      try {
        state = await apiRequest("/labs/csrf/state");
      } catch (error) {
        if (error.message !== "Demo session required") {
          throw error;
        }

        csrfToken = null;
        if (csrfTokenState) {
          csrfTokenState.textContent = "Chưa có phiên";
          csrfTokenState.classList.remove("is-ready");
        }
        setCsrfButtonsDisabled();
        renderCsrfResult({
          success: false,
          message: "Chưa có phiên demo để đọc.",
        });
        setCsrfStatus("Chưa có phiên demo. Hãy đăng nhập để bắt đầu.");
        if (csrfDemoSummary) {
          csrfDemoSummary.textContent =
            "Chưa có dữ liệu phiên trên server. Bấm “Đăng nhập ngân hàng demo” để tạo phiên và số dư ban đầu.";
        }
        return;
      }

      setSession(state);
      renderCsrfResult({
        success: true,
        balance: state.balance,
        lastTransfer: state.lastTransfer,
        tokenAvailable: Boolean(state.csrfToken),
      });
      setCsrfStatus("Số dư và giao dịch đã được đọc lại từ server.", "is-safe");
      if (csrfDemoSummary) {
        csrfDemoSummary.textContent = "Đây là trạng thái mới nhất trong session local.";
      }
    });
  });
}

if (csrfAttackForm) {
  csrfAttackForm.addEventListener("submit", function (event) {
    event.preventDefault();
    performCsrfAction(function () {
      return simulateAttackerForm("vulnerable");
    });
  });
}

if (csrfMissingTokenBtn) {
  csrfMissingTokenBtn.addEventListener("click", function () {
    performCsrfAction(function () {
      return simulateAttackerForm("secure");
    });
  });
}

if (csrfSecureBtn) {
  csrfSecureBtn.addEventListener("click", function () {
    performCsrfAction(async function () {
      const transfer = validateTransferInput();
      const result = await apiPost(
        "/labs/csrf/secure",
        transfer,
        { headers: { "X-CSRF-Token": csrfToken } },
      );
      updateBank(result);
      renderCsrfResult({
        success: true,
        mode: result.mode,
        tokenSentInHeader: true,
        balance: result.balance,
        lastTransfer: result.lastTransfer,
      });
      setCsrfStatus("Server xác minh token và chấp nhận giao dịch demo.", "is-safe");
      if (csrfDemoSummary) {
        csrfDemoSummary.textContent =
          "Đây là thao tác từ giao diện ngân hàng giả lập: token gắn với session được gửi trong header riêng, server xác minh trước khi thay đổi số dư.";
      }
    });
  });
}

if (csrfRecipient && csrfAmount) {
  const refreshAttackerFields = function () {
    csrfFormRecipient.value = csrfRecipient.value.trim();
    csrfFormAmount.value = csrfAmount.value;
  };

  csrfRecipient.addEventListener("input", refreshAttackerFields);
  csrfAmount.addEventListener("input", refreshAttackerFields);
  refreshAttackerFields();
}

setCsrfButtonsDisabled();
