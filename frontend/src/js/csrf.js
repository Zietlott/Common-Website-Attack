/* =========================================================
   CSRF LAB
   Educational simulation only
   ========================================================= */

const csrfButtons = document.querySelectorAll(".csrf-analyze-btn");
const csrfResult = document.getElementById("csrfResult");

if (csrfButtons.length > 0 && csrfResult) {
  csrfButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const requestType = button.dataset.request;

      csrfResult.classList.remove("is-warning", "is-safe");

      if (requestType === "A") {
        csrfResult.classList.add("is-safe");

        csrfResult.innerHTML = "";

        const title = document.createElement("span");
        title.className = "csrf-result-title";
        title.textContent = "Yêu cầu A — mức độ rủi ro thấp hơn";

        const text = document.createElement("span");
        text.className = "csrf-result-text";
        text.textContent =
          "Đọc dữ liệu thường không làm thay đổi trạng thái. Vẫn cần kiểm soát quyền truy cập phù hợp.";

        csrfResult.appendChild(title);
        csrfResult.appendChild(text);
      }

      if (requestType === "B") {
        csrfResult.classList.add("is-warning");

        csrfResult.innerHTML = "";

        const title = document.createElement("span");
        title.className = "csrf-result-title";
        title.textContent = "Yêu cầu B — cần chú ý CSRF";

        const text = document.createElement("span");
        text.className = "csrf-result-text";
        text.textContent =
          "Yêu cầu làm thay đổi trạng thái cần xác minh ý định của người dùng và áp dụng biện pháp chống CSRF phù hợp.";

        csrfResult.appendChild(title);
        csrfResult.appendChild(text);
      }
    });
  });
}
