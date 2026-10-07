/* =========================================================
   XSS LAB
   Educational simulation only

   IMPORTANT:
   The user input is never executed as HTML or JavaScript.
   The "vulnerable" section only simulates the concept.
   ========================================================= */

const xssForm = document.getElementById("xssForm");
const userInput = document.getElementById("userInput");

const vulnerableOutput = document.getElementById("vulnerableOutput");
const safeOutput = document.getElementById("safeOutput");

const resetBtn = document.getElementById("resetBtn");
const xssMessage = document.getElementById("xssMessage");

if (xssForm && userInput && vulnerableOutput && safeOutput && resetBtn) {
  /* -------------------------------------------------------
     Show validation message
     ------------------------------------------------------- */

  function showMessage(message) {
    if (!xssMessage) {
      return;
    }

    xssMessage.textContent = message;
    xssMessage.hidden = false;
  }

  /* -------------------------------------------------------
     Hide validation message
     ------------------------------------------------------- */

  function hideMessage() {
    if (!xssMessage) {
      return;
    }

    xssMessage.textContent = "";
    xssMessage.hidden = true;
  }

  /* -------------------------------------------------------
     Create output message
     ------------------------------------------------------- */

  function createMessage(className, text) {
    const message = document.createElement("p");

    message.className = className;
    message.textContent = text;

    return message;
  }

  /* -------------------------------------------------------
     Render simulation
     ------------------------------------------------------- */

  function renderResults(input) {
    /*
      Both outputs intentionally use textContent.

      This means the browser treats the input as plain text
      instead of interpreting it as HTML or JavaScript.

      The "vulnerable" panel is only a visual simulation
      explaining what could happen in an unsafe implementation.
    */

    vulnerableOutput.textContent = input;

    vulnerableOutput.appendChild(
      createMessage(
        "simulation-warning",
        "Mô phỏng: nếu ứng dụng chèn dữ liệu người dùng trực tiếp vào HTML, dữ liệu không được kiểm soát có thể tạo ra rủi ro XSS.",
      ),
    );

    safeOutput.textContent = input;

    safeOutput.appendChild(
      createMessage(
        "simulation-success",
        "An toàn hơn: dữ liệu được xử lý như văn bản thuần, không được trình duyệt thực thi như HTML hoặc JavaScript.",
      ),
    );
  }

  /* -------------------------------------------------------
     Submit form
     ------------------------------------------------------- */

  xssForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const input = userInput.value.trim();

    if (input === "") {
      showMessage("Vui lòng nhập nội dung để thực hiện mô phỏng.");
      userInput.focus();
      return;
    }

    hideMessage();
    renderResults(input);
  });

  /* -------------------------------------------------------
     Reset
     ------------------------------------------------------- */

  resetBtn.addEventListener("click", function () {
    userInput.value = "";

    hideMessage();

    vulnerableOutput.textContent = "Nội dung mô phỏng sẽ xuất hiện ở đây.";

    safeOutput.textContent = "Nội dung an toàn sẽ xuất hiện ở đây.";

    userInput.focus();
  });
}
