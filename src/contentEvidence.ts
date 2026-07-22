export type EvidenceField = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
};

export type ContentEvidenceSchema = {
  questionId: number;
  type: "专业判断" | "制度核验" | "案例穿行" | "经营数据" | "多人感知";
  title: string;
  instruction: string;
  fields: EvidenceField[];
  analysis: string[];
  boundary: string;
};

export const contentEvidenceSchemas: Partial<
  Record<number, ContentEvidenceSchema>
> = {
  2: {
    questionId: 2,
    type: "专业判断",
    title: "核心竞争资源证据矩阵",
    instruction:
      "不要只判断资源是否领先。请说明资源、客户价值和竞争者难以复制的原因。",
    fields: [
      {
        id: "resource",
        label: "核心资源是什么",
        placeholder: "例如：行业数据、关键渠道、专利组合或客户网络",
        required: true,
      },
      {
        id: "customer_value",
        label: "它为客户创造什么价值",
        placeholder: "客户为什么会因此选择或继续选择公司",
        required: true,
        multiline: true,
      },
      {
        id: "proof",
        label: "可核验的竞争证据",
        placeholder: "客户反馈、赢单原因、价格溢价、市场份额或竞争者对比",
        multiline: true,
      },
    ],
    analysis: [
      "资源是否具体",
      "客户价值链是否成立",
      "稀缺性与可复制性证据是否充分",
    ],
    boundary:
      "没有客户或竞争证据时，只能形成资源假设，不能确认构成持续竞争优势。",
  },
  5: {
    questionId: 5,
    type: "专业判断",
    title: "商业模式一致性分析",
    instruction: "分别描述客群、价值和盈利来源，用于检查内部认知是否连贯。",
    fields: [
      {
        id: "customer",
        label: "主要服务谁",
        placeholder: "最核心的客户群体",
        required: true,
      },
      {
        id: "value",
        label: "解决什么关键问题",
        placeholder: "客户愿意付费的核心价值",
        required: true,
        multiline: true,
      },
      {
        id: "revenue",
        label: "收入与利润从哪里产生",
        placeholder: "主要收费方式、收入来源与利润来源",
        required: true,
        multiline: true,
      },
    ],
    analysis: [
      "客群与价值是否匹配",
      "价值与收入来源是否闭环",
      "是否存在依赖单一机会的信号",
    ],
    boundary: "文字一致不等于商业模式有效，仍需收入结构、毛利和客户行为验证。",
  },
  6: {
    questionId: 6,
    type: "案例穿行",
    title: "重大决策案例穿行",
    instruction: "选择最近一次真实重大决策，重建信息、讨论、决定和复盘过程。",
    fields: [
      {
        id: "decision",
        label: "决策事项",
        placeholder: "例如：新业务投资、组织调整或关键人事任命",
        required: true,
      },
      {
        id: "participants",
        label: "谁参与、谁最终决定",
        placeholder: "列出提出者、讨论者、决定者和执行责任人",
        required: true,
        multiline: true,
      },
      {
        id: "process",
        label: "用了什么信息、耗时多久、是否复盘",
        placeholder: "说明关键数据、等待点、最终耗时与后续复盘",
        multiline: true,
      },
    ],
    analysis: [
      "治理角色是否清晰",
      "信息输入是否充分",
      "决策权与执行责任是否匹配",
    ],
    boundary:
      "单个案例只用于发现机制线索，需要多个案例或治理文件才能确认稳定模式。",
  },
  9: {
    questionId: 9,
    type: "制度核验",
    title: "授权边界与例外分析",
    instruction: "用一项真实审批说明制度规定和实际执行是否一致。",
    fields: [
      {
        id: "matter",
        label: "事项与制度规定",
        placeholder: "事项类型、规定审批人和授权额度",
        required: true,
        multiline: true,
      },
      {
        id: "actual",
        label: "实际如何完成",
        placeholder: "真实经过哪些人、是否越级或特批、耗时多久",
        required: true,
        multiline: true,
      },
      {
        id: "exception",
        label: "最近一次例外及原因",
        placeholder: "没有例外可填写“无”",
        multiline: true,
      },
    ],
    analysis: [
      "制度权责是否明确",
      "例外是否成为常态",
      "审批层级与风险是否匹配",
    ],
    boundary: "仅提供制度表述不能证明制度被执行，应与审批记录或案例交叉核验。",
  },
  10: {
    questionId: 10,
    type: "案例穿行",
    title: "关键流程穿行",
    instruction: "选择一条真实核心流程，定位责任、等待和返工发生在哪里。",
    fields: [
      {
        id: "flow",
        label: "流程起点、终点与负责人",
        placeholder: "例如：从合同申请到盖章完成；流程负责人为法务负责人",
        required: true,
        multiline: true,
      },
      {
        id: "steps",
        label: "涉及部门与关键节点",
        placeholder: "按实际顺序列出主要步骤和责任人",
        required: true,
        multiline: true,
      },
      {
        id: "bottleneck",
        label: "最近一次卡点、返工或等待",
        placeholder: "发生在哪里、持续多久、造成什么业务影响",
        required: true,
        multiline: true,
      },
    ],
    analysis: [
      "流程所有者是否明确",
      "跨部门交接是否形成等待",
      "制度流程与真实流程是否一致",
    ],
    boundary: "流程图完整不代表执行有效，仍需周期、返工和系统日志验证。",
  },
  29: {
    questionId: 29,
    type: "经营数据",
    title: "数据参与决策案例",
    instruction: "用最近一次经营决策说明数据是否真正进入管理过程。",
    fields: [
      {
        id: "decision",
        label: "最近一次数据支持的决策",
        placeholder: "例如：调整价格、库存、渠道投入或人员配置",
        required: true,
      },
      {
        id: "data",
        label: "使用了哪些数据和口径",
        placeholder: "数据来源、统计周期、更新时间和负责人",
        required: true,
        multiline: true,
      },
      {
        id: "effect",
        label: "数据如何改变了决定",
        placeholder: "如果没有改变，请说明数据只用于汇报还是实际决策",
        multiline: true,
      },
    ],
    analysis: [
      "数据口径是否可追溯",
      "数据时效是否匹配决策",
      "数据是否改变行动而非只用于展示",
    ],
    boundary:
      "有报表或系统不等于数据驱动，应检查数据是否实际改变了资源配置或行动。",
  },
  41: {
    questionId: 41,
    type: "多人感知",
    title: "跨部门协作案例",
    instruction: "管理者案例只能作为线索，后续还需不同层级员工的匿名感知数据。",
    fields: [
      {
        id: "case",
        label: "最近一次跨部门协作事项",
        placeholder: "事项、参与部门、共同目标和最终结果",
        required: true,
        multiline: true,
      },
      {
        id: "conflict",
        label: "分歧或摩擦发生在哪里",
        placeholder: "目标、资源、责任、信息或评价机制",
        required: true,
        multiline: true,
      },
      {
        id: "voices",
        label: "其他参与者可能如何描述",
        placeholder: "记录不同部门对同一事件的说法差异",
        multiline: true,
      },
    ],
    analysis: [
      "是否存在共同目标",
      "部门边界与依赖是否合理",
      "不同角色叙述是否一致",
    ],
    boundary:
      "不能由单一管理者代表组织氛围，正式判断需要多人匿名数据和样本说明。",
  },
  56: {
    questionId: 56,
    type: "案例穿行",
    title: "具体变革案例分析",
    instruction: "绑定一次具体变革，分析利益相关者、阻力和推进方式。",
    fields: [
      {
        id: "change",
        label: "变革是什么、为什么发生",
        placeholder: "变革目标、时间和预期业务结果",
        required: true,
        multiline: true,
      },
      {
        id: "stakeholders",
        label: "谁受到影响、谁支持或抵触",
        placeholder: "关键群体、利益变化和具体行为表现",
        required: true,
        multiline: true,
      },
      {
        id: "actions",
        label: "采取了哪些沟通、试点与调整",
        placeholder: "说明做法、反馈和当前结果",
        required: true,
        multiline: true,
      },
    ],
    analysis: [
      "变革理由是否形成共识",
      "关键利益相关者是否被识别",
      "反馈是否真正改变推进方式",
    ],
    boundary: "变革准备度必须针对具体变革判断，不能泛化为企业永久能力。",
  },
};

export const getContentEvidenceSchema = (questionId: number) =>
  contentEvidenceSchemas[questionId];
