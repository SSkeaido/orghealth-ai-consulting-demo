import type { DiagnosticEvent } from "./diagnosticModes";
import type { ProblemMapping } from "./problemMappingAgent";

export type ConsultantProfile = {
  id: string;
  name: string;
  title: string;
  base: string;
  years: number;
  unitIds: string[];
  specialties: string[];
  industries: string[];
  methods: string[];
  availability: string;
  fictional: true;
};

export type ServiceUnit = {
  id: string;
  wing: "恒远咨询" | "恒远资本" | "恒远商学";
  name: string;
  services: string[];
  keywords: string[];
  signalIds: string[];
};

export type ServiceRoute = {
  unit: ServiceUnit;
  score: number;
  reasons: string[];
  matchedServices: string[];
};

export type ConsultantMatch = {
  consultant: ConsultantProfile;
  score: number;
  reasons: string[];
  routeUnit: string;
};

export type CaseProfile = {
  id: string;
  title: string;
  industry: string;
  scale: string;
  problemSignals: string[];
  unitIds: string[];
  solution: string;
  outcomes: Array<{ label: string; value: string }>;
  testimonial: string;
  fictional: true;
};

export type CaseMatch = {
  caseProfile: CaseProfile;
  similarity: number;
  reasons: string[];
  matchedSignals: string[];
};

export type ConsultingRouteResult = {
  routes: ServiceRoute[];
  cases: CaseMatch[];
  consultants: ConsultantMatch[];
  boundary: string;
};

export const serviceUnits: ServiceUnit[] = [
  {
    id: "strategy",
    wing: "恒远咨询",
    name: "企业战略规划（演示）",
    services: ["企业战略规划"],
    keywords: ["战略", "增长", "竞争", "商业模式", "集团", "行业", "决策"],
    signalIds: ["growth", "governance", "innovation"],
  },
  {
    id: "planning",
    wing: "恒远咨询",
    name: "企业和政府的五年规划（演示）",
    services: ["企业和政府的五年规划"],
    keywords: ["五年规划", "政府规划", "长期规划"],
    signalIds: ["growth", "governance"],
  },
  {
    id: "organization",
    wing: "恒远咨询",
    name: "组织、流程和管控（演示）",
    services: ["组织、流程和管控"],
    keywords: ["组织", "流程", "协同", "权责", "执行", "管控", "交付"],
    signalIds: ["coordination", "delivery", "change"],
  },
  {
    id: "people",
    wing: "恒远咨询",
    name: "人力资源和企业文化（演示）",
    services: ["人力资源和企业文化"],
    keywords: ["人力", "人才", "文化", "绩效", "激励", "管理者", "梯队"],
    signalIds: ["people", "change"],
  },
  {
    id: "market",
    wing: "恒远咨询",
    name: "品牌规划和营销咨询（演示）",
    services: ["品牌规划和营销咨询"],
    keywords: ["品牌", "营销", "客户", "销售", "定价", "获客", "增长"],
    signalIds: ["growth", "customer", "profit"],
  },
  {
    id: "operations",
    wing: "恒远咨询",
    name: "精益生产和供应链管理（演示）",
    services: ["精益生产和供应链管理"],
    keywords: ["交付", "质量", "供应链", "生产", "库存", "成本", "效率"],
    signalIds: ["delivery", "profit"],
  },
  {
    id: "digital",
    wing: "恒远咨询",
    name: "数字化转型和AI应用（演示）",
    services: ["数字化转型和AI应用"],
    keywords: ["数字", "数据", "系统", "AI", "信息", "流程"],
    signalIds: ["digital", "change"],
  },
  {
    id: "risk",
    wing: "恒远咨询",
    name: "内控、风险和合规管理（演示）",
    services: ["内控、风险和合规管理"],
    keywords: ["治理", "风险", "合规", "内控", "股权", "危机", "决策"],
    signalIds: ["governance"],
  },
  {
    id: "entrepreneur",
    wing: "恒远咨询",
    name: "科技创业咨询和辅导（演示）",
    services: ["科技创业咨询和辅导"],
    keywords: ["科技创业", "创业", "创新", "新业务", "商业化", "孵化"],
    signalIds: ["innovation", "growth"],
  },
  {
    id: "global",
    wing: "恒远咨询",
    name: "出海和全球化咨询（演示）",
    services: ["出海和全球化咨询"],
    keywords: ["出海", "全球化", "海外", "国际市场"],
    signalIds: ["growth", "governance"],
  },
  {
    id: "regional",
    wing: "恒远咨询",
    name: "区域经济和产业规划（演示）",
    services: ["区域经济和产业规划"],
    keywords: ["区域经济", "产业规划", "产业集群", "区域发展"],
    signalIds: ["growth", "governance"],
  },
  {
    id: "park",
    wing: "恒远咨询",
    name: "园区发展规划和运营管理（演示）",
    services: ["园区发展规划和运营管理"],
    keywords: ["园区", "园区运营", "招商", "产业园"],
    signalIds: ["growth", "delivery"],
  },
];

const eventServicePriority: Record<string, string[]> = {
  A01: ["market"],
  A02: ["market", "strategy"],
  A03: ["strategy", "market"],
  A04: ["organization"],
  A05: ["operations", "organization"],
  A06: ["organization", "risk"],
  A07: ["organization", "people"],
  A08: ["people"],
  A09: ["people", "organization"],
  A10: ["organization", "people"],
  A11: ["digital", "organization"],
  A12: ["entrepreneur", "strategy"],
  B01: ["strategy"],
  B02: ["strategy", "market"],
  B03: ["strategy", "entrepreneur"],
  B04: ["risk", "strategy"],
  B05: ["strategy", "risk"],
  B06: ["risk", "organization"],
  B07: ["organization", "strategy"],
  B08: ["organization", "people"],
  B09: ["people", "organization"],
  B10: ["organization", "risk"],
  B11: ["risk", "market"],
  B12: ["digital", "organization"],
  B13: ["entrepreneur", "strategy"],
  B14: ["risk", "strategy"],
};

export const fictionalConsultants: ConsultantProfile[] = [
  {
    id: "c01",
    name: "林知远",
    title: "资深战略顾问（虚拟）",
    base: "北京",
    years: 14,
    unitIds: ["strategy", "market"],
    specialties: ["增长战略", "商业模式", "集团战略解码"],
    industries: ["企业服务", "高新科技", "新消费"],
    methods: ["经营假设复盘", "增长路径组合", "战略解码工作坊"],
    availability: "预计 2 周内可启动访谈",
    fictional: true,
  },
  {
    id: "c02",
    name: "周睿",
    title: "组织与人效顾问（虚拟）",
    base: "上海",
    years: 11,
    unitIds: ["organization", "people"],
    specialties: ["组织设计", "权责机制", "绩效与人才梯队"],
    industries: ["专业服务", "制造业", "企业服务"],
    methods: ["责任地图", "决策权诊断", "关键岗位访谈"],
    availability: "预计 1 周内可安排初谈",
    fictional: true,
  },
  {
    id: "c03",
    name: "陈澜",
    title: "客户与品牌增长顾问（虚拟）",
    base: "深圳",
    years: 9,
    unitIds: ["market", "strategy"],
    specialties: ["客户洞察", "品牌定位", "产品与定价"],
    industries: ["新消费", "商业零售", "企业服务"],
    methods: ["客户流失访谈", "价值主张重构", "价格瀑布分析"],
    availability: "预计 2 周内可启动",
    fictional: true,
  },
  {
    id: "c04",
    name: "许衡",
    title: "精益运营顾问（虚拟）",
    base: "苏州",
    years: 16,
    unitIds: ["operations", "organization"],
    specialties: ["交付体系", "精益运营", "供应链与质量"],
    industries: ["制造业", "新能源", "工业科技"],
    methods: ["价值流分析", "现场诊断", "交付节拍重构"],
    availability: "预计 3 周内可驻场",
    fictional: true,
  },
  {
    id: "c05",
    name: "赵清越",
    title: "数字化经营顾问（虚拟）",
    base: "杭州",
    years: 10,
    unitIds: ["digital", "organization"],
    specialties: ["数字化转型", "AI应用", "数据化经营"],
    industries: ["企业服务", "零售与电商", "制造业"],
    methods: ["业务流程重构", "数据口径治理", "采纳机制设计"],
    availability: "预计 1 周内可进行线上初谈",
    fictional: true,
  },
  {
    id: "c06",
    name: "唐嘉禾",
    title: "资本与治理顾问（虚拟）",
    base: "北京",
    years: 15,
    unitIds: ["risk", "strategy"],
    specialties: ["融资规划", "公司治理", "并购整合"],
    industries: ["高新科技", "医药医疗", "制造业"],
    methods: ["资本结构复盘", "治理责任矩阵", "投融资情景分析"],
    availability: "预计 2 周内可安排初谈",
    fictional: true,
  },
];

export const fictionalCases: CaseProfile[] = [
  {
    id: "case01",
    title: "某成长型企业增长与交付协同改善",
    industry: "企业服务",
    scale: "约 120 人",
    problemSignals: ["growth", "customer", "coordination", "delivery"],
    unitIds: ["strategy", "market", "organization"],
    solution: "增长路径重构 + 客户分层 + 跨部门交付责任地图",
    outcomes: [
      { label: "销售转化率", value: "+22%" },
      { label: "按期交付率", value: "74% → 91%" },
      { label: "项目满意度", value: "9.2 / 10" },
    ],
    testimonial: "终于把增长、销售和交付放进了同一套经营语言。",
    fictional: true,
  },
  {
    id: "case02",
    title: "某制造企业交付与质量体系重构",
    industry: "制造业",
    scale: "约 650 人",
    problemSignals: ["delivery", "coordination", "profit", "people"],
    unitIds: ["operations", "organization"],
    solution: "价值流诊断 + 计划协同机制 + 现场质量闭环",
    outcomes: [
      { label: "交付周期", value: "-28%" },
      { label: "一次合格率", value: "+13pct" },
      { label: "客户好评率", value: "94%" },
    ],
    testimonial: "方案不是停在报告里，而是进入了每天的生产节拍。",
    fictional: true,
  },
  {
    id: "case03",
    title: "某零售企业数字化经营与复购提升",
    industry: "零售与电商",
    scale: "约 300 人",
    problemSignals: ["digital", "customer", "growth", "change"],
    unitIds: ["digital", "market", "organization"],
    solution: "会员数据治理 + CRM流程重构 + 一线采纳机制",
    outcomes: [
      { label: "会员复购率", value: "+18%" },
      { label: "有效触达率", value: "+31%" },
      { label: "管理层满意度", value: "9.0 / 10" },
    ],
    testimonial: "系统从IT项目变成了门店真正使用的经营工具。",
    fictional: true,
  },
  {
    id: "case04",
    title: "某科技企业创新项目商业化加速",
    industry: "高新科技",
    scale: "约 220 人",
    problemSignals: ["innovation", "growth", "governance", "profit"],
    unitIds: ["strategy", "entrepreneur", "risk"],
    solution: "创新组合分级 + 阶段门机制 + 商业验证与资本规划",
    outcomes: [
      { label: "试点转化率", value: "+26%" },
      { label: "无效项目退出", value: "7 项" },
      { label: "董事会满意度", value: "9.1 / 10" },
    ],
    testimonial: "第一次能用统一标准决定项目继续、暂停还是退出。",
    fictional: true,
  },
  {
    id: "case05",
    title: "某专业服务企业人才与绩效机制升级",
    industry: "专业服务",
    scale: "约 180 人",
    problemSignals: ["people", "coordination", "change"],
    unitIds: ["organization", "people"],
    solution: "关键岗位梳理 + 绩效反馈机制 + 管理者训练营",
    outcomes: [
      { label: "骨干保留率", value: "+17pct" },
      { label: "目标达成率", value: "+21%" },
      { label: "员工推荐度", value: "+19" },
    ],
    testimonial: "管理者开始真正承担反馈和人才发展的责任。",
    fictional: true,
  },
];

const normalizeIndustry = (industry: string) =>
  industry.replace(" / SaaS", "").replace("与电商", "");

export function routeConsultingServices(input: {
  industry: string;
  events: DiagnosticEvent[];
  mapping: ProblemMapping;
  primaryId?: string;
}): ConsultingRouteResult {
  const eventText = input.events
    .flatMap((event) => [event.name, event.direction, ...event.routes])
    .join(" ");
  const signalIds = new Set(input.mapping.signals.map((signal) => signal.id));
  const orderedEvents = [...input.events].sort((a, b) => {
    if (a.id === input.primaryId) return -1;
    if (b.id === input.primaryId) return 1;
    return 0;
  });
  const explicitPriority = orderedEvents.flatMap(
    (event) => eventServicePriority[event.id] ?? [],
  );
  const explicitRank = new Map<string, number>();
  explicitPriority.forEach((unitId, index) => {
    if (!explicitRank.has(unitId)) explicitRank.set(unitId, index);
  });

  const routes = serviceUnits
    .map((unit): ServiceRoute => {
      const keywordHits = unit.keywords.filter((keyword) =>
        eventText.includes(keyword),
      );
      const signalHits = unit.signalIds.filter((id) => signalIds.has(id));
      const priority = explicitRank.get(unit.id);
      const explicitScore =
        priority === undefined ? 0 : Math.max(12, 30 - priority * 4);
      const score = explicitScore + keywordHits.length * 2 + signalHits.length * 3;
      const reasons = [
        priority !== undefined
          ? `所选经营事件明确映射到“${unit.services[0]}”`
          : "未被当前经营事件列为优先业务",
        signalHits.length
          ? `企业自述包含${signalHits.length}类相关经营信号`
          : "企业自述尚无直接信号",
        keywordHits.length
          ? `所选事件与“${keywordHits.slice(0, 3).join("、")}”服务能力相连`
          : "需要通过访谈确认专业归属",
      ];
      return {
        unit,
        score,
        reasons,
        matchedServices: unit.services,
      };
    })
    .filter((route) => route.score > 0)
    .sort((a, b) => {
      const aRank = explicitRank.get(a.unit.id);
      const bRank = explicitRank.get(b.unit.id);
      if (aRank !== undefined || bRank !== undefined) {
        if (aRank === undefined) return 1;
        if (bRank === undefined) return -1;
        if (aRank !== bRank) return aRank - bRank;
      }
      return b.score - a.score;
    })
    .slice(0, 3);

  const fallbackRoutes = routes.length
    ? routes
    : serviceUnits
        .filter((unit) => unit.id === "strategy" || unit.id === "organization")
        .map((unit) => ({
          unit,
          score: 1,
          reasons: ["当前信息不足，建议先由综合诊断团队进行问题界定"],
          matchedServices: unit.services.slice(0, 1),
        }));

  const routeIds = new Set(fallbackRoutes.map((route) => route.unit.id));
  const industry = normalizeIndustry(input.industry);
  const cases = fictionalCases
    .map((caseProfile): CaseMatch => {
      const matchedSignals = caseProfile.problemSignals.filter((signal) =>
        signalIds.has(signal),
      );
      const matchedUnits = caseProfile.unitIds.filter((unitId) =>
        routeIds.has(unitId),
      );
      const industryMatch =
        caseProfile.industry.includes(industry) ||
        industry.includes(caseProfile.industry);
      const similarity = Math.min(
        96,
        48 +
          matchedSignals.length * 9 +
          matchedUnits.length * 7 +
          (industryMatch ? 8 : 0),
      );
      return {
        caseProfile,
        similarity,
        matchedSignals,
        reasons: [
          matchedSignals.length
            ? `${matchedSignals.length}类问题信号相似`
            : "问题信号仍需核验",
          matchedUnits.length
            ? `${matchedUnits.length}个建议业务单元重合`
            : "解决路径相似度有限",
          industryMatch ? "行业背景相近" : "跨行业机制案例",
        ],
      };
    })
    .filter((match) => match.matchedSignals.length || match.similarity >= 62)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  const consultants = fictionalConsultants
    .map((consultant): ConsultantMatch => {
      const matchedUnits = consultant.unitIds.filter((id) => routeIds.has(id));
      const matchesPrimaryRoute = consultant.unitIds.includes(
        fallbackRoutes[0]?.unit.id,
      );
      const industryMatch = consultant.industries.some(
        (item) => item.includes(industry) || industry.includes(item),
      );
      const route = fallbackRoutes.find((item) =>
        consultant.unitIds.includes(item.unit.id),
      );
      return {
        consultant,
        score:
          matchedUnits.length * 4 +
          (matchesPrimaryRoute ? 8 : 0) +
          (industryMatch ? 2 : 0),
        reasons: [
          matchesPrimaryRoute
            ? `专业方向直接覆盖首要业务“${fallbackRoutes[0].matchedServices[0]}”`
            : "专业方向覆盖次级候选业务",
          `专业方向覆盖${matchedUnits.length}个建议业务单元`,
          industryMatch
            ? `具有${input.industry}相关经验`
            : "行业经验需进一步核验",
        ],
        routeUnit: route?.unit.name ?? "综合诊断团队",
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    routes: fallbackRoutes,
    cases,
    consultants,
    boundary:
      "业务单元名称与咨询师资料均为原型演示；正式推荐还需接入恒远真实组织、顾问履历、项目冲突与档期数据。",
  };
}
