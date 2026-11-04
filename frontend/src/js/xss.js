const xssForm = document.getElementById("xssForm");
const attackType = document.getElementById("xssAttackType");
const defenseType = document.getElementById("xssDefenseType");
const attackFrame = document.getElementById("xssAttackFrame");
const defenseOutput = document.getElementById("xssDefenseOutput");
const emptyState = document.getElementById("xssEmptyState");
const resultBadge = document.getElementById("xssResultBadge");
const attackButton = document.getElementById("xssAttackBtn");
const victimButton = document.getElementById("xssVictimBtn");
const resetBtn = document.getElementById("resetBtn");
const defendBtn = document.getElementById("xssDefendBtn");
const payloadPreview = document.getElementById("xssPayloadPreview");
const xssMessage = document.getElementById("xssMessage");
const simulationStatus = document.getElementById("xssSimulationStatus");
const storedPayloadKey = "web-security-lab.xss-stored-payload";
const storedDefenseKey = "web-security-lab.xss-stored-defense";
let activeXssRunId = 0;

const xssAttackPayload =
  `<img src="data:image/png;base64,AAAA" onerror="document.getElementById('cartCount').textContent='1'; document.getElementById('attackOffer').hidden=false; document.getElementById('productState').textContent='Ưu đãi đã được áp dụng'; window.parent.postMessage({source:'xss-sandbox',state:'executed',type:new URLSearchParams(location.search).get('type'),run:new URLSearchParams(location.search).get('run')},'*')">`;

if (
  xssForm &&
  attackType &&
  defenseType &&
  attackFrame &&
  defenseOutput &&
  emptyState &&
  resultBadge &&
  attackButton &&
  victimButton &&
  resetBtn &&
  defendBtn &&
  payloadPreview &&
  simulationStatus
) {
  payloadPreview.textContent = xssAttackPayload;

  function setStatus(message, state = "") {
    simulationStatus.textContent = message;
    simulationStatus.classList.remove("is-danger", "is-safe");
    if (state) {
      simulationStatus.classList.add(state);
    }
  }

  function showMessage(message) {
    if (!xssMessage) {
      return;
    }

    xssMessage.textContent = message;
    xssMessage.hidden = false;
  }

  function hideMessage() {
    if (!xssMessage) {
      return;
    }

    xssMessage.textContent = "";
    xssMessage.hidden = true;
  }

  function clearOutput() {
    activeXssRunId += 1;
    attackFrame.removeAttribute("src");
    attackFrame.hidden = true;
    defenseOutput.replaceChildren();
    defenseOutput.hidden = true;
    emptyState.hidden = false;
    emptyState.textContent = "Chạy mô phỏng để xem kết quả tại đây.";
    resultBadge.textContent = "Chưa chạy";
    resultBadge.className = "xss-result-badge";
    victimButton.hidden = true;
  }

  function updateScenario() {
    const type = attackType.value;
    document.getElementById("xssFlowReflected").hidden = type !== "reflected";
    document.getElementById("xssFlowStored").hidden = type !== "stored";
    document.getElementById("xssFlowDom").hidden = type !== "dom";
    attackButton.textContent =
      type === "stored"
        ? "1. Đăng bình luận giả"
        : type === "dom"
          ? "Nạn nhân mở link chia sẻ"
          : "Nạn nhân mở link email";
    victimButton.hidden = true;
    hideMessage();
  }

  attackType.addEventListener("change", function () {
    try {
      sessionStorage.removeItem(storedPayloadKey);
      sessionStorage.removeItem(storedDefenseKey);
      clearOutput();
      updateScenario();
      setStatus("Tình huống đã đổi. Chạy các bước mới để xem luồng tấn công.");
    } catch (error) {
      showMessage(`Không thể đặt lại tình huống: ${error.message}`);
    }
  });

  function createSandboxUrl(type, runId) {
    const url = new URL("../pages/xss-sandbox.html", window.location.href);
    url.searchParams.set("type", type);
    url.searchParams.set("run", String(runId));

    if (type === "stored") {
      url.searchParams.set("comment", xssAttackPayload);
    } else if (type === "dom") {
      url.hash = new URLSearchParams({ message: xssAttackPayload }).toString();
    } else {
      url.searchParams.set("q", xssAttackPayload);
    }

    return url;
  }

  function runAttack(type) {
    if (!["reflected", "stored", "dom"].includes(type)) {
      showMessage("Chọn một dạng XSS hợp lệ.");
      return;
    }

    hideMessage();
    try {
      if (
        type === "stored" &&
        sessionStorage.getItem(storedPayloadKey) !== xssAttackPayload
      ) {
        throw new Error(
          "Hãy đăng bình luận mô phỏng trước khi khách truy cập.",
        );
      }

      if (type !== "stored") {
        sessionStorage.removeItem(storedPayloadKey);
      }
      sessionStorage.removeItem(storedDefenseKey);
      activeXssRunId += 1;
      defenseOutput.replaceChildren();
      defenseOutput.hidden = true;
      emptyState.hidden = true;
      victimButton.hidden = true;
      attackFrame.hidden = false;
      attackFrame.src = createSandboxUrl(type, activeXssRunId).href;
      resultBadge.textContent = "Đang mở website giả";
      resultBadge.className = "xss-result-badge is-running";
      setStatus(
        type === "stored"
          ? "Khách đang mở trang sản phẩm có bình luận đã lưu."
          : "Đang mở link; website giả nhận dữ liệu qua URL.",
      );
    } catch (error) {
      showMessage(`Không thể chạy mô phỏng: ${error.message}`);
      setStatus("Mô phỏng không chạy được.", "is-danger");
    }
  }

  function handleAttackSubmit(event) {
    event.preventDefault();
    const type = attackType.value;

    if (type !== "stored") {
      runAttack(type);
      return;
    }

    try {
      sessionStorage.setItem(storedPayloadKey, xssAttackPayload);
      sessionStorage.removeItem(storedDefenseKey);
      clearOutput();
      victimButton.hidden = false;
      resultBadge.textContent = "Bình luận đã được lưu";
      resultBadge.className = "xss-result-badge is-running";
      emptyState.textContent =
        "Bình luận độc hại đã lưu trong sessionStorage của lab. Nhấn nút bên dưới để mô phỏng khách khác mở trang.";
      setStatus(
        "Bước 1 hoàn tất: bình luận đã lưu. Chưa có ai bị ảnh hưởng cho đến khi mở trang sản phẩm.",
      );
      hideMessage();
    } catch (error) {
      showMessage(`Không thể lưu bình luận mô phỏng: ${error.message}`);
      setStatus("Không thể lưu mô phỏng.", "is-danger");
    }
  }

  function createFakeShop() {
    const shop = document.createElement("article");
    shop.className = "xss-safe-store";

    const header = document.createElement("div");
    header.className = "xss-safe-store-header";
    const brand = document.createElement("span");
    brand.textContent = "ShopViet";
    const cart = document.createElement("span");
    cart.append("Giỏ hàng ");
    const cartCount = document.createElement("strong");
    cartCount.textContent = "0";
    cart.appendChild(cartCount);
    header.append(brand, cart);

    const product = document.createElement("div");
    product.className = "xss-safe-store-content";

    const eyebrow = document.createElement("span");
    eyebrow.className = "xss-safe-store-kicker";
    eyebrow.textContent = "ĐIỆN GIA DỤNG";

    const title = document.createElement("h4");
    title.textContent = "Máy xay đa năng ShopViet";

    const stock = document.createElement("p");
    stock.className = "xss-safe-store-state";
    stock.textContent = "Còn hàng · Giao dự kiến ngày mai";

    const price = document.createElement("strong");
    price.className = "xss-safe-store-price";
    price.textContent = "1.290.000 ₫";

    const review = document.createElement("div");
    review.className = "xss-safe-review";
    const reviewer = document.createElement("strong");
    reviewer.textContent = "Đánh giá gần đây";
    const comment = document.createElement("p");
    comment.className = "xss-safe-comment";

    review.append(reviewer, comment);
    product.append(eyebrow, title, stock, price, review);
    shop.append(header, product);
    return { shop, comment };
  }

  function showDefenseResult() {
    const defense = defenseType.value;
    const { shop, comment } = createFakeShop();
    const result = document.createElement("p");
    result.className = "xss-defense-message";

    activeXssRunId += 1;
    attackFrame.removeAttribute("src");
    attackFrame.hidden = true;
    defenseOutput.replaceChildren();
    defenseOutput.hidden = false;
    emptyState.hidden = true;

    if (defense === "validate") {
      result.textContent =
        "Bình luận bị từ chối: trường này chỉ nhận văn bản, không nhận thẻ HTML.";
      result.classList.add("is-safe");
    } else if (defense === "encode") {
      comment.textContent = xssAttackPayload;
      result.textContent =
        "Đầu ra được thêm bằng textContent: payload hiện như chữ, không chạy.";
      result.classList.add("is-safe");
    } else if (defense === "sanitize") {
      comment.appendChild(createSafeXssPreview(xssAttackPayload));
      result.textContent =
        "Sanitizer allowlist không cho phép img/onerror nên không có mã chạy.";
      result.classList.add("is-safe");
    } else {
      showMessage("Chọn một cách phòng thủ hợp lệ.");
      return;
    }

    defenseOutput.append(shop, result);

    try {
      if (attackType.value === "stored") {
        if (defense === "validate") {
          sessionStorage.removeItem(storedPayloadKey);
          sessionStorage.removeItem(storedDefenseKey);
        } else if (sessionStorage.getItem(storedPayloadKey) === xssAttackPayload) {
          sessionStorage.setItem(storedDefenseKey, defense);
        }
      }
    } catch (error) {
      showMessage(`Không thể lưu trạng thái phòng thủ: ${error.message}`);
      return;
    }

    victimButton.hidden = true;
    resultBadge.textContent = "Đã phòng thủ";
    resultBadge.className = "xss-result-badge is-safe";
    setStatus(
      `${defenseType.options[defenseType.selectedIndex].text}: giao diện cửa hàng và giỏ hàng không bị thay đổi.`,
      "is-safe",
    );
    hideMessage();
  }

  xssForm.addEventListener("submit", handleAttackSubmit);
  attackType.addEventListener("change", updateScenario);
  victimButton.addEventListener("click", function () {
    runAttack("stored");
  });
  defendBtn.addEventListener("click", showDefenseResult);

  resetBtn.addEventListener("click", function () {
    hideMessage();
    try {
      sessionStorage.removeItem(storedPayloadKey);
      sessionStorage.removeItem(storedDefenseKey);
      sessionStorage.removeItem("web-security-lab.xss-comments");
    } catch (error) {
      showMessage(`Không thể xóa mô phỏng đã lưu: ${error.message}`);
    }
    clearOutput();
    setStatus("Chọn tình huống rồi theo dõi các bước tấn công.");
  });

  updateScenario();

  try {
    if (sessionStorage.getItem(storedPayloadKey) === xssAttackPayload) {
      attackType.value = "stored";
      updateScenario();
      const savedDefense = sessionStorage.getItem(storedDefenseKey);
      if (["validate", "encode", "sanitize"].includes(savedDefense)) {
        defenseType.value = savedDefense;
        showDefenseResult();
      } else {
        runAttack("stored");
        setStatus(
          "Bình luận giả đã lưu từ trước; khách khác đang mở trang sản phẩm.",
          "is-danger",
        );
      }
    }
  } catch (error) {
    showMessage(`Không thể tải mô phỏng đã lưu: ${error.message}`);
  }
}

window.addEventListener("message", function (event) {
  const attackFrame = document.getElementById("xssAttackFrame");
  if (
    !attackFrame ||
    event.source !== attackFrame.contentWindow ||
    event.origin !== "null" ||
    !event.data ||
    event.data.source !== "xss-sandbox" ||
    event.data.state !== "executed" ||
    Number(event.data.run) !== activeXssRunId ||
    !["reflected", "stored", "dom"].includes(event.data.type)
  ) {
    return;
  }

  const resultBadge = document.getElementById("xssResultBadge");
  const simulationStatus = document.getElementById("xssSimulationStatus");
  if (resultBadge) {
    resultBadge.textContent = "Tấn công thành công";
    resultBadge.className = "xss-result-badge is-danger";
  }
  if (simulationStatus) {
    const steps = {
      reflected:
        "Nạn nhân mở link email → dữ liệu từ query được phản chiếu vào trang tìm kiếm. Payload đổi giỏ hàng giả và hiện khuyến mãi giả.",
      stored:
        "Bình luận đã lưu → khách khác mở trang sản phẩm → payload chạy khi bình luận được hiển thị. Giỏ hàng giả đổi và khuyến mãi giả xuất hiện.",
      dom:
        "Trang đọc dữ liệu từ URL fragment → đưa vào innerHTML → payload đổi giỏ hàng giả và hiện khuyến mãi giả.",
    };
    simulationStatus.textContent = `${steps[event.data.type]} Không có dữ liệu hay yêu cầu nào rời khỏi lab.`;
    simulationStatus.classList.remove("is-safe");
    simulationStatus.classList.add("is-danger");
  }
});
