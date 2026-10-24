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
const xssExampleButtons = document.querySelectorAll(".xss-example-btn");

const xssExamples = {
  formatting: "<p>Xin chào <strong>bạn</strong>!</p>",
  "active-content":
    '<strong>Nội dung mẫu</strong> <script>console.log("XSS demo")</script>',
};

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
    vulnerableOutput.replaceChildren(createSafeXssPreview(input));

    vulnerableOutput.appendChild(
      createMessage(
        "simulation-warning",
        "Preview chỉ diễn giải thẻ định dạng văn bản, bỏ qua nội dung hoạt động và không giữ lại thuộc tính.",
      ),
    );

    safeOutput.textContent = input;

    safeOutput.appendChild(
      createMessage(
        "simulation-success",
        "An toàn hơn: textContent hiển thị toàn bộ dữ liệu như văn bản thuần, không diễn giải thành HTML.",
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

  xssExampleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const example = xssExamples[button.dataset.xssExample];

      if (!example) {
        return;
      }

      userInput.value = example;
      hideMessage();
      renderResults(example);
    });
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
