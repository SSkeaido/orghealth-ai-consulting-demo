import { diagnosticModes, type DiagnosticVersion } from "./diagnosticModes";
import { getQuestion } from "./questionBank";

export type MappingConfidence = "高" | "中" | "低";

export type ProblemSignal = {
  id: string;
  label: string;
  matchedTerms: string[];
  interpretation: string;
};

export type QuestionMapping = {
  questionId: number;
  score: number;
  confidence: MappingConfidence;
  reason: string;
  signalIds: string[];
};

export type EventMapping = {
  eventId: string;
  score: number;
  confidence: MappingConfidence;
  reason: string;
};

export type ProblemMapping = {
  status: "empty" | "needs-detail" | "mapped";
  signals: ProblemSignal[];
  questions: QuestionMapping[];
  events: EventMapping[];
  followUps: string[];
  caveat: string;
};

type SignalRule = {
  id: string;
  label: string;
  terms: string[];
  interpretation: string;
  questionIds: number[];
  eventIds: string[];
  followUp: string;
};

const rules: SignalRule[] = [
  {
    id: "growth",
    label: "增长与市场",
    terms: [
      "增长",
      "营收",
      "销售额",
      "获客",
      "线索",
      "订单",
      "市场份额",
      "增长停滞",
      "没有客户",
    ],
    interpretation:
      "可能涉及市场判断、客户价值、增长路径或目标执行，需要区分外部空间与内部机制。",
    questionIds: [1, 3, 5, 20, 21, 22, 23, 30, 49, 50],
    eventIds: ["A03", "A01", "A07", "B01", "B02", "B03"],
    followUp: "增长变化从何时开始？主要发生在获客、转化、复购还是客单价？",
  },
  {
    id: "profit",
    label: "盈利与现金",
    terms: [
      "利润",
      "毛利",
      "亏损",
      "成本",
      "费用",
      "现金流",
      "回款",
      "融资",
      "资金",
      "价格战",
      "降价",
    ],
    interpretation:
      "可能涉及定价权、成本结构、预算配置或现金约束，不能只用收入变化解释。",
    questionIds: [5, 21, 25, 27, 29, 33, 34, 50],
    eventIds: ["A02", "B02", "B04", "B03"],
    followUp: "压力主要来自价格、销量、交付成本、费用增长还是回款周期？",
  },
  {
    id: "customer",
    label: "客户价值与体验",
    terms: [
      "客户流失",
      "续费",
      "复购",
      "投诉",
      "满意度",
      "客户体验",
      "需求变化",
      "退货",
      "客诉",
      "竞争对手",
    ],
    interpretation:
      "可能涉及客户需求、产品价值、关系经营或交付体验，需要定位流失发生的具体环节。",
    questionIds: [20, 21, 22, 24, 31, 48],
    eventIds: ["A01", "A05", "B01", "B11"],
    followUp: "哪些客户在离开或投诉？他们明确提到的原因和替代选择是什么？",
  },
  {
    id: "delivery",
    label: "交付与流程",
    terms: [
      "延期",
      "交付",
      "返工",
      "质量",
      "库存",
      "流程",
      "效率低",
      "工期",
      "项目失控",
      "响应慢",
    ],
    interpretation:
      "可能涉及流程标准、资源配置、质量控制或跨团队依赖，应从真实交付链路核验。",
    questionIds: [8, 9, 10, 11, 17, 18, 31, 32, 52, 53],
    eventIds: ["A05", "A04", "A07", "B08", "B11"],
    followUp:
      "问题最常卡在哪个交付节点？由哪个角色接收、处理并交给下一个角色？",
  },
  {
    id: "coordination",
    label: "权责与协同",
    terms: [
      "扯皮",
      "推诿",
      "协同",
      "跨部门",
      "职责不清",
      "权责",
      "审批",
      "老板拍板",
      "决策慢",
      "各自为政",
      "信息不通",
    ],
    interpretation:
      "优先作为组织边界、决策权或跨团队依赖的机制假设，而不是直接归因为员工态度。",
    questionIds: [4, 6, 8, 9, 10, 29, 30, 31, 41, 53],
    eventIds: ["A04", "A06", "B06", "B07", "B08"],
    followUp: "请举一个最近被卡住的事项：谁应负责、谁有决定权、实际等待了谁？",
  },
  {
    id: "people",
    label: "人才与绩效",
    terms: [
      "离职",
      "人才流失",
      "招不到",
      "能力不足",
      "绩效",
      "完不成目标",
      "积极性",
      "激励",
      "薪酬",
      "梯队",
      "管理者",
    ],
    interpretation:
      "可能同时包含能力、动机、管理和工作系统问题，需要避免把结构性障碍归咎于个人。",
    questionIds: [9, 11, 12, 13, 14, 15, 30, 31, 32, 41, 43],
    eventIds: ["A07", "A08", "A09", "B07", "B09"],
    followUp:
      "问题集中在哪些岗位或团队？目标、能力、资源和管理支持分别有什么证据？",
  },
  {
    id: "digital",
    label: "数字化与数据",
    terms: [
      "数字化",
      "系统",
      "数据",
      "报表",
      "信息化",
      "上线没人用",
      "手工",
      "口径不一",
      "ERP",
      "CRM",
    ],
    interpretation:
      "可能来自业务流程、数据质量、系统适配或组织采纳，不将系统上线本身视为改善结果。",
    questionIds: [10, 19, 25, 28, 29, 31, 52, 56],
    eventIds: ["A11", "A04", "A10", "B12", "B10"],
    followUp: "系统原本要改善哪个经营指标？目前谁不用、在哪一步回到线下？",
  },
  {
    id: "innovation",
    label: "创新与新业务",
    terms: [
      "创新",
      "研发",
      "新产品",
      "新业务",
      "第二曲线",
      "试点",
      "商业化",
      "转化",
      "技术布局",
    ],
    interpretation:
      "可能涉及战略连接、资源保障、组合治理或商业化机制，需要区分想法不足与放大失败。",
    questionIds: [3, 44, 45, 46, 49, 50, 54, 55, 56],
    eventIds: ["A12", "A03", "B03", "B13"],
    followUp: "创新卡在机会判断、资源投入、试点验证、负责人还是规模化阶段？",
  },
  {
    id: "change",
    label: "变革与组织采纳",
    terms: [
      "改革",
      "变革",
      "抵触",
      "落地难",
      "执行不下去",
      "重组",
      "新制度",
      "文化",
      "阻力",
    ],
    interpretation:
      "可能涉及变革理由、利益相关者、沟通、试点和反馈机制，不能只归因为员工抗拒。",
    questionIds: [39, 40, 41, 42, 43, 52, 53, 54, 56],
    eventIds: ["A10", "A11", "A04", "B08", "B10"],
    followUp:
      "哪些群体的工作、权力或利益会因变化受到影响？他们具体在抵触什么？",
  },
  {
    id: "governance",
    label: "治理与重大决策",
    terms: [
      "股东",
      "董事会",
      "治理",
      "高管",
      "战略分歧",
      "重大决策",
      "接班",
      "上市",
      "并购",
      "合规",
      "危机",
    ],
    interpretation:
      "可能涉及治理边界、高管共同目标、资本纪律或风险机制，需要一号位和正式决策证据。",
    questionIds: [3, 6, 7, 25, 26, 27, 30, 35, 36, 37, 38],
    eventIds: ["B05", "B06", "B07", "B11", "B14"],
    followUp: "该事项的正式决策人、参与人、判断标准和复盘机制分别是什么？",
  },
];

const confidenceFor = (score: number): MappingConfidence =>
  score >= 5 ? "高" : score >= 3 ? "中" : "低";

export function createEmptyProblemMapping(): ProblemMapping {
  return {
    status: "empty",
    signals: [],
    questions: [],
    events: [],
    followUps: [],
    caveat: "企业自述尚未解析。",
  };
}

export function mapCompanyProblem(
  rawText: string,
  lens: DiagnosticVersion,
): ProblemMapping {
  const text = rawText.trim().toLowerCase();
  if (!text) return createEmptyProblemMapping();

  const matched = rules
    .map((rule) => ({
      rule,
      terms: rule.terms.filter((term) => text.includes(term.toLowerCase())),
    }))
    .filter((item) => item.terms.length > 0);

  if (text.length < 12 || matched.length === 0) {
    return {
      status: "needs-detail",
      signals: [],
      questions: [],
      events: [],
      followUps: [
        "请补充一个具体表现、发生时间和受影响结果。",
        "请说明已经尝试过什么，以及结果如何。",
      ],
      caveat: "当前描述不足以可靠映射题项，Agent 不会强行猜测。",
    };
  }

  const signals: ProblemSignal[] = matched.map(({ rule, terms }) => ({
    id: rule.id,
    label: rule.label,
    matchedTerms: terms,
    interpretation: rule.interpretation,
  }));

  const questionScores = new Map<
    number,
    { score: number; signalIds: string[]; terms: string[] }
  >();
  matched.forEach(({ rule, terms }) => {
    rule.questionIds.forEach((questionId, index) => {
      const current = questionScores.get(questionId) ?? {
        score: 0,
        signalIds: [],
        terms: [],
      };
      current.score +=
        terms.length * 2 + Math.max(0, 3 - Math.floor(index / 3));
      current.signalIds.push(rule.id);
      current.terms.push(...terms);
      questionScores.set(questionId, current);
    });
  });

  const questions = Array.from(questionScores.entries())
    .map(([questionId, value]): QuestionMapping => ({
      questionId,
      score: value.score,
      confidence: confidenceFor(value.score),
      signalIds: Array.from(new Set(value.signalIds)),
      reason: `企业描述提到“${Array.from(new Set(value.terms)).slice(0, 3).join("、")}”，需核验${getQuestion(questionId).title}。`,
    }))
    .sort((a, b) => b.score - a.score || a.questionId - b.questionId)
    .slice(0, 6);

  const availableEvents = diagnosticModes[lens].events;
  const eventScores = new Map<string, { score: number; labels: string[] }>();
  matched.forEach(({ rule, terms }) => {
    rule.eventIds.forEach((eventId, index) => {
      if (!availableEvents.some((event) => event.id === eventId)) return;
      const current = eventScores.get(eventId) ?? { score: 0, labels: [] };
      current.score += terms.length * 2 + Math.max(0, 2 - index);
      current.labels.push(rule.label);
      eventScores.set(eventId, current);
    });
  });

  const events = Array.from(eventScores.entries())
    .map(([eventId, value]): EventMapping => ({
      eventId,
      score: value.score,
      confidence: confidenceFor(value.score),
      reason: `与${Array.from(new Set(value.labels)).join("、")}信号相关，建议由企业确认是否真实发生。`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    status: "mapped",
    signals,
    questions,
    events,
    followUps: matched.slice(0, 3).map(({ rule }) => rule.followUp),
    caveat:
      "映射只决定优先核验哪些题，不代表问题已经成立，也不参与成熟度得分。",
  };
}
