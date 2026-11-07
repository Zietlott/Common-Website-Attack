const xssForm = document.getElementById("xssForm");
const attackType = document.getElementById("xssAttackType");
const defenseType = document.getElementById("xssDefenseType");
const attackFrame = document.getElementById("xssAttackFrame");
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
  `<img src="data:image/png;base64,AAAA" width="0" height="0" alt="" onerror="var t=new URLSearchParams(location.search).get('type'),e=document.getElementById('injectedEffect'),s=document.getElementById('sandboxStatus');if(t==='reflected'){e.classList.add('is-reflected');document.getElementById('injectedEffectTitle').textContent='Cần xác minh đơn hàng #1042';document.getElementById('injectedEffectMessage').textContent='Để tiếp tục, vui lòng xác minh thông tin giao hàng.';document.getElementById('injectedEffectAction').hidden=false}else if(t==='stored'){e.classList.add('is-stored');document.getElementById('injectedEffectTitle').textContent='Đánh giá sản phẩm';document.getElementById('injectedEffectMessage').textContent='Sản phẩm rất tốt, hãy liên hệ hỗ trợ để xác minh bảo hành.';document.getElementById('rating').textContent='★★★★★ · 999 đánh giá'}else{e.classList.add('is-dom');document.getElementById('injectedEffectTitle').textContent='Thông tin từ link chia sẻ';document.getElementById('injectedEffectMessage').textContent='Giá sản phẩm trong trang đã bị thay đổi.';document.getElementById('price').textContent='0 ₫';document.getElementById('productState').textContent='Giá được cập nhật từ link chia sẻ'}s.textContent='XSS đã chạy: '+(t==='reflected'?'kết quả tìm kiếm hiển thị yêu cầu xác minh đơn hàng giả.':t==='stored'?'bình luận giả và lượt đánh giá bị sửa.':'giá sản phẩm bị sửa từ dữ liệu trong URL.');s.classList.add('attack-confirmed');setTimeout(function(){window.parent.postMessage({source:'xss-sandbox',state:'executed',type:t,run:new URLSearchParams(location.search).get('run'),height:document.body.scrollHeight},'*')},0)"><section id="injectedEffect" class="injected-xss-effect"><strong id="injectedEffectTitle">Thông tin trang</strong><span id="injectedEffectMessage">Nội dung không an toàn đang được hiển thị.</span><button id="injectedEffectAction" type="button" disabled hidden>Xem chi tiết đơn hàng</button></section>`;

if (
  xssForm &&
  attackType &&
  defenseType &&
  attackFrame &&
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

  function createSandboxUrl(type, runId, defense = "") {
    const url = new URL("../pages/xss-sandbox.html", window.location.href);
    url.searchParams.set("type", type);
    url.searchParams.set("run", String(runId));
    if (defense) {
      url.searchParams.set("defense", defense);
    }

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

  function showDefenseResult() {
    const defense = defenseType.value;
    if (!["validate", "encode", "sanitize"].includes(defense)) {
      showMessage("Chọn một cách phòng thủ hợp lệ.");
      return;
    }

    hideMessage();
    emptyState.hidden = true;
    activeXssRunId += 1;
    attackFrame.hidden = false;
    attackFrame.src = createSandboxUrl(
      attackType.value,
      activeXssRunId,
      defense,
    ).href;

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
      attackFrame.removeAttribute("src");
      attackFrame.hidden = true;
      emptyState.hidden = false;
      return;
    }

    victimButton.hidden = true;
    resultBadge.textContent = "Đang áp dụng phòng thủ";
    resultBadge.className = "xss-result-badge is-running";
    setStatus(
      `${defenseType.options[defenseType.selectedIndex].text}: đang hiển thị kết quả an toàn trong cùng cửa hàng giả lập.`,
      "is-safe",
    );
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
    Number(event.data.run) !== activeXssRunId
  ) {
    return;
  }

  if (
    Number.isFinite(event.data.height) &&
    event.data.height >= 300 &&
    event.data.height <= 1198
  ) {
    attackFrame.style.height = `${Math.ceil(event.data.height) + 2}px`;
  }

  if (
    event.data.state === "defended" &&
    ["reflected", "stored", "dom"].includes(event.data.type) &&
    ["validate", "encode", "sanitize"].includes(event.data.defense)
  ) {
    const resultBadge = document.getElementById("xssResultBadge");
    const simulationStatus = document.getElementById("xssSimulationStatus");
    const defenseLabels = {
      validate: "Xác thực đầu vào",
      encode: "Mã hóa đầu ra (textContent)",
      sanitize: "Lọc HTML theo allowlist",
    };
    const scenarioResults = {
      reflected: "kết quả tìm kiếm chỉ hiện nội dung an toàn",
      stored: "bình luận không thể chạy mã khi được hiển thị",
      dom: "dữ liệu trong URL không thể sửa nội dung trang",
    };
    if (resultBadge) {
      resultBadge.textContent = "Đã phòng thủ";
      resultBadge.className = "xss-result-badge is-safe";
    }
    if (simulationStatus) {
      simulationStatus.textContent = `${defenseLabels[event.data.defense]}: ${scenarioResults[event.data.type]}. Cửa hàng giả giữ nguyên bố cục; chỉ nội dung ở điểm nhận dữ liệu thay đổi.`;
      simulationStatus.classList.remove("is-danger");
      simulationStatus.classList.add("is-safe");
    }
    return;
  }

  if (
    event.data.state !== "executed" ||
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
        "Nạn nhân mở link email → payload từ query chèn thông báo giả vào kết quả tìm kiếm.",
      stored:
        "Bình luận chứa payload đã lưu → khách khác mở trang → bình luận chạy và sửa lượt đánh giá hiển thị.",
      dom:
        "JavaScript đọc fragment rồi đưa vào innerHTML → payload sửa giá hiển thị ngay trong trình duyệt.",
    };
    simulationStatus.textContent = `${steps[event.data.type]} Chỉ giao diện giả lập thay đổi; không có dữ liệu hay yêu cầu nào rời khỏi lab.`;
    simulationStatus.classList.remove("is-safe");
    simulationStatus.classList.add("is-danger");
  }
});
