export type EventType = '增长停滞' | '利润承压' | '客户流失' | '交付延期' | '组织协同' | '人才流失' | '数字化低效' | '创新受阻'
export type V2View = 'cockpit' | 'facts' | 'questionnaire' | 'graph' | 'routes' | 'execution'
export type FactStatus = '企业自述' | '待验证' | '已验证' | '存在冲突'
export type BusinessFact = { id:number; type:'经营指标'|'业务事件'|'管理动作'|'人员变化'; name:string; value:string; comparison:string; period:string; status:FactStatus }

export const eventOptions: {name:EventType; description:string; icon:string}[] = [
  {name:'增长停滞',description:'收入增速下降、新客户减少或业务进入平台期',icon:'↗'},
  {name:'利润承压',description:'毛利下降、费用上升或现金流紧张',icon:'◒'},
  {name:'客户流失',description:'复购下降、投诉上升或重点客户离开',icon:'◎'},
  {name:'交付延期',description:'项目延期、返工增加或质量不稳定',icon:'◇'},
  {name:'组织协同',description:'决策缓慢、职责不清或跨部门阻塞',icon:'⌘'},
  {name:'人才流失',description:'关键岗位空缺、骨干离职或梯队不足',icon:'♙'},
  {name:'数字化低效',description:'系统很多但数据不通、决策仍靠手工',icon:'▦'},
  {name:'创新受阻',description:'试点多但落地少，新业务难以规模化',icon:'✦'},
]

export const seedFacts: BusinessFact[] = [
  {id:1,type:'经营指标',name:'老客户续约率',value:'68%',comparison:'较上期下降 12 个百分点',period:'2026 Q2',status:'企业自述'},
  {id:2,type:'业务事件',name:'重点项目延期',value:'3 个',comparison:'均涉及产品与交付协同',period:'近 90 天',status:'待验证'},
  {id:3,type:'经营指标',name:'新客户签约额',value:'+9%',comparison:'仍保持增长',period:'2026 H1',status:'企业自述'},
  {id:4,type:'管理动作',name:'交付流程调整',value:'已启动',comparison:'尚未设定效果指标',period:'2026-06',status:'待验证'},
]

export const routeSeeds = [
  {rank:1,name:'组织与交付流程专项',agent:'组织与人才 Agent',score:84,fit:'优先建议',reason:'客户流失与项目延期同时出现，新签约仍增长，问题更可能发生在承诺后的交付环节。',facts:['老客户续约率下降 12pp','近90天出现3个重点项目延期'],missing:'需要确认延期环节与责任边界',duration:'4—6 周'},
  {rank:2,name:'客户成功体系优化',agent:'战略与经营 Agent',score:71,fit:'备选路径',reason:'续约率下降可能与客户价值实现和服务节奏有关，需要结合流失客户原因进一步判断。',facts:['老客户续约率为68%','新客户签约额仍增长9%'],missing:'缺少客户流失原因分类',duration:'3—5 周'},
  {rank:3,name:'经营数据与项目治理',agent:'财务与效率 Agent',score:58,fit:'前置能力',reason:'已启动流程调整但没有效果指标，建议补齐项目周期、延期原因与改进结果的持续监控。',facts:['交付流程调整已启动','尚未设置效果指标'],missing:'缺少项目周期和返工趋势',duration:'2—4 周'},
]

export type RouteCandidate = {rank:number;name:string;agent:string;score:number;fit:string;reason:string;facts:string[];missing:string;duration:string}
export type EventPlaybook = {
  outcome:string; outcomeValue:string; hypotheses:string[]; causes:string[];
  actions:{title:string;description:string;factName:string;factType:BusinessFact['type']}[];
  routes:RouteCandidate[];
}

const route = (rank:number,name:string,agent:string,score:number,reason:string,facts:string[],missing:string,duration:string):RouteCandidate => ({rank,name,agent,score,fit:rank===1?'优先建议':rank===2?'备选路径':'前置能力',reason,facts,missing,duration})

export const eventPlaybooks: Record<EventType,EventPlaybook> = {
  '增长停滞':{
    outcome:'营业收入增速放缓',outcomeValue:'当前经营事件',hypotheses:['新客户获取不足','现有业务空间见顶'],causes:['市场定位与渠道效率下降','产品组合缺少新增长点'],
    actions:[{title:'拆分新客与老客的收入变化',description:'先判断增长问题来自获客、复购还是客单价。',factName:'新老客户收入结构',factType:'经营指标'},{title:'确认主要产品线增长贡献',description:'用于识别增长停滞集中在哪个产品或区域。',factName:'产品线增长贡献',factType:'经营指标'}],
    routes:[route(1,'增长战略与市场定位','战略与经营 Agent',86,'收入增速下降需要先识别目标市场、产品组合和增长来源，而不是直接扩大销售团队。',['营业收入增长放缓','新客户数量变化'], '缺少产品线和区域增长贡献','4—6 周'),route(2,'销售漏斗与渠道优化','市场销售 Agent',72,'如果产品需求仍然存在，线索获取和转化效率可能是主要约束。',['新客户数量变化','现有客户收入趋势'],'缺少各渠道转化率','3—5 周'),route(3,'产品组合与第二增长曲线','创新管理 Agent',61,'现有业务空间可能接近上限，需要评估新产品和新客群机会。',['收入增长趋势','核心产品集中度'],'缺少产品生命周期数据','6—8 周')]
  },
  '利润承压':{
    outcome:'利润与现金流承压',outcomeValue:'当前经营事件',hypotheses:['成本结构恶化','低质量收入增加'],causes:['采购与人工成本失控','定价和项目选择机制不足'],
    actions:[{title:'拆解毛利率下降来源',description:'区分采购、人工、价格和项目结构的影响。',factName:'毛利率变动拆解',factType:'经营指标'},{title:'补充现金转换周期',description:'确认利润问题是否已经传导到现金流。',factName:'现金转换周期',factType:'经营指标'}],
    routes:[route(1,'盈利能力与成本专项','财务与效率 Agent',88,'毛利和现金流需要按产品、客户与项目拆解，定位真正侵蚀利润的环节。',['毛利率变化','经营现金流状态'],'缺少分产品毛利数据','4—6 周'),route(2,'定价与产品组合优化','战略与经营 Agent',69,'如果成本没有显著异常，低价项目和产品组合可能是利润下降原因。',['利润压力来源','收入变化'],'缺少项目报价与实际成本','3—5 周'),route(3,'预算与经营分析体系','财务与效率 Agent',57,'需要建立持续监测而非一次性降本。',['现金流状态','改善周期'],'缺少预算偏差趋势','3—4 周')]
  },
  '客户流失':{
    outcome:'老客户续约或复购下降',outcomeValue:'当前经营事件',hypotheses:['客户价值实现不足','交付体验下降'],causes:['客户成功机制不完整','跨部门交付责任不清'],
    actions:[{title:'确认项目延期集中在哪个环节',description:'区分流程问题与客户成功问题。',factName:'重点项目延期环节',factType:'业务事件'},{title:'补充流失客户原因分类',description:'判断产品、价值和交付问题的权重。',factName:'流失客户原因分类',factType:'业务事件'}],
    routes:[route(1,'组织与交付流程专项','组织与人才 Agent',84,'客户流失与项目延期同时出现，问题更可能发生在承诺后的交付环节。',['续约率下降','重点项目延期'],'需要确认延期环节与责任边界','4—6 周'),route(2,'客户成功体系优化','战略与经营 Agent',71,'续约下降可能与客户价值实现和服务节奏有关。',['客户续约率','投诉趋势'],'缺少流失原因分类','3—5 周'),route(3,'客户经营数据体系','财务与效率 Agent',58,'需要持续监测续约、投诉与交付之间的关系。',['续约率趋势','投诉趋势'],'缺少客户分层数据','2—4 周')]
  },
  '交付延期':{
    outcome:'项目按期交付率下降',outcomeValue:'当前经营事件',hypotheses:['项目计划失真','跨部门资源阻塞'],causes:['需求与变更管理薄弱','项目预警和授权机制缺失'],
    actions:[{title:'定位延期最多的项目阶段',description:'确认需求、设计、审批、实施或验收哪个环节最慢。',factName:'延期阶段分布',factType:'业务事件'},{title:'补充项目变更和返工数据',description:'判断延期来自计划、资源还是返工。',factName:'项目变更与返工率',factType:'经营指标'}],
    routes:[route(1,'项目交付体系优化','组织与人才 Agent',89,'延期需要从项目阶段、变更和资源冲突建立完整闭环。',['按期交付率','延期主要环节'],'缺少项目周期明细','4—6 周'),route(2,'流程与授权优化','组织与人才 Agent',73,'内部审批和跨部门决策可能放大交付周期。',['延期环节','项目预警机制'],'缺少审批耗时数据','3—5 周'),route(3,'项目经营数据建设','财务与效率 Agent',59,'需要统一计划、成本、进度与质量指标。',['返工趋势','按期交付率'],'缺少项目基准数据','3—4 周')]
  },
  '组织协同':{
    outcome:'跨部门决策与执行受阻',outcomeValue:'当前经营事件',hypotheses:['职责边界不清','决策授权不足'],causes:['组织设计与业务流程脱节','目标和责任缺少共同机制'],
    actions:[{title:'记录三个最近的协同阻塞案例',description:'用真实业务事件定位职责和决策问题。',factName:'跨部门阻塞案例',factType:'业务事件'},{title:'确认高频审批的实际耗时',description:'识别授权不足还是流程冗余。',factName:'高频审批周期',factType:'经营指标'}],
    routes:[route(1,'组织权责与协同机制','组织与人才 Agent',91,'协同问题需要围绕真实业务流程重新明确权责和决策机制。',['决策周期','阻塞频率'],'缺少典型阻塞案例','4—6 周'),route(2,'战略解码与目标协同','战略与经营 Agent',68,'部门目标不一致可能导致持续拉扯。',['协同影响结果','职责阻塞频率'],'缺少部门目标样本','3—5 周'),route(3,'核心流程再设计','组织与人才 Agent',62,'如果职责清晰但仍低效，应进一步改造跨部门流程。',['授权清单状态','决策周期'],'缺少流程节点数据','4—6 周')]
  },
  '人才流失':{
    outcome:'关键人才与组织能力流失',outcomeValue:'当前经营事件',hypotheses:['激励与回报失配','成长和管理体验不足'],causes:['绩效薪酬机制缺少竞争力','管理者和人才发展机制薄弱'],
    actions:[{title:'拆分主动离职人员结构',description:'判断流失是否集中在关键岗位、司龄或团队。',factName:'离职人员结构',factType:'人员变化'},{title:'补充离职原因与管理者分布',description:'区分薪酬、发展与管理问题。',factName:'离职原因分布',factType:'人员变化'}],
    routes:[route(1,'人才保留与激励机制','组织与人才 Agent',87,'离职率和关键岗位空缺需要结合薪酬、绩效与成长路径分析。',['员工离职率','关键岗位空缺'],'缺少关键人才离职结构','4—6 周'),route(2,'管理者能力与组织氛围','组织与人才 Agent',70,'若离职集中在特定团队，管理体验可能是主要因素。',['主要离职原因','人才梯队状态'],'缺少团队维度离职率','4—6 周'),route(3,'关键岗位与人才梯队','组织与人才 Agent',64,'继任不足会放大离职对经营的影响。',['关键岗位空缺','继任者覆盖'],'缺少岗位风险等级','3—5 周')]
  },
  '数字化低效':{
    outcome:'数字化投入未转化为经营效率',outcomeValue:'当前经营事件',hypotheses:['流程未先标准化','数据与系统割裂'],causes:['业务流程和系统设计不匹配','数据治理与使用机制缺失'],
    actions:[{title:'选择一个高频流程做系统穿行',description:'比较系统设计与实际操作路径。',factName:'高频流程系统穿行',factType:'管理动作'},{title:'统计核心报表人工处理时间',description:'量化数据割裂造成的效率损失。',factName:'报表人工处理时间',factType:'经营指标'}],
    routes:[route(1,'数字化流程与数据诊断','财务与效率 Agent',88,'先识别流程、数据和系统之间的错配，再决定是否继续投入系统。',['系统实际使用','经营报表方式'],'缺少典型流程穿行记录','4—6 周'),route(2,'数据治理与经营驾驶舱','财务与效率 Agent',74,'数据口径不一致会直接限制经营分析。',['数据口径状态','报表方式'],'缺少核心指标口径清单','4—5 周'),route(3,'数字化采纳与变革管理','组织与人才 Agent',60,'如果系统能力足够，员工使用和管理推动可能是主要障碍。',['系统使用情况','数字化核心障碍'],'缺少用户使用率','3—4 周')]
  },
  '创新受阻':{
    outcome:'创新项目难以落地和规模化',outcomeValue:'当前经营事件',hypotheses:['创新方向与业务脱节','项目转化机制薄弱'],causes:['缺少组合管理和阶段评审','资源、激励与商业化责任不清'],
    actions:[{title:'梳理创新项目所处阶段',description:'识别项目集中在想法、试点还是商业化阶段。',factName:'创新项目阶段分布',factType:'业务事件'},{title:'补充近一年终止项目原因',description:'判断主要阻塞来自方向、资源还是决策。',factName:'创新项目终止原因',factType:'业务事件'}],
    routes:[route(1,'创新组合与转化机制','战略与经营 Agent',86,'需要建立从机会、试点到规模化的阶段门和资源配置。',['创新项目数量','项目落地比例'],'缺少项目阶段分布','5—7 周'),route(2,'新业务商业化验证','创新管理 Agent',73,'落地率低可能来自客户价值和商业模式未验证。',['项目落地比例','主要阻塞'],'缺少试点客户结果','4—6 周'),route(3,'创新组织与激励机制','组织与人才 Agent',61,'决策、资源和容错机制会影响团队持续创新。',['阶段评审机制','主要阻塞'],'缺少创新激励和资源数据','3—5 周')]
  },
}
