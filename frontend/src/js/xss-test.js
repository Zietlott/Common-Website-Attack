const loadDemoBtn = document.getElementById("loadDemoBtn");
const loadStatus = document.getElementById("loadStatus");
const vulnerable = document.getElementById("vulnerable");
const secure = document.getElementById("secure");

if (loadDemoBtn && loadStatus && vulnerable && secure) {
  loadDemoBtn.addEventListener("click", async function () {
    const confirmed = window.confirm(
      "Chỉ tiếp tục nếu database local chỉ chứa dữ liệu giả. Bạn có muốn tải bình luận?",
    );

    if (!confirmed) {
      loadStatus.textContent = "Đã hủy. Chưa tải hoặc hiển thị bình luận.";
      return;
    }

    loadDemoBtn.disabled = true;
    loadStatus.textContent = "Đang tải bình luận từ API local...";

    try {
      const result = await apiRequest("/comments");

      if (result.success !== true || !Array.isArray(result.data)) {
        throw new Error("Dữ liệu bình luận từ API không hợp lệ.");
      }

      vulnerable.replaceChildren();
      secure.replaceChildren();

      for (const comment of result.data) {
        const previewItem = document.createElement("p");
        previewItem.appendChild(createSafeXssPreview(comment.content));
        vulnerable.appendChild(previewItem);

        const safeItem = document.createElement("p");
        safeItem.textContent = comment.content;
        secure.appendChild(safeItem);
      }

      loadStatus.textContent =
        `Đã tải ${result.data.length} bình luận từ database demo local.`;
    } catch (error) {
      console.error("Không thể tải dữ liệu demo XSS:", error);
      loadStatus.textContent = `Không thể tải bình luận: ${error.message}`;
    } finally {
      loadDemoBtn.disabled = false;
    }
  });
}
