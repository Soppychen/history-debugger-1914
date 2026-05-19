# ENDING_REPORT_DESIGN.md

# 《历史现场调试器：1914》结算报告设计文档

本文档用于设计《历史现场调试器：1914》的结算报告系统。结算报告不是普通“胜利 / 失败”弹窗，而是本游戏最重要的传播点、复盘点和情绪落点。

玩家结束一局后，应该看到的不是一句“你赢了”或“你输了”，而是一份像 **历史事故调查报告 + 系统调试日志 + 档案终页** 的报告。

---

## 1. 设计目标

结算报告要完成四件事：

1. 告诉玩家本局历史系统最终走向了什么结果。
2. 解释这个结果是如何被变量、事件和玩家选择共同推出来的。
3. 让玩家理解“历史不是单因果”，而是多变量耦合后的系统结果。
4. 形成可截图、可分享、可讨论的传播内容。

一句话目标：

> 让玩家感觉自己不是看到了胜负，而是收到了一份关于历史系统崩溃或稳定的调查报告。

---

## 2. 结算报告的核心气质

视觉关键词：

- 历史事故调查报告
- 档案终页
- 系统崩溃日志
- 外交危机复盘
- 红色印章
- 变量图表
- 因果链
- 证据编号
- 克制、冷静、沉重

避免：

- 不要做成普通游戏胜利弹窗
- 不要只显示分数
- 不要只写“成功避免战争”
- 不要过度爽感
- 不要把战争灾难轻浮娱乐化
- 不要用过多炫酷特效影响阅读

---

## 3. 报告触发时机

结算报告在以下情况下触发：

1. 玩家完成第 12 回合。
2. 提前触发全面战争不可逆结局。
3. 达成某个特殊结局条件。
4. 玩家主动选择“结束调试 / 生成报告”。
5. Demo 版本完成后进入结算页。

---

## 4. 结局类型

第一版建议支持以下 6 类结局。

```ts
export type EndingType =
  | "total_war"
  | "delayed_war"
  | "localized_war"
  | "conference_freeze"
  | "coercive_peace"
  | "low_credibility_miracle";
```

---

## 4.1 全面战争：Total War

### 定位

失败结局 / 系统崩溃结局。

### 含义

外交调试失败，军事时间表接管政治进程，联盟体系连锁触发，欧洲进入全面战争。

### 视觉

- 黑红色
- 重警报
- 文件烧痕或裂纹
- `SYSTEM FAILURE`
- `TOTAL WAR` 印章

### 音乐

《无名战士》（Unknown Soldier）

如果前一屏刚触发不可逆节点，可先短暂播放《钢铁洪流》，进入报告后切换《无名战士》。

---

## 4.2 延迟战争：Delayed War

### 定位

低质量缓和结局。

### 含义

玩家暂时推迟了战争，但核心结构性压力没有解除。战争没有在当前窗口完全爆发，但未来仍高度危险。

### 视觉

- 暗橙色
- `UNRESOLVED`
- `DELAYED`
- 文件上有未关闭的红线

### 音乐

《无名战士》（Unknown Soldier）

---

## 4.3 巴尔干局部战争：Localized War

### 定位

中间结局。

### 含义

战争被限制在局部范围，没有升级为全面欧洲大战，但代价仍然沉重。

### 视觉

- 黄灰色
- 局部地图封锁线
- `CONTAINED`
- `LOCALIZED`

### 音乐

根据结果质量判断：

- 风险仍高：播放《无名战士》
- 成功控制扩散：播放《历史的回响》

---

## 4.4 国际会议冻结危机：Conference Freeze

### 定位

较好结局。

### 含义

危机被国际会议、仲裁机制或多方调停冻结。问题没有彻底解决，但系统获得了冷却时间。

### 视觉

- 蓝金色
- 文件封存
- 会议桌 / 条约 / 档案盒
- `FROZEN`
- `CONFERENCE`

### 音乐

《历史的回响》（Echoes of History）

---

## 4.5 高压和平：Coercive Peace

### 定位

最佳常规结局。

### 含义

玩家通过有限威慑、外交清晰度、制度缓冲和风险控制，让战争系统没有越过临界点。

这不是童话式和平，而是一个付出代价的高压稳定状态。

### 视觉

- 暗金 / 深绿
- `CONTROLLED`
- `PEACE`
- 压住红线的印章

### 音乐

《历史的回响》（Echoes of History）

---

## 4.6 低可信奇迹：Low Credibility Miracle

### 定位

特殊 / 彩蛋 / 低可信结局。

### 含义

玩家通过极其罕见的组合达成近似完美和平，但历史可信度较低。

### 视觉

- 紫灰色
- `ANOMALY`
- `LOW CREDIBILITY`
- 系统异常标记

### 音乐

《历史的回响》（Echoes of History），但建议低音量，并加入轻微异常音效。

---

## 5. 报告页面结构

结算报告建议分为 7 个区域。

```txt
┌─────────────────────────────────────────────┐
│ 1. Report Header                            │
│ 案件名 / 结局类型 / 评级 / 印章              │
├─────────────────────────────────────────────┤
│ 2. Executive Summary                        │
│ 一段 80—120 字的总结                         │
├─────────────────────────────────────────────┤
│ 3. Final Variables                          │
│ 最终变量与风险评级                           │
├─────────────────────────────────────────────┤
│ 4. Key Causal Chain                         │
│ 关键因果链                                   │
├─────────────────────────────────────────────┤
│ 5. Player Actions                           │
│ 玩家关键行动                                 │
├─────────────────────────────────────────────┤
│ 6. Failure / Stability Analysis             │
│ 失控原因或稳定原因                           │
├─────────────────────────────────────────────┤
│ 7. Share Card / Restart / Review Path       │
│ 分享卡、重新调试、查看完整日志               │
└─────────────────────────────────────────────┘
```

---

# Part A：Report Header

## A.1 必须显示

- 案件编号
- 案件名称
- 日期范围
- 结局名称
- 结局类型
- 结局评级
- 历史可信度
- 结局印章

示例：

```txt
CASE 001：1914 七月危机

结局：高压和平
评级：A-
历史可信度：74%
报告状态：已归档
```

## A.2 评级建议

```ts
export type EndingGrade = "S" | "A" | "B" | "C" | "D" | "F";
```

评级不是简单胜负，而是综合：

- 是否避免全面战争
- 战争概率最终值
- 不可逆节点数量
- 局部冲突代价
- 历史可信度
- 结构性风险残留
- 玩家干预成本

---

# Part B：Executive Summary

## B.1 目标

用一段短文本告诉玩家本局发生了什么。

要求：

- 80—120 字
- 不要太学术
- 不要只说结果
- 要体现因果和代价
- 适合截图传播

## B.2 示例：全面战争

```txt
你的调试未能阻止七月危机滑入全面战争。奥匈强硬度、俄国动员压力与德国军事时间表刚性在第 9 回合后形成连锁锁定，外交窗口迅速关闭。最终，战争不再是单一国家的选择，而成为整个联盟系统的默认输出。
```

## B.3 示例：高压和平

```txt
你没有创造一个轻松的和平，但成功阻止了系统越过全面战争临界点。通过提前明确英国红线、降低最后通牒苛刻度，并控制俄国动员压力，危机被压回外交轨道。欧洲仍然紧张，但没有在这个夏天崩溃。
```

---

# Part C：Final Variables

## C.1 目标

让玩家看到结局不是随机判定，而是变量共同作用的结果。

## C.2 必须显示变量

建议至少显示：

```txt
全面战争概率
奥匈强硬度
塞尔维亚妥协度
俄国动员压力
德国风险判断
英国红线清晰度
军事时间表刚性
媒体煽动度
外交信任度
```

## C.3 展示方式

每个变量显示：

- 变量名
- 最终值
- 风险等级
- 相比初始值变化
- 简短解释

示例：

```txt
俄国动员压力：82 / 100  ↑ +31
评级：Critical
说明：该变量越高，越容易触发德俄军事时间表连锁。
```

## C.4 风险等级

```ts
export type RiskLevel = "low" | "medium" | "high" | "critical";
```

建议规则：

```ts
if (value >= 85) return "critical";
if (value >= 70) return "high";
if (value >= 40) return "medium";
return "low";
```

注意：部分变量越高越好，例如：

- 塞尔维亚妥协度
- 德国风险判断
- 英国红线清晰度
- 外交信任度

这些变量需要 `polarity` 字段。

---

# Part D：Key Causal Chain

## D.1 目标

把本局最关键的 3—6 个因果节点展示出来。

玩家应该能看到：

> 哪些变量和事件真正把历史推向了这个结局。

## D.2 示例

```txt
萨拉热窝刺杀
↓
奥匈强硬度持续上升
↓
德国空白支票强化风险误判
↓
最后通牒苛刻度过高
↓
俄国动员压力进入临界
↓
军事时间表接管政治
↓
全面战争
```

## D.3 数据来源

因果链可以来自：

- timeline flags
- triggered risks
- irreversible events
- highest-impact variable deltas
- used cards
- ending rule evaluation

## D.4 视觉

建议：

- 垂直时间线
- 红线连接
- 不可逆节点用锁图标
- 玩家干预成功的节点用蓝 / 金标记
- 失败节点用红色标记

---

# Part E：Player Actions

## E.1 目标

展示玩家的关键选择，让玩家理解自己“做了什么”。

不要列出全部操作，只列最重要的 3—5 个。

## E.2 关键行动筛选规则

优先展示：

1. 影响变量最大的卡牌
2. 触发反噬的卡牌
3. 阻止关键风险的卡牌
4. 导致卡牌过期或错过窗口的推进
5. 结局判定中被引用的行动

## E.3 示例

```txt
关键行动 01：提前明确英国红线
效果：德国风险判断 +15，全面战争概率 -8
评价：有效降低了德国对英国介入的误判。

关键行动 02：压低最后通牒措辞
效果：塞尔维亚妥协度 +12，奥匈强硬度 -6
评价：延长了外交窗口，但激怒了奥匈国内强硬派。

关键行动 03：推迟俄国总动员
效果：俄国动员压力 -10，军事时间表刚性 -5
评价：成功降低了连锁动员风险。
```

---

# Part F：Failure / Stability Analysis

## F.1 目标

根据结局类型，给出“失控原因”或“稳定原因”。

这部分是结算报告最有教育价值的部分。

---

## F.2 全面战争分析模板

```txt
主要失控原因：

1. 军事时间表刚性过高
   到第 10 回合时，该变量达到 91，政治决策空间被压缩。

2. 英国红线不清晰
   德国风险判断未能及时上升，导致其低估英国介入概率。

3. 俄国总动员触发不可逆节点
   一旦该节点触发，德国军事计划进入自动推进状态。
```

---

## F.3 高压和平分析模板

```txt
主要稳定原因：

1. 最后通牒苛刻度被压低
   塞尔维亚保留了部分回应空间，局部战争窗口被延后。

2. 英国红线提前明确
   德国对战争扩散的判断上升，威慑效果形成。

3. 俄国动员压力被控制
   军事时间表没有完全接管政治进程。
```

---

# Part G：Historical Credibility

## G.1 目标

反事实结局必须有可信度，不然容易变成爽文。

每个结局应显示：

```txt
历史可信度：74%
```

## G.2 可信度含义

可信度不是“历史真实发生概率”，而是：

> 在本游戏的历史模型中，这条反事实路径与已知结构约束的相容程度。

## G.3 影响可信度的因素

降低可信度：

- 过度完美和平
- 高风险变量仍然很高
- 多个结构性压力未处理
- 通过单一卡牌逆转过多变量
- 已触发不可逆节点后仍达成过好结局

提高可信度：

- 多个关键变量被合理控制
- 关键干预发生在正确窗口
- 没有违背已锁定历史条件
- 结局保留代价和残余风险

## G.4 示例说明

```txt
可信度说明：
该结局并不意味着欧洲长期和平已经到来。它只说明在 1914 年 7—8 月的窗口内，全面战争被推迟或冻结。军备竞赛、民族主义与联盟结构仍然存在。
```

---

# Part H：Player Style Summary

## H.1 目标

结合行为分析，给玩家一个“调试员风格”总结。

这不是心理诊断，而是游戏内行为风格。

## H.2 示例标签

```txt
外交派调试员
档案派调试员
威慑派调试员
制度派调试员
冒险派调试员
回滚派调试员
```

## H.3 示例文案

```txt
你的调试风格：外交派 + 档案派

你倾向于先阅读情报，再使用低风险外交卡牌缓和局势。你很少直接押注军事威慑，更愿意让系统重新建立沟通渠道。
```

## H.4 数据来源

- 情报阅读率
- 外交卡使用比例
- 军事 / 威慑卡使用比例
- 读档次数
- 高风险卡使用次数
- 反噬触发次数
- 平均战争概率承受阈值

---

# Part I：Share Card

## I.1 目标

结算报告必须能生成一张适合截图分享的简版卡片。

## I.2 分享卡内容

建议包含：

```txt
游戏名
案件名
结局名称
评级
历史可信度
最终战争概率
玩家风格
一句结局短评
```

## I.3 示例

```txt
《历史现场调试器：1914》

结局：高压和平
评级：A-
历史可信度：74%
最终全面战争概率：38%

调试员风格：外交派 + 档案派

“你没有消除战争的原因，但让这个夏天没有成为系统崩溃点。”
```

## I.4 分享卡视觉

- 适合 4:5 或 16:9
- 深色档案背景
- 结局印章
- 变量小图表
- 不要放太多细字
- 可保存为图片

---

# Part J：数据结构设计

## J.1 EndingReport

```ts
export interface EndingReport {
  id: string;
  caseId: string;
  endingType: EndingType;
  endingTitle: string;
  grade: EndingGrade;
  historicalCredibility: number;
  finalWarProbability: number;
  executiveSummary: string;
  finalVariables: FinalVariableReport[];
  keyCausalChain: CausalChainNode[];
  keyPlayerActions: PlayerActionSummary[];
  analysis: EndingAnalysis;
  playerStyle?: PlayerStyleSummary;
  shareCard: ShareCardData;
  createdAt: string;
}
```

---

## J.2 FinalVariableReport

```ts
export interface FinalVariableReport {
  id: string;
  label: string;
  value: number;
  initialValue?: number;
  delta?: number;
  polarity: "higher_is_better" | "higher_is_worse" | "neutral";
  riskLevel: RiskLevel;
  explanation: string;
}
```

---

## J.3 CausalChainNode

```ts
export interface CausalChainNode {
  id: string;
  label: string;
  type: "event" | "variable" | "player_action" | "irreversible" | "ending";
  turn?: number;
  dateLabel?: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}
```

---

## J.4 PlayerActionSummary

```ts
export interface PlayerActionSummary {
  cardId: string;
  cardName: string;
  turn: number;
  effectSummary: string;
  variableDeltas: Record<string, number>;
  evaluation: "effective" | "mixed" | "harmful" | "too_late";
  explanation: string;
}
```

---

## J.5 EndingAnalysis

```ts
export interface EndingAnalysis {
  mode: "failure" | "stability" | "mixed";
  primaryFactors: EndingFactor[];
  credibilityNote: string;
  residualRisks: string[];
}
```

---

## J.6 EndingFactor

```ts
export interface EndingFactor {
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
  relatedVariables: string[];
  relatedEvents: string[];
}
```

---

## J.7 ShareCardData

```ts
export interface ShareCardData {
  title: string;
  endingTitle: string;
  grade: EndingGrade;
  historicalCredibility: number;
  finalWarProbability: number;
  playerStyleLabel?: string;
  quote: string;
}
```

---

# Part K：结算报告生成逻辑

## K.1 输入

报告生成器需要：

```ts
interface EndingReportInput {
  caseId: string;
  finalGameState: GameState;
  initialVariables: Record<string, number>;
  actionLog: ActionLogEntry[];
  endingRuleResult: EndingRuleResult;
  playerAnalytics?: PlayerRunAnalytics;
}
```

---

## K.2 输出

```ts
function generateEndingReport(input: EndingReportInput): EndingReport
```

---

## K.3 生成步骤

```txt
1. 根据 endingRuleResult 确认结局类型。
2. 计算评级 grade。
3. 计算历史可信度 historicalCredibility。
4. 计算最终变量报告 finalVariables。
5. 从 actionLog 中筛选关键玩家行动。
6. 从 flags / triggered risks / variable deltas 中生成关键因果链。
7. 根据结局类型生成 failure 或 stability analysis。
8. 根据玩家行为生成 playerStyle。
9. 生成 shareCard。
```

---

# Part L：UI 组件设计

建议新增：

```txt
EndingReportModal
EndingReportHeader
EndingSummaryPanel
FinalVariablesPanel
CausalChainPanel
KeyActionsPanel
EndingAnalysisPanel
HistoricalCredibilityPanel
PlayerStylePanel
ShareCardPanel
```

---

## L.1 `EndingReportModal`

整体容器。

功能：

- 显示完整报告
- 支持滚动
- 支持保存报告
- 支持生成分享卡
- 支持重新开始
- 支持查看完整行动日志

---

## L.2 `EndingReportHeader`

显示：

- 案件名
- 结局名
- 评级
- 可信度
- 印章
- 音乐状态

---

## L.3 `FinalVariablesPanel`

显示变量最终状态。

建议用：

- 横向条形图
- 风险色
- delta 标记
- tooltip 解释

---

## L.4 `CausalChainPanel`

显示关键因果链。

建议：

- 纵向时间线
- 关键节点 3—6 个
- 不可逆节点加锁
- 玩家行动节点特殊标记

---

## L.5 `KeyActionsPanel`

显示玩家关键行动。

建议卡片式：

```txt
C18 英国提前明确红线
Turn 5
效果：德国风险判断 +15，战争概率 -8
评价：有效
```

---

## L.6 `EndingAnalysisPanel`

显示失控 / 稳定原因。

要像报告结论，不要像普通说明文。

---

## L.7 `ShareCardPanel`

显示简版分享卡。

按钮：

```txt
保存图片
复制结局摘要
再调试一次
查看完整日志
```

---

# Part M：视觉与动效

## M.1 结局印章

对应 `AUDIO_CUE_GUIDE.md` 和 `ART_PRODUCTION_BRIEF.md`：

```txt
stamp-total-war.svg
stamp-delayed-war.svg
stamp-localized-war.svg
stamp-conference-freeze.svg
stamp-coercive-peace.svg
stamp-low-credibility-miracle.svg
```

## M.2 印章动效

打开结算报告时：

```txt
印章从 1.2 倍缩放到 1.0
透明度从 0 到 1
轻微旋转归正
伴随 sfx-ending-stamp-success 或 sfx-ending-stamp-failure
```

## M.3 报告展开动效

建议：

- 背景变暗
- 档案页展开
- Header 先出现
- Summary 再出现
- 变量面板依次淡入
- 印章最后落下

动效不要太长，总时长控制在 1.5—2.5 秒。

---

# Part N：音乐与音效

## N.1 音乐映射

| 结局 | 音乐 |
|---|---|
| 全面战争 | 《无名战士》 |
| 延迟战争 | 《无名战士》 |
| 局部战争，高风险 | 《无名战士》 |
| 局部战争，成功控制 | 《历史的回响》 |
| 国际会议冻结 | 《历史的回响》 |
| 高压和平 | 《历史的回响》 |
| 低可信奇迹 | 《历史的回响》，低音量或异常处理 |

## N.2 音效

建议使用：

```txt
sfx-ending-report-open.wav
sfx-ending-stamp-success.wav
sfx-ending-stamp-failure.wav
sfx-document-stamp.wav
```

---

# Part O：Codex 开发任务说明

可以直接给 Codex：

```txt
请根据 ENDING_REPORT_DESIGN.md 实现结算报告系统第一版。

要求：

1. 新建类型定义：
   - src/types/endingReport.ts

2. 新建报告生成逻辑：
   - src/engine/generateEndingReport.ts

3. 新增或改造 UI 组件：
   - EndingReportModal
   - EndingReportHeader
   - EndingSummaryPanel
   - FinalVariablesPanel
   - CausalChainPanel
   - KeyActionsPanel
   - EndingAnalysisPanel
   - HistoricalCredibilityPanel
   - PlayerStylePanel
   - ShareCardPanel

4. 报告必须包含：
   - 案件名
   - 结局名
   - 评级
   - 历史可信度
   - 最终战争概率
   - Executive Summary
   - 最终变量
   - 关键因果链
   - 玩家关键行动
   - 失控 / 稳定原因
   - 玩家调试风格
   - 分享卡

5. 根据 endingType 显示对应 stamp。
6. 根据 endingType 选择音乐。
7. 支持“再调试一次”“查看完整日志”“复制摘要”。
8. 不要把文案全部硬编码在组件里，尽量放入 ending 配置或生成函数。
9. 保持现有核心循环不被破坏。
10. 如果数据不足，使用 fallback 文案，但页面不能崩溃。
```

---

# Part P：验收标准

第一版完成后，应满足：

1. 完成一局后能生成结算报告。
2. 不同结局显示不同标题、颜色、印章和音乐。
3. 报告能解释为什么进入该结局。
4. 玩家能看到最终变量状态。
5. 玩家能看到自己最关键的 3—5 个行动。
6. 玩家能看到关键因果链。
7. 报告不是单纯胜负，而像历史事故调查报告。
8. 分享卡可截图。
9. 如果数据缺失，报告仍能显示 fallback 内容。
10. 不影响重新开始和读取存档。

---

# 最终原则

结算报告不是游戏结束后的附属品，而是《历史现场调试器》的核心体验之一。

一句话：

> 玩家调试的是历史，结算报告调试的是玩家对历史因果的理解。
