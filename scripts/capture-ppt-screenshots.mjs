import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.DEMO_URL ?? "http://127.0.0.1:5173/?v=3.1";
const outputDir = path.resolve(
  process.env.SCREENSHOT_DIR ?? "artifacts/ppt-screenshots-v1",
);
const edgePath =
  process.env.EDGE_PATH ??
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const company = "云帆协同科技有限公司（演示）";
const challenge =
  "从今年第二季度开始，销售、产品和实施团队在重点客户项目上频繁出现跨部门协同问题。需求变更后职责不清，方案和报价需要多轮审批并等待老板拍板，平均交付周期由45天延长到70天，返工增加，两个团队连续三个季度完不成目标。我们已经增加周会和项目群，但信息仍然重复传递，管理者经常亲自下场救火，问题没有明显改善。";

const files = [
  ["01-首页_从问卷到咨询入口.png", "讲清产品定位：不是直接给分的问卷，而是咨询入口。"],
  ["02-诊断方法_从现象到机制.png", "展示为什么先解释方法，再邀请企业进入诊断。"],
  ["03-隐私前置_阅读后才能填写.png", "展示隐私声明前置、滚动阅读和企业知情。"],
  ["04-企业自述_AI问题映射.png", "展示自由文本入口及 Agent 将模糊表述映射为候选信号。"],
  ["05-经营事件_企业确认组合.png", "展示 AI 建议与企业主动确认真实经营事件。"],
  ["06-核心题_合并而非简单相加.png", "展示由事件映射出的合并核验题。"],
  ["07-初诊结果_局部风险而非企业总分.png", "展示初诊边界：识别优先关注方向，不下整体结论。"],
  ["08-案例匹配_先建立能力信任.png", "展示相似案例、已授权状态和结果边界。"],
  ["09-咨询师路由_事业部与专家匹配.png", "展示由企业问题路由到业务与咨询师。"],
  ["10-企业授权_诊断与销售线索隔离.png", "展示企业主动决定是否提交，且咨询授权不等于案例授权。"],
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: edgePath });
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

const pause = (milliseconds = 500) => page.waitForTimeout(milliseconds);
const shot = async (filename, locator) => {
  if (locator) {
    await locator.scrollIntoViewIfNeeded();
    await pause(450);
  }
  await page.screenshot({ path: path.join(outputDir, filename), fullPage: false });
};

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await shot(files[0][0]);

  await page.getByRole("button", { name: /先了解诊断方法/ }).click();
  await page.locator("#method").scrollIntoViewIfNeeded();
  await pause(1200);
  await shot(files[1][0], page.locator("#method"));

  await page.getByRole("button", { name: /进入企业健康初诊/ }).click();
  await page.locator(".v31-privacy-gate").waitFor();
  await shot(files[2][0], page.locator(".v31-privacy-gate"));
  await page.locator(".v31-privacy-scroll").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await page.getByRole("button", { name: /我已阅读并知晓/ }).click();

  await page.locator(".v3-profile input").fill(company);
  await page.locator(".v3-profile select").nth(1).selectOption({ index: 3 });
  await page.locator(".v3-challenge textarea").fill(challenge);
  await pause(1200);
  await shot(files[3][0], page.locator(".v3-mapping-preview"));

  await page.getByRole("button", { name: /继续选择经营事件/ }).click();
  for (const eventName of [
    "跨部门事项反复卡住",
    "交付延期或返工频发",
    "团队连续完不成目标",
  ]) {
    await page.locator(".v3-event-list button", { hasText: eventName }).click();
  }
  await page
    .locator(".v3-entry-primary > div button", { hasText: "跨部门事项反复卡住" })
    .click();
  await shot(files[4][0], page.locator(".v3-entry-primary"));
  await page.getByRole("button", { name: /进入核心判断/ }).click();

  const questionLabels = page.locator(".v3-question-list label");
  const questionCount = await questionLabels.count();
  const answerById = new Map([
    [8, "部分开展但不稳定"],
    [9, "尚未建立或基本无效"],
    [10, "部分开展但不稳定"],
    [11, "基本建立并能够执行"],
    [14, "部分开展但不稳定"],
    [17, "部分开展但不稳定"],
    [30, "尚未建立或基本无效"],
    [31, "尚未建立或基本无效"],
    [32, "部分开展但不稳定"],
    [41, "部分开展但不稳定"],
  ]);
  for (let index = 0; index < questionCount; index += 1) {
    const label = questionLabels.nth(index);
    const idText = await label.locator(":scope > b").innerText();
    const id = Number(idText.replace(/\D/g, ""));
    const answer = answerById.get(id) ?? "部分开展但不稳定";
    await label.locator("select").selectOption({ label: answer });
  }
  await shot(files[5][0], page.locator(".v3-intake-title"));
  await page.getByRole("button", { name: /进入联合诊断工作台/ }).click();

  await page.locator(".v3-analysis-hero").waitFor();
  await shot(files[6][0], page.locator(".v3-analysis-hero"));
  await shot(files[7][0], page.locator(".v3-case-matches"));
  await shot(files[8][0], page.locator(".v3-consultant-matches"));

  const consent = page.locator(".v3-consulting-consent");
  await consent.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /我想申请咨询/ }).click();
  await page.getByLabel("联系人").fill("林经理（演示）");
  await page.getByLabel("联系方式").fill("demo@example.com");
  await page.locator(".v3-consent-check input").nth(0).check();
  await page.locator(".v3-consent-check input").nth(1).check();
  await page.getByRole("button", { name: /生成授权提交预览/ }).click();
  await shot(files[9][0], consent);

  const readme = [
    "# 企业健康初诊 V3.1 · PPT 关键截图",
    "",
    `自动化入口：${baseUrl}`,
    `演示企业：${company}`,
    "画面规格：1600 × 900（16:9）",
    "",
    ...files.flatMap(([name, use]) => [`## ${name}`, "", use, ""]),
  ].join("\n");
  await writeFile(path.join(outputDir, "README.md"), readme, "utf8");
  console.log(`Captured ${files.length} screenshots in ${outputDir}`);
} finally {
  await browser.close();
}
