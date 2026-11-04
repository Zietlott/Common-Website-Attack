const phishingOpenBtn = document.getElementById("phishingOpenBtn");
const phishingProtectBtn = document.getElementById("phishingProtectBtn");
const phishingSubmitBtn = document.getElementById("phishingSubmitBtn");
const phishingResetBtn = document.getElementById("phishingResetBtn");
const phishingSite = document.getElementById("phishingSite");
const phishingResult = document.getElementById("phishingResult");
const phishingRecovery = document.getElementById("phishingRecovery");
const phishingRecoverBtn = document.getElementById("phishingRecoverBtn");

function showPhishingResult(message, state = "") {
  phishingResult.classList.remove("is-safe", "is-warning", "is-danger");
  if (state) {
    phishingResult.classList.add(state);
  }
  phishingResult.textContent = message;
}

if (
  phishingOpenBtn &&
  phishingProtectBtn &&
  phishingSubmitBtn &&
  phishingResetBtn &&
  phishingSite &&
  phishingResult &&
  phishingRecovery &&
  phishingRecoverBtn
) {
  phishingOpenBtn.addEventListener("click", function () {
    phishingSite.hidden = false;
    showPhishingResult(
      "Link đã mở trang giả. Dấu hiệu quan trọng: tên miền đích không phải antam.example và email thúc ép xác minh trong 10 phút.",
      "is-warning",
    );
    phishingSite.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  phishingSubmitBtn.addEventListener("click", function () {
    phishingRecovery.hidden = false;
    showPhishingResult(
      "Bạn vừa thử gửi thông tin mẫu trên trang giả. Trong một vụ thật, trang giả có thể lấy thông tin rồi dùng để thử chiếm tài khoản. Lab không đọc các ô, không gửi request và không lưu dữ liệu.",
      "is-danger",
    );
    phishingRecovery.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  phishingProtectBtn.addEventListener("click", function () {
    phishingSite.hidden = true;
    phishingRecovery.hidden = true;
    showPhishingResult(
      "Đã dừng trước khi gửi thông tin và báo cáo email giả lập. Hãy tự mở ứng dụng hoặc gõ địa chỉ chính thức để kiểm tra tài khoản.",
      "is-safe",
    );
  });

  phishingResetBtn.addEventListener("click", function () {
    phishingSite.hidden = true;
    phishingRecovery.hidden = true;
    showPhishingResult(
      "Trước khi mở link, hãy để ý người gửi, sự khẩn cấp và tên miền.",
    );
  });

  phishingRecoverBtn.addEventListener("click", function () {
    showPhishingResult(
      "Đã xem checklist: đổi mật khẩu qua kênh chính thức, thu hồi phiên, báo cáo và bật MFA.",
      "is-safe",
    );
  });
}
