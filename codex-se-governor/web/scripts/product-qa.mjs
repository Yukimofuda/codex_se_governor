import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

async function findChrome() {
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {}
  }
  throw new Error("Chrome or Chromium was not found. Set CHROME_PATH.");
}

function collectBrowserErrors(page) {
  const errors = [];
  const appOrigin = new URL(baseUrl).origin;
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).origin === appOrigin) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}

async function assertNoHorizontalOverflow(page, label) {
  const audit = await page.evaluate(() => {
    const offenders = [...document.querySelectorAll("main *, [role='dialog'], [role='dialog'] *")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.right > window.innerWidth + 1 || box.left < -1;
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        className: String(element.className),
        text: (element.textContent || "").trim().slice(0, 80),
      }));
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      offenders,
    };
  });
  if (audit.documentWidth > audit.viewportWidth + 1 || audit.offenders.length) {
    throw new Error(`${label} overflows horizontally: ${JSON.stringify(audit)}`);
  }
}

async function assertDesktopShellGeometry(page, label) {
  await page.waitForFunction(() => {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".workspace-main");
    if (!sidebar || !main) return false;
    const expected = Number.parseFloat(getComputedStyle(main).getPropertyValue("--sidebar"));
    const box = sidebar.getBoundingClientRect();
    return expected > 0 && Math.abs(box.width - expected) < 1 && Math.abs(box.left) < 1
      && Math.abs(Number.parseFloat(getComputedStyle(main).paddingLeft) - expected) < 1
      && getComputedStyle(sidebar).visibility === "visible";
  });
  const geometry = await page.evaluate(() => {
    const sidebar = document.querySelector(".sidebar");
    const nav = sidebar?.querySelector("nav");
    const main = document.querySelector(".workspace-main");
    return {
      expected: main ? Number.parseFloat(getComputedStyle(main).getPropertyValue("--sidebar")) : 0,
      sidebar: sidebar?.getBoundingClientRect().width || 0,
      nav: nav?.getBoundingClientRect().width || 0,
      mainPadding: main ? Number.parseFloat(getComputedStyle(main).paddingLeft) : 0,
    };
  });
  if (Math.abs(geometry.sidebar - geometry.expected) > 1 || Math.abs(geometry.mainPadding - geometry.expected) > 1 || geometry.nav < geometry.sidebar - 32) {
    throw new Error(`${label} shell geometry is inconsistent: ${JSON.stringify(geometry)}`);
  }
}

async function openDemo(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "查看登录限流示例" }).waitFor();
  await page.getByRole("button", { name: "查看登录限流示例" }).click();
  await page.getByRole("heading", { name: "Sample Login API" }).waitFor();
}

async function addAcceptanceScenario(page, values) {
  await page.getByRole("button", { name: "添加缺少的场景" }).click();
  const row = page.locator(".acceptance-row").last();
  await row.getByPlaceholder("已知什么前提").fill(values.context);
  await row.getByPlaceholder("发生什么操作").fill(values.action);
  await row.getByPlaceholder("应观察到什么结果").fill(values.expected);
}

async function waitForSavedRequirement(page, title) {
  await page.waitForFunction(async (expected) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("codex-se-governor-web", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction("workspace", "readonly").objectStore("workspace").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return saved?.requirements?.some((item) => item.title === expected);
  }, title);
}

async function flowDemo(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "zh-CN", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await openDemo(page);
  await assertNoHorizontalOverflow(page, "demo overview");
  await assertDesktopShellGeometry(page, "demo overview");
  await page.screenshot({ path: ".qa/project-overview-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "收起导航", exact: true }).click();
  await assertDesktopShellGeometry(page, "collapsed navigation");
  await assertNoHorizontalOverflow(page, "collapsed overview");
  await page.setViewportSize({ width: 820, height: 1180 });
  await assertNoHorizontalOverflow(page, "collapsed-to-tablet overview");
  await page.getByRole("button", { name: "打开导航" }).click();
  await page.locator("aside").getByRole("button", { name: "需求", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "展开导航", exact: true }).click();

  await page.getByRole("button", { name: "运行", exact: true }).click();
  await page.getByRole("heading", { name: "工程运行" }).waitFor();
  await assertNoHorizontalOverflow(page, "demo run");
  await page.getByRole("button", { name: /确定性验证/ }).click();
  await page.getByText("validation-results.json", { exact: true }).waitFor();

  await page.getByRole("button", { name: "检查", exact: true }).click();
  await page.getByRole("button", { name: /单元测试/ }).click();
  await page.getByText(/18 项测试通过/).waitFor();
  await assertNoHorizontalOverflow(page, "demo checks");

  await page.getByRole("button", { name: "工件与证据", exact: true }).click();
  await page.getByRole("heading", { name: "工件与证据", exact: true }).waitFor();
  await page.getByRole("button", { name: /SECURITY_REVIEW\.md/ }).click();
  await page.getByText(/trusted proxy/, { exact: false }).waitFor();
  await assertNoHorizontalOverflow(page, "demo evidence");

  await page.getByRole("button", { name: "发布", exact: true }).click();
  await page.getByText("已阻断", { exact: true }).waitFor();
  await page.getByText("发布前确认来源地址只读取受信任代理提供的请求头。", { exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, "demo release");
  await page.screenshot({ path: ".qa/product-demo-release.png", fullPage: true });
  await page.getByRole("button", { name: "查看安全阶段" }).click();
  await page.getByRole("heading", { name: "工程运行" }).waitFor();
  await page.locator(".stage-workbench-head .section-label").getByText("阶段 11", { exact: true }).waitFor();
  await context.close();
  return { name: "demo-lifecycle", passed: true, errors };
}

async function flowNewProject(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 960 }, locale: "zh-CN", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "创建项目" }).waitFor();
  await page.screenshot({ path: ".qa/first-run-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "创建项目" }).click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(260);
  await assertNoHorizontalOverflow(page, "project wizard first step");
  await page.screenshot({ path: ".qa/project-dialog.png", fullPage: true });

  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByText("请输入项目名称。", { exact: true }).waitFor();
  await page.getByText("请说明这个项目要解决的问题。", { exact: true }).waitFor();
  await page.getByText("至少选择或填写一项主要技术。", { exact: true }).waitFor();
  await page.waitForTimeout(60);
  if (await page.evaluate(() => document.activeElement?.id !== "project-name")) throw new Error("Project validation did not focus the first invalid field.");

  await page.getByLabel(/项目名称/).fill("客户服务门户");
  await page.getByLabel(/主要技术/).fill("TypeScript, React, PostgreSQL");
  await page.getByLabel(/这个项目解决什么问题/).fill("让客户在一个入口查询订单并提交售后申请。");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: /开发与测试逐级配对/ }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "隐私", exact: true }).click();
  await page.getByRole("button", { name: /基本个人资料/ }).click();
  await page.getByText("明确收集目的、保存期限、访问和删除路径", { exact: false }).waitFor();
  await page.screenshot({ path: ".qa/project-quality-step.png", fullPage: true });
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByText("QUALITY_ATTRIBUTE_SCENARIOS.md", { exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, "project wizard");
  await page.getByRole("button", { name: "创建工程工作区" }).click();

  await page.getByRole("heading", { name: "还没有需求" }).waitFor();
  await page.getByRole("button", { name: "新建需求", exact: true }).click();
  await page.getByLabel(/需求标题/).fill("导出客户订单");
  await page.getByLabel(/当前问题/).fill("客户无法把自己的订单记录交给财务核对。");
  await page.getByLabel(/本次目标/).fill("已登录客户可以下载只包含本人订单的文件。");
  await page.getByPlaceholder("客户支持人员").fill("已登录客户");
  await page.getByPlaceholder("统一查看客户订单").fill("导出自己的订单记录");
  await page.getByPlaceholder("更快解决问题").fill("可以完成财务核对");
  await page.getByRole("button", { name: "添加功能需求" }).click();
  await page.getByLabel("系统必须提供的行为 1").fill("已登录客户可以导出只属于自己的订单。");

  await page.getByRole("button", { name: /验收标准/ }).click();
  await addAcceptanceScenario(page, { context: "客户已登录且有订单", action: "客户选择导出订单", expected: "下载文件只包含该客户的订单" });
  await addAcceptanceScenario(page, { context: "客户没有任何订单", action: "客户选择导出订单", expected: "系统生成带表头的空文件并明确提示无记录" });
  await addAcceptanceScenario(page, { context: "导出服务暂时不可用", action: "客户请求导出", expected: "页面提示稍后重试且不会生成损坏文件" });
  await addAcceptanceScenario(page, { context: "客户尝试导出其他账户订单", action: "请求携带其他客户标识", expected: "系统拒绝请求并记录安全事件" });
  await addAcceptanceScenario(page, { context: "现有订单查询仍可使用", action: "上线导出功能后查询订单", expected: "查询结果和权限行为保持不变" });

  await page.getByRole("button", { name: /质量与边界/ }).click();
  await page.getByRole("button", { name: "确认这些要求" }).click();
  await page.getByRole("button", { name: "确认需求", exact: true }).click();
  await page.locator(".bottom-next").getByText("需求已确认", { exact: true }).waitFor();

  await page.getByRole("button", { name: "查看工程计划" }).click();
  await page.getByRole("button", { name: "生成计划草稿" }).click();
  await page.getByRole("heading", { name: "工程计划" }).waitFor();
  await page.getByRole("button", { name: "批准此计划" }).click();
  await page.getByRole("button", { name: "开始治理运行" }).click();
  await page.getByRole("heading", { name: "工程运行" }).waitFor();
  await page.getByText("14", { exact: true }).first().waitFor();
  await assertNoHorizontalOverflow(page, "new project run");
  await assertDesktopShellGeometry(page, "new project run");
  await page.screenshot({ path: ".qa/product-new-run.png", fullPage: true });

  await page.getByRole("button", { name: "概览", exact: true }).click();
  await page.getByRole("button", { name: "新建需求", exact: true }).click();
  await page.getByLabel(/需求标题/).fill("订单筛选");
  await page.getByLabel(/当前问题/).fill("需要按日期查找订单");
  await waitForSavedRequirement(page, "订单筛选");
  await page.getByRole("button", { name: "概览", exact: true }).click();
  await page.getByRole("button", { name: /订单筛选.*草稿/ }).waitFor();
  await page.getByText("尚未评估", { exact: true }).waitFor();
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /订单筛选.*草稿/ }).click();
  if (await page.getByLabel(/当前问题/).inputValue() !== "需要按日期查找订单") throw new Error("Unconfirmed draft was lost after navigation or reload.");
  await page.getByRole("button", { name: "计划", exact: true }).click();
  await page.getByRole("heading", { name: "先确认需求" }).waitFor();
  await page.getByRole("button", { name: "需求", exact: true }).click();
  await page.getByLabel("当前需求", { exact: true }).selectOption({ label: "导出客户订单" });
  await page.getByRole("button", { name: "计划", exact: true }).click();
  await page.getByRole("heading", { name: "工程计划" }).waitFor();
  await page.getByRole("button", { name: "概览", exact: true }).click();
  await page.screenshot({ path: ".qa/multiple-requirements.png", fullPage: true });

  await page.evaluate(() => {
    window.qaTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args) {
      if (args[1] === "readwrite") throw new DOMException("Storage full", "QuotaExceededError");
      return window.qaTransaction.apply(this, args);
    };
  });
  await page.getByRole("button", { name: "新建需求", exact: true }).click();
  await page.getByLabel(/需求标题/).fill("保存失败恢复测试");
  await page.getByRole("alert").getByText(/浏览器保存失败/).waitFor();
  await page.evaluate(() => { IDBDatabase.prototype.transaction = window.qaTransaction; delete window.qaTransaction; });
  await page.getByRole("button", { name: "重试保存" }).click();
  await waitForSavedRequirement(page, "保存失败恢复测试");
  await page.getByRole("button", { name: "重试保存" }).waitFor({ state: "hidden" });
  await context.close();
  return { name: "new-project-draft-context-and-save-recovery", passed: true, errors };
}

async function flowVisualVariants(browser) {
  const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, locale: "en-US", colorScheme: "dark", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await openDemo(page);
  await assertNoHorizontalOverflow(page, "tablet dark overview");
  await page.screenshot({ path: ".qa/project-tablet-dark.png", fullPage: true });
  await page.getByRole("button", { name: "切换语言" }).click();
  await page.getByRole("button", { name: "New requirement", exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, "tablet English overview");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await assertDesktopShellGeometry(page, "dark tablet-to-desktop navigation");
  await assertNoHorizontalOverflow(page, "dark desktop overview");
  await page.screenshot({ path: ".qa/project-desktop-dark.png", fullPage: true });
  await context.close();
  return { name: "tablet-dark-and-English", passed: true, errors };
}

async function flowFailure(browser) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, locale: "zh-CN", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await openDemo(page);
  await page.getByRole("button", { name: "运行历史", exact: true }).click();
  await page.getByRole("button", { name: /^Run #1/ }).click();
  await page.getByRole("heading", { name: "工程运行" }).waitFor();
  await page.getByText("成功登录后计数器未重置", { exact: true }).waitFor();
  await page.getByRole("button", { name: /测试/ }).click();
  await page.getByText("成功登录后失败计数器没有重置。", { exact: true }).waitFor();
  await context.close();
  return { name: "failure-evidence", passed: true, errors };
}

async function flowProviderAndRunner(browser) {
  const context = await browser.newContext({ viewport: { width: 1180, height: 900 }, locale: "zh-CN", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await openDemo(page);
  await page.locator("aside").getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("button", { name: "需求 AI", exact: true }).click();
  const keyInput = page.getByLabel("API Key");
  if ((await keyInput.getAttribute("type")) !== "password") throw new Error("API Key input is not masked.");
  await keyInput.fill("sk-browser-qa-secret-value");
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  if (storage.includes("sk-browser-qa-secret-value")) throw new Error("Provider secret entered localStorage.");
  await keyInput.fill("");

  await page.getByRole("button", { name: "本机 Codex", exact: true }).click();
  await page.getByRole("heading", { name: "连接本机 Codex CLI" }).waitFor();
  await page.getByRole("button", { name: "生成", exact: true }).click();
  const token = await page.getByLabel(/临时令牌/).inputValue();
  if (token.length < 16) throw new Error("Local runner token was not generated.");
  const persisted = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  if (persisted.includes(token)) throw new Error("Local runner token entered localStorage.");
  await assertNoHorizontalOverflow(page, "provider and runner settings");
  await context.close();
  return { name: "provider-and-runner-boundary", passed: true, errors };
}

async function flowMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "zh-CN", serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = collectBrowserErrors(page);
  await openDemo(page);
  await assertNoHorizontalOverflow(page, "mobile overview");
  await page.screenshot({ path: ".qa/product-mobile.png", fullPage: true });

  const menuButton = page.getByRole("button", { name: "打开导航" });
  await menuButton.click();
  if (await menuButton.getAttribute("aria-expanded") !== "true") throw new Error("Mobile menu does not expose its expanded state.");
  if (!await page.locator("main").evaluate((element) => (element).inert)) throw new Error("Background content remains interactive while mobile navigation is open.");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(60);
  if (!await menuButton.evaluate((element) => element === document.activeElement)) throw new Error("Mobile menu did not restore focus to its opener.");
  await menuButton.click();
  await page.locator("aside").getByRole("button", { name: "运行", exact: true }).click();
  await page.getByRole("heading", { name: "工程运行" }).waitFor();
  await assertNoHorizontalOverflow(page, "mobile run");

  await page.getByRole("button", { name: "打开导航" }).click();
  await page.locator("aside").getByRole("button", { name: "检查", exact: true }).click();
  await page.getByRole("heading", { name: "检查", exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, "mobile checks");

  await page.getByRole("button", { name: "打开导航" }).click();
  await page.locator("aside").getByRole("button", { name: "工件与证据", exact: true }).click();
  await page.getByRole("heading", { name: "工件与证据", exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, "mobile evidence");

  await page.getByRole("button", { name: "打开导航" }).click();
  await page.locator("aside").getByRole("button", { name: "发布", exact: true }).click();
  await page.getByRole("heading", { name: "发布准备度" }).waitFor();
  await page.waitForTimeout(260);
  await assertNoHorizontalOverflow(page, "mobile release");
  await page.screenshot({ path: ".qa/product-mobile-release.png", fullPage: true });
  await context.close();
  return { name: "mobile", passed: true, errors };
}

async function main() {
  await mkdir(".qa", { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: await findChrome(), args: ["--no-sandbox"] });
  const results = [];
  try {
    for (const flow of [flowDemo, flowNewProject, flowFailure, flowProviderAndRunner, flowMobile, flowVisualVariants]) {
      if (process.env.QA_FLOW && process.env.QA_FLOW !== flow.name) continue;
      try {
        results.push(await flow(browser));
      } catch (error) {
        const page = browser.contexts().at(-1)?.pages().at(-1);
        if (page) {
          await page.screenshot({ path: `.qa/failure-${flow.name}.png`, fullPage: true });
          await writeFile(`.qa/failure-${flow.name}.txt`, `${page.url()}\n${await page.locator("main").innerText()}`);
        }
        results.push({ name: flow.name, passed: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
  } finally {
    await browser.close();
  }
  await writeFile(".qa/product-results.json", `${JSON.stringify(results, null, 2)}\n`);
  const failed = results.some((result) => !result.passed || result.errors?.length);
  console.log(failed ? "FAIL" : "PASS", JSON.stringify(results));
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
