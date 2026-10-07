/* =========================================================
   PHISHING LAB
   Educational simulation only
   ========================================================= */

const phishingSafeBtn = document.getElementById("phishingSafeBtn");

const phishingResult = document.getElementById("phishingResult");

if (phishingSafeBtn && phishingResult) {
  phishingSafeBtn.addEventListener("click", function () {
    phishingResult.classList.add("is-safe");

    phishingResult.textContent =
      "Đúng hướng: Không cung cấp thông tin. Tự mở website hoặc ứng dụng chính thức để kiểm tra và liên hệ bộ phận hỗ trợ qua kênh đáng tin cậy.";
  });
}
