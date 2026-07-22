import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { diagnosticModes, type DiagnosticEvent } from "./diagnosticModes";
import { analyzeDiagnosis } from "./diagnosisEngine";
import { getQuestion, maturityOptions } from "./questionBank";
import { useDeskMotion } from "./useDeskMotion";
import {
  createEmptyProblemMapping,
  mapCompanyProblem,
  type ProblemMapping,
} from "./problemMappingAgent";
import { routeConsultingServices } from "./serviceRoutingAgent";
import {
  analyzeCompanyProblemWithAI,
  isSemanticAiEnabled,
} from "./semanticAnalysisApi";
import {
  getContentEvidenceSchema,
  type ContentEvidenceSchema,
} from "./contentEvidence";

type Lens = "2.1" | "2.2";
type Profile = {
  company: string;
  industry: string;
  size: string;
  challenge: string;
  problemMapping: ProblemMapping;
  mappedQuestionIds: number[];
  lens: Lens;
  events: DiagnosticEvent[];
  primaryId: string;
};
type V3View = "overview" | "evidence" | "relations" | "routes";

function useScrollToPageTop(pageKey: string) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pageKey]);
}

const unique = <T,>(items: T[]) => Array.from(new Set(items));

function V3Top({
  step = "background",
}: {
  step?: "about" | "background" | "events" | "questions" | "analysis";
}) {
  const edition = new URLSearchParams(window.location.search).get("v");
  return (
    <header className="v3-top v3-product-top">
      <a
        className="v3-product-name"
        href="?v=3"
        aria-label="返回和君咨询企业健康初诊首页"
      >
        <span>和君咨询 · 企业健康初诊</span>
        <small>HEJUN CONSULTING{edition === "3.1" ? " · V3.1" : ""}</small>
      </a>
      {step === "about" ? (
        <div className="v3-product-meta">
          <span>企业问题初诊</span>
          <span>信息仅用于本次诊断</span>
        </div>
      ) : (
        <ol className="v3-product-progress" aria-label="诊断进度">
          <li className={step === "background" ? "active" : "done"}>
            企业背景
          </li>
          <li
            className={
              step === "events"
                ? "active"
                : step === "questions" || step === "analysis"
                  ? "done"
                  : ""
            }
          >
            经营事件
          </li>
          <li
            className={
              step === "questions"
                ? "active"
                : step === "analysis"
                  ? "done"
                  : ""
            }
          >
            核心判断
          </li>
          <li className={step === "analysis" ? "active" : ""}>初步结果</li>
        </ol>
      )}
    </header>
  );
}

export function V3Landing({
  onStart,
}: {
  onStart: (profile: Profile) => void;
}) {
  const [lens, setLens] = useState<Lens>("2.1");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("企业服务 / SaaS");
  const [size, setSize] = useState("51—100人");
  const [selected, setSelected] = useState<string[]>([]);
  const [primaryId, setPrimaryId] = useState("");
  const events = diagnosticModes[lens].events;
  const switchLens = (next: Lens) => {
    setLens(next);
    setSelected([]);
    setPrimaryId("");
  };
  const toggle = (id: string) =>
    setSelected((old) => {
      if (old.includes(id)) {
        const next = old.filter((x) => x !== id);
        if (primaryId === id) setPrimaryId(next[0] ?? "");
        return next;
      }
      if (old.length >= 3) return old;
      const next = [...old, id];
      if (!primaryId) setPrimaryId(id);
      return next;
    });
  const chosen = selected
    .map((id) => events.find((event) => event.id === id)!)
    .filter(Boolean);
  useDeskMotion(`v3-landing-${lens}-${selected.join("-")}`);
  return (
    <main className="v3-landing v3-site">
      <V3Top />
      <section className="v3-site-hero">
        <div className="v3-site-copy">
          <p>HEJUN CONSULTING · 企业健康初诊</p>
          <h1>
            用10分钟，看清企业
            <br />
            <span>现在最该解决的问题。</span>
          </h1>
          <p className="v3-site-lead">
            不是一份泛泛的测评分数。我们从正在发生的经营事件出发，识别可能的共同机制、业务影响与下一步解决方向。
          </p>
          <div className="v3-site-actions">
            <button
              onClick={() =>
                document
                  .querySelector("#diagnosis")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              开始免费初诊 <b>→</b>
            </button>
            <a href="#method">先了解诊断方法</a>
          </div>
          <div className="v3-site-proof">
            <span>
              <b>10–15分钟</b>完成首轮
            </span>
            <span>
              <b>无需下载</b>点击即用
            </span>
            <span>
              <b>先看结果</b>再决定是否联系
            </span>
          </div>
        </div>
        <aside className="v3-preview-card">
          <header>
            <span>诊断结果预览</span>
            <i>示例</i>
          </header>
          <div>
            <small>优先关注</small>
            <h2>跨部门决策与协同</h2>
            <p>
              当前信号更接近权责边界与共同目标问题，不建议简单归因于“员工执行力”。
            </p>
          </div>
          <section>
            <span>业务影响</span>
            <strong>项目交付周期</strong>
          </section>
          <section>
            <span>下一步</span>
            <strong>组织权责专项诊断</strong>
          </section>
          <footer>每条判断均显示依据与不确定性</footer>
        </aside>
      </section>
      <section className="v3-method" id="method">
        <div>
          <p>WHY THIS WORKS</p>
          <h2>
            先帮你把问题说清楚，
            <br />
            再讨论要不要做咨询。
          </h2>
        </div>
        <section>
          <article>
            <b>01</b>
            <h3>从经营事件开始</h3>
            <p>不要求你先懂管理术语，只选择正在真实发生的情况。</p>
          </article>
          <article>
            <b>02</b>
            <h3>寻找共同解释</h3>
            <p>避免把多个症状简单相加，优先识别可能的共因。</p>
          </article>
          <article>
            <b>03</b>
            <h3>给出解决方向</h3>
            <p>区分企业可自行行动、需要补证和适合专项咨询的部分。</p>
          </article>
        </section>
      </section>
      <section className="v3-case-strip" id="cases">
        <div>
          <p>RELEVANT CASES</p>
          <h2>结果之后，只展示与你的问题机制相关的案例。</h2>
        </div>
        <article>
          <span>成长型科技企业 · 已脱敏</span>
          <h3>审批越来越慢，真正的问题并不是“流程太多”</h3>
          <p>
            通过目标冲突、授权边界和三个真实项目穿行，定位到共同决策机制，并重构关键事项授权规则。
          </p>
          <footer>
            <b>决策周期缩短 41%</b>
            <small>案例结果不构成当前企业的效果承诺</small>
          </footer>
        </article>
      </section>
      <section className="v3-diagnostic-head" id="diagnosis">
        <div>
          <p>START YOUR DIAGNOSTIC</p>
          <h2>先告诉我们，你看见了哪些经营事件。</h2>
          <span>
            最多选择3项。首轮不要求上传材料，也不会因为你浏览过某项服务而改变诊断结果。
          </span>
        </div>
        <aside>
          <strong>01</strong>
          <span>企业背景</span>
          <i>→</i>
          <strong>02</strong>
          <span>经营事件</span>
          <i>→</i>
          <strong>03</strong>
          <span>核心问题</span>
        </aside>
      </section>
      <section className="v3-controls">
        <div className="v3-profile">
          <label>
            企业名称
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label>
            行业
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option>企业服务 / SaaS</option>
              <option>制造业</option>
              <option>消费品</option>
              <option>专业服务</option>
              <option>零售与电商</option>
            </select>
          </label>
          <label>
            规模
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option>20人以下</option>
              <option>21—50人</option>
              <option>51—100人</option>
              <option>101—300人</option>
              <option>300人以上</option>
            </select>
          </label>
        </div>
        <div className="v3-lens">
          <span>由谁来回答</span>
          <button
            className={lens === "2.1" ? "active" : ""}
            onClick={() => switchLens("2.1")}
          >
            <b>业务 / 职能负责人</b>
            <small>聚焦执行、团队和业务现场 · 12类事件</small>
          </button>
          <button
            className={lens === "2.2" ? "active" : ""}
            onClick={() => switchLens("2.2")}
          >
            <b>创始人 / 总经理</b>
            <small>聚焦经营、组织和战略 · 14类事件</small>
          </button>
        </div>
      </section>
      <section className="v3-picker">
        <header>
          <div>
            <p>OBSERVED EVENTS</p>
            <h2>哪些情况正在同时发生？</h2>
          </div>
          <span className={selected.length === 3 ? "full" : ""}>
            {selected.length} / 3
          </span>
        </header>
        <div className="v3-event-list">
          {events.map((event) => {
            const order = selected.indexOf(event.id);
            return (
              <button
                key={event.id}
                className={order >= 0 ? "active" : ""}
                aria-pressed={order >= 0}
                onClick={() => toggle(event.id)}
              >
                <i>{order >= 0 ? order + 1 : event.icon}</i>
                <span>
                  <strong>{event.name}</strong>
                  <small>{event.description}</small>
                </span>
                <em>{order >= 0 ? "已加入" : "加入组合"}</em>
              </button>
            );
          })}
        </div>
      </section>
      {chosen.length > 0 && (
        <section className="v3-event-belt">
          <div>
            <small>你的事件组合</small>
            <strong>指定一个最想优先解决的问题</strong>
          </div>
          <div className="v3-belt-items">
            {chosen.map((event) => (
              <button
                key={event.id}
                className={primaryId === event.id ? "primary" : ""}
                onClick={() => setPrimaryId(event.id)}
              >
                <i>{primaryId === event.id ? "主" : "并"}</i>
                <span>{event.name}</span>
                <small>{event.id}</small>
              </button>
            ))}
          </div>
          <button
            className="v3-continue"
            disabled={!company.trim() || !primaryId}
            onClick={() =>
              onStart({
                company,
                industry,
                size,
                challenge: "",
                problemMapping: createEmptyProblemMapping(),
                mappedQuestionIds: [],
                lens,
                events: chosen,
                primaryId,
              })
            }
          >
            合并核心题并开始诊断 →
          </button>
        </section>
      )}
      <footer className="v3-site-footer">
        <strong>和君咨询 · 企业健康初诊</strong>
        <span>你的诊断信息不会在未经同意时自动提交给销售人员。</span>
      </footer>
    </main>
  );
}

function V3Gateway({ onEnter }: { onEnter: () => void }) {
  const [page, setPage] = useState<"intro" | "learn">("intro");
  const [canEnter, setCanEnter] = useState(false);
  useScrollToPageTop(page);
  useDeskMotion(`v3-gateway-${page}`);
  useEffect(() => {
    if (page !== "learn") {
      setCanEnter(false);
      return;
    }
    setCanEnter(false);
    const timer = window.setTimeout(() => setCanEnter(true), 1000);
    return () => window.clearTimeout(timer);
  }, [page]);

  if (page === "intro")
    return (
      <main className="v3-landing v3-site v3-gateway">
        <V3Top step="about" />
        <section className="v3-site-hero v3-gateway-hero">
          <div className="v3-site-copy">
            <p>HEJUN CONSULTING · 企业健康初诊</p>
            <h1>
              先看懂企业问题，
              <br />
              <span>再决定如何解决。</span>
            </h1>
            <p className="v3-site-lead">
              这不是一个直接给分的调查问卷。开始前，先了解诊断如何从经营事件形成判断，以及结果能够回答什么、不能回答什么。
            </p>
            <div className="v3-site-actions">
              <button onClick={() => setPage("learn")}>
                先了解诊断方法 <b>→</b>
              </button>
            </div>
            <div className="v3-site-proof">
              <span>
                <b>不直接下结论</b>先解释判断方法
              </span>
              <span>
                <b>不预设服务</b>先识别问题方向
              </span>
              <span>
                <b>不自动留资</b>结果后自主决定
              </span>
            </div>
          </div>
          <aside className="v3-preview-card">
            <header>
              <span>你将了解</span>
              <i>01</i>
            </header>
            <div>
              <small>诊断逻辑</small>
              <h2>从经营现象到问题机制</h2>
              <p>
                为什么不把多个症状简单相加，以及系统如何区分初步信号、待验证假设和解决方向。
              </p>
            </div>
            <section>
              <span>下一页</span>
              <strong>诊断方法与案例</strong>
            </section>
            <footer>完成阅读后再进入正式诊断</footer>
          </aside>
        </section>
      </main>
    );

  return (
    <main className="v3-landing v3-site v3-gateway v3-gateway-learn">
      <V3Top step="about" />
      <button className="v3-entry-back" onClick={() => setPage("intro")}>
        ← 返回介绍
      </button>
      <section className="v3-method" id="method">
        <div>
          <p>02 · HOW IT WORKS</p>
          <h2>
            诊断不是把问卷分数
            <br />
            直接翻译成咨询服务。
          </h2>
        </div>
        <section>
          <article>
            <b>01</b>
            <h3>从经营事件开始</h3>
            <p>先选择正在真实发生的情况，不要求使用者先掌握管理学术语。</p>
          </article>
          <article>
            <b>02</b>
            <h3>形成机制假设</h3>
            <p>寻找多个事件之间可能的共同原因，并明确仍需补充什么证据。</p>
          </article>
          <article>
            <b>03</b>
            <h3>区分解决路径</h3>
            <p>区分企业可自行行动、需要继续核验和适合专项咨询的部分。</p>
          </article>
        </section>
      </section>
      <section className="v3-case-strip" id="cases">
        <div>
          <p>03 · EXAMPLE</p>
          <h2>
            案例用于帮助理解判断过程，
            <br />
            不是提前推销咨询项目。
          </h2>
        </div>
        <article>
          <span>成长型科技企业 · 脱敏示例</span>
          <h3>审批越来越慢，真正的问题并不一定是“流程太多”</h3>
          <p>
            系统先将审批延迟与跨部门等待识别为并发事件，再通过目标冲突、授权边界和真实项目证据，判断它们是否共享同一个决策机制。
          </p>
          <footer>
            <b>现象 → 假设 → 补证 → 方向</b>
            <small>案例结果不构成当前企业的效果承诺</small>
          </footer>
        </article>
      </section>
      {canEnter && (
        <section className="v3-gateway-enter" role="status" aria-live="polite">
          <div>
            <p>READY TO START</p>
            <h2>可以进入企业健康初诊了</h2>
          </div>
          <button onClick={onEnter}>
            进入企业健康初诊 <b>→</b>
          </button>
        </section>
      )}
      <footer className="v3-site-footer">
        <strong>和君咨询 · 企业健康初诊</strong>
        <span>未经确认，诊断信息不会自动提交给咨询顾问或销售人员。</span>
      </footer>
    </main>
  );
}

function V31PrivacyGate({ onAccept }: { onAccept: () => void }) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    const content = scrollRef.current;
    if (content && content.scrollHeight <= content.clientHeight + 4) {
      setReachedEnd(true);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const updateProgress = () => {
    const content = scrollRef.current;
    if (!content) return;
    const remaining =
      content.scrollHeight - content.scrollTop - content.clientHeight;
    if (remaining <= 8) setReachedEnd(true);
  };

  const keepFocusInside = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeIndex = focusable.indexOf(
      document.activeElement as HTMLElement,
    );
    if (event.shiftKey && activeIndex <= 0) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeIndex === focusable.length - 1) {
      event.preventDefault();
      first.focus();
    } else if (!event.shiftKey && activeIndex === -1) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="v31-privacy-overlay" role="presentation">
      <section
        ref={dialogRef}
        className="v31-privacy-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="v31-privacy-title"
        aria-describedby="v31-privacy-summary"
        onKeyDown={keepFocusInside}
      >
        <header>
          <span>PRIVACY NOTICE · V3.1</span>
          <strong>进入填写前请完整阅读</strong>
        </header>
        <div
          ref={scrollRef}
          className="v31-privacy-scroll"
          onScroll={updateProgress}
          tabIndex={0}
        >
          <div className="v31-privacy-title">
            <i aria-hidden="true">私</i>
            <div>
              <p>企业诊断数据知情说明</p>
              <h2 id="v31-privacy-title" ref={titleRef} tabIndex={-1}>
                你的诊断内容默认不会交给和君
              </h2>
              <span id="v31-privacy-summary">
                请确认数据如何处理、什么情况下可以提交，以及案例授权与咨询授权的区别。
              </span>
            </div>
          </div>

          <article>
            <b>01</b>
            <div>
              <h3>{isSemanticAiEnabled ? "基础信息留在浏览器，问题文本按授权解析" : "当前版本只在浏览器内处理"}</h3>
              <p>
                {isSemanticAiEnabled
                  ? "企业名称、事件选择和问卷回答保存在当前页面；问题文本会发送到硅基流动模型服务完成本次语义解析。"
                  : "企业名称、问题描述、事件选择和问卷回答只保存在当前页面的运行内存中。刷新或关闭页面后，本次内容会被清除。"}
              </p>
            </div>
          </article>
          <article>
            <b>02</b>
            <div>
              <h3>不会自动形成销售线索</h3>
              <p>
                完成评测不等于向和君申请咨询。未经企业主动授权，咨询师、销售人员和后台运营人员无法查看本次诊断内容。
              </p>
            </div>
          </article>
          <article>
            <b>03</b>
            <div>
              <h3>不自动用于模型训练或案例库建设</h3>
              <p>
                {isSemanticAiEnabled
                  ? "问题文本仅为完成本次语义解析而发送至硅基流动；本产品不会把填写内容自动加入训练集、研究数据或案例库。请勿填写客户名单、合同原文等不必要敏感信息。"
                  : "当前问题解析使用本地规则，不会把企业原始描述发送给外部模型，也不会将填写内容自动用于训练、研究或案例库建设。"}
              </p>
            </div>
          </article>
          <article>
            <b>04</b>
            <div>
              <h3>只有企业主动申请咨询时才选择提交</h3>
              <p>
                结果页会单独展示授权入口。企业可以先查看即将提交的字段，再决定是否把背景、问题描述和初诊结果交给和君。
              </p>
            </div>
          </article>
          <article>
            <b>05</b>
            <div>
              <h3>咨询授权不等于案例展示授权</h3>
              <p>
                如果未来形成咨询项目，是否收入案例库、是否脱敏、允许展示哪些指标和评价，必须在项目结束后另行取得企业授权。
              </p>
            </div>
          </article>
          <article>
            <b>06</b>
            <div>
              <h3>加密云端保险箱尚未接入</h3>
              <p>
                本原型目前没有云端封存和跨设备恢复能力。后续上线企业自持密钥保险箱时，将重新说明加密、保存期限、恢复和授权访问方式。
              </p>
            </div>
          </article>

          <aside>
            <strong>你可以选择不继续</strong>
            <span>
              不接受本说明不会产生任何诊断记录或销售线索，直接关闭本页面即可退出。
            </span>
          </aside>
        </div>
        <footer>
          <span className={reachedEnd ? "done" : ""}>
            {reachedEnd ? "已阅读至声明末尾" : "请向下滚动，完整阅读后才能继续"}
          </span>
          <button disabled={!reachedEnd} onClick={onAccept}>
            {reachedEnd ? "我已阅读并知晓，进入填写 →" : "阅读完成后可确认"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function V3Entry({
  onStart,
  edition,
}: {
  onStart: (profile: Profile) => void;
  edition: "3" | "3.1";
}) {
  const [step, setStep] = useState<"background" | "events">("background");
  const [privacyAccepted, setPrivacyAccepted] = useState(edition === "3");
  const [lens, setLens] = useState<Lens>("2.1");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("企业服务 / SaaS");
  const [size, setSize] = useState("51—100人");
  const [challenge, setChallenge] = useState("");
  const localProblemMapping = useMemo(
    () => mapCompanyProblem(challenge, lens),
    [challenge, lens],
  );
  const [aiProblemMapping, setAiProblemMapping] = useState<ProblemMapping | null>(null);
  const [aiMappingStatus, setAiMappingStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const problemMapping = aiProblemMapping ?? localProblemMapping;
  const [acceptedMappedIds, setAcceptedMappedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [primaryId, setPrimaryId] = useState("");
  const events = diagnosticModes[lens].events;
  const chosen = selected
    .map((id) => events.find((event) => event.id === id)!)
    .filter(Boolean);
  useScrollToPageTop(step);
  useDeskMotion(`v3-entry-${step}-${lens}-${selected.join("-")}`);

  useEffect(() => {
    setAiProblemMapping(null);
    if (!isSemanticAiEnabled || challenge.trim().length < 12) {
      setAiMappingStatus("idle");
      return;
    }
    const controller = new AbortController();
    setAiMappingStatus("loading");
    const timer = window.setTimeout(async () => {
      try {
        const result = await analyzeCompanyProblemWithAI({
          text: challenge,
          lens,
          industry,
          size,
          signal: controller.signal,
        });
        if (result) {
          setAiProblemMapping(result);
          setAiMappingStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setAiMappingStatus("fallback");
      }
    }, 700);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [challenge, lens, industry, size]);

  useEffect(() => {
    setAcceptedMappedIds(
      problemMapping.questions.map((item) => item.questionId),
    );
  }, [problemMapping]);

  const changeLens = (next: Lens) => {
    setLens(next);
    setSelected([]);
    setPrimaryId("");
  };
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      const next = selected.filter((item) => item !== id);
      setSelected(next);
      if (primaryId === id) setPrimaryId(next[0] ?? "");
      return;
    }
    if (selected.length === 3) return;
    setSelected([...selected, id]);
    if (!primaryId) setPrimaryId(id);
  };

  return (
    <main className="v3-landing v3-site v3-entry">
      <V3Top step={step} />
      <section className="v3-diagnostic-head v3-entry-head">
        <div>
          <p>
            {step === "background"
              ? "STEP 01 · COMPANY CONTEXT"
              : "STEP 02 · OBSERVED EVENTS"}
          </p>
          <h1>
            {step === "background"
              ? "先建立基本的企业背景"
              : "哪些经营情况正在同时发生？"}
          </h1>
          <span>
            {step === "background"
              ? "这些信息只用于确定合适的判断范围，不会直接生成企业结论。"
              : "最多选择3项，再指定一个当前最希望优先解决的问题。"}
          </span>
        </div>
        <aside>
          <strong>{step === "background" ? "01" : "02"}</strong>
          <span>{step === "background" ? "约1分钟" : "约2分钟"}</span>
        </aside>
      </section>
      {step === "background" ? (
        <>
          {edition === "3.1" && !privacyAccepted && (
            <V31PrivacyGate onAccept={() => setPrivacyAccepted(true)} />
          )}
          {edition === "3.1" && privacyAccepted ? (
            <section className="v31-privacy-confirmed" role="status">
              <span>隐私说明已阅读</span>
              <strong>当前诊断仍仅在浏览器内处理，和君不可见</strong>
              <button onClick={() => setPrivacyAccepted(false)}>
                重新查看说明
              </button>
            </section>
          ) : edition === "3" ? (
            <section className="v3-privacy-notice" role="note">
              <header>
                <span aria-hidden="true">私</span>
                <div>
                  <p>PRIVACY BY DEFAULT</p>
                  <h2>填写内容默认不离开当前浏览器</h2>
                </div>
                <strong>当前状态：和君不可见</strong>
              </header>
              <div>
                <span>不自动提交给咨询师、销售或后台人员</span>
                <span>不用于任何模型训练或案例库建设</span>
                <span>当前原型仅保存在运行内存，刷新或关闭后清除</span>
              </div>
              <footer>
                只有你在结果页主动选择“申请咨询”并确认提交范围后，指定信息才可以交给和君。加密云端临时保险箱尚未接入本原型。
              </footer>
            </section>
          ) : null}
          <section className="v3-controls v3-entry-controls">
            <div className="v3-profile">
              <label>
                企业名称
                <input
                  value={company}
                  placeholder="请输入企业名称"
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>
              <label>
                行业
                <select
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                >
                  <option>企业服务 / SaaS</option>
                  <option>制造业</option>
                  <option>消费品</option>
                  <option>专业服务</option>
                  <option>零售与电商</option>
                </select>
              </label>
              <label>
                规模
                <select
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                >
                  <option>20人以下</option>
                  <option>21—50人</option>
                  <option>51—100人</option>
                  <option>101—300人</option>
                  <option>300人以上</option>
                </select>
              </label>
            </div>
            <label className="v3-challenge">
              <span className="v3-challenge-label">
                <b>企业当前遇到的难点和问题</b>
                <small>{isSemanticAiEnabled ? "硅基流动 AI 解析 · 可选" : "本地规则解析 · 可选"}</small>
              </span>
              <textarea
                value={challenge}
                maxLength={800}
                placeholder="请用自己的话描述正在发生的问题，例如：哪些现象持续出现、影响了什么结果、已经尝试过什么。"
                onChange={(event) => setChallenge(event.target.value)}
              />
              <span className="v3-challenge-meta">
                <small>
                  {isSemanticAiEnabled
                    ? aiMappingStatus === "loading"
                      ? "资深咨询师 Agent 正在分析；处理失败时自动回退本地规则。"
                      : aiMappingStatus === "ready"
                        ? "已由资深咨询师 Agent 生成候选信号、事件与核验题。"
                        : aiMappingStatus === "fallback"
                          ? "模型暂不可用，当前结果来自本地规则。"
                          : "问题文本将在你接受隐私说明后发送至硅基流动完成本次解析。"
                    : "当前使用本地规则推荐经营事件、候选核验题和补充问题。"}
                </small>
                <em>{challenge.length} / 800</em>
              </span>
            </label>
            {challenge.trim() && (
              <section
                className={`v3-mapping-preview ${problemMapping.status}`}
                aria-live="polite"
              >
                <header>
                  <div>
                    <p>PROBLEM MAPPING AGENT</p>
                    <h2>
                      {problemMapping.status === "mapped"
                        ? `识别到 ${problemMapping.signals.length} 类待核验信号`
                        : "还需要更具体的问题描述"}
                    </h2>
                  </div>
                  <span>
                    {problemMapping.status === "mapped"
                      ? `${problemMapping.questions.length} 道候选题`
                      : "不强行映射"}
                  </span>
                </header>
                {problemMapping.status === "mapped" ? (
                  <div className="v3-mapping-signals">
                    {problemMapping.signals.map((signal) => (
                      <article key={signal.id}>
                        <strong>{signal.label}</strong>
                        <small>命中：{signal.matchedTerms.join(" / ")}</small>
                        <span>{signal.interpretation}</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <ul>
                    {problemMapping.followUps.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                )}
                <footer>{problemMapping.caveat}</footer>
              </section>
            )}
            <div className="v3-lens">
              <span>本次由谁回答</span>
              <button
                className={lens === "2.1" ? "active" : ""}
                onClick={() => changeLens("2.1")}
              >
                <b>业务 / 职能负责人</b>
                <small>聚焦执行、团队和业务现场</small>
              </button>
              <button
                className={lens === "2.2" ? "active" : ""}
                onClick={() => changeLens("2.2")}
              >
                <b>创始人 / 总经理</b>
                <small>聚焦经营、组织和战略</small>
              </button>
            </div>
          </section>
          <section className="v3-entry-action">
            <div>
              <strong>下一步不会立即生成诊断</strong>
              <span>还需要选择真实发生的经营事件并完成核心判断。</span>
            </div>
            <button
              disabled={!company.trim()}
              onClick={() => setStep("events")}
            >
              继续选择经营事件 →
            </button>
          </section>
        </>
      ) : (
        <>
          <button
            className="v3-entry-back"
            onClick={() => setStep("background")}
          >
            ← 返回修改企业背景
          </button>
          <section className="v3-picker">
            <header>
              <div>
                <p>OBSERVED EVENTS</p>
                <h2>选择正在真实发生的情况</h2>
              </div>
              <span className={selected.length === 3 ? "full" : ""}>
                {selected.length} / 3
              </span>
            </header>
            {problemMapping.status === "mapped" && (
              <section className="v3-agent-routing">
                <header>
                  <div>
                    <p>AGENT SUGGESTIONS</p>
                    <h3>根据企业自述，优先确认这些经营事件</h3>
                  </div>
                  <span>建议不是诊断，可自行选择</span>
                </header>
                <div>
                  {problemMapping.events.map((mapping) => {
                    const event = events.find(
                      (item) => item.id === mapping.eventId,
                    );
                    if (!event) return null;
                    const active = selected.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        className={active ? "active" : ""}
                        onClick={() => toggle(event.id)}
                        disabled={!active && selected.length === 3}
                      >
                        <span>
                          <b>{event.name}</b>
                          <small>{mapping.reason}</small>
                        </span>
                        <em>
                          {active ? "已选择" : `${mapping.confidence}匹配`}
                        </em>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            <div className="v3-event-list">
              {events.map((event) => {
                const order = selected.indexOf(event.id);
                return (
                  <button
                    key={event.id}
                    className={order >= 0 ? "active" : ""}
                    aria-pressed={order >= 0}
                    onClick={() => toggle(event.id)}
                  >
                    <i>{order >= 0 ? order + 1 : event.icon}</i>
                    <span>
                      <strong>{event.name}</strong>
                      <small>{event.description}</small>
                    </span>
                    <em>{order >= 0 ? "已加入" : "加入组合"}</em>
                  </button>
                );
              })}
            </div>
          </section>
          {chosen.length > 0 && (
            <section className="v3-entry-primary">
              <header>
                <div>
                  <p>PRIMARY CONCERN</p>
                  <h2>其中最希望优先解决的是哪一项？</h2>
                </div>
              </header>
              <div>
                {chosen.map((event) => (
                  <button
                    key={event.id}
                    className={primaryId === event.id ? "active" : ""}
                    onClick={() => setPrimaryId(event.id)}
                  >
                    <i>{primaryId === event.id ? "主" : "并"}</i>
                    <span>
                      <strong>{event.name}</strong>
                      <small>
                        {primaryId === event.id
                          ? "当前优先问题"
                          : "同时发生的问题"}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
              {problemMapping.questions.length > 0 && (
                <section className="v3-agent-questions">
                  <header>
                    <div>
                      <p>QUESTION MAPPING</p>
                      <h3>企业自述将补充以下核验题</h3>
                    </div>
                    <span>点击可移除或恢复</span>
                  </header>
                  <div>
                    {problemMapping.questions.map((mapping) => {
                      const question = getQuestion(mapping.questionId);
                      const active = acceptedMappedIds.includes(
                        mapping.questionId,
                      );
                      return (
                        <button
                          key={mapping.questionId}
                          className={active ? "active" : ""}
                          aria-pressed={active}
                          onClick={() =>
                            setAcceptedMappedIds((current) =>
                              active
                                ? current.filter(
                                    (id) => id !== mapping.questionId,
                                  )
                                : [...current, mapping.questionId],
                            )
                          }
                        >
                          <b>Q{mapping.questionId}</b>
                          <span>
                            <strong>{question.title}</strong>
                            <small>{mapping.reason}</small>
                          </span>
                          <em>{active ? "将加入" : "已移除"}</em>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              <footer>
                <span>下一步将合并重复题项，不会把多个问题简单相加。</span>
                <button
                  disabled={!primaryId}
                  onClick={() =>
                    onStart({
                      company,
                      industry,
                      size,
                      challenge,
                      problemMapping,
                      mappedQuestionIds: acceptedMappedIds,
                      lens,
                      events: chosen,
                      primaryId,
                    })
                  }
                >
                  进入核心判断 →
                </button>
              </footer>
            </section>
          )}
        </>
      )}
      <footer className="v3-site-footer">
        <strong>和君咨询 · 企业健康初诊</strong>
        <span>未经你确认，诊断信息不会自动提交给咨询顾问或销售人员。</span>
      </footer>
    </main>
  );
}

function V3Intake({
  profile,
  onBack,
  onComplete,
}: {
  profile: Profile;
  onBack: () => void;
  onComplete: (answers: Record<number, string>) => void;
}) {
  const counts = useMemo(() => {
    const map = new Map<number, number>();
    profile.events.forEach((event) =>
      event.core.forEach((id) => map.set(id, (map.get(id) ?? 0) + 1)),
    );
    return map;
  }, [profile]);
  const mappedQuestionIds = profile.mappedQuestionIds;
  const ids = useMemo(
    () =>
      Array.from(new Set([...counts.keys(), ...mappedQuestionIds])).sort(
        (a, b) =>
          (counts.get(b) ?? 0) - (counts.get(a) ?? 0) ||
          mappedQuestionIds.indexOf(a) - mappedQuestionIds.indexOf(b),
      ),
    [counts, mappedQuestionIds],
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const complete = ids.filter((id) => answers[id]).length;
  useDeskMotion(`v3-intake-${complete}`);
  return (
    <main className="v3-intake">
      <V3Top step="questions" />
      <button className="v3-back" onClick={onBack}>
        ← 返回调整事件组合
      </button>
      <section className="v3-intake-title">
        <p>MERGED CORE EVIDENCE</p>
        <h1>
          {profile.events.length}个经营事件，合并为{ids.length}道核心题
        </h1>
        <span>重复题项只回答一次；同时支持多个事件的交叉题优先显示。</span>
        <div>
          <i style={{ width: `${(complete / ids.length) * 100}%` }} />
        </div>
      </section>
      <section className="v3-question-list">
        {ids.map((id) => {
          const q = getQuestion(id);
          const support = counts.get(id) ?? 1;
          const names = profile.events
            .filter((event) => event.core.includes(id))
            .map((event) => event.name);
          const fromStatement = mappedQuestionIds.includes(id);
          return (
            <label key={id} className={support > 1 ? "cross" : ""}>
              <b>Q{id}</b>
              <span>
                <strong>{q.title}</strong>
                <small>{q.prompt}</small>
                <em>
                  {support > 1
                    ? `交叉题 · 同时支持 ${support} 个事件`
                    : fromStatement
                      ? "企业自述映射题"
                      : "单事件核心题"}{" "}
                  · {names.join(" / ") || "问题映射 Agent"}
                </em>
              </span>
              <select
                value={answers[id] ?? ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [id]: e.target.value })
                }
              >
                <option value="">请选择</option>
                {maturityOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          );
        })}
      </section>
      <footer className="v3-intake-action">
        <div>
          <strong>第一轮仍不计算置信度</strong>
          <span>完成后显示多个初步方向以及事件之间待确认的关系。</span>
        </div>
        <button
          disabled={complete < ids.length}
          onClick={() => onComplete(answers)}
        >
          {complete < ids.length
            ? `还需回答 ${ids.length - complete} 项`
            : "进入联合诊断工作台 →"}
        </button>
      </footer>
    </main>
  );
}

function V3Analysis({
  profile,
  answers,
  onBack,
  onContinue,
}: {
  profile: Profile;
  answers: Record<number, string>;
  onBack: () => void;
  onContinue: () => void;
}) {
  const analysis = useMemo(
    () => analyzeDiagnosis(answers, profile.events),
    [answers, profile.events],
  );
  const serviceRouting = useMemo(
    () =>
      routeConsultingServices({
        industry: profile.industry,
        events: profile.events,
        mapping: profile.problemMapping,
        primaryId: profile.primaryId,
      }),
    [
      profile.events,
      profile.industry,
      profile.primaryId,
      profile.problemMapping,
    ],
  );
  const [showConsent, setShowConsent] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [shareDiagnosis, setShareDiagnosis] = useState(false);
  const [separateCaseConsent, setSeparateCaseConsent] = useState(false);
  const [consentPreviewed, setConsentPreviewed] = useState(false);
  const leadModule = analysis.modules[0];
  useDeskMotion(`v3-analysis-${analysis.answeredCount}-${analysis.quality}`);

  return (
    <main className="v3-analysis v3-landing">
      <V3Top step="analysis" />
      <button className="v3-entry-back" onClick={onBack}>
        ← 返回修改核心判断
      </button>
      <section className="v3-analysis-hero">
        <div>
          <p>INITIAL DIAGNOSTIC ANALYSIS</p>
          <h1>
            本次初诊首先需要关注
            <span>{leadModule?.name ?? "信息覆盖不足"}</span>
          </h1>
          <p>
            {leadModule?.score === null || !leadModule
              ? "当前有效回答不足，暂时不能形成模块判断。"
              : `该模块在本次已回答题目中的成熟度为 ${leadModule.score}%。这是一项局部风险信号，不代表企业整体健康度。`}
          </p>
        </div>
        <aside>
          <small>当前信息状态</small>
          <strong>{analysis.quality}</strong>
          <span>
            {analysis.answeredCount}项回答 · {analysis.unknownCount}项暂不清楚
          </span>
        </aside>
      </section>

      {profile.challenge.trim() && (
        <section className="v3-analysis-challenge">
          <div>
            <p>COMPANY STATEMENT</p>
            <h2>企业对当前问题的原始描述</h2>
            <span>已由本地映射 Agent 提取候选信号；尚未接入外部模型。</span>
          </div>
          <blockquote>{profile.challenge}</blockquote>
        </section>
      )}

      <section className="v3-analysis-scope">
        <div>
          <p>ANALYSIS SCOPE</p>
          <h2>只分析本次实际覆盖的模块</h2>
          <span>未出现的模块没有被测量，不参与得分，也不会被解释为健康。</span>
        </div>
        <strong>
          {analysis.modules.length}
          <small>个覆盖模块</small>
        </strong>
      </section>

      <section className="v3-analysis-modules">
        {analysis.modules.map((module) => (
          <article key={module.module} className={module.level}>
            <header>
              <span>M{String(module.module).padStart(2, "0")}</span>
              <em>
                {module.level === "risk"
                  ? "风险信号"
                  : module.level === "watch"
                    ? "需要关注"
                    : module.level === "stable"
                      ? "相对稳定"
                      : "信息不足"}
              </em>
            </header>
            <h3>{module.name}</h3>
            <div>
              <i style={{ width: `${module.score ?? 0}%` }} />
            </div>
            <footer>
              <strong>
                {module.score === null ? "—" : `${module.score}%`}
              </strong>
              <span>
                本次回答 {module.answered} 题 / 模块题库 {module.available} 题
              </span>
            </footer>
          </article>
        ))}
      </section>

      <section className="v3-analysis-detail">
        <article>
          <header>
            <p>RISK SIGNALS</p>
            <h2>哪些回答拉低了本次判断</h2>
          </header>
          {analysis.topSignals.length ? (
            <div>
              {analysis.topSignals.map((signal, index) => (
                <section key={`${signal.title}-${index}`}>
                  <b>0{index + 1}</b>
                  <span>
                    <strong>{signal.title}</strong>
                    <small>{signal.module}</small>
                  </span>
                  <em>{signal.score === 0 ? "尚未建立" : "开展不稳定"}</em>
                </section>
              ))}
            </div>
          ) : (
            <p className="v3-analysis-empty">
              本次回答没有形成明显低成熟度信号；仍不能据此证明其他模块健康。
            </p>
          )}
        </article>
        <aside>
          <header>
            <p>CONSISTENCY CHECK</p>
            <h2>信息是否相互支持</h2>
          </header>
          {analysis.contradictions.length ? (
            analysis.contradictions.map((item) => (
              <section key={item.event}>
                <strong>{item.event}</strong>
                <span>{item.message}</span>
              </section>
            ))
          ) : (
            <section className="consistent">
              <strong>暂未发现明显矛盾</strong>
              <span>
                经营事件与核心题方向基本一致，下一步仍需用真实案例或材料核验。
              </span>
            </section>
          )}
        </aside>
      </section>

      <section className="v3-analysis-directions">
        <header>
          <p>MECHANISM HYPOTHESES</p>
          <h2>当前只能形成候选机制，不能直接宣布根因</h2>
        </header>
        <div>
          {analysis.directions.map((direction, index) => (
            <article key={direction.name}>
              <b>0{index + 1}</b>
              <strong>{direction.name}</strong>
              <span>
                {direction.supportingSignals
                  ? `${direction.supportingSignals}项低成熟度回答提供支持`
                  : "当前缺少低成熟度回答支持，需要继续核验"}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="v3-service-routing">
        <header>
          <div>
            <p>CONSULTING SERVICE ROUTER</p>
            <h2>从企业问题，路由到和君业务与咨询师</h2>
          </div>
          <span>原型演示 · 推荐结果需人工确认</span>
        </header>

        <div className="v3-routing-chain" aria-label="咨询服务推荐路径">
          <span>
            <small>企业问题</small>
            <strong>
              {profile.events.find((event) => event.id === profile.primaryId)
                ?.name ?? profile.events[0]?.name ?? "待界定"}
            </strong>
          </span>
          <i>→</i>
          <span>
            <small>建议承接业务</small>
            <strong>
              {serviceRouting.routes[0]
                ? `${serviceRouting.routes[0].unit.wing} · ${serviceRouting.routes[0].matchedServices[0]}`
                : "综合诊断"}
            </strong>
          </span>
          <i>→</i>
          <span>
            <small>优先顾问</small>
            <strong>
              {serviceRouting.consultants[0]?.consultant.name ?? "待人工指派"}
            </strong>
          </span>
        </div>

        <section className="v3-service-units">
          <header>
            <h3>建议承接业务单元</h3>
            <span>依据《和君集团简介V2026》中的公开业务范围映射</span>
          </header>
          <div>
            {serviceRouting.routes.map((route, index) => (
              <article key={route.unit.id}>
                <header>
                  <b>0{index + 1}</b>
                  <span>{route.unit.wing}</span>
                </header>
                <h4>{route.unit.name}</h4>
                <ul>
                  {route.matchedServices.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
                <footer>
                  {route.reasons.map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="v3-case-matches">
          <header>
            <div>
              <p>SIMILAR CASE EVIDENCE</p>
              <h3>相似案例与已交付结果</h3>
            </div>
            <span>先展示能力证明，再推荐负责顾问</span>
          </header>
          <div>
            {serviceRouting.cases.map((match, index) => (
              <article key={match.caseProfile.id}>
                <header>
                  <div>
                    <small>模拟案例 CASE 0{index + 1}</small>
                    <h4>{match.caseProfile.title}</h4>
                    <span>
                      {match.caseProfile.industry} · {match.caseProfile.scale}
                    </span>
                  </div>
                  <strong>
                    <b>{match.similarity}%</b>
                    <small>问题相似度</small>
                  </strong>
                </header>
                <div className="v3-case-auth">
                  <b>授权状态</b>
                  <span>模拟已授权展示 · 非真实客户案例</span>
                </div>
                <section className="v3-case-comparison">
                  <div>
                    <small>相似依据</small>
                    <p>{match.reasons.join(" · ")}</p>
                  </div>
                  <div>
                    <small>采用方案</small>
                    <p>{match.caseProfile.solution}</p>
                  </div>
                </section>
                <section className="v3-case-outcomes">
                  {match.caseProfile.outcomes.map((outcome) => (
                    <div key={outcome.label}>
                      <small>{outcome.label}</small>
                      <strong>{outcome.value}</strong>
                    </div>
                  ))}
                </section>
                <blockquote>“{match.caseProfile.testimonial}”</blockquote>
                <footer>
                  演示数据，不代表和君真实项目或客户评价；正式上线需由案例库提供可核验口径。
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="v3-consultant-matches">
          <header>
            <div>
              <p>FICTIONAL CONSULTANT PROFILES</p>
              <h3>咨询师匹配推荐</h3>
            </div>
            <span>以下姓名、履历和档期均为虚拟演示数据</span>
          </header>
          <div>
            {serviceRouting.consultants.map((match, index) => (
              <article key={match.consultant.id}>
                <header>
                  <span className="v3-consultant-avatar" aria-hidden="true">
                    {match.consultant.name.slice(-2)}
                  </span>
                  <div>
                    <small>推荐 0{index + 1} · 虚拟资料</small>
                    <h4>{match.consultant.name}</h4>
                    <span>{match.consultant.title}</span>
                  </div>
                  <b>匹配分 {match.score}</b>
                </header>
                <dl>
                  <div>
                    <dt>常驻地</dt>
                    <dd>{match.consultant.base}</dd>
                  </div>
                  <div>
                    <dt>经验</dt>
                    <dd>{match.consultant.years}年</dd>
                  </div>
                  <div>
                    <dt>承接单元</dt>
                    <dd>{match.routeUnit}</dd>
                  </div>
                </dl>
                <section>
                  <small>擅长议题</small>
                  <div>
                    {match.consultant.specialties.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <small>建议工作方法</small>
                  <p>{match.consultant.methods.join(" · ")}</p>
                </section>
                <footer>
                  <div>
                    {match.reasons.map((reason) => (
                      <span key={reason}>{reason}</span>
                    ))}
                  </div>
                  <strong>{match.consultant.availability}</strong>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="v3-consulting-consent">
          <header>
            <div>
              <p>ENTERPRISE CONTROLLED DISCLOSURE</p>
              <h3>是否把本次初诊交给和君？</h3>
              <span>
                默认不提交。只有企业主动授权后，和君才能看到你选择提交的内容并联系你。
              </span>
            </div>
            <strong>
              {showConsent ? "正在确认授权范围" : "和君当前不可见"}
            </strong>
          </header>
          {!showConsent ? (
            <div className="v3-consent-closed">
              <p>
                你可以继续在本机查看结果，也可以在准备好后发起咨询申请。本次评测不会因为完成诊断而自动建立销售线索。
              </p>
              <button onClick={() => setShowConsent(true)}>
                我想申请咨询，查看提交范围 →
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setConsentPreviewed(true);
              }}
            >
              <div className="v3-consent-contact">
                <label>
                  联系人
                  <input
                    value={contactName}
                    placeholder="请输入联系人姓名"
                    onChange={(event) => setContactName(event.target.value)}
                  />
                </label>
                <label>
                  联系方式
                  <input
                    value={contactMethod}
                    placeholder="手机号或企业邮箱"
                    onChange={(event) => setContactMethod(event.target.value)}
                  />
                </label>
              </div>
              <label className="v3-consent-check">
                <input
                  type="checkbox"
                  checked={shareDiagnosis}
                  onChange={(event) => setShareDiagnosis(event.target.checked)}
                />
                <span>
                  <strong>我授权提交本次企业背景、问题描述和初诊结果</strong>
                  <small>
                    用途仅限安排咨询沟通；正式系统需要记录授权时间、版本、提交范围和撤回状态。
                  </small>
                </span>
              </label>
              <label className="v3-consent-check separate">
                <input
                  type="checkbox"
                  checked={separateCaseConsent}
                  onChange={(event) =>
                    setSeparateCaseConsent(event.target.checked)
                  }
                />
                <span>
                  <strong>我理解：申请咨询不等于授权公开案例</strong>
                  <small>
                    是否收入案例库、是否脱敏以及允许展示哪些结果，必须在项目结束后另行授权。
                  </small>
                </span>
              </label>
              {consentPreviewed && (
                <div className="v3-consent-preview" role="status">
                  <strong>授权预览已生成，尚未提交</strong>
                  <span>
                    当前原型没有后端提交接口，因此和君仍然看不到这些信息。接入正式授权与审计服务后才能完成提交。
                  </span>
                </div>
              )}
              <footer>
                <button type="button" onClick={() => setShowConsent(false)}>
                  暂不提交
                </button>
                <button
                  type="submit"
                  disabled={
                    !contactName.trim() ||
                    !contactMethod.trim() ||
                    !shareDiagnosis ||
                    !separateCaseConsent
                  }
                >
                  生成授权提交预览 →
                </button>
              </footer>
            </form>
          )}
        </section>

        <footer>{serviceRouting.boundary}</footer>
      </section>

      <footer className="v3-analysis-action">
        <div>
          <strong>下一步：联合核验</strong>
          <span>
            确认关联事件并补充案例、制度或经营证据后，才能决定是否进入咨询路线。
          </span>
        </div>
        <button onClick={onContinue}>进入联合核验工作台 →</button>
      </footer>
    </main>
  );
}

function ContentEvidenceCard({
  schema,
  values,
  onChange,
}: {
  schema: ContentEvidenceSchema;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  const required = schema.fields.filter((field) => field.required);
  const completed = required.filter(
    (field) => (values[field.id] ?? "").trim().length >= 8,
  ).length;
  const ready = completed === required.length;
  return (
    <article className={`v31-evidence-card ${ready ? "ready" : ""}`}>
      <header>
        <div>
          <span>Q{schema.questionId}</span>
          <em>{schema.type}</em>
        </div>
        <strong>
          {ready
            ? "内容可分析"
            : `${completed}/${required.length}项达到最低信息量`}
        </strong>
      </header>
      <section>
        <h3>{schema.title}</h3>
        <p>{schema.instruction}</p>
      </section>
      <div className="v31-evidence-fields">
        {schema.fields.map((field) => (
          <label key={field.id}>
            <span>
              {field.label}
              {field.required && <b>必填</b>}
            </span>
            {field.multiline ? (
              <textarea
                value={values[field.id] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.id, event.target.value)}
              />
            ) : (
              <input
                value={values[field.id] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.id, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <footer>
        <div>
          <small>系统将检查</small>
          {schema.analysis.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p>
          <b>判断边界</b>
          {schema.boundary}
        </p>
      </footer>
    </article>
  );
}

function V3Workspace({
  profile,
  initialAnswers,
  onExit,
  edition = "3",
}: {
  profile: Profile;
  initialAnswers: Record<number, string>;
  onExit: () => void;
  edition?: "3" | "3.1";
}) {
  const [view, setView] = useState<V3View>("overview");
  const [answers, setAnswers] = useState(initialAnswers);
  const [branches, setBranches] = useState<string[]>([]);
  const [contentEvidence, setContentEvidence] = useState<
    Record<number, Record<string, string>>
  >({});
  const primary = profile.events.find(
    (event) => event.id === profile.primaryId,
  )!;
  useScrollToPageTop(view);
  const candidates = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        label: string;
        description: string;
        questionIds: number[];
        sources: string[];
      }
    >();
    profile.events.forEach((event) =>
      event.branches.forEach((branch) => {
        const old = map.get(branch.label);
        if (old) {
          old.questionIds = unique([...old.questionIds, ...branch.questionIds]);
          old.sources.push(event.name);
        } else
          map.set(branch.label, {
            ...branch,
            id: `${branch.id}:${branch.label}`,
            sources: [event.name],
          });
      }),
    );
    return Array.from(map.values());
  }, [profile]);
  const coreIds = useMemo(
    () => unique(profile.events.flatMap((event) => event.core)),
    [profile],
  );
  const relatedIds = useMemo(
    () =>
      unique(
        candidates
          .filter((x) => branches.includes(x.id))
          .flatMap((x) => x.questionIds),
      ).filter((id) => !coreIds.includes(id)),
    [candidates, branches, coreIds],
  );
  const analysisIds = useMemo(
    () =>
      unique([...coreIds, ...relatedIds]).filter((id) =>
        getContentEvidenceSchema(id),
      ),
    [coreIds, relatedIds],
  );
  const completedContentEvidence = analysisIds.filter((id) => {
    const schema = getContentEvidenceSchema(id)!;
    return schema.fields
      .filter((field) => field.required)
      .every(
        (field) => (contentEvidence[id]?.[field.id] ?? "").trim().length >= 8,
      );
  }).length;
  const answeredRelated = relatedIds.filter((id) =>
    Boolean(answers[id]),
  ).length;
  const structuredRelatedIds = relatedIds.filter(
    (id) => !getContentEvidenceSchema(id),
  );
  const completedStructuredEvidence = structuredRelatedIds.filter((id) =>
    Boolean(answers[id]),
  ).length;
  const evidenceTarget =
    edition === "3.1"
      ? analysisIds.length + structuredRelatedIds.length
      : relatedIds.length;
  const evidenceCompleted =
    edition === "3.1"
      ? completedContentEvidence + completedStructuredEvidence
      : answeredRelated;
  const evidenceCoverage = evidenceTarget
    ? Math.round((evidenceCompleted / evidenceTarget) * 100)
    : null;
  const hasSupplementalEvidence = evidenceCompleted > 0;
  const directions = unique(profile.events.map((event) => event.direction));
  const routes = unique(profile.events.flatMap((event) => event.routes));
  const toggleBranch = (id: string) =>
    setBranches((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  useDeskMotion(
    `v3-workspace-${edition}-${view}-${branches.join("-")}-${answeredRelated}-${completedContentEvidence}`,
  );
  return (
    <div className={`v3-shell ${edition === "3.1" ? "v31-shell" : ""}`}>
      <aside className="v3-sidebar">
        <button className="v2-brand" onClick={onExit}>
          <span>O</span>
          <b>和君诊断</b>
          <em>V{edition}</em>
        </button>
        <div className="v3-company">
          <small>联合诊断企业</small>
          <strong>{profile.company}</strong>
          <span>{diagnosticModes[profile.lens].name}</span>
        </div>
        <nav>
          {(
            [
              ["overview", "联合概览"],
              ["evidence", "补充证据"],
              ["relations", "事件关系"],
              ["routes", "咨询路由"],
            ] as [V3View, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
            >
              <i>
                {id === "overview"
                  ? "⌂"
                  : id === "evidence"
                    ? "□"
                    : id === "relations"
                      ? "⌘"
                      : "↗"}
              </i>
              {label}
              {id === "evidence" && (
                <b>
                  {edition === "3.1"
                    ? completedContentEvidence
                    : answeredRelated}
                </b>
              )}
            </button>
          ))}
        </nav>
        <section>
          <small>主事件</small>
          <strong>{primary.name}</strong>
          {profile.events
            .filter((e) => e.id !== primary.id)
            .map((event) => (
              <span key={event.id}>＋ {event.name}</span>
            ))}
        </section>
      </aside>
      <main className="v3-main">
        <header>
          <div>
            <p>
              V{edition} ·{" "}
              {edition === "3.1"
                ? "CONTENT EVIDENCE WORKBENCH"
                : "MULTI-EVENT WORKBENCH"}
            </p>
            <h1>
              {view === "overview"
                ? "联合诊断概览"
                : view === "evidence"
                  ? "补充关联证据"
                  : view === "relations"
                    ? "事件关系图"
                    : "咨询路由"}
            </h1>
          </div>
          <span>
            {profile.events.length}个事件 · {Object.keys(answers).length}项信息
          </span>
        </header>
        {view === "overview" && (
          <>
            <section className="v3-summary">
              <div>
                <p>PRIMARY EVENT</p>
                <h2>{primary.name}</h2>
                <span>{primary.description}</span>
              </div>
              <aside>
                <small>当前阶段</small>
                <strong>初步方向</strong>
                <span>
                  {evidenceCoverage === null
                    ? "等待确认关联事件"
                    : `证据覆盖 ${evidenceCoverage}%`}
                </span>
              </aside>
            </section>
            <section className="v3-direction-stack">
              <header>
                <p>INITIAL DIRECTIONS</p>
                <h2>不是简单叠加，而是先寻找共同解释</h2>
              </header>
              {directions.map((direction, index) => (
                <article key={direction}>
                  <b>0{index + 1}</b>
                  <strong>{direction}</strong>
                  <span>
                    {profile.events
                      .filter((event) => event.direction === direction)
                      .map((event) => event.name)
                      .join("、")}
                  </span>
                </article>
              ))}
            </section>
            <section className="v3-candidates">
              <header>
                <div>
                  <p>RELATION CHECK</p>
                  <h2>这些关联情况是否也发生？</h2>
                </div>
                <span>确认后才展开补充题</span>
              </header>
              <div>
                {candidates.map((item) => (
                  <button
                    key={item.id}
                    className={branches.includes(item.id) ? "active" : ""}
                    onClick={() => toggleBranch(item.id)}
                  >
                    <i>{branches.includes(item.id) ? "✓" : "+"}</i>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                      <em>由 {unique(item.sources).join(" / ")} 提出</em>
                    </span>
                  </button>
                ))}
              </div>
              {branches.length > 0 && (
                <button className="v3-next" onClick={() => setView("evidence")}>
                  补充已确认关系的证据 →
                </button>
              )}
            </section>
          </>
        )}
        {view === "evidence" && (
          <section className="v3-page">
            <header>
              <div>
                <p>
                  {edition === "3.1"
                    ? "CONTENT EVIDENCE"
                    : "SUPPLEMENTAL EVIDENCE"}
                </p>
                <h2>
                  {edition === "3.1"
                    ? "把自评分数还原成可检查的企业证据"
                    : "只补充已确认关系对应的题目"}
                </h2>
              </div>
              <span>
                {edition === "3.1"
                  ? `${completedContentEvidence}/${analysisIds.length}组内容可分析`
                  : `${answeredRelated}项已补充`}
              </span>
            </header>
            {edition === "3.1" ? (
              <div className="v31-evidence-workbench">
                <section className="v31-evidence-note">
                  <div>
                    <strong>先采集内容，再形成判断</strong>
                    <span>
                      此处不会根据文字长度自动宣布企业存在问题。完成标记只代表信息达到最低分析量。
                    </span>
                  </div>
                  <aside>
                    <b>{analysisIds.length}</b>
                    <small>当前事件触发的内容证据</small>
                  </aside>
                </section>
                {analysisIds.length === 0 ? (
                  <div className="v2-empty">
                    <h3>当前事件暂未配置内容分析题</h3>
                    <p>可以先在联合概览确认关联事件，继续使用成熟度补充题。</p>
                  </div>
                ) : (
                  analysisIds.map((id) => {
                    const schema = getContentEvidenceSchema(id)!;
                    return (
                      <ContentEvidenceCard
                        key={id}
                        schema={schema}
                        values={contentEvidence[id] ?? {}}
                        onChange={(fieldId, value) =>
                          setContentEvidence((old) => ({
                            ...old,
                            [id]: { ...(old[id] ?? {}), [fieldId]: value },
                          }))
                        }
                      />
                    );
                  })
                )}
                {relatedIds.filter((id) => !getContentEvidenceSchema(id))
                  .length > 0 && (
                  <section className="v31-scale-supplement">
                    <header>
                      <div>
                        <p>STRUCTURED SUPPLEMENT</p>
                        <h3>其余关联题仍作为结构化初筛</h3>
                      </div>
                      <span>不与内容证据混为一种分数</span>
                    </header>
                    <div className="v3-evidence-list">
                      {relatedIds
                        .filter((id) => !getContentEvidenceSchema(id))
                        .map((id) => {
                          const q = getQuestion(id);
                          return (
                            <label key={id}>
                              <b>Q{id}</b>
                              <span>
                                <strong>{q.title}</strong>
                                <small>{q.prompt}</small>
                              </span>
                              <select
                                value={answers[id] ?? ""}
                                onChange={(event) =>
                                  setAnswers({
                                    ...answers,
                                    [id]: event.target.value,
                                  })
                                }
                              >
                                <option value="">暂不填写</option>
                                {maturityOptions.map((option) => (
                                  <option key={option}>{option}</option>
                                ))}
                              </select>
                            </label>
                          );
                        })}
                    </div>
                  </section>
                )}
              </div>
            ) : branches.length === 0 ? (
              <div className="v2-empty">
                <h3>尚未确认关联事件</h3>
                <p>先返回联合概览，确认实际同时发生的关联情况。</p>
                <button onClick={() => setView("overview")}>返回确认</button>
              </div>
            ) : relatedIds.length === 0 ? (
              <div className="v2-empty">
                <h3>当前关联题已全部填写</h3>
                <button onClick={() => setView("routes")}>查看咨询路由</button>
              </div>
            ) : (
              <div className="v3-evidence-list">
                {relatedIds.map((id) => {
                  const q = getQuestion(id);
                  return (
                    <label key={id}>
                      <b>Q{id}</b>
                      <span>
                        <strong>{q.title}</strong>
                        <small>{q.prompt}</small>
                      </span>
                      <select
                        value={answers[id] ?? ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [id]: e.target.value })
                        }
                      >
                        <option value="">暂不填写</option>
                        {maturityOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            )}
            {evidenceCoverage !== null && (
              <div className="v3-confidence">
                <span>当前证据覆盖度</span>
                <strong>{evidenceCoverage}%</strong>
                <p>
                  只表示已完成证据单元的比例，不表示问题严重性，也不等于结论正确率。
                </p>
                <button onClick={() => setView("routes")}>查看路由 →</button>
              </div>
            )}
          </section>
        )}
        {view === "relations" && (
          <section className="v3-page">
            <header>
              <div>
                <p>CAUSAL HYPOTHESES</p>
                <h2>事件关系仍是待验证假设</h2>
              </div>
            </header>
            <div className="v3-map">
              <article className="primary">
                <small>主事件</small>
                <strong>{primary.name}</strong>
              </article>
              <div className="v3-map-line" />
              <section>
                {profile.events
                  .filter((e) => e.id !== primary.id)
                  .map((event) => (
                    <article key={event.id}>
                      <small>并发事件</small>
                      <strong>{event.name}</strong>
                    </article>
                  ))}
              </section>
              <div className="v3-map-line" />
              <section>
                {candidates
                  .filter((x) => branches.includes(x.id))
                  .map((item) => (
                    <article className="confirmed" key={item.id}>
                      <small>已确认关联</small>
                      <strong>{item.label}</strong>
                    </article>
                  ))}
              </section>
            </div>
          </section>
        )}
        {view === "routes" && (
          <section className="v3-page">
            <header>
              <div>
                <p>CONSULTING ROUTER</p>
                <h2>解决方向与下一步</h2>
              </div>
              {evidenceCoverage !== null && (
                <span>{evidenceCoverage}% 证据覆盖</span>
              )}
            </header>
            {!hasSupplementalEvidence ? (
              <div className="v2-empty">
                <h3>目前只有初步方向</h3>
                <p>确认关联事件并补充至少一项信息后，才能进行路线排序。</p>
                <button
                  onClick={() =>
                    setView(branches.length ? "evidence" : "overview")
                  }
                >
                  继续补充
                </button>
              </div>
            ) : (
              <>
                <div className="v3-routes">
                  {routes.slice(0, 5).map((route, index) => (
                    <article key={route}>
                      <b>0{index + 1}</b>
                      <div>
                        <span>
                          {index === 0 ? "优先解决方向" : "相邻候选方向"}
                        </span>
                        <h3>{route}</h3>
                        <p>
                          {index === 0
                            ? `优先处理“${primary.name}”，并验证其他事件是否由同一机制引起。`
                            : "作为相邻模块保留，是否纳入取决于后续证据，不因本公司提供该服务而自动推荐。"}
                        </p>
                      </div>
                      <strong>{index === 0 ? "优先核验" : "候选"}</strong>
                    </article>
                  ))}
                </div>
                <article className="v3-matched-case">
                  <div>
                    <p>与你相关的脱敏案例</p>
                    <h3>
                      一家相近规模企业，曾出现“{primary.name}”与多个经营事件并发
                    </h3>
                    <span>
                      相似之处在于问题不是单点能力不足，而是多个事件可能共享组织机制。项目先核验真实决策与协作案例，再决定是否进入专项咨询。
                    </span>
                    <footer>
                      <b>查看案例详情 →</b>
                      <small>案例结果不代表当前企业必然获得相同结果</small>
                    </footer>
                  </div>
                  <aside>
                    <small>匹配依据</small>
                    <strong>问题机制</strong>
                    <strong>企业阶段</strong>
                    <strong>事件组合</strong>
                  </aside>
                </article>
                <section className="v3-consult-cta">
                  <div>
                    <p>NEXT STEP</p>
                    <h2>带着这份结果，和顾问谈一次具体的问题。</h2>
                    <span>
                      预约后顾问将先阅读你的诊断摘要，不需要从公司介绍重新开始。未经你确认，当前结果不会自动提交。
                    </span>
                  </div>
                  <button>
                    预约30分钟结果解读 <b>→</b>
                  </button>
                </section>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function V3App({ edition = "3" }: { edition?: "3" | "3.1" }) {
  const [entered, setEntered] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<Record<number, string> | null>(null);
  const [analysisReviewed, setAnalysisReviewed] = useState(false);
  const stage = !entered
    ? "gateway"
    : !profile
      ? "landing"
      : !answers
        ? "intake"
        : !analysisReviewed
          ? "analysis"
          : "workspace";
  useScrollToPageTop(stage);
  if (!entered) return <V3Gateway onEnter={() => setEntered(true)} />;
  if (!profile) return <V3Entry onStart={setProfile} edition={edition} />;
  if (!answers)
    return (
      <V3Intake
        profile={profile}
        onBack={() => setProfile(null)}
        onComplete={setAnswers}
      />
    );
  if (!analysisReviewed)
    return (
      <V3Analysis
        profile={profile}
        answers={answers}
        onBack={() => setAnswers(null)}
        onContinue={() => setAnalysisReviewed(true)}
      />
    );
  return (
    <V3Workspace
      profile={profile}
      initialAnswers={answers}
      edition={edition}
      onExit={() => {
        setEntered(false);
        setProfile(null);
        setAnswers(null);
        setAnalysisReviewed(false);
      }}
    />
  );
}
