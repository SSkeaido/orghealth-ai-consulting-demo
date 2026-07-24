import { useMemo, useState } from "react";
import {
  dimensionOrder,
  modules,
  type DiagnosticModule,
  type Dimension,
} from "./data";

type View = "overview" | "evidence" | "diagnosis" | "report";
type Upload = { name: string; size: string; kind: string };

const icon = (name: View) =>
  ({ overview: "⌂", evidence: "◇", diagnosis: "◎", report: "↗" })[name];
const labels: Record<View, string> = {
  overview: "项目概览",
  evidence: "证据资料",
  diagnosis: "诊断工作区",
  report: "诊断报告",
};
const statusClass = (value: string) => `status status--${value}`;

function scoreTone(score: number | null) {
  if (score === null) return "muted";
  if (score >= 4) return "good";
  if (score >= 3) return "steady";
  if (score >= 2) return "watch";
  return "risk";
}

function Landing({
  onStart,
}: {
  onStart: (company: string, industry: string, files: Upload[]) => void;
}) {
  const [company, setCompany] = useState("示例科技有限公司");
  const [industry, setIndustry] = useState("企业服务 / SaaS");
  const [files, setFiles] = useState<Upload[]>([
    { name: "2025年度经营计划.pdf", size: "2.4 MB", kind: "战略" },
    { name: "组织架构与岗位职责.docx", size: "864 KB", kind: "组织" },
  ]);
  function pick(list: FileList | null) {
    if (!list) return;
    setFiles((current) => [
      ...current,
      ...Array.from(list).map((file) => ({
        name: file.name,
        size:
          file.size > 1048576
            ? `${(file.size / 1048576).toFixed(1)} MB`
            : `${Math.ceil(file.size / 1024)} KB`,
        kind: "待分类",
      })),
    ]);
  }
  return (
    <main className="landing">
      <header className="landing__nav">
        <a className="brand">
          <span>恒</span> 恒远咨询
        </a>
        <div>
          <span className="quiet-pill">企业健康初诊</span>
        </div>
      </header>
      <section className="landing__hero">
        <p className="eyebrow">EVIDENCE-BASED ORGANIZATION DIAGNOSTICS</p>
        <h1>
          不发问卷，也能看清一家企业
          <br />
          <em>真正卡在哪里。</em>
        </h1>
        <p>
          上传经营资料、记录关键访谈，恒远企业健康初诊会把零散证据整理为 56
          项可追溯诊断，并形成优先级清晰的改进报告。
        </p>
      </section>
      <section className="intake-grid">
        <article className="intake-card">
          <div className="card-kicker">
            <span>01</span> 项目背景
          </div>
          <label>
            企业名称
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="输入被诊断企业名称"
            />
          </label>
          <label>
            所属行业
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例如：制造业 / 消费品"
            />
          </label>
          <label>
            本次诊断重点
            <textarea placeholder="可选：例如增长放缓、组织协同、人才梯队……" />
          </label>
        </article>
        <article className="intake-card">
          <div className="card-kicker">
            <span>02</span> 企业资料
          </div>
          <label className="dropzone">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              onChange={(e) => pick(e.target.files)}
            />
            <span className="drop-icon">＋</span>
            <strong>拖入或选择企业资料</strong>
            <small>战略、财务、人力、销售、流程制度等均可</small>
          </label>
          <div className="upload-list">
            {files.map((file, i) => (
              <div className="upload-item" key={`${file.name}-${i}`}>
                <span className="file-mark">
                  {file.name.split(".").pop()?.toUpperCase()}
                </span>
                <div>
                  <strong>{file.name}</strong>
                  <small>
                    {file.kind} · {file.size}
                  </small>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, x) => x !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="launch-bar">
        <div>
          <strong>{files.length} 份资料已就绪</strong>
          <span>资料仅用于当前演示项目，下一步进入证据核验工作区。</span>
        </div>
        <button
          onClick={() => onStart(company, industry, files)}
          disabled={!company.trim()}
        >
          创建诊断项目 <b>→</b>
        </button>
      </section>
    </main>
  );
}

function Radar({ values }: { values: number[] }) {
  const center = 110,
    radius = 82,
    points = 5;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / points;
    return `${center + Math.cos(a) * r},${center + Math.sin(a) * r}`;
  };
  const polygon = values.map((v, i) => pt(i, (radius * v) / 5)).join(" ");
  return (
    <svg className="radar" viewBox="0 0 220 220" aria-label="五大维度雷达图">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon
          key={r}
          points={dimensionOrder.map((_, i) => pt(i, radius * r)).join(" ")}
          fill="none"
          stroke="#d7ddd8"
        />
      ))}
      {dimensionOrder.map((_, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={pt(i, radius).split(",")[0]}
          y2={pt(i, radius).split(",")[1]}
          stroke="#d7ddd8"
        />
      ))}
      <polygon
        points={polygon}
        fill="rgba(35,105,89,.2)"
        stroke="#236959"
        strokeWidth="2.5"
      />
      {values.map((v, i) => {
        const [x, y] = pt(i, (radius * v) / 5).split(",");
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#236959" />;
      })}
    </svg>
  );
}

function Workspace({
  company,
  industry,
  initialFiles,
  onExit,
}: {
  company: string;
  industry: string;
  initialFiles: Upload[];
  onExit: () => void;
}) {
  const [view, setView] = useState<View>("overview");
  const [files, setFiles] = useState(initialFiles);
  const [items, setItems] = useState(modules);
  const [selected, setSelected] = useState<DiagnosticModule | null>(null);
  const [filter, setFilter] = useState<Dimension | "全部">("全部");
  const scores = useMemo(
    () =>
      dimensionOrder.map((d) => {
        const xs = items.filter((m) => m.dimension === d && m.score !== null);
        return xs.length
          ? xs.reduce((s, m) => s + (m.score ?? 0), 0) / xs.length
          : 0;
      }),
    [items],
  );
  const completed = items.filter((x) => x.status === "已完成").length;
  const avg =
    items
      .filter((x) => x.score !== null)
      .reduce((s, x) => s + (x.score ?? 0), 0) /
    Math.max(1, items.filter((x) => x.score !== null).length);
  const updateModule = (id: number, patch: Partial<DiagnosticModule>) => {
    setItems((old) => old.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setSelected((old) => (old?.id === id ? { ...old, ...patch } : old));
  };
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((old) => [
      ...old,
      ...Array.from(list).map((f) => ({
        name: f.name,
        size:
          f.size > 1048576
            ? `${(f.size / 1048576).toFixed(1)} MB`
            : `${Math.ceil(f.size / 1024)} KB`,
        kind: "待分类",
      })),
    ]);
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand brand--button" onClick={onExit}>
          <span>恒</span> 恒远咨询
        </button>
        <div className="project-mini">
          <small>当前项目</small>
          <strong>{company}</strong>
          <span>{industry}</span>
        </div>
        <nav>
          {(Object.keys(labels) as View[]).map((key) => (
            <button
              key={key}
              className={view === key ? "active" : ""}
              onClick={() => setView(key)}
            >
              <i>{icon(key)}</i>
              {labels[key]}
              {key === "diagnosis" && <b>{items.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar__foot">
          <div className="progress-ring">
            <span>{Math.round((completed / items.length) * 100)}%</span>
          </div>
          <div>
            <strong>诊断进度</strong>
            <small>
              {completed} / {items.length} 模块完成
            </small>
          </div>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <p>{labels[view]}</p>
            <h1>
              {view === "overview"
                ? `早上好，继续诊断 ${company}`
                : labels[view]}
            </h1>
          </div>
          <div className="top-actions">
            <span className="sync-dot">● 已自动保存</span>
            <button onClick={() => setView("report")}>预览报告</button>
            <span className="avatar">顾</span>
          </div>
        </header>
        {view === "overview" && (
          <>
            <section className="metric-grid">
              <article>
                <span>综合健康度</span>
                <strong>
                  {(avg * 20).toFixed(0)}
                  <small>/100</small>
                </strong>
                <em className="trend">
                  基于 {items.filter((x) => x.score !== null).length}{" "}
                  个已评分模块
                </em>
              </article>
              <article>
                <span>证据资料</span>
                <strong>
                  {files.length}
                  <small>份</small>
                </strong>
                <em>覆盖战略、组织与运营</em>
              </article>
              <article>
                <span>待复核</span>
                <strong>
                  {items.filter((x) => x.status === "待复核").length}
                  <small>项</small>
                </strong>
                <em className="warn">建议本周完成</em>
              </article>
              <article>
                <span>高风险模块</span>
                <strong>
                  {
                    items.filter((x) => x.score !== null && x.score < 2.5)
                      .length
                  }
                  <small>项</small>
                </strong>
                <em className="risk-text">需要优先干预</em>
              </article>
            </section>
            <section className="overview-grid">
              <article className="panel health-panel">
                <div className="panel-head">
                  <div>
                    <small>健康度画像</small>
                    <h2>五大维度</h2>
                  </div>
                  <button onClick={() => setView("report")}>
                    查看完整报告 →
                  </button>
                </div>
                <div className="radar-wrap">
                  <Radar values={scores} />
                  <div className="dimension-list">
                    {dimensionOrder.map((d, i) => (
                      <div key={d}>
                        <span>
                          <i
                            style={{
                              background: [
                                "#356e61",
                                "#648f75",
                                "#aa8f5c",
                                "#996c63",
                                "#567487",
                              ][i],
                            }}
                          />
                          {d}
                        </span>
                        <strong>
                          {scores[i] ? `${(scores[i] * 20).toFixed(0)}%` : "—"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
              <article className="panel next-panel">
                <div className="panel-head">
                  <div>
                    <small>下一步</small>
                    <h2>待办事项</h2>
                  </div>
                  <span>
                    {items.filter((x) => x.status !== "已完成").length} 项
                  </span>
                </div>
                {[items[2], items[4], items[8]].map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelected(m);
                      setView("diagnosis");
                    }}
                  >
                    <span className={`task-icon task-icon--${i}`}>
                      {i === 0 ? "!" : i === 1 ? "✓" : "◇"}
                    </span>
                    <div>
                      <strong>{m.name}</strong>
                      <small>
                        {i === 0
                          ? "补充授权清单与董事会纪要"
                          : i === 1
                            ? "复核人才梯队判断"
                            : "等待数字化系统使用数据"}
                      </small>
                    </div>
                    <b>→</b>
                  </button>
                ))}
              </article>
            </section>
            <section className="panel activity">
              <div className="panel-head">
                <div>
                  <small>项目动态</small>
                  <h2>最近证据</h2>
                </div>
                <button onClick={() => setView("evidence")}>
                  管理全部资料
                </button>
              </div>
              {files.slice(0, 4).map((f, i) => (
                <div className="activity-row" key={`${f.name}-${i}`}>
                  <span className="file-mark">
                    {f.name.split(".").pop()?.toUpperCase()}
                  </span>
                  <div>
                    <strong>{f.name}</strong>
                    <small>
                      {i === 0
                        ? "已关联：战略规划与商业模式"
                        : "等待关联诊断项"}
                    </small>
                  </div>
                  <time>{i === 0 ? "刚刚" : "今天"}</time>
                </div>
              ))}
            </section>
          </>
        )}
        {view === "evidence" && (
          <section className="panel evidence-view">
            <div className="section-title">
              <div>
                <p className="eyebrow">EVIDENCE LIBRARY</p>
                <h2>所有判断，都要回到证据</h2>
                <span>
                  把文件、数据和访谈记录放在同一个证据库中，再关联到具体诊断项。
                </span>
              </div>
              <label className="upload-button">
                ＋ 添加资料
                <input
                  type="file"
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
            </div>
            <div className="evidence-stats">
              <span>
                <b>{files.length}</b> 全部资料
              </span>
              <span>
                <b>{Math.min(files.length, 6)}</b> 已核验
              </span>
              <span>
                <b>{Math.max(0, files.length - 6)}</b> 待关联
              </span>
            </div>
            <div className="evidence-grid">
              {files.map((f, i) => (
                <article key={`${f.name}-${i}`}>
                  <div className="file-mark file-mark--large">
                    {f.name.split(".").pop()?.toUpperCase()}
                  </div>
                  <span className={i < 6 ? "verified" : "pending"}>
                    {i < 6 ? "✓ 已核验" : "待关联"}
                  </span>
                  <h3>{f.name}</h3>
                  <p>
                    {f.kind} · {f.size}
                  </p>
                  <small>
                    {i < 6
                      ? `已关联 ${(i % 3) + 1} 个诊断项`
                      : "上传后等待顾问核验"}
                  </small>
                  <button>查看证据 →</button>
                </article>
              ))}
            </div>
          </section>
        )}
        {view === "diagnosis" && (
          <section className="diagnosis-view">
            <div className="section-title">
              <div>
                <p className="eyebrow">56 CHECKS · 18 MODULES</p>
                <h2>诊断工作区</h2>
                <span>
                  不是让企业自己打分，而是由顾问根据数据、文件、访谈和现场事实作出判断。
                </span>
              </div>
              <div className="filter-row">
                <button
                  className={filter === "全部" ? "active" : ""}
                  onClick={() => setFilter("全部")}
                >
                  全部
                </button>
                {dimensionOrder.map((d) => (
                  <button
                    className={filter === d ? "active" : ""}
                    key={d}
                    onClick={() => setFilter(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="module-table">
              <div className="module-head">
                <span>模块</span>
                <span>证据</span>
                <span>状态</span>
                <span>评分</span>
                <span />
              </div>
              {items
                .filter((x) => filter === "全部" || x.dimension === filter)
                .map((m) => (
                  <button
                    className="module-row"
                    key={m.id}
                    onClick={() => setSelected(m)}
                  >
                    <div>
                      <i>{String(m.id).padStart(2, "0")}</i>
                      <span>
                        <strong>{m.name}</strong>
                        <small>
                          {m.dimension} · {m.items} 个检查项
                        </small>
                      </span>
                    </div>
                    <span>{m.evidence} 份</span>
                    <span className={statusClass(m.status)}>{m.status}</span>
                    <strong className={`score score--${scoreTone(m.score)}`}>
                      {m.score?.toFixed(1) ?? "—"}
                    </strong>
                    <b>›</b>
                  </button>
                ))}
            </div>
          </section>
        )}
        {view === "report" && (
          <section className="report-view">
            <div className="report-cover">
              <p>ORGHEALTH DIAGNOSTIC REPORT</p>
              <h2>
                {company}
                <br />
                组织健康度诊断报告
              </h2>
              <div>
                <span>
                  诊断日期
                  <br />
                  <b>2026.07.21</b>
                </span>
                <span>
                  综合健康度
                  <br />
                  <b>{(avg * 20).toFixed(0)} / 100</b>
                </span>
                <span>
                  证据覆盖
                  <br />
                  <b>{files.length} 份</b>
                </span>
              </div>
            </div>
            <div className="report-grid">
              <article className="panel">
                <div className="panel-head">
                  <h2>核心判断</h2>
                  <span className="report-tag">内部工作稿</span>
                </div>
                <p className="lead">
                  企业战略方向基本清晰，但组织授权、数字化使用和新商业模式转化正在成为增长的主要约束。
                </p>
                <div className="finding">
                  <b>01</b>
                  <div>
                    <strong>组织授权不完整，跨部门事项依赖高层协调</strong>
                    <p>
                      授权清单与真实审批路径存在差异，建议优先梳理高频决策事项。
                    </p>
                  </div>
                </div>
                <div className="finding">
                  <b>02</b>
                  <div>
                    <strong>数据系统已部署，但经营决策仍依赖手工报表</strong>
                    <p>
                      需要从“系统上线”转向关键经营指标的统一定义和使用闭环。
                    </p>
                  </div>
                </div>
                <div className="finding">
                  <b>03</b>
                  <div>
                    <strong>创新项目多，但缺少从试点到规模化的门径管理</strong>
                    <p>建议建立创新组合、阶段评审和退出机制。</p>
                  </div>
                </div>
              </article>
              <article className="panel report-radar">
                <h2>维度表现</h2>
                <Radar values={scores} />
                {dimensionOrder.map((d, i) => (
                  <div key={d}>
                    <span>{d}</span>
                    <meter min="0" max="5" value={scores[i]} />
                    <b>{scores[i] ? scores[i].toFixed(1) : "—"}</b>
                  </div>
                ))}
              </article>
            </div>
          </section>
        )}
      </main>
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelected(null)}>
              ×
            </button>
            <p className="eyebrow">
              MODULE {String(selected.id).padStart(2, "0")} ·{" "}
              {selected.dimension}
            </p>
            <h2>{selected.name}</h2>
            <p className="drawer-prompt">{selected.prompt}</p>
            <div className="drawer-block">
              <label>
                成熟度评分 <b>{selected.score?.toFixed(1) ?? "未评分"}</b>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={selected.score ?? 0}
                onChange={(e) =>
                  updateModule(selected.id, { score: Number(e.target.value) })
                }
              />
              <div className="scale">
                <span>未建立</span>
                <span>基本成熟</span>
                <span>领先</span>
              </div>
            </div>
            <div className="drawer-block">
              <label>核验状态</label>
              <div className="status-options">
                {(["未开始", "取证中", "待复核", "已完成"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      className={selected.status === s ? "active" : ""}
                      onClick={() => updateModule(selected.id, { status: s })}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="drawer-block">
              <label>证据结论</label>
              <textarea defaultValue="已有制度文件，但抽样项目显示实际执行仍依赖负责人个人推动。建议补充最近三个项目的审批与复盘记录。" />
            </div>
            <div className="drawer-evidence">
              <span>◇</span>
              <div>
                <strong>{selected.evidence} 份关联证据</strong>
                <small>点击进入证据库查看来源与核验记录</small>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setView("evidence");
                }}
              >
                查看
              </button>
            </div>
            <button
              className="primary"
              onClick={() => {
                updateModule(selected.id, { status: "已完成" });
                setSelected(null);
              }}
            >
              保存并完成复核
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [project, setProject] = useState<{
    company: string;
    industry: string;
    files: Upload[];
  } | null>(null);
  return project ? (
    <Workspace
      {...project}
      initialFiles={project.files}
      onExit={() => setProject(null)}
    />
  ) : (
    <Landing
      onStart={(company, industry, files) =>
        setProject({ company, industry, files })
      }
    />
  );
}
