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
  wing: "和君咨询" | "和君资本" | "和君商学";
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
    wing: "和君咨询",
    name: "战略与集团管控业务单元（演示）",
    services: ["企业战略规划", "集团战略与集团管控", "商业模式重构"],
    keywords: ["战略", "增长", "竞争", "商业模式", "集团", "行业", "决策"],
    signalIds: ["growth", "governance", "innovation"],
  },
  {
    id: "organization",
    wing: "和君咨询",
    name: "组织、流程与人效业务单元（演示）",
    services: ["组织、流程和管控", "人效提升", "人才发展与企业大学"],
    keywords: ["组织", "流程", "协同", "权责", "执行", "人才", "绩效", "交付"],
    signalIds: ["coordination", "people", "delivery", "change"],
  },
  {
    id: "market",
    wing: "和君咨询",
    name: "品牌、营销与客户增长业务单元（演示）",
    services: ["品牌规划和营销咨询", "客户价值与增长路径", "产品与定价优化"],
    keywords: ["品牌", "营销", "客户", "销售", "定价", "获客", "增长"],
    signalIds: ["growth", "customer", "profit"],
  },
  {
    id: "operations",
    wing: "和君咨询",
    name: "精益运营与供应链业务单元（演示）",
    services: ["精益生产和供应链管理", "交付体系优化", "质量与运营改善"],
    keywords: ["交付", "质量", "供应链", "生产", "库存", "成本", "效率"],
    signalIds: ["delivery", "profit"],
  },
  {
    id: "digital",
    wing: "和君咨询",
    name: "数字化转型与 AI 应用业务单元（演示）",
    services: ["数字化转型和AI应用", "数据化经营机制", "流程数字化重构"],
    keywords: ["数字", "数据", "系统", "AI", "信息", "流程"],
    signalIds: ["digital", "change"],
  },
  {
    id: "risk",
    wing: "和君咨询",
    name: "内控、风险与治理业务单元（演示）",
    services: ["内控、风险和合规管理", "公司治理和股权结构设计", "危机治理"],
    keywords: ["治理", "风险", "合规", "内控", "股权", "危机", "决策"],
    signalIds: ["governance"],
  },
  {
    id: "capital",
    wing: "和君资本",
    name: "资本运作与融资业务单元（演示）",
    services: ["融资顾问", "企业资本运作总体规划", "并购重组与战略投资"],
    keywords: ["资本", "融资", "现金", "并购", "投资", "上市", "股权"],
    signalIds: ["profit", "governance"],
  },
  {
    id: "academy",
    wing: "和君商学",
    name: "企业培训与人才培养业务单元（演示）",
    services: ["企业定制化培训", "管理者培养", "企业大学与人才梯队"],
    keywords: ["培训", "人才", "管理者", "能力", "文化", "梯队"],
    signalIds: ["people", "change"],
  },
];

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
    unitIds: ["organization", "academy"],
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
    unitIds: ["capital", "risk"],
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
    unitIds: ["strategy", "capital", "risk"],
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
    unitIds: ["organization", "academy"],
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
}): ConsultingRouteResult {
  const eventText = input.events
    .flatMap((event) => [event.name, event.direction, ...event.routes])
    .join(" ");
  const signalIds = new Set(input.mapping.signals.map((signal) => signal.id));

  const routes = serviceUnits
    .map((unit): ServiceRoute => {
      const keywordHits = unit.keywords.filter((keyword) =>
        eventText.includes(keyword),
      );
      const signalHits = unit.signalIds.filter((id) => signalIds.has(id));
      const score = keywordHits.length * 2 + signalHits.length * 3;
      const reasons = [
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
        matchedServices: unit.services.slice(0, 2),
      };
    })
    .filter((route) => route.score > 0)
    .sort((a, b) => b.score - a.score)
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
      const industryMatch = consultant.industries.some(
        (item) => item.includes(industry) || industry.includes(item),
      );
      const route = fallbackRoutes.find((item) =>
        consultant.unitIds.includes(item.unit.id),
      );
      return {
        consultant,
        score: matchedUnits.length * 4 + (industryMatch ? 2 : 0),
        reasons: [
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
      "业务单元名称与咨询师资料均为原型演示；正式推荐还需接入和君真实组织、顾问履历、项目冲突与档期数据。",
  };
}
