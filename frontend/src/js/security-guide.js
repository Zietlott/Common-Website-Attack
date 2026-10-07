/* =========================================================
   SECURITY GUIDE
   ========================================================= */

const securityChecks = document.querySelectorAll(".security-check");

const checklistProgress = document.getElementById("checklistProgress");

const checklistMessage = document.getElementById("checklistMessage");

const resetChecklistBtn = document.getElementById("resetChecklistBtn");

if (
  securityChecks.length > 0 &&
  checklistProgress &&
  checklistMessage &&
  resetChecklistBtn
) {
  /* -------------------------------------------------------
     Update checklist
     ------------------------------------------------------- */

  function updateChecklist() {
    const total = securityChecks.length;

    let completed = 0;

    securityChecks.forEach(function (checkbox) {
      const item = checkbox.closest(".checklist-item");

      if (checkbox.checked) {
        completed++;

        if (item) {
          item.classList.add("is-checked");
        }
      } else {
        if (item) {
          item.classList.remove("is-checked");
        }
      }
    });

    checklistProgress.textContent = `${completed}/${total}`;

    if (completed === total) {
      checklistMessage.classList.add("is-complete");

      checklistMessage.textContent =
        "Hoàn thành! Bạn đã kiểm tra tất cả các nội dung trong checklist.";
    } else {
      checklistMessage.classList.remove("is-complete");

      checklistMessage.textContent = `Bạn đã hoàn thành ${completed}/${total} nội dung.`;
    }
  }

  /* -------------------------------------------------------
     Checkbox events
     ------------------------------------------------------- */

  securityChecks.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateChecklist);
  });

  /* -------------------------------------------------------
     Reset
     ------------------------------------------------------- */

  resetChecklistBtn.addEventListener("click", function () {
    securityChecks.forEach(function (checkbox) {
      checkbox.checked = false;
    });

    updateChecklist();
  });

  /* Initial state */
  updateChecklist();
}
