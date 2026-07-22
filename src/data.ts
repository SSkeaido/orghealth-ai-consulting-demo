export type Dimension = '顶层设计' | '效能提升' | '产融互动' | '企业文化' | '创新驱动'
export type DiagnosticModule = { id: number; dimension: Dimension; name: string; items: number; score: number | null; evidence: number; status: '未开始' | '取证中' | '待复核' | '已完成'; prompt: string }

export const modules: DiagnosticModule[] = [
  { id:1, dimension:'顶层设计', name:'发展机遇与赛道选择', items:2, score:4.0, evidence:5, status:'已完成', prompt:'企业是否基于行业阶段、需求变化和竞争格局选择了合适的赛道？' },
  { id:2, dimension:'顶层设计', name:'战略规划与商业模式', items:3, score:3.3, evidence:6, status:'待复核', prompt:'战略是否清晰、可分解，并形成稳定可解释的盈利逻辑？' },
  { id:3, dimension:'顶层设计', name:'公司治理与股权激励', items:2, score:2.5, evidence:3, status:'取证中', prompt:'治理、授权和激励机制是否支持长期决策与经营效率？' },
  { id:4, dimension:'效能提升', name:'组织管理与流程优化', items:3, score:2.7, evidence:4, status:'取证中', prompt:'组织职责、权责边界和关键流程是否清晰有效？' },
  { id:5, dimension:'效能提升', name:'人力资源与人才发展', items:5, score:3.1, evidence:8, status:'待复核', prompt:'人才规划、招聘、激励、绩效和梯队是否与战略匹配？' },
  { id:6, dimension:'效能提升', name:'精益生产与智能制造', items:4, score:null, evidence:0, status:'未开始', prompt:'生产、质量、库存和现场数字化是否持续改善？' },
  { id:7, dimension:'效能提升', name:'市场营销与品牌管理', items:5, score:3.6, evidence:7, status:'已完成', prompt:'市场洞察、产品定位、渠道、销售和品牌是否形成增长闭环？' },
  { id:8, dimension:'效能提升', name:'财税管理与合规风控', items:3, score:4.1, evidence:6, status:'已完成', prompt:'预算、财税、合同和风险管理是否可控且有记录？' },
  { id:9, dimension:'效能提升', name:'数字信息与智慧赋能', items:2, score:2.2, evidence:3, status:'取证中', prompt:'系统、数据和报表是否真正服务经营决策？' },
  { id:10, dimension:'效能提升', name:'执行力系统', items:3, score:2.8, evidence:4, status:'待复核', prompt:'目标、督办、反馈和复盘是否形成执行闭环？' },
  { id:11, dimension:'产融互动', name:'资本规划与企业融资', items:2, score:null, evidence:1, status:'未开始', prompt:'资本结构和融资规划是否匹配发展阶段？' },
  { id:12, dimension:'产融互动', name:'资本运营与并购重组', items:2, score:null, evidence:0, status:'未开始', prompt:'投资并购是否有明确策略、尽调和投后机制？' },
  { id:13, dimension:'产融互动', name:'企业上市与市值管理', items:2, score:null, evidence:0, status:'未开始', prompt:'上市规划和规范治理是否与企业阶段相匹配？' },
  { id:14, dimension:'企业文化', name:'企业文化体系', items:5, score:3.0, evidence:7, status:'取证中', prompt:'文化是否从口号转化为行为、奖惩和真实组织体验？' },
  { id:15, dimension:'创新驱动', name:'创新战略与资源保障', items:2, score:2.4, evidence:3, status:'取证中', prompt:'创新是否有清晰方向、预算、组织和决策机制？' },
  { id:16, dimension:'创新驱动', name:'产品、技术与服务创新', items:3, score:3.2, evidence:5, status:'待复核', prompt:'创新项目是否持续产生产品、技术或客户体验成果？' },
  { id:17, dimension:'创新驱动', name:'商业模式与生态协同创新', items:3, score:2.0, evidence:2, status:'取证中', prompt:'新业务试点、伙伴协同和模式复盘是否持续发生？' },
  { id:18, dimension:'创新驱动', name:'组织流程、激励与变革管理', items:5, score:2.6, evidence:4, status:'取证中', prompt:'流程、组织、激励与容错机制是否支持变革落地？' },
]

export const dimensionOrder: Dimension[] = ['顶层设计','效能提升','产融互动','企业文化','创新驱动']
