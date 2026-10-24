/* =========================================================
   PHISHING LAB
   Educational simulation only
   ========================================================= */

const phishingSafeBtn = document.getElementById("phishingSafeBtn");
const phishingResult = document.getElementById("phishingResult");
const phishingSigns = document.querySelectorAll(
  'input[name="phishingSign"]',
);

if (phishingSafeBtn && phishingResult && phishingSigns.length > 0) {
  phishingSafeBtn.addEventListener("click", function () {
    const selectedSigns = Array.from(phishingSigns)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    const correctSigns = ["urgency", "credentials", "sender"];
    const missedSigns = correctSigns.filter(
      (sign) => !selectedSigns.includes(sign),
    );
    const incorrectSigns = selectedSigns.filter(
      (sign) => !correctSigns.includes(sign),
    );

    phishingResult.classList.remove("is-safe", "is-warning");

    if (selectedSigns.length === 0) {
      phishingResult.classList.add("is-warning");
      phishingResult.textContent =
        "Hãy chọn những dấu hiệu bạn nhận thấy trước khi kiểm tra.";
      return;
    }

    const correctCount = selectedSigns.filter((sign) =>
      correctSigns.includes(sign),
    ).length;

    phishingResult.classList.add(
      missedSigns.length === 0 && incorrectSigns.length === 0
        ? "is-safe"
        : "is-warning",
    );
    const feedback = [
      `Bạn nhận diện đúng ${correctCount}/${correctSigns.length} dấu hiệu.`,
    ];

    if (missedSigns.length > 0) {
      feedback.push(`Bạn còn bỏ sót ${missedSigns.length} dấu hiệu đáng ngờ.`);
    }

    if (incorrectSigns.length > 0) {
      feedback.push(
        `${incorrectSigns.length} lựa chọn không phải dấu hiệu đáng ngờ; tự mở website hoặc ứng dụng chính thức là biện pháp bảo vệ.`,
      );
    }

    feedback.push(
      "Trang có lời đe dọa khẩn cấp, yêu cầu mật khẩu/OTP và tên miền không được xác minh. Không nhập thông tin; hãy tự mở website hoặc ứng dụng chính thức để kiểm tra.",
    );
    phishingResult.textContent = feedback.join(" ");
  });
}
