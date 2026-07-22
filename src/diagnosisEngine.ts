import { questionBank } from "./questionBank";

type EventInput = {
  name: string;
  core: number[];
  direction: string;
};

export type ModuleAnalysis = {
  module: number;
  name: string;
  score: number | null;
  answered: number;
  available: number;
  level: "risk" | "watch" | "stable" | "unknown";
  lowSignals: string[];
  strengths: string[];
};

export type DiagnosisAnalysis = {
  modules: ModuleAnalysis[];
  answeredCount: number;
  unknownCount: number;
  topSignals: Array<{ title: string; module: string; score: number }>;
  contradictions: Array<{ event: string; message: string }>;
  directions: Array<{ name: string; supportingSignals: number }>;
  quality: "信息有限" | "形成初步信号" | "可以进入联合核验";
};

const moduleNames: Record<number, string> = {
  1: "发展机遇与赛道选择",
  2: "战略规划与商业模式",
  3: "公司治理与股权激励",
  4: "组织管理与流程优化",
  5: "人力资源与人才发展",
  6: "精益生产与智能制造",
  7: "市场营销与品牌管理",
  8: "财税管理与合规风控",
  9: "数字信息与智慧智能",
  10: "执行力系统",
  11: "资本规划与企业融资",
  12: "资本运营与并购重组",
  13: "企业上市与市值管理",
  14: "企业文化体系",
  15: "创新战略与资源保障",
  16: "产品、技术与服务创新",
  17: "商业模式与生态协同创新",
  18: "组织流程、激励与变革管理",
};

const optionScores: Record<string, number | null> = {
  表现成熟且稳定: 5,
  基本建立并能够执行: 3,
  部分开展但不稳定: 1,
  尚未建立或基本无效: 0,
  暂时不清楚: null,
};

export function analyzeDiagnosis(
  answers: Record<number, string>,
  events: EventInput[],
): DiagnosisAnalysis {
  const answeredItems = Object.entries(answers)
    .map(([id, answer]) => {
      const question = questionBank.find((item) => item.id === Number(id));
      return question
        ? { question, answer, score: optionScores[answer] ?? null }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const moduleIds = Array.from(
    new Set(answeredItems.map((item) => item.question.module)),
  );
  const modules = moduleIds
    .map((module): ModuleAnalysis => {
      const items = answeredItems.filter(
        (item) => item.question.module === module,
      );
      const scored = items.filter((item) => item.score !== null);
      const score = scored.length
        ? Math.round(
            (scored.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              (scored.length * 5)) *
              100,
          )
        : null;
      const level =
        score === null
          ? "unknown"
          : score < 40
            ? "risk"
            : score < 70
              ? "watch"
              : "stable";
      return {
        module,
        name: moduleNames[module],
        score,
        answered: items.length,
        available: questionBank.filter((item) => item.module === module).length,
        level,
        lowSignals: scored
          .filter((item) => (item.score ?? 5) <= 1)
          .map((item) => item.question.title),
        strengths: scored
          .filter((item) => (item.score ?? 0) >= 5)
          .map((item) => item.question.title),
      };
    })
    .sort((a, b) => (a.score ?? 101) - (b.score ?? 101));

  const topSignals = answeredItems
    .filter((item) => item.score !== null && item.score <= 1)
    .sort((a, b) => (a.score ?? 5) - (b.score ?? 5))
    .slice(0, 5)
    .map((item) => ({
      title: item.question.title,
      module: moduleNames[item.question.module],
      score: item.score ?? 0,
    }));

  const contradictions = events.flatMap((event) => {
    const core = event.core
      .map((id) => answeredItems.find((item) => item.question.id === id))
      .filter((item): item is NonNullable<typeof item> =>
        Boolean(item?.score !== null),
      );
    if (!core.length) return [];
    const average =
      core.reduce((sum, item) => sum + (item.score ?? 0), 0) / core.length;
    return average >= 4
      ? [
          {
            event: event.name,
            message:
              "经营事件与核心题回答偏成熟，当前信息存在矛盾，需要真实案例核验。",
          },
        ]
      : [];
  });

  const directions = Array.from(
    new Set(events.map((event) => event.direction)),
  ).map((name) => ({
    name,
    supportingSignals: events
      .filter((event) => event.direction === name)
      .flatMap((event) => event.core)
      .filter((id) => {
        const item = answeredItems.find((answer) => answer.question.id === id);
        return item?.score !== null && (item?.score ?? 5) <= 1;
      }).length,
  }));

  const unknownCount = answeredItems.filter(
    (item) => item.score === null,
  ).length;
  const quality =
    topSignals.length >= 2 && unknownCount === 0
      ? "可以进入联合核验"
      : topSignals.length > 0
        ? "形成初步信号"
        : "信息有限";

  return {
    modules,
    answeredCount: answeredItems.length,
    unknownCount,
    topSignals,
    contradictions,
    directions,
    quality,
  };
}
