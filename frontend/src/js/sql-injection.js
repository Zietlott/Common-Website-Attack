/* =========================================================
   SQL INJECTION LAB
   Educational simulation only
   ========================================================= */

const checkSqlBtn = document.getElementById("checkSqlBtn");
const resetSqlBtn = document.getElementById("resetSqlBtn");
const sqlResult = document.getElementById("sqlResult");

const sqlAnswers = document.querySelectorAll('input[name="sqlAnswer"]');

if (checkSqlBtn && resetSqlBtn && sqlResult && sqlAnswers.length > 0) {
  /* -------------------------------------------------------
     Check answer
     ------------------------------------------------------- */

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
        "Chính xác! Truy vấn tham số hóa giúp tách dữ liệu đầu vào khỏi cấu trúc SQL và là biện pháp quan trọng để giảm nguy cơ SQL Injection.";

      return;
    }

    sqlResult.classList.add("is-wrong");

    sqlResult.textContent =
      "Chưa chính xác. Hãy nhớ ưu tiên truy vấn tham số hóa và kiểm soát quyền của tài khoản cơ sở dữ liệu.";
  });

  /* -------------------------------------------------------
     Reset
     ------------------------------------------------------- */

  resetSqlBtn.addEventListener("click", function () {
    sqlAnswers.forEach(function (answer) {
      answer.checked = false;
    });

    sqlResult.classList.remove("is-correct", "is-wrong", "is-empty");

    sqlResult.textContent = "Kết quả sẽ hiển thị tại đây.";
  });
}
