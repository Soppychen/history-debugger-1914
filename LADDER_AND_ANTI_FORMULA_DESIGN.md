# LADDER_AND_ANTI_FORMULA_DESIGN.md

# 《历史现场调试器：1914》反套路复杂化与天梯排名系统设计文档

本文档用于指导 Codex 实现《历史现场调试器：1914》的 **反公式化玩法复杂化系统** 与 **天梯 / 挑战榜系统**。

当前原型的核心玩法已经成立：

- 12 回合七月危机
- 变量系统
- 情报卡
- 干预卡
- 反噬
- 时间推进
- 结局报告

但如果系统始终是固定初始变量、固定卡牌效果、固定结局条件，策略型玩家迟早会总结出一套固定公式。

例如：

```txt
前期压奥匈强硬度
中期提高英国红线清晰度
后期压俄国动员压力
避免高反噬卡
最终战争概率最低路线 = 固定最优解
```

本系统的目标不是禁止玩家发现规律，而是：

> 允许玩家发现策略，但不要让游戏退化成唯一公式。

---

## 1. 设计目标

本轮设计解决三个问题：

1. **玩法深度问题**  
   避免玩家在数局后找到唯一最优解，导致重复游玩价值下降。

2. **竞争公平问题**  
   如果做排行榜，必须防止玩家通过无限读档、低可信路线或数值漏洞刷榜。

3. **评分单一问题**  
   不应只比较“最终全面战争概率最低”，而应综合历史可信度、代价、反噬、行动效率和结局质量。

---

## 2. 设计原则

### 2.1 不要让玩家只优化一个数字

如果排行榜只看：

```txt
最终全面战争概率
```

玩家会自然变成刷分机器，只追求把战争概率压到最低。

更好的设计是让玩家同时面对多个目标：

- 最终全面战争概率
- 历史可信度
- 不可逆节点数量
- 反噬次数
- 局部战争代价
- 低可信卡使用次数
- 行动效率
- 情报使用效率
- 存读档行为
- 结局类型

核心原则：

> 不要让玩家只优化一个数字，要让他们在多个坏选择中做历史判断。

---

### 2.2 允许存取大法，但要分模式

普通玩家可以自由存档读档，这是历史调试器“断点 / 回滚 / 分支实验”的乐趣。

但排行榜模式必须限制读档，否则排行榜会变成刷概率和试错路线。

因此：

```txt
普通模式：允许读档，不进严肃排行榜
挑战模式：固定 seed，限制读档，可进榜
铁人模式：禁止读档，高权重进榜
```

---

### 2.3 排名不是奖励“战争爽感”

排行榜不能鼓励玩家以极端方式刷低战争概率。  
高分应该代表：

> 用更可信、更少副作用、更小代价的方式阻止系统崩溃。

---

# Part A：反公式化玩法复杂化

## A.1 当前风险

如果当前关卡是完全固定的，玩家可能找到唯一最优路径。

风险表现：

- 每局开局变量一样
- 情报顺序一样
- 卡牌效果一样
- 反噬判定一样
- 结局条件一样
- 不存在信息不确定性
- 战争概率成为唯一目标

最终会产生：

```txt
固定最优卡牌序列
固定回合操作
固定结局达成路线
固定最低战争概率打法
```

---

## A.2 反公式化方案总览

建议增加三层复杂化：

1. **局势变体**
2. **信息不完全**
3. **多目标评分**

---

## A.3 局势变体

### A.3.1 目标

同一个 1914 关卡，每局开局可以有轻微差异，防止同一套打法永久有效。

### A.3.2 可扰动变量

可在开局 seed 中轻微扰动：

```txt
德国风险判断
媒体煽动度
奥匈强硬度
英国红线清晰度
俄国动员压力
外交信任度
军事时间表刚性
民族主义压力
```

### A.3.3 扰动规则

不要完全随机。  
必须在历史合理范围内波动。

示例：

```ts
interface VariablePerturbationRule {
  variableId: string;
  minDelta: number;
  maxDelta: number;
  mode: "weekly_challenge" | "standard_random" | "fixed";
}
```

示例配置：

```ts
const perturbationRules = [
  { variableId: "german_risk_perception", minDelta: -8, maxDelta: 8, mode: "standard_random" },
  { variableId: "media_agitation", minDelta: -10, maxDelta: 10, mode: "standard_random" },
  { variableId: "british_redline_clarity", minDelta: -6, maxDelta: 6, mode: "standard_random" }
];
```

### A.3.4 设计约束

- 扰动幅度不能太大，否则历史可信度下降。
- 玩家应该知道本局存在“局势偏差”。
- 排行榜必须记录 seed。
- 每周挑战模式必须所有玩家使用同一个 seed。

---

## A.4 信息不完全

### A.4.1 目标

玩家不应该一开始看到所有变量精确值。  
部分变量应以模糊状态显示，需要通过情报卡、调查卡或行动解锁。

### A.4.2 显示等级

```ts
type VariableVisibility =
  | "hidden"
  | "unknown"
  | "rough"
  | "range"
  | "exact";
```

显示示例：

```txt
德国风险判断：未知偏低
俄国动员压力：高
英国红线清晰度：约 40—55
媒体煽动度：72 / 100
```

### A.4.3 情报解锁

情报卡可以提升变量可见度：

```ts
interface IntelRevealEffect {
  variableId: string;
  visibility: VariableVisibility;
  confidence?: number;
}
```

示例：

```json
{
  "intelId": "I18",
  "title": "英国内阁讨论摘要",
  "reveals": [
    {
      "variableId": "british_redline_clarity",
      "visibility": "range",
      "confidence": 0.7
    }
  ]
}
```

### A.4.4 设计效果

玩家不能只按公式操作，因为他必须判断：

```txt
俄国动员压力到底是 61 还是 78？
德国风险判断是真的低，还是情报误差？
这张卡现在打，是正确窗口，还是过早暴露意图？
```

---

## A.5 多目标评分

### A.5.1 目标

不要让最终战争概率成为唯一目标。

### A.5.2 评分维度

建议评分包含：

```txt
最终全面战争概率
历史可信度
结局类型
不可逆节点数量
反噬次数
低可信卡牌使用次数
行动效率
存读档次数
局部战争代价
关键变量稳定度
情报使用质量
```

---

# Part B：HDB 调试评分系统

## B.1 评分名称

建议主评分命名为：

```txt
HDB 调试评分
Historical Debug Score
```

显示示例：

```txt
HDB 调试评分：1280
评级：A-
```

---

## B.2 分数公式第一版

第一版可以使用规则公式，不需要复杂机器学习。

```ts
debugScore =
  1000
  - finalWarProbability * 5
  + historicalCredibility * 3
  - irreversibleEventCount * 80
  - backlashCount * 25
  - lowCredibilityCardCount * 60
  - reloadCount * 10
  - localWarCost * 2
  + endingBonus
  + actionEfficiencyBonus
  + intelQualityBonus;
```

---

## B.3 评分字段定义

```ts
interface DebugScoreInput {
  endingType: EndingType;
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  backlashCount: number;
  lowCredibilityCardCount: number;
  reloadCount: number;
  localWarCost: number;
  usedCardCount: number;
  readIntelCount: number;
  effectiveActionCount: number;
  totalTurns: number;
}
```

---

## B.4 结局奖励

```ts
const endingBonusMap: Record<EndingType, number> = {
  coercive_peace: 350,
  conference_freeze: 280,
  localized_war: 120,
  delayed_war: -50,
  total_war: -300,
  low_credibility_miracle: 80
};
```

说明：

- `coercive_peace` 是最佳常规结局，奖励最高。
- `conference_freeze` 是较好结局。
- `localized_war` 有代价但可接受。
- `delayed_war` 不是高质量成功。
- `total_war` 强惩罚。
- `low_credibility_miracle` 不能奖励太高，因为可信度低。

---

## B.5 行动效率奖励

行动效率不是“用卡越少越好”，而是：

```txt
有效行动 / 总行动
```

示例：

```ts
const actionEfficiency = effectiveActionCount / Math.max(usedCardCount, 1);

if (actionEfficiency >= 0.8) bonus += 100;
else if (actionEfficiency >= 0.6) bonus += 50;
else if (actionEfficiency < 0.35) bonus -= 80;
```

---

## B.6 情报质量奖励

鼓励玩家阅读情报后再行动，而不是盲打卡牌。

```ts
const intelRate = readIntelCount / Math.max(totalTurns, 1);

if (intelRate >= 1.5) bonus += 60;
if (intelRate < 0.5) bonus -= 40;
```

---

## B.7 读档惩罚

普通模式可以读档，不一定惩罚。  
但排行榜模式需要记录。

```ts
if (mode === "standard") {
  reloadPenalty = 0;
}

if (mode === "challenge") {
  reloadPenalty = reloadCount * 10;
}

if (mode === "ironman") {
  reloadCount must be 0;
}
```

---

## B.8 分数输出

```ts
interface DebugScoreResult {
  score: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  breakdown: DebugScoreBreakdown;
}
```

```ts
interface DebugScoreBreakdown {
  base: number;
  warProbabilityPenalty: number;
  credibilityBonus: number;
  irreversiblePenalty: number;
  backlashPenalty: number;
  lowCredibilityPenalty: number;
  reloadPenalty: number;
  localWarPenalty: number;
  endingBonus: number;
  actionEfficiencyBonus: number;
  intelQualityBonus: number;
}
```

---

# Part C：游戏模式设计

## C.1 标准模式 Standard Mode

### 定位

普通玩家默认模式。

### 规则

- 允许手动存档。
- 允许读档。
- 允许探索分支。
- 可生成结算报告。
- 不进入严肃排行榜。
- 可进入“个人历史记录榜”。

### 用途

适合：

- 新玩家
- 学习玩法
- 探索反事实路线
- 研究卡牌效果

---

## C.2 严肃模式 Serious Mode

### 定位

历史可信度优先。

### 规则

- 只允许 A/B/C 可行性卡。
- D 卡强警告或禁用。
- X 卡禁止。
- 低可信奇迹结局不进入主榜。
- 可以进入部分排行榜。

### 用途

适合：

- 历史向玩家
- 内容创作者
- 教育场景
- 可信反事实挑战

---

## C.3 挑战模式 Challenge Mode

### 定位

排行榜主要模式。

### 规则

- 使用固定 seed。
- 同一挑战周期内所有玩家开局一致。
- 限制读档。
- 记录完整行动序列。
- 进入天梯排行榜。
- 每周刷新或每两周刷新。

### 用途

适合：

- 每周档案挑战
- 天梯排名
- 玩家社区讨论
- 复盘分享

---

## C.4 铁人模式 Ironman Mode

### 定位

硬核玩家模式。

### 规则

- 禁止手动读档。
- 每回合自动保存。
- 行动不可撤销。
- 分数加权。
- 排行榜单独显示。
- 失败也生成报告。

### 用途

适合：

- 硬核挑战
- 主播
- 竞速 / 高分玩家
- 严肃历史推演玩家

---

# Part D：排行榜设计

## D.1 不建议只做一个排行榜

如果只有一个总榜，玩家会自然优化漏洞。  
建议做多个榜单，让玩家追求不同目标。

---

## D.2 榜单 A：HDB 总评榜

### 目标

综合评分最高。

### 排序

```txt
debugScore DESC
historicalCredibility DESC
finalWarProbability ASC
createdAt ASC
```

### 显示字段

```txt
排名
玩家代号
结局
HDB 调试评分
评级
最终战争概率
历史可信度
不可逆节点数
使用卡牌数
完成时间
查看报告
```

---

## D.3 榜单 B：最低战争风险榜

### 目标

最终全面战争概率最低。

### 限制

- 严肃模式
- 禁止 D/X 低可信卡
- 必须完成第 12 回合或正常结局
- 历史可信度不得低于 60%

### 排序

```txt
finalWarProbability ASC
historicalCredibility DESC
debugScore DESC
```

---

## D.4 榜单 C：可信和平榜

### 目标

达成和平或冻结危机，同时历史可信度最高。

### 合格结局

```txt
coercive_peace
conference_freeze
localized_war_controlled
```

### 排序

```txt
historicalCredibility DESC
finalWarProbability ASC
debugScore DESC
```

---

## D.5 榜单 D：最小干预榜

### 目标

用最少行动达成较好结局。

### 合格结局

```txt
coercive_peace
conference_freeze
localized_war_controlled
```

### 排序

```txt
usedCardCount ASC
debugScore DESC
historicalCredibility DESC
```

### 设计意义

真正优雅的调试不是乱改，而是找到最小修复点。

---

## D.6 榜单 E：铁人调试榜

### 目标

无读档完成高质量结局。

### 限制

- Ironman Mode
- reloadCount = 0
- 不允许手动回滚

### 排序

```txt
debugScore DESC
historicalCredibility DESC
finalWarProbability ASC
```

---

## D.7 榜单 F：个人历史榜

### 目标

给普通玩家记录自己的历史成绩。

### 特点

- 可以包含标准模式成绩。
- 可允许读档。
- 不与全服玩家竞争。
- 适合展示玩家成长轨迹。

---

# Part E：每周档案挑战

## E.1 目标

每周给所有玩家同一个固定局势，让排行榜公平且有讨论价值。

名称建议：

```txt
每周档案挑战
Weekly Archive Challenge
```

---

## E.2 挑战定义

```ts
interface WeeklyArchiveChallenge {
  id: string;
  caseId: string;
  seed: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  variableOverrides: Record<string, number>;
  visibilityOverrides?: Record<string, VariableVisibility>;
  cardPoolOverrides?: string[];
  specialRules?: WeeklyChallengeRule[];
}
```

---

## E.3 示例挑战

```json
{
  "id": "1914-W21",
  "caseId": "case_1914",
  "seed": "1914-W21-BALKAN-PRESSURE",
  "title": "1914-W21：模糊的红线",
  "description": "本周局势中，英国红线更模糊，媒体煽动更高，德国风险判断更低。",
  "variableOverrides": {
    "british_redline_clarity": -8,
    "media_agitation": 10,
    "german_risk_perception": -6
  },
  "specialRules": [
    {
      "id": "press_pressure",
      "description": "媒体煽动度超过 75 时，奥匈强硬度额外 +5。"
    }
  ]
}
```

---

## E.4 挑战 UI

入口：

```txt
档案挑战
本周主题：模糊的红线
剩余时间：4 天 12 小时
参与人数：1284
查看排行榜
开始挑战
```

---

## E.5 挑战成绩提交

玩家完成后提交：

```ts
interface ChallengeSubmission {
  challengeId: string;
  playerId: string;
  runId: string;
  mode: "challenge" | "ironman";
  seed: string;
  endingType: EndingType;
  debugScore: number;
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  backlashCount: number;
  usedCardCount: number;
  readIntelCount: number;
  reloadCount: number;
  completionTimeSeconds: number;
  reportId: string;
  actionSequenceHash: string;
  createdAt: string;
}
```

---

# Part F：防作弊与榜单完整性

## F.1 第一版防作弊目标

第一版不需要做到竞技游戏级别反作弊，但至少要防止明显篡改。

### 最低要求

- 提交成绩必须包含 seed。
- 提交成绩必须包含 actionSequenceHash。
- 后端重新计算 debugScore。
- 后端不信任客户端传来的最终分数。
- 关键数据尽量由后端验证。

---

## F.2 行动序列

客户端应记录：

```ts
interface ActionSequenceEntry {
  turn: number;
  actionType:
    | "open_intel"
    | "use_card"
    | "advance_turn"
    | "save"
    | "load"
    | "trigger_event";
  payload: Record<string, unknown>;
}
```

生成 hash：

```ts
actionSequenceHash = hash(seed + serializedActionSequence)
```

后端可以未来重放验证。

---

## F.3 后端重算

理想情况：

```txt
客户端上传 actionSequence
后端根据 seed 和规则重放一局
后端生成最终变量、结局和 debugScore
后端写入排行榜
```

第一版如果成本太高，可以先：

```txt
客户端上传摘要 + actionSequenceHash
后端重算 debugScore
后端标记为 unverified
```

后续升级为：

```txt
verified leaderboard
```

---

## F.4 榜单状态

```ts
type LeaderboardSubmissionStatus =
  | "verified"
  | "unverified"
  | "flagged"
  | "rejected";
```

---

# Part G：数据结构设计

## G.1 RunRecord

```ts
interface RunRecord {
  id: string;
  playerId: string;
  caseId: string;
  mode: GameMode;
  seed: string;
  startedAt: string;
  completedAt?: string;
  endingType?: EndingType;
  debugScore?: number;
  finalWarProbability?: number;
  historicalCredibility?: number;
  irreversibleEventCount?: number;
  backlashCount?: number;
  usedCardCount?: number;
  readIntelCount?: number;
  reloadCount?: number;
  actionSequenceHash?: string;
  reportId?: string;
}
```

---

## G.2 LeaderboardEntry

```ts
interface LeaderboardEntry {
  id: string;
  leaderboardId: string;
  playerId: string;
  displayName: string;
  runId: string;
  rank?: number;
  endingType: EndingType;
  debugScore: number;
  grade: EndingGrade;
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  usedCardCount: number;
  reloadCount: number;
  completionTimeSeconds: number;
  reportId: string;
  status: "verified" | "unverified" | "flagged" | "rejected";
  createdAt: string;
}
```

---

## G.3 LeaderboardDefinition

```ts
interface LeaderboardDefinition {
  id: string;
  title: string;
  type:
    | "debug_score"
    | "lowest_war_probability"
    | "credible_peace"
    | "minimal_intervention"
    | "ironman"
    | "personal";
  caseId: string;
  challengeId?: string;
  sortRules: LeaderboardSortRule[];
  eligibilityRules: LeaderboardEligibilityRule[];
  startsAt?: string;
  endsAt?: string;
}
```

---

## G.4 EligibilityRule

```ts
interface LeaderboardEligibilityRule {
  id: string;
  description: string;
  predicate:
    | "mode_is"
    | "ending_in"
    | "credibility_min"
    | "reload_max"
    | "low_credibility_cards_max"
    | "completed_case"
    | "seed_matches";
  value: unknown;
}
```

---

# Part H：数据库表建议

## H.1 `run_records`

```sql
CREATE TABLE run_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  case_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  seed TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  ending_type TEXT,
  debug_score INTEGER,
  final_war_probability INTEGER,
  historical_credibility INTEGER,
  irreversible_event_count INTEGER,
  backlash_count INTEGER,
  used_card_count INTEGER,
  read_intel_count INTEGER,
  reload_count INTEGER,
  action_sequence_hash TEXT,
  report_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## H.2 `leaderboards`

```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  case_id TEXT NOT NULL,
  challenge_id TEXT,
  sort_rules JSONB NOT NULL,
  eligibility_rules JSONB NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## H.3 `leaderboard_entries`

```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES leaderboards(id),
  player_id UUID NOT NULL REFERENCES players(id),
  run_id UUID NOT NULL REFERENCES run_records(id),
  display_name TEXT NOT NULL,
  ending_type TEXT NOT NULL,
  debug_score INTEGER NOT NULL,
  grade TEXT,
  final_war_probability INTEGER NOT NULL,
  historical_credibility INTEGER NOT NULL,
  irreversible_event_count INTEGER NOT NULL,
  used_card_count INTEGER NOT NULL,
  reload_count INTEGER NOT NULL,
  completion_time_seconds INTEGER,
  report_id UUID,
  status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## H.4 `weekly_archive_challenges`

```sql
CREATE TABLE weekly_archive_challenges (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  seed TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  variable_overrides JSONB,
  visibility_overrides JSONB,
  card_pool_overrides JSONB,
  special_rules JSONB,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

# Part I：UI 组件建议

建议新增：

```txt
GameModeSelectModal
WeeklyChallengePanel
LeaderboardPage
LeaderboardTabs
LeaderboardTable
LeaderboardEntryDetail
DebugScoreBreakdownPanel
RunSummaryCard
PersonalHistoryPanel
```

---

## I.1 GameModeSelectModal

显示模式选择：

```txt
标准模式
适合探索。允许存档读档，不进入严肃排行榜。

挑战模式
本周固定档案，限制读档，进入排行榜。

铁人模式
禁止读档，一次性调试，失败也归档。
```

---

## I.2 WeeklyChallengePanel

显示本周挑战：

```txt
1914-W21：模糊的红线
英国红线更模糊，媒体煽动更高，德国风险判断更低。
剩余时间：4 天 12 小时
参与人数：1284
开始挑战
查看排行榜
```

---

## I.3 LeaderboardPage

排行榜主页面。

包含 tabs：

```txt
HDB 总评榜
最低战争风险
可信和平
最小干预
铁人调试
个人历史
```

---

## I.4 LeaderboardEntryDetail

点击榜单记录时显示：

- 结算报告
- 关键行动
- 最终变量
- 玩家风格
- 行动序列摘要
- 是否 verified

---

# Part J：Codex 开发任务说明

可以直接给 Codex：

```txt
请根据 LADDER_AND_ANTI_FORMULA_DESIGN.md 实现反公式化复杂化与天梯排名系统第一版。

第一阶段目标：
1. 增加游戏模式：standard、serious、challenge、ironman。
2. 增加 seed-based run 初始化机制。
3. 增加变量轻微扰动机制，但保持历史合理范围。
4. 增加 DebugScore 计算函数，不能只看最终战争概率。
5. 增加 RunRecord 数据结构。
6. 增加本地或 mock leaderboard。
7. 增加 Weekly Archive Challenge 配置结构。
8. 挑战模式使用固定 seed。
9. 铁人模式禁止手动读档。
10. 标准模式允许读档，但不进入严肃排行榜。
11. Leaderboard 页面至少支持：
    - HDB 总评榜
    - 最低战争风险榜
    - 可信和平榜
    - 最小干预榜
    - 铁人调试榜
    - 个人历史榜
12. 如果暂时没有后端，先用 local mock 实现，并保留 API 抽象层。
13. 不要破坏现有 12 回合核心循环。
```

建议新增文件：

```txt
src/modes/gameModes.ts
src/random/seededRng.ts
src/engine/applyScenarioSeed.ts
src/score/calculateDebugScore.ts
src/score/debugScoreTypes.ts
src/leaderboard/leaderboardTypes.ts
src/leaderboard/leaderboardClient.ts
src/leaderboard/mockLeaderboardClient.ts
src/challenges/weeklyArchiveChallenge.ts
src/components/GameModeSelectModal.tsx
src/components/WeeklyChallengePanel.tsx
src/components/LeaderboardPage.tsx
src/components/DebugScoreBreakdownPanel.tsx
src/components/PersonalHistoryPanel.tsx
```

---

# Part K：第一阶段验收标准

完成后应满足：

1. 玩家可以选择标准 / 严肃 / 挑战 / 铁人模式。
2. 标准模式允许读档。
3. 铁人模式禁止手动读档。
4. 挑战模式使用固定 seed。
5. 同一 seed 下初始变量扰动结果一致。
6. 不同 seed 下局势有轻微差异。
7. 完成一局后生成 HDB 调试评分。
8. 调试评分有 breakdown，不只是一个数字。
9. 至少一个 mock 排行榜能展示成绩。
10. 排行榜能显示最终战争概率、历史可信度、结局、分数。
11. 普通模式成绩不进入严肃排行榜。
12. 现有游戏核心循环仍能完整运行。
13. 结算报告能显示 DebugScore 与玩家榜单资格。
14. 如果后端未接入，代码结构仍预留 API 抽象层。

---

# Part L：后续升级方向

未来可以继续升级：

1. 后端重放验证行动序列。
2. 全球排行榜。
3. 好友排行榜。
4. 每日挑战。
5. 更多案例的跨关卡排行榜。
6. 玩家调试风格长期统计。
7. 基于排行榜数据调整卡牌平衡。
8. 赛季系统。
9. 教育版班级排行榜。
10. 分享结算报告生成图片。

---

## 最终原则

玩家可以发现策略，但不应该只有唯一公式。

排行榜可以存在，但它不应该奖励最机械的刷数值路线。

一句话：

> 天梯比的不是谁把战争概率压得最低，而是谁用最可信、最小代价、最少副作用的方式阻止系统崩溃。
