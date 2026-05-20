# VISUAL_CONTENT_EXPANSION_AND_REPLACEMENT.md

# 《历史现场调试器：1914》图片内容扩展与替换设计文档

本文档用于回应玩家反馈：当前游戏画面偏文字、图片较少、视觉节奏略单调。目标是在不重构核心玩法的前提下，为《历史现场调试器：1914》增加更多“历史现场感”的图片，并指导 Codex 完成图片接入、替换、fallback 和数据映射。

---

## 1. 问题判断

玩家反馈“图片有些单调”，通常不是单纯指背景不好看，而是指：

1. 卡牌之间视觉差异不明显。
2. 每回合历史事件缺少现场画面。
3. 情报卡像纯文本资料，没有档案感。
4. 变量变化、不可逆节点、结局报告缺少视觉冲击。
5. 主界面长期停留在同一种色调和布局，视觉疲劳。
6. 玩家很难通过图像快速判断“现在发生了什么”。

当前已有设计系统和美术风格是正确的，但内容美术密度不足。

一句话判断：

> 现在缺的不是 UI 皮肤，而是“历史事件图片系统”。

---

## 2. 本轮目标

本轮目标不是重新设计整个 UI，而是增加一层可替换、可扩展、可逐步生成的图片系统。

具体目标：

1. 每个回合至少有一张事件图。
2. 每类卡牌至少有一张类型图例。
3. 关键情报有档案缩略图。
4. 关键不可逆节点有视觉图。
5. 结局报告有对应主视觉。
6. 图片资源可以通过配置映射，不硬编码在组件中。
7. 没有图片时使用 fallback，不影响运行。

---

## 3. 图片类型分层

建议将图片分为 6 层，按优先级逐步接入。

```txt
Layer 1：回合事件图
Layer 2：卡牌类型图例
Layer 3：关键情报档案图
Layer 4：不可逆节点图
Layer 5：结局报告主视觉
Layer 6：主界面氛围背景轮换
```

第一阶段优先实现 Layer 1、Layer 2、Layer 5。第二阶段再补 Layer 3、Layer 4、Layer 6。

---

# Part A：回合事件图 Turn Event Images

## A.1 目标

每个回合都应有一张 16:9 事件图，用于：

- 回合开始简报
- 时间推进报告
- 时间线节点详情
- 结算报告关键节点回放
- 分享图素材

这些图负责让玩家感觉：

> 我不是在翻文本，我正在进入一个历史现场。

## A.2 数量

第一阶段：12 张，每回合 1 张。

## A.3 目录

```txt
public/assets/turn-events/
```

## A.4 文件命名

```txt
turn-01-sarajevo-aftershock.png
turn-02-blank-check.png
turn-03-ultimatum-drafted.png
turn-04-press-agitation.png
turn-05-countdown-begins.png
turn-06-serbian-reply.png
turn-07-local-war-gate.png
turn-08-russian-mobilization-pressure.png
turn-09-timetable-takes-over.png
turn-10-german-ultimatum.png
turn-11-belgium-redline.png
turn-12-system-collapse-or-freeze.png
```

## A.5 图片规格

```txt
尺寸：1600 x 900
比例：16:9
格式：png 或 jpg
风格：档案拼贴 / 旧照片质感 / 地图 / 电报 / 红线批注
```

## A.6 每回合图片说明

### Turn 01：`turn-01-sarajevo-aftershock.png`

主题：萨拉热窝刺杀后的欧洲震动。

画面建议：

- 暗色街道剪影
- 车队或街头混乱的档案感
- 欧洲地图作为底图
- 从萨拉热窝向外扩散的红线

避免：

- 不要血腥刺杀特写。
- 不要把画面做成动作电影。

### Turn 02：`turn-02-blank-check.png`

主题：德国对奥匈的支持承诺。

画面建议：

- 柏林与维也纳之间的红线
- 外交文件
- 未填写金额的支票隐喻
- 暗色会议桌
- 印章和批注

### Turn 03：`turn-03-ultimatum-drafted.png`

主题：最后通牒草案形成。

画面建议：

- 文件草案
- 钢笔
- 红线圈出苛刻条款
- 时钟
- 塞尔维亚地图边缘

### Turn 04：`turn-04-press-agitation.png`

主题：报纸、民族主义和街头情绪加速危机。

画面建议：

- 旧报纸堆叠
- 印刷机
- 人群剪影
- 被红笔圈出的标题
- 外交电报被报纸覆盖

### Turn 05：`turn-05-countdown-begins.png`

主题：最后通牒发出，倒计时开始。

画面建议：

- 最后通牒文本
- 老式时钟
- 维也纳到贝尔格莱德红线
- 橙红警报氛围

### Turn 06：`turn-06-serbian-reply.png`

主题：塞尔维亚回应，接受与拒绝之间的边界。

画面建议：

- 两份文件对照
- 勾选与叉号批注
- 主权条款被圈出
- 档案桌、折痕和钢笔

### Turn 07：`turn-07-local-war-gate.png`

主题：局部战争之门打开。

画面建议：

- 巴尔干地图
- 半开的门或边境线隐喻
- 局部红色火点
- 周边大国红线靠近

### Turn 08：`turn-08-russian-mobilization-pressure.png`

主题：俄国动员压力上升。

画面建议：

- 铁路线
- 动员表
- 军用列车剪影
- 总参谋部文件
- 红线从局部扩散为多线

### Turn 09：`turn-09-timetable-takes-over.png`

主题：军事时间表接管政治。

画面建议：

- 铁路网
- 作战时间表
- 齿轮或机械感
- 政治文件被军事表格覆盖
- 红色时钟指针

### Turn 10：`turn-10-german-ultimatum.png`

主题：德国最后通牒与战争路径开启。

画面建议：

- 德俄边界红线
- 电报
- 铁轨信号灯
- 黑红警报氛围

### Turn 11：`turn-11-belgium-redline.png`

主题：比利时中立与英国介入。

画面建议：

- 比利时边界高亮
- 条约文本
- 英国内阁剪影
- 地图红线
- 中立印章隐喻

### Turn 12：`turn-12-system-collapse-or-freeze.png`

主题：欧洲系统最终判定。

画面建议：

- 欧洲地图被红线覆盖
- 事故报告文件打开
- 变量图表
- 结局印章悬在报告上
- 系统崩溃或冻结的双重隐喻

---

# Part B：卡牌类型图例 Card Type Illustrations

## B.1 目标

卡牌不能全部像文字块。每种卡牌类型应有共用图例，用于提升辨识度。

## B.2 数量

第一阶段：12 张。

## B.3 目录

```txt
public/assets/card-illustrations/
```

## B.4 文件命名

```txt
card-illo-diplomacy.png
card-illo-military.png
card-illo-media.png
card-illo-judicial.png
card-illo-intelligence.png
card-illo-institutional.png
card-illo-domestic-politics.png
card-illo-symbolic-politics.png
card-illo-international-law.png
card-illo-crisis-management.png
card-illo-war-aims.png
card-illo-backlash.png
```

## B.5 图片规格

```txt
尺寸：1024 x 640
前端裁切：16:9
风格：档案拼贴、旧照片、文件、地图、红线、章印
```

## B.6 接入方式

卡牌不建议每张都手动指定图片。第一版使用类型映射。

```ts
export const cardTypeIllustrationMap = {
  diplomacy: "/assets/card-illustrations/card-illo-diplomacy.png",
  military: "/assets/card-illustrations/card-illo-military.png",
  media: "/assets/card-illustrations/card-illo-media.png",
  judicial: "/assets/card-illustrations/card-illo-judicial.png",
  intelligence: "/assets/card-illustrations/card-illo-intelligence.png",
  institutional: "/assets/card-illustrations/card-illo-institutional.png",
  domestic_politics: "/assets/card-illustrations/card-illo-domestic-politics.png",
  symbolic_politics: "/assets/card-illustrations/card-illo-symbolic-politics.png",
  international_law: "/assets/card-illustrations/card-illo-international-law.png",
  crisis_management: "/assets/card-illustrations/card-illo-crisis-management.png",
  war_aims: "/assets/card-illustrations/card-illo-war-aims.png",
  backlash: "/assets/card-illustrations/card-illo-backlash.png"
};
```

---

# Part C：关键情报档案图 Intel Images

## C.1 目标

情报卡应更像“打开一份档案”，而不是单纯读一段文字。

## C.2 第一阶段建议数量

先做 10 张关键情报图，不必所有情报都配图。

## C.3 目录

```txt
public/assets/intel-documents/
```

## C.4 文件命名示例

```txt
intel-blank-check-telegram.png
intel-british-cabinet-note.png
intel-russian-mobilization-memo.png
intel-serbian-reply-dossier.png
intel-austrian-war-council.png
intel-belgium-neutrality-treaty.png
intel-german-general-staff-map.png
intel-press-nationalist-headlines.png
intel-hague-arbitration-file.png
intel-schlieffen-risk-brief.png
```

## C.5 图片规格

```txt
尺寸：1200 x 800
比例：3:2
格式：png 或 jpg
```

## C.6 使用场景

- 情报卡详情弹窗
- 情报阅读界面
- 结算报告“关键证据”区域
- 玩家分享报告中的证据图

---

# Part D：不可逆节点图 Irreversible Event Images

## D.1 目标

不可逆节点是压迫感核心。玩家看到不可逆节点时，应有明显视觉冲击。

## D.2 第一阶段数量

建议先做 6 张。

## D.3 目录

```txt
public/assets/irreversible-events/
```

## D.4 文件命名

```txt
irrev-ultimatum-issued.png
irrev-austria-declares-war.png
irrev-russian-general-mobilization.png
irrev-german-ultimatum.png
irrev-belgium-invasion.png
irrev-britain-enters-war.png
```

## D.5 使用场景

- 不可逆节点弹窗
- 时间线锁定节点详情
- Time Advance Report
- 结算报告因果链

## D.6 视觉要求

- 红色锁章
- 暗色档案背景
- 事件文件或地图
- 不要做成爆炸大片
- 强调“系统路径锁死”

---

# Part E：结局报告主视觉 Ending Report Images

## E.1 目标

结局报告是传播点。每种结局应有主视觉，而不仅是文字和印章。

## E.2 数量

6 张，对应 6 类结局。

## E.3 目录

```txt
public/assets/ending-visuals/
```

## E.4 文件命名

```txt
ending-total-war.png
ending-delayed-war.png
ending-localized-war.png
ending-conference-freeze.png
ending-coercive-peace.png
ending-low-credibility-miracle.png
```

## E.5 图片规格

```txt
尺寸：1600 x 900
比例：16:9
```

## E.6 每张说明

### `ending-total-war.png`

主题：欧洲系统全面崩溃。

画面建议：

- 欧洲地图红线爆发
- 档案报告烧痕
- 黑红系统失败印章
- 不出现血腥战场

### `ending-delayed-war.png`

主题：战争被推迟，但系统未修复。

画面建议：

- 未关闭的红线
- 半封存档案
- 时钟暂停
- 暗橙色风险感

### `ending-localized-war.png`

主题：战争被限制在巴尔干。

画面建议：

- 巴尔干地图封锁线
- 局部火点
- 周边红线被压住
- 黄灰色调

### `ending-conference-freeze.png`

主题：国际会议冻结危机。

画面建议：

- 会议桌
- 条约文件
- 蓝金色封存章
- 档案盒关闭

### `ending-coercive-peace.png`

主题：高压和平。

画面建议：

- 红线被金色印章压住
- 文件仍有裂纹
- 深绿 / 暗金色
- 和平但不轻松

### `ending-low-credibility-miracle.png`

主题：低可信奇迹。

画面建议：

- 异常档案
- 紫灰色调
- 系统 anomaly 标记
- 看起来漂亮但略不稳定

---

# Part F：主界面氛围背景轮换

## F.1 目标

长期游玩时，主界面背景如果一直不变，会显得单调。可以根据危机阶段替换背景。

## F.2 目录

```txt
public/assets/backgrounds/
```

## F.3 文件命名

```txt
bg-stage-stable.png
bg-stage-tense.png
bg-stage-ultimatum.png
bg-stage-mobilization.png
bg-stage-war-imminent.png
bg-stage-irreversible.png
```

## F.4 背景映射

```ts
export const crisisStageBackgroundMap = {
  stable: "/assets/backgrounds/bg-stage-stable.png",
  tense: "/assets/backgrounds/bg-stage-tense.png",
  ultimatum: "/assets/backgrounds/bg-stage-ultimatum.png",
  mobilization: "/assets/backgrounds/bg-stage-mobilization.png",
  war_imminent: "/assets/backgrounds/bg-stage-war-imminent.png",
  irreversible: "/assets/backgrounds/bg-stage-irreversible.png"
};
```

## F.5 视觉原则

背景必须低对比、弱存在感。不能影响 UI 可读性。

建议：

```txt
opacity: 0.12—0.22
blur: 0—2px
mix-blend-mode: normal or multiply
```

---

# Part G：图片映射数据结构

## G.1 统一 Asset Manifest

建议新增：

```txt
src/assets/visualAssetManifest.ts
```

## G.2 类型定义

```ts
export type VisualAssetKind =
  | "turn_event"
  | "card_illustration"
  | "intel_document"
  | "irreversible_event"
  | "ending_visual"
  | "background";

export interface VisualAsset {
  id: string;
  kind: VisualAssetKind;
  src: string;
  alt: string;
  caption?: string;
  fallback?: string;
}
```

## G.3 示例

```ts
export const visualAssets: Record<string, VisualAsset> = {
  "turn_05_countdown": {
    id: "turn_05_countdown",
    kind: "turn_event",
    src: "/assets/turn-events/turn-05-countdown-begins.png",
    alt: "最后通牒发出前的倒计时档案图",
    caption: "最后通牒窗口正在关闭。"
  },
  "ending_total_war": {
    id: "ending_total_war",
    kind: "ending_visual",
    src: "/assets/ending-visuals/ending-total-war.png",
    alt: "欧洲系统进入全面战争的结局档案图",
    caption: "系统崩溃：全面战争。"
  }
};
```

---

# Part H：JSON 字段扩展建议

## H.1 Timeline 增加图片字段

在 `timeline_1914.json` 中增加：

```json
{
  "turn": 5,
  "title": "倒计时开始",
  "image": "/assets/turn-events/turn-05-countdown-begins.png",
  "caption": "最后通牒窗口正在关闭。"
}
```

## H.2 Intel Cards 增加图片字段

```json
{
  "id": "I18",
  "title": "英国内阁讨论摘要",
  "image": "/assets/intel-documents/intel-british-cabinet-note.png",
  "caption": "英国红线仍未清晰传达。"
}
```

## H.3 Endings 增加图片字段

```json
{
  "id": "ending_total_war",
  "type": "total_war",
  "visual": "/assets/ending-visuals/ending-total-war.png",
  "stamp": "/assets/stamps/stamp-total-war.svg"
}
```

## H.4 Intervention Cards 可选图片字段

第一阶段仍建议类型映射。后续可以给关键卡单独加图：

```json
{
  "id": "C18",
  "name": "英国提前明确红线",
  "type": ["diplomacy"],
  "image": "/assets/card-specific/c18-british-redline.png"
}
```

---

# Part I：组件替换与接入方案

## I.1 `TurnBriefingModal`

增加：

```txt
回合事件图
图片 caption
图片缺失 fallback
```

## I.2 `TimeAdvanceReportModal`

增加：

```txt
本回合事件图
已触发不可逆节点图
失效卡牌图标或小图
```

## I.3 `InterventionCard`

增加：

```txt
卡牌顶部 16:9 图例区域
优先使用 card.image
否则使用 cardTypeIllustrationMap
否则使用 CSS fallback
```

## I.4 `IntelCard`

增加：

```txt
档案缩略图
打开详情时显示大图
图片 caption
```

## I.5 `TimelineNodeDetail`

增加：

```txt
事件图
不可逆节点图
相关情报图
```

## I.6 `EndingReportModal`

增加：

```txt
结局主视觉
结局印章
关键因果节点缩略图
分享卡背景图
```

## I.7 `TopStatusBar` / `MainLayout`

增加：

```txt
根据 crisisStage 替换低透明背景图
```

---

# Part J：Fallback 规则

必须实现 fallback，避免缺图导致页面崩溃。

## J.1 图片加载失败

如果图片缺失：

```txt
显示 CSS 渐变背景
显示类型图标
显示 alt 文本或 caption
console.warn 一次
```

## J.2 Fallback 类型

```ts
export function getVisualFallback(kind: VisualAssetKind): string {
  switch (kind) {
    case "turn_event":
      return "archive-map-gradient";
    case "card_illustration":
      return "card-paper-texture";
    case "intel_document":
      return "document-placeholder";
    case "irreversible_event":
      return "red-lock-archive";
    case "ending_visual":
      return "ending-report-placeholder";
    case "background":
      return "dark-archive-background";
  }
}
```

---

# Part K：图片生成优先级

如果资源有限，按以下顺序生成。

## K.1 第一批，最小有效增强包

```txt
12 张回合事件图
12 张卡牌类型图例
6 张结局主视觉
```

总计 30 张。这批做完，游戏视觉丰富度会明显提升。

## K.2 第二批，情报与不可逆节点

```txt
10 张关键情报档案图
6 张不可逆节点图
6 张危机阶段背景
```

总计 22 张。

## K.3 第三批，关键卡独立插图

```txt
10—20 张关键干预卡独立图
```

优先给高频使用卡和结局关键卡。

---

# Part L：Codex 开发任务说明

可以直接给 Codex：

```txt
请根据 VISUAL_CONTENT_EXPANSION_AND_REPLACEMENT.md 实现游戏图片内容扩展与替换系统第一版。

目标：
解决当前游戏视觉偏单调的问题，在不改核心 game engine 的前提下，为回合、卡牌、情报、不可逆节点和结算报告增加图片支持。

请完成：

1. 新建目录约定：
   - public/assets/turn-events/
   - public/assets/card-illustrations/
   - public/assets/intel-documents/
   - public/assets/irreversible-events/
   - public/assets/ending-visuals/
   - public/assets/backgrounds/

2. 新建：
   - src/assets/visualAssetManifest.ts
   - src/assets/cardTypeIllustrationMap.ts
   - src/assets/crisisStageBackgroundMap.ts
   - src/components/VisualAssetImage.tsx

3. 修改组件：
   - TurnBriefingModal：显示回合事件图
   - TimeAdvanceReportModal：显示事件图与不可逆节点图
   - InterventionCard：显示卡牌图例
   - IntelCard：显示档案缩略图
   - TimelineNodeDetail：显示事件图
   - EndingReportModal：显示结局主视觉
   - MainLayout 或 AppShell：根据 crisisStage 显示低透明背景图

4. 图片优先级：
   - card.image
   - card type illustration
   - fallback

5. 所有图片加载失败时必须 fallback，页面不能崩。
6. 不要把具体图片路径硬编码在 UI 组件中，优先使用 manifest 或 JSON 字段。
7. 如果某些 JSON 暂时没有 image 字段，则使用映射表。
8. 不要重构核心 game engine。
9. 保持现有 12 回合流程可运行。
10. 完成后在 README 中说明图片目录和命名规则。
```

---

# Part M：验收标准

第一版完成后，应满足：

1. 每个回合开始简报显示一张事件图或 fallback。
2. 干预卡显示卡牌类型图例或 fallback。
3. 情报卡可以显示档案缩略图。
4. 结局报告显示结局主视觉。
5. 不可逆节点若有图片，会显示在弹窗或报告中。
6. 主背景可根据危机阶段变化。
7. 图片缺失不会导致页面报错。
8. 图片路径不硬编码在组件里。
9. 视觉变丰富，但 UI 文字仍清晰可读。
10. 游戏核心循环不受影响。

---

# Part N：美术生产提示模板

以下模板可给 Manus / 美术生成图片时使用。

## N.1 通用风格前缀

```txt
为历史策略游戏《历史现场调试器：1914》生成一张档案拼贴风历史事件图。整体风格为旧照片质感、暗色档案桌、欧洲地图、电报文件、红线批注、印章、纸张纹理。画面克制、紧张、理性，像历史事故调查资料，不要奇幻风，不要二次元，不要宏大战争宣传画，不要血腥，不要现代商业插画感太重。
```

## N.2 回合事件图模板

```txt
生成 16:9 横图，主题是【回合标题】。画面表现【事件含义】。使用旧地图、文件、电报、红线、印章、暗色档案桌元素。主体视觉居中，适合放入游戏回合简报。不要出现大段清晰文字，避免 AI 乱码。不要出现血腥战斗场面。
```

## N.3 卡牌图例模板

```txt
生成 1024x640 卡牌图例，主题是【卡牌类型】。画面应能让玩家一眼识别这是【外交 / 军事 / 情报 / 媒体 / 国际法等】类型。使用档案拼贴、旧照片、文件、地图、红线批注。不要依赖文字表达，不要放人物特写，不要过度复杂。
```

## N.4 结局主视觉模板

```txt
生成 16:9 结局报告主视觉，主题是【结局类型】。画面像历史事故报告终页，包含地图、档案文件、印章、红线、变量图表等元素。气质为【失败 / 延迟 / 局部控制 / 冻结 / 高压和平 / 异常奇迹】。不要做成普通胜利海报，不要战争爽感。
```

---

# 最终原则

图片不是装饰，而是帮助玩家理解历史危机正在发生。

一句话：

> 让玩家在读文字之前，先看见危机。
