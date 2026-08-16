const pricing = {
  fulfillment: {
    trial: {
      label: "0-50 单/天（测品）",
      rates: { "0-1": 0.8, "1-2": 1.0, "2-5": 1.5, "5-10": 2.0, "10-15": 2.5, "15-22": 3.0 },
    },
    small: {
      label: "50-100 单/天",
      rates: { "0-1": 0.73, "1-2": 0.9, "2-5": 1.5, "5-10": 2.0, "10-15": 2.5, "15-22": 3.0 },
    },
    medium: {
      label: "100-500 单/天",
      rates: { "0-1": 0.67, "1-2": 0.82, "2-5": 1.5, "5-10": 2.0, "10-15": 2.5, "15-22": 3.0 },
    },
    large: {
      label: "500+ 单/天",
      rates: { "0-1": 0.65, "1-2": 0.8, "2-5": 1.5, "5-10": 2.0, "10-15": 2.5, "15-22": 3.0 },
    },
  },
  y2Exchange: {
    standard: { label: "0-1000 单", price: 0.4 },
    bulk: { label: "1000+ 单", price: 0.35 },
  },
  whatnot: {
    unknown: { label: "0-50 单（未知）", price: 0.6 },
    small: { label: "50-100 单", price: 0.5 },
    large: { label: "100+ 单", price: 0.4 },
  },
  weightLabels: {
    "0-1": "0-1KG",
    "1-2": "1-2KG",
    "2-5": "2-5KG",
    "5-10": "5-10KG",
    "10-15": "10-15KG",
    "15-22": "15-22KG",
  },
  addons: [
    { id: "fbaReturn10", name: "FBA退货费 0-10LB", unit: "箱", price: 3 },
    { id: "fbaReturn20", name: "FBA退货费 10.01-20LB", unit: "箱", price: 5 },
    { id: "fbaReturn45", name: "FBA退货费 20.01-45LB", unit: "箱", price: 10 },
    { id: "fbaRelabel", name: "FBA换标 / 覆盖标签", unit: "个", price: 1 },
    { id: "fbaSort", name: "FBA退货分拣费", unit: "件", price: 0.3 },
    { id: "count20", name: "清点费 0-20LB", unit: "件", price: 0.3 },
    { id: "count45", name: "清点费 20.01-45LB", unit: "件", price: 1 },
    { id: "count65", name: "清点费 45.01-65LB", unit: "件", price: 2 },
    { id: "count110", name: "清点费 65.01-110LB", unit: "件", price: 3 },
    { id: "labelPiece", name: "贴标签", unit: "件", price: 1 },
    { id: "labelBox", name: "贴标签", unit: "箱", price: 1 },
    { id: "labelPallet", name: "贴标签", unit: "托", price: 2 },
    { id: "materialSmallBox", name: "物料费 小纸箱", unit: "个", price: 3 },
    { id: "materialMediumBox", name: "物料费 中纸箱", unit: "个", price: 4 },
    { id: "materialLargeBox", name: "物料费 大纸箱", unit: "个", price: 5 },
    { id: "materialBubble05", name: "物料费 气泡袋", unit: "个", price: 0.5 },
    { id: "materialBubble10", name: "物料费 大气泡袋", unit: "个", price: 1 },
    { id: "polybag30", name: "普通邮寄胶袋 30*40", unit: "个", price: 0.5 },
    { id: "polybag50", name: "普通邮寄胶袋 50*50", unit: "个", price: 0.8 },
    { id: "repack", name: "额外人工打包", unit: "箱", price: 4 },
    { id: "photo", name: "拍照费", unit: "张", price: 1 },
    { id: "video", name: "视频拍摄", unit: "个", price: 5 },
    { id: "inspect", name: "检查货物包装及外观", unit: "个", price: 2 },
    { id: "destroy", name: "销毁处理费", unit: "kg", price: 1, note: "最低 $50/票" },
    { id: "dimensionCheck", name: "商品尺寸重量复核", unit: "件", price: 5 },
    { id: "detentionBox", name: "压仓费", unit: "箱/天", price: 1 },
    { id: "detentionPallet", name: "压仓费", unit: "卡板/天", price: 8 },
    { id: "restockBox", name: "下架重新转上架", unit: "箱", price: 2 },
    { id: "returnToStock", name: "退货转标品库存", unit: "件", price: 3 },
    { id: "overtime", name: "节假日加班处理费", unit: "小时", price: 100 },
    { id: "palletize", name: "打托人工耗材费", unit: "托", price: 18 },
    { id: "truck", name: "卡车服务 / 卡派尾程", unit: "票", manual: true },
  ],
};

const $ = (id) => document.getElementById(id);
const money = (value) => `$${value.toFixed(2)}`;
const stepOrder = ["service", "productType", "dailyVolume", "weightBand", "y2Volume", "whatnotVolume", "otherServices", "result"];
let activeStep = "service";
let historyStack = [];

function selectedRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value;
}

function num(id) {
  const value = parseFloat($(id)?.value || "0");
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function goToStep(step, pushHistory = true) {
  if (pushHistory && activeStep !== step) historyStack.push(activeStep);
  activeStep = step;
  document.querySelectorAll(".wizard-step").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.step !== step);
  });
  updateProgress();
  if (step === "result") renderResult();
}

function goBack() {
  const previous = historyStack.pop() || "service";
  goToStep(previous, false);
}

function updateProgress() {
  const service = selectedRadio("service") || "fulfillment";
  const total = service === "fulfillment" ? 5 : 3;
  const currentMap = {
    service: 1,
    productType: 2,
    weightBand: 3,
    dailyVolume: 4,
    y2Volume: 2,
    whatnotVolume: 2,
    otherServices: 2,
    result: total,
  };
  const current = currentMap[activeStep] || 1;
  $("progressText").textContent = `第 ${current} 步 / 共 ${total} 步`;
  $("progressBar").style.width = `${Math.min(100, Math.round((current / total) * 100))}%`;
}

function serviceNextStep(service) {
  if (service === "fulfillment") return "productType";
  if (service === "y2Exchange") return "y2Volume";
  if (service === "whatnot") return "whatnotVolume";
  return "otherServices";
}

function addLine(lines, name, qty, unit, price, note = "") {
  if (qty <= 0) return;
  lines.push({
    name,
    detail: `${qty} ${unit} × ${money(price)}${note ? ` · ${note}` : ""}`,
    amount: qty * price,
  });
}

function addManual(lines, name, detail) {
  lines.push({ name, detail, amount: 0, manual: true });
}

function fulfillmentLines() {
  const lines = [];
  const productType = selectedRadio("productType") || "general";
  const dailyVolume = selectedRadio("dailyVolume") || "trial";
  const weightBand = selectedRadio("weightBand") || "0-1";
  const volume = pricing.fulfillment[dailyVolume];
  const productSurcharge = productType === "sensitive" ? 0.1 : 0;
  const finalRate = volume.rates[weightBand] + productSurcharge;

  addLine(
    lines,
    `订单处理 + 扫码验货 + 打包 + 扫码出库`,
    1,
    "单",
    finalRate,
    `${volume.label} · ${pricing.weightLabels[weightBand]} · ${productType === "sensitive" ? "敏感货+$0.10/单" : "普货"}`
  );

  const skuTier = selectedRadio("skuCountTier") || "one";
  const skuPricing = {
    one: { label: "单箱 1 SKU", price: 0 },
    twoToFive: { label: "单箱 2-5 SKU", price: 1 },
    overFive: { label: "单箱 5+ SKU", price: 2 },
  };
  const skuRate = skuPricing[skuTier];
  addLine(lines, "清点上架费", 1, "箱", skuRate.price, skuRate.label);

  return lines;
}

function y2Lines() {
  const volume = selectedRadio("y2Volume") || "standard";
  const rate = pricing.y2Exchange[volume];
  const lines = [];
  addLine(lines, "Y2换单", 1, "单", rate.price, rate.label);
  return lines;
}

function whatnotLines() {
  const volume = selectedRadio("whatnotVolume") || "unknown";
  const rate = pricing.whatnot[volume];
  const lines = [];
  addLine(lines, "Whatnot", 1, "单", rate.price, rate.label);
  return lines;
}

function addonLines(prefix = "otherAddon") {
  const lines = [];
  pricing.addons.forEach((addon) => {
    const enabled = $(`${prefix}_${addon.id}Enabled`);
    if (!enabled?.checked) return;
    if (addon.manual) {
      addManual(lines, addon.name, "该项目报价单标注为“单询”，需人工确认");
      return;
    }
    addLine(lines, addon.name, num(`${prefix}_${addon.id}Qty`), addon.unit, addon.price, addon.note || "");
  });
  return lines;
}

function currentLines() {
  const service = selectedRadio("service") || "fulfillment";
  if (service === "fulfillment") return fulfillmentLines();
  if (service === "y2Exchange") return y2Lines();
  if (service === "whatnot") return whatnotLines();
  return addonLines("otherAddon");
}

function renderResult() {
  const service = selectedRadio("service") || "fulfillment";
  const lines = currentLines();
  const hasManual = lines.some((line) => line.manual);
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  $("resultLabel").textContent = service === "fulfillment" ? "一件代发单价" : "报价结果";
  $("totalPrice").textContent = service === "fulfillment" ? `${money(total)}/单` : money(total);
  $("manualHint").textContent = hasManual ? "包含需人工确认项目" : "当前项目可自动估算";
  $("manualHint").classList.toggle("clean", !hasManual);

  $("breakdownRows").innerHTML = lines.length ? lines.map((line) => `
    <div class="line-row">
      <div>
        <strong>${line.name}</strong>
        <small>${line.detail}</small>
      </div>
      <div class="amount ${line.manual ? "manual" : ""}">${line.manual ? "单询" : money(line.amount)}</div>
    </div>
  `).join("") : `<div class="line-row"><div><strong>暂无费用</strong><small>选择服务后生成明细</small></div><div class="amount">$0.00</div></div>`;

  renderFulfillmentAddonPrices(service);
  renderRules(service);
}

function renderFulfillmentAddonPrices(service) {
  const section = $("fulfillmentAddonPriceSection");
  const contactSection = $("fulfillmentContactSection");
  const container = $("fulfillmentAddonPrices");
  section.classList.toggle("hidden", service !== "fulfillment");
  contactSection.classList.toggle("hidden", service !== "fulfillment");
  if (service !== "fulfillment") return;

  const priceItems = [
    { name: "退货服务", price: "$3 / 件", detail: "退货处理服务" },
    ...pricing.addons.map((addon) => ({
      name: addon.name,
      price: addon.manual ? "单询" : `${money(addon.price)} / ${addon.unit}`,
      detail: addon.note || "可按实际需求选择",
    })),
  ];

  container.innerHTML = priceItems.map((item) => `
    <div class="addon-price-card">
      <strong>${item.name}</strong>
      <span>${item.price}</span>
      <small>${item.detail}</small>
    </div>
  `).join("");
}

function setAddonCollapse(expanded) {
  $("addonCollapseBody").classList.toggle("hidden", !expanded);
  $("addonToggle").setAttribute("aria-expanded", String(expanded));
  $("addonToggleIcon").textContent = expanded ? "收起" : "展开";
}

function renderRules(service) {
  const rules = {
    fulfillment: [
      "一件代发费用为：订单处理 + 扫码验货 + 打包 + 扫码出库。",
      "抛货取体积重和实际重量中的较大值，体积重按长 × 宽 × 高（cm）/ 6000 或长 × 宽 × 高（inch）/ 167 计算。",
      "订单处理费按单个订单对应的票总重量计费；一票多 SKU 按打包后的包裹总重量计费。",
      "订单处理时效为 24 小时（工作日）；耗材、退货、清点上架和其他增值服务按所选项目另计。",
    ],
    y2Exchange: [
      "Y2换单按客户选择的单量档位计费。",
      "0-1000 单为 $0.40/单，1000+ 单为 $0.35/单。",
      "如涉及特殊渠道、异常处理或额外人工操作，以人工确认为准。",
      "最终费用以实际订单数据和系统记录为准。",
    ],
    whatnot: [
      "Whatnot 按客户选择的单量档位计费。",
      "0-50 单（未知）为 $0.60/单，50-100 单为 $0.50/单，100+ 单为 $0.40/单。",
      "如涉及特殊包装、拍照、检查、退货或其他人工服务，需另计增值服务费用。",
      "最终费用以实际订单数据和系统记录为准。",
    ],
    otherServices: [
      "其他服务按客户勾选的增值服务项目计费。",
      "单询项目需要人工确认报价。",
      "带最低收费、特殊条件或异常处理的项目，以实际操作要求和仓库确认为准。",
      "最终费用以实际订单数据和系统记录为准。",
    ],
  };

  const selectedRules = rules[service] || rules.fulfillment;
  ["ruleServiceLine", "ruleWeightLine", "ruleSkuLine", "ruleTimeLine"].forEach((id, index) => {
    $(id).textContent = selectedRules[index];
  });
}

function renderAddons(targetId, prefix) {
  const list = $(targetId);
  list.innerHTML = pricing.addons.map((addon) => {
    const priceText = addon.manual ? "单询" : `${money(addon.price)} / ${addon.unit}`;
    return `
      <label class="addon">
        <input id="${prefix}_${addon.id}Enabled" type="checkbox">
        <span>${addon.name}<small>${priceText}</small></span>
        <input id="${prefix}_${addon.id}Qty" type="number" min="0" step="1" value="${addon.manual ? 1 : 0}" aria-label="${addon.name}数量">
      </label>
    `;
  }).join("");
}

function startOver() {
  $("quoteForm").reset();
  historyStack = [];
  goToStep("service", false);
}

renderAddons("otherAddonList", "otherAddon");
document.querySelectorAll('input[name="service"]').forEach((input) => {
  input.addEventListener("change", () => goToStep(serviceNextStep(input.value)));
  input.addEventListener("click", () => goToStep(serviceNextStep(input.value)));
});
document.querySelectorAll('input[name="productType"]').forEach((input) => {
  input.addEventListener("change", () => goToStep("weightBand"));
  input.addEventListener("click", () => goToStep("weightBand"));
});
document.querySelectorAll('input[name="dailyVolume"]').forEach((input) => {
  input.addEventListener("change", () => goToStep("result"));
  input.addEventListener("click", () => goToStep("result"));
});
document.querySelectorAll('input[name="weightBand"]').forEach((input) => {
  input.addEventListener("change", () => goToStep("dailyVolume"));
  input.addEventListener("click", () => goToStep("dailyVolume"));
});
document.querySelectorAll('input[name="y2Volume"], input[name="whatnotVolume"]').forEach((input) => {
  input.addEventListener("change", () => goToStep("result"));
  input.addEventListener("click", () => goToStep("result"));
});
document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", goBack));
$("otherResultBtn").addEventListener("click", () => goToStep("result"));
$("resetBtn").addEventListener("click", startOver);
$("startOverBtn").addEventListener("click", startOver);
$("wechatBtn").addEventListener("click", async () => {
  const wechatId = "zhengzhonghwc";
  try {
    await navigator.clipboard.writeText(wechatId);
    $("wechatBtnText").textContent = "已复制";
  } catch {
    $("wechatBtnText").textContent = "请手动复制";
  }
  setTimeout(() => {
    $("wechatBtnText").textContent = "复制微信号";
  }, 1800);
});
$("addonToggle").addEventListener("click", () => {
  const expanded = $("addonToggle").getAttribute("aria-expanded") === "true";
  setAddonCollapse(!expanded);
});
document.addEventListener("input", () => {
  if (activeStep === "result") renderResult();
});
document.addEventListener("change", (event) => {
  if (activeStep === "result" && event.target.name === "skuCountTier") renderResult();
});
goToStep("service", false);
