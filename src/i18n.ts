import type {
  DataBundle,
  EndingDefinition,
  IntelCard,
  InterventionCard,
  TimelineTurn,
  VariableDefinition,
} from "./types";

export type Language = "zh" | "en";

export const languageLabels: Record<Language, string> = {
  zh: "中文",
  en: "English",
};

export const uiText = {
  zh: {
    loading: "正在读取 1914 案件数据...",
    loadFailed: "数据加载失败",
    caseTitle: "Case 001：1914 七月危机",
    risk: "风险",
    controllable: "可控",
    dangerous: "危险",
    criticalEscalation: "临界升级",
    crisisStage: "危机阶段",
    exportState: "导出 GameState JSON",
    restart: "重新开始",
    enableAudio: "启用音频",
    music: "音乐",
    sfx: "音效",
    musicVolume: "音乐音量",
    sfxVolume: "音效音量",
    timeline: "时间线",
    variables: "变量",
    currentEvent: "BREAKPOINT / 当前事件",
    causalGraph: "因果链 MVP",
    flags: "系统标记",
    upcoming: "即将发生",
    opportunityCost: "未处理风险",
    noOpportunityCost: "当前没有突出的未处理风险。",
    irreversible: "不可逆节点已触发",
    intelTray: "当前回合情报",
    read: "已阅读",
    sealed: "封存",
    unlock: "解锁",
    interventionTray: "可用干预",
    advanceTime: "推进时间",
    feasibility: "可行性",
    window: "窗口",
    lockReason: "锁定原因",
    expiring: "本回合后窗口关闭",
    missed: "已错过",
    requirementCheck: "条件检查",
    riskCount: "风险",
    cancel: "取消",
    useCard: "确认用卡",
    effects: "效果",
    backlash: "潜在反噬",
    noBacklash: "无显性反噬。",
    revealedVariables: "揭示变量",
    unlockedCards: "解锁卡牌",
    none: "无",
    variableChanges: "变量变化",
    noTriggered: "未触发。",
    flagsAdded: "新增标记",
    endingReport: "历史事故报告",
    rating: "评级",
    credibility: "可信度",
    finalVariables: "最终变量",
    keyActions: "关键行动日志",
    noInterventions: "未使用干预卡。",
    turn: "第",
    turnSuffix: "回合",
    noVariableChanges: "无变量变化",
    shareLine: "分享句",
    reportStatus: "报告状态",
    archived: "已归档",
    executiveSummary: "执行摘要",
    keyCausalChain: "关键因果链",
    endingAnalysis: "失控 / 稳定分析",
    historicalCredibility: "历史可信度",
    playerStyle: "调试员风格",
    shareCard: "分享卡",
    copySummary: "复制摘要",
    saveShareCard: "保存分享卡",
    fullLog: "查看完整日志",
    hideFullLog: "收起完整日志",
    finalWarProbability: "最终全面战争概率",
    residualRisks: "残余风险",
    primaryFactors: "主要因素",
    reportCreatedAt: "生成时间",
    advanceConfirm: "推进时间确认",
    advanceHint: "在点击推进时间前，你应该知道自己正在放弃哪些可能性。",
    currentTurn: "当前回合",
    unusedAp: "未使用 AP",
    willHappen: "推进后将发生",
    specialRules: "可能触发的特殊规则",
    keyEvents: "即将触发的关键事件",
    noFutureEvents: "暂无未来事件。",
    closingWindows: "即将关闭的行动窗口",
    noClosingWindows: "本回合没有可见卡牌窗口关闭。",
    confirmAdvance: "确认推进时间",
    timeReport: "时间推进报告",
    pressureChanges: "历史压力变化",
    specialOrIrreversible: "特殊规则 / 不可逆节点",
    expiredCards: "失效卡牌",
    noExpiredCards: "本次推进没有新的可见卡牌失效。",
    briefingRisks: "本回合主要风险",
    noMajorRisks: "暂无突出风险。",
    upcomingEvents: "即将触发事件",
    possiblyExpire: "本回合可能失效",
    noExpireThisTurn: "没有可见卡牌将在本回合后失效。",
    language: "语言",
    turnsAfter: "回合后",
  },
  en: {
    loading: "Loading 1914 case data...",
    loadFailed: "Failed to load data",
    caseTitle: "Case 001: July Crisis, 1914",
    risk: "Risk",
    controllable: "Controlled",
    dangerous: "Danger",
    criticalEscalation: "Critical",
    crisisStage: "Crisis Stage",
    exportState: "Export GameState JSON",
    restart: "Restart",
    enableAudio: "Enable Audio",
    music: "Music",
    sfx: "SFX",
    musicVolume: "Music volume",
    sfxVolume: "SFX volume",
    timeline: "Timeline",
    variables: "Variables",
    currentEvent: "BREAKPOINT / Current Event",
    causalGraph: "Causal Chain MVP",
    flags: "System Flags",
    upcoming: "Upcoming",
    opportunityCost: "Unresolved Threats",
    noOpportunityCost: "No major unresolved threat right now.",
    irreversible: "Irreversible Node Triggered",
    intelTray: "Current Turn Intel",
    read: "Read",
    sealed: "Sealed",
    unlock: "Unlocks",
    interventionTray: "Available Interventions",
    advanceTime: "Advance Time",
    feasibility: "Feasibility",
    window: "Window",
    lockReason: "Locked",
    expiring: "Window closes after this turn",
    missed: "Missed",
    requirementCheck: "Requirement Check",
    riskCount: "Risk",
    cancel: "Cancel",
    useCard: "Use Card",
    effects: "Effects",
    backlash: "Potential Backlash",
    noBacklash: "No explicit backlash.",
    revealedVariables: "Revealed variables",
    unlockedCards: "Unlocked cards",
    none: "None",
    variableChanges: "Variable Changes",
    noTriggered: "Not triggered.",
    flagsAdded: "New flags",
    endingReport: "Historical Incident Report",
    rating: "Rating",
    credibility: "Credibility",
    finalVariables: "Final Variables",
    keyActions: "Key Action Log",
    noInterventions: "No intervention cards used.",
    turn: "Turn",
    turnSuffix: "",
    noVariableChanges: "No variable changes",
    shareLine: "Share Line",
    reportStatus: "Report Status",
    archived: "Archived",
    executiveSummary: "Executive Summary",
    keyCausalChain: "Key Causal Chain",
    endingAnalysis: "Failure / Stability Analysis",
    historicalCredibility: "Historical Credibility",
    playerStyle: "Debugger Style",
    shareCard: "Share Card",
    copySummary: "Copy Summary",
    saveShareCard: "Save Share Card",
    fullLog: "View Full Log",
    hideFullLog: "Hide Full Log",
    finalWarProbability: "Final Total War Probability",
    residualRisks: "Residual Risks",
    primaryFactors: "Primary Factors",
    reportCreatedAt: "Created At",
    advanceConfirm: "Confirm Time Advance",
    advanceHint: "Before advancing time, understand which possibilities you are giving up.",
    currentTurn: "Current Turn",
    unusedAp: "Unused AP",
    willHappen: "After Advancing",
    specialRules: "Possible Special Rules",
    keyEvents: "Upcoming Key Events",
    noFutureEvents: "No future events.",
    closingWindows: "Action Windows Closing Soon",
    noClosingWindows: "No visible card window closes this turn.",
    confirmAdvance: "Advance Time",
    timeReport: "Time Advance Report",
    pressureChanges: "Historical Pressure Changes",
    specialOrIrreversible: "Special Rules / Irreversible Nodes",
    expiredCards: "Expired Cards",
    noExpiredCards: "No newly visible card expired after this advance.",
    briefingRisks: "Main Risks This Turn",
    noMajorRisks: "No major risk right now.",
    upcomingEvents: "Upcoming Events",
    possiblyExpire: "May Expire This Turn",
    noExpireThisTurn: "No visible card will expire after this turn.",
    language: "Language",
    turnsAfter: "turns later",
  },
} as const;

const variableEn: Record<string, string> = {
  war_probability: "Total War Probability",
  austrian_hardline: "Austro-Hungarian Hardline",
  serbian_compromise: "Serbian Compromise",
  german_risk_perception: "German Risk Perception",
  russian_mobilization_pressure: "Russian Mobilization Pressure",
  franco_russian_coordination: "Franco-Russian Coordination",
  british_redline_clarity: "British Red-Line Clarity",
  alliance_lock_in: "Alliance Lock-In",
  military_timetable_rigidity: "Military Timetable Rigidity",
  nationalist_pressure: "Nationalist Pressure",
  diplomatic_trust: "Diplomatic Trust",
  media_agitation: "Media Agitation",
};

const variableZh: Record<string, string> = {
  war_probability: "全面战争概率",
  austrian_hardline: "奥匈强硬度",
  serbian_compromise: "塞尔维亚妥协度",
  german_risk_perception: "德国风险判断",
  russian_mobilization_pressure: "俄国动员压力",
  franco_russian_coordination: "法俄协调度",
  british_redline_clarity: "英国红线清晰度",
  alliance_lock_in: "联盟锁定度",
  military_timetable_rigidity: "军事时间表刚性",
  nationalist_pressure: "民族主义压力",
  diplomatic_trust: "外交信任度",
  media_agitation: "媒体煽动度",
};

const typeEn: Record<string, string> = {
  diplomacy: "Diplomacy",
  military: "Military",
  media: "Media",
  judicial: "Judicial",
  intelligence: "Intelligence",
  institutional: "Institutional",
  domestic_politics: "Domestic Politics",
  symbolic_politics: "Symbolic Politics",
  international_law: "International Law",
  crisis_management: "Crisis Management",
  war_aims: "War Aims",
  backlash: "Backlash",
};

const typeZh: Record<string, string> = {
  diplomacy: "外交",
  military: "军事",
  media: "媒体",
  judicial: "司法",
  intelligence: "情报",
  institutional: "制度",
  domestic_politics: "国内政治",
  symbolic_politics: "象征政治",
  international_law: "国际法",
  crisis_management: "危机管理",
  war_aims: "战争目标",
  backlash: "反噬",
};

const flagEn: Record<string, string> = {
  ultimatum_harshness: "Ultimatum Harshness",
  limited_victory_possible: "Limited Victory Possible",
  russian_general_mobilization: "Russian General Mobilization",
  germany_invaded_belgium: "Germany Invaded Belgium",
};

const flagZh: Record<string, string> = {
  ultimatum_harshness: "最后通牒强硬化",
  limited_victory_possible: "有限胜利可包装",
  russian_general_mobilization: "俄国总动员",
  germany_invaded_belgium: "德国入侵比利时",
};

const timelineEn: Record<number, Partial<TimelineTurn>> = {
  1: { title: "The Spark Falls", narrative: "The assassination is not an isolated incident. The danger lies in how political systems interpret and use it.", goalHint: "You are not facing one assassination, but the way a system turns assassination into policy." },
  2: { title: "The Ally's Promise", narrative: "A promise without limits can become fuel for escalation.", goalHint: "If allied support has no boundary, it becomes crisis fuel." },
  3: { title: "War in the Text", narrative: "A diplomatic text can become a battlefield before any army moves.", goalHint: "Diplomatic language is not wordplay. Every unacceptable clause is a path toward mobilization." },
  4: { title: "Newspapers Move Faster Than Diplomats", narrative: "Public emotion is beginning to outrun negotiation.", goalHint: "When compromise is framed as cowardice, diplomats lose room to maneuver." },
  5: { title: "The Countdown Begins", narrative: "Time itself has become an enemy.", goalHint: "You must now buy hours, not goodwill." },
  6: { title: "How Much Acceptance Counts?", narrative: "A nearly accepted ultimatum may still be treated as rejection.", goalHint: "Sometimes peace needs not justice, but an explanation everyone can take home." },
  7: { title: "The Gate of Local War", narrative: "A local war may still be contained, but only if the firebreak holds.", goalHint: "Local war does not have to become total war. The key is whether a firewall can be built." },
  8: { title: "Mobilization Is a Slope", narrative: "Military preparation begins to make decisions for politics.", goalHint: "Once plans start inside a military bureaucracy, they begin deciding for politicians." },
  9: { title: "Timetables Take Over", narrative: "Fear of being late is becoming more dangerous than anger.", goalHint: "The most dangerous variable is now the belief that one more delay means defeat." },
  10: { title: "The First Gate Opens", narrative: "Once one gate opens, the next may require only inertia.", goalHint: "After the first gate opens, later gates need not hatred, only momentum." },
  11: { title: "A Small Border Changes Imperial Choices", narrative: "Belgian neutrality turns geography into law, morality, and strategy.", goalHint: "A small state's border can become the switch for great-power intervention." },
  12: { title: "System Collapse Check", narrative: "The system now returns its result.", goalHint: "The ending matters less than the causal chain you uncovered." },
};

const cardEn: Record<string, Partial<InterventionCard>> = {
  C01: { name: "Strengthen Public Investigation of the Assassination Network", description: "A public investigation can pull the crisis from revenge back toward law, but it will not satisfy every hardliner." },
  C02: { name: "Push for a Third-Party Inquiry", description: "A third-party inquiry cannot guarantee truth, but it can buy time. In a crisis, time itself is a resource." },
  C03: { name: "Reduce Newspaper Agitation", description: "Lowering press heat can give diplomats room again, though heavy control may be read as a cover-up." },
  C04: { name: "Appease Austro-Hungarian Court Hardliners", description: "Hardliners may not need war as much as face, guarantees, and a stance they can sell at home." },
  C05: { name: "Attach Limits to German Support", description: "Support without boundaries encourages risk. Limited support may look like betrayal to an ally." },
  C06: { name: "Signal Possible British Intervention Early", description: "A clear red line can deter, but may also push rivals to act before it settles." },
  C07: { name: "Send Berlin a Risk Assessment Memo", description: "Risk assessment cannot stop ambition, but it can make the cost of misjudgment visible." },
  C08: { name: "Arrange Secret Diplomatic Channels", description: "The harder public positions become, the more important private channels are." },
  C09: { name: "Set an International Inquiry Deadline", description: "A deadline makes delay acceptable. An inquiry without one is just another escape." },
  C10: { name: "Revise the Ultimatum Wording", description: "Sometimes a war hides inside a few adjectives and one unacceptable clause." },
  C11: { name: "Offer Austro-Hungarian Domestic Political Off-Ramp", description: "Retreat must be packaged as victory, or hardliners will reject it." },
  C12: { name: "Pressure Serbia into Pre-Emptive Concessions", description: "A small state's concession can buy time, but every concession may be counted by radicals at home." },
  C13: { name: "Issue a Restraint-Oriented Joint Statement", description: "A joint statement is not peace, but it can keep states from hearing only their own echo." },
  C14: { name: "Reframe the Assassination as a Judicial Case", description: "Turning revenge into trial is fragile and necessary work." },
  C15: { name: "Stage a Public Royal/Government Mourning Ritual", description: "Ritual cannot solve the crisis, but it can give anger an outlet other than immediate fire." },
  C16: { name: "Extend the Ultimatum Deadline", description: "You buy time, and also suspicion. Hardliners will ask why action is delayed." },
  C17: { name: "Have Serbia Accept Most Terms", description: "Accepting most terms may stop war, but it leaves new fractures at home." },
  C18: { name: "Clarify Britain's Red Line Early", description: "Deterrence must convince rivals you will act without making them feel trapped." },
  C19: { name: "Submit Disputed Clauses to Hague Arbitration", description: "Arbitration is not meant to satisfy everyone, but to let everyone avoid shooting for now." },
  C20: { name: "Help Austria-Hungary Declare a Limited Victory", description: "Politics often creates a story that lets people stop escalating." },
  C21: { name: "Give Russia a Diplomatic Off-Ramp", description: "Great powers need interests, but also explanations for why they did not retreat." },
  C22: { name: "Limit the Conflict to Border Punishment", description: "Limited aims can prevent spread, but militaries rarely like wars that are 'just enough'." },
  C23: { name: "Have France Urge Russia to Delay Mobilization", description: "Counseling restraint reduces crisis pressure, but may be misread as weakness." },
  C24: { name: "Pause Austro-Hungarian Military Action for 72 Hours", description: "Seventy-two hours can save the crisis, or give hardliners time to counterattack." },
  C25: { name: "Downgrade Russian General Mobilization to Partial Mobilization", description: "Partial mobilization sounds moderate, but may not be executable inside a vast military machine." },
  C26: { name: "Create a Direct German-Russian Hotline", description: "In crisis, misunderstanding can move faster than troop trains. A hotline can slow it down." },
  C27: { name: "Publicly Limit War Aims", description: "Limited aims reduce others' fears, but also constrain your own freedom of action." },
  C28: { name: "Germany Announces Defensive Mobilization", description: "Declarations are political language; mobilization is military language. They do not always translate." },
  C29: { name: "Hold a Conference on Belgian Neutrality", description: "Belgium is not a small square on the board; it is a legal and moral switch for Britain." },
  C30: { name: "Freeze the Western Plan for 48 Hours", description: "Forty-eight hours may save Europe, or convince the German army it is losing the first day." },
};

const intelEn: Record<string, Partial<IntelCard>> = {
  I01: { title: "Sarajevo Assassination Report", type: "Incident Report", summary: "Archduke Franz Ferdinand was assassinated in Sarajevo. The attackers are linked to Yugoslav nationalist networks, but direct Serbian government responsibility is not simple or clear." },
  I02: { title: "Vienna Internal Memo", type: "Government File", summary: "Austro-Hungarian leaders believe a weak response will further damage imperial prestige and internal nationality control." },
  I03: { title: "Serbian Public Denial", type: "Diplomatic Statement", summary: "Serbia denies directly planning the assassination and is willing to investigate, but rejects external control over sovereignty." },
  I04: { title: "German Support Signal to Austria-Hungary", type: "Diplomatic Telegram", summary: "Germany leans toward backing harsh action against Serbia, hopes to localize the crisis, and underestimates Russia and France." },
  I05: { title: "Kaiser and General Staff Risk Misjudgment", type: "Strategic Assessment", summary: "Some German decision-makers think Russia may not risk general war for Serbia, and that earlier war may be advantageous." },
  I06: { title: "Austro-Hungarian Fear of Great-Power Mediation", type: "Internal Assessment", summary: "Vienna fears slow action will let other powers mediate and erase the chance to punish Serbia." },
  I07: { title: "Ultimatum Draft", type: "Diplomatic Text", summary: "Austria-Hungary drafts an ultimatum whose clauses may be seen by Serbia as violations of sovereignty." },
  I08: { title: "Serbian Sovereignty Bottom Line", type: "Diplomatic Analysis", summary: "Serbia may accept inquiry and punishment, but not Austro-Hungarian entry into its judicial or administrative system." },
  I09: { title: "Austro-Hungarian Military Time Pressure", type: "Military Memo", summary: "The military argues delay weakens deterrence, while preparations themselves push politics forward." },
  I10: { title: "Revenge Calls in Austro-Hungarian Press", type: "Media Observation", summary: "Press narratives of revenge, honor, and imperial prestige narrow the government's room to step back." },
  I11: { title: "Belgrade Street Mood", type: "Social Observation", summary: "Serbia faces fear and anti-Austrian nationalism. Larger concessions may intensify domestic backlash." },
  I12: { title: "European Media Chain Reporting", type: "Media Network", summary: "Newspapers cite, magnify, and misread one another, spreading the crisis narrative across borders." },
  I13: { title: "Official Ultimatum Text", type: "Diplomatic File", summary: "The ultimatum is issued with a very short deadline and clauses almost certain to create disputes." },
  I14: { title: "Russian Pressure to Protect Serbia", type: "Great-Power Credibility", summary: "Another Russian retreat would damage prestige in the Balkans and Slavic world." },
  I15: { title: "British Foreign Office Hesitation", type: "Diplomatic Observation", summary: "Britain has not clearly stated when it would enter the war; Germany may interpret ambiguity as nonintervention." },
  I16: { title: "Serbian Reply Text", type: "Diplomatic File", summary: "Serbia accepts many terms but reserves on core sovereignty clauses." },
  I17: { title: "Austro-Hungarian Dissatisfaction With the Reply", type: "Government Response", summary: "Hardliners judge Serbia's response insufficient and still favor military punishment." },
  I18: { title: "Russian Court Meeting Notes", type: "Internal Meeting", summary: "Russian elites waver between restraint and mobilization. Retreat looks like failure; mobilization may provoke Germany." },
  I19: { title: "Austro-Hungarian Military Preparations", type: "Military Intelligence", summary: "Military preparations reach a higher stage; even if politics can still negotiate, military action creates inertia." },
  I20: { title: "Russia's Memory of Previous Retreat", type: "Historical Memory", summary: "Memories of earlier Balkan concessions make it harder for Russian leaders to do nothing again." },
  I21: { title: "French Support Signal to Russia", type: "Alliance Signal", summary: "French support affects Russian confidence and German anxiety." },
  I22: { title: "Russian Mobilization Plan Split", type: "Military Institution", summary: "Russia faces institutional difficulty between partial and general mobilization." },
  I23: { title: "German Fear of Russian Mobilization", type: "Military Psychology", summary: "German planning is highly sensitive to Russian mobilization and favors preemption as Russia moves." },
  I24: { title: "Irreversibility of Mobilization Timetables", type: "Institutional Analysis", summary: "Railways, reserves, supplies, and theater plans interlock, making mobilization hard to stop politically." },
  I25: { title: "German Ultimatum", type: "Diplomatic File", summary: "Germany demands Russia halt mobilization and asks France to state its position. The window narrows fast." },
  I26: { title: "Schlieffen Plan Pressure", type: "Strategic Plan", summary: "German planning favors west-before-east, raising pressure on France and Belgium once launched." },
  I27: { title: "France's Strategic Dilemma", type: "Alliance Dilemma", summary: "France cannot easily abandon Russia, but also does not want to provoke Germany alone." },
  I28: { title: "German-Russian War Risk", type: "Critical Alert", summary: "German-Russian relations are critical. Mobilization, mistransmission, or hardline statements may trigger war." },
  I29: { title: "Strategic Meaning of Belgian Neutrality", type: "International Law / Strategy", summary: "Belgian neutrality is a key British red line. Crossing it greatly raises the chance of British intervention." },
  I30: { title: "British Cabinet Split", type: "Domestic Politics", summary: "Britain is divided over war. Belgian neutrality and the European balance may change the cabinet's stance." },
};

const endingEn: Record<string, Partial<EndingDefinition>> = {
  E01: { title: "Total War", summary: "The local crisis has fully escalated. Europe enters general war; your interventions did not break the chain of alliance and mobilization.", shareLine: "You stopped some mistakes, but not the machine that kept making them." },
  E02: { title: "Delayed War", summary: "The war of 1914 is delayed, but the core structure remains. Another Balkan crisis may still collapse the system.", shareLine: "You did not save Europe; you only delayed the explosion." },
  E03: { title: "Balkan Local War", summary: "The war is contained in the Balkans. The cost is still terrible, but Europe as a whole does not burn.", shareLine: "You did not extinguish the flame, but you kept the warehouse from burning." },
  E04: { title: "International Conference Freeze", summary: "The great powers stop at the last window. The crisis is frozen, not truly solved.", shareLine: "Peace came not from goodwill, but because risk finally became visible." },
  E05: { title: "Coercive Peace", summary: "Serbia accepts limited inquiry, and Austria-Hungary receives a political off-ramp. Peace holds because each side gets an explanation to take home.", shareLine: "You packaged concession as victory, and peace briefly became possible." },
  E06: { title: "Low-Credibility Miracle", summary: "You achieved peace, but this path depends on unlikely personality shifts and unusual information transparency.", shareLine: "You won, but historians are frowning." },
  E07: { title: "Temporary De-Escalation", summary: "The crisis avoids general war, but no stable peace mechanism has formed. Europe returns to a diplomatic waiting room.", shareLine: "You stopped the machine, but did not prove it will not restart." },
};

const phraseEn: Record<string, string> = {
  "仅限回合": "Only turns",
  "本局已使用": "Already used this run",
  "需要回合": "Requires turn",
  "需要标记": "Requires flag",
  "需要已使用": "Requires card used",
  "需要已用卡数": "Requires cards used",
  "AP 不足": "Not enough AP",
  "需要": "requires",
  "当前": "current",
  "已错过": "Missed",
  "行动窗口": "action window",
  "已关闭": "closed",
  "本回合后失效": "expires after this turn",
  "历史压力": "Historical Pressure",
  "推进回合时，系统应用了本回合默认压力和已满足的特殊规则。": "The system applied this turn's default pressure and all satisfied special rules.",
  "将": "will change",
  "已达": "has reached",
};

export function t(language: Language, key: keyof typeof uiText.zh): string {
  return uiText[language][key];
}

export function variableLabel(key: string, language: Language): string {
  return language === "en" ? variableEn[key] ?? key : variableZh[key] ?? key;
}

export function typeLabel(key: string, language: Language): string {
  return language === "en" ? typeEn[key] ?? key : typeZh[key] ?? key;
}

export function flagLabel(key: string, language: Language): string {
  return language === "en" ? flagEn[key] ?? key : flagZh[key] ?? key;
}

export function formatTypeList(types: string[], language: Language): string {
  return types.map((type) => typeLabel(type, language)).join("/");
}

export function translateText(value: string, language: Language): string {
  if (language === "zh") {
    return replaceAllKnown(value, { ...variableZh, ...flagZh, ...typeZh });
  }
  return replaceAllKnown(value, { ...variableEn, ...flagEn, ...phraseEn });
}

export function localizeDataBundle(data: DataBundle, language: Language): DataBundle {
  if (language === "zh") {
    return {
      ...data,
      variables: data.variables.map(localizeVariableZh),
    };
  }

  return {
    variables: data.variables.map(localizeVariableEn),
    timeline: data.timeline.map((turn) => ({ ...turn, ...timelineEn[turn.turn] })),
    interventionCards: data.interventionCards.map((card) => ({ ...card, ...cardEn[card.id] })),
    intelCards: data.intelCards.map((card) => ({ ...card, ...intelEn[card.id] })),
    endings: data.endings.map((ending) => ({ ...ending, ...endingEn[ending.id] })),
  };
}

function localizeVariableZh(definition: VariableDefinition): VariableDefinition {
  return { ...definition, label: variableLabel(definition.key, "zh") };
}

function localizeVariableEn(definition: VariableDefinition): VariableDefinition {
  return {
    ...definition,
    label: variableLabel(definition.key, "en"),
    description: translateVariableDescription(definition.key),
  };
}

function translateVariableDescription(key: string): string {
  const descriptions: Record<string, string> = {
    war_probability: "Risk that the European crisis escalates into great-power general war.",
    austrian_hardline: "Austria-Hungary's tendency to punish Serbia militarily.",
    serbian_compromise: "Serbia's willingness to accept inquiry, concessions, and cooperation.",
    german_risk_perception: "Germany's perception of the risk that the crisis becomes general war.",
    russian_mobilization_pressure: "Russian pressure to protect Serbia, preserve prestige, and prepare militarily.",
    franco_russian_coordination: "Alliance coordination between France and Russia during the crisis.",
    british_redline_clarity: "How clearly Britain states its intervention conditions, especially Belgian neutrality.",
    alliance_lock_in: "How strongly alliances, promises, prestige, and expectations bind states into the crisis.",
    military_timetable_rigidity: "How strongly mobilization plans and railway timetables constrain political decisions.",
    nationalist_pressure: "Domestic opinion and honor narratives pushing governments toward hardline policy.",
    diplomatic_trust: "Whether states trust one another's signals, commitments, concessions, and deterrence.",
    media_agitation: "How strongly newspapers amplify revenge, honor, fear, and nationalist emotion.",
  };
  return descriptions[key] ?? key;
}

function replaceAllKnown(value: string, replacements: Record<string, string>): string {
  return Object.entries(replacements)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((text, [from, to]) => text.split(from).join(to), value);
}
