# AUDIO_CUE_GUIDE.md

# 《历史现场调试器：1914》音乐与音效接入指南

本文档用于指导 Codex / 前端开发把 Manus 生成的 4 首音乐接入《历史现场调试器：1914》的测试环境，并规划后续需要补充的音效资产。

当前已有音乐：

1. 《战壕的黎明》（Dawn of the Trenches）
2. 《钢铁洪流》（Iron Torrent）
3. 《无名战士》（Unknown Soldier）
4. 《历史的回响》（Echoes of History）

---

## 1. 总体音频设计原则

《历史现场调试器：1914》的音乐不应该像普通战棋游戏一样只服务“燃”或“爽”。

本项目的核心气质是：

- 危机逼近
- 历史不可逆
- 外交误判
- 系统失控
- 反事实推演
- 事故调查
- 对战争后果的反思

因此音乐使用原则是：

> 音乐不是为了鼓励玩家发动战争，而是为了让玩家感到历史系统正在失控。

---

## 2. 音乐文件建议命名

请将音乐文件统一放入：

```txt
public/assets/audio/music/
```

推荐文件命名：

```txt
public/assets/audio/music/dawn-of-the-trenches.mp3
public/assets/audio/music/iron-torrent.mp3
public/assets/audio/music/unknown-soldier.mp3
public/assets/audio/music/echoes-of-history.mp3
```

如使用 `.wav` 或 `.ogg`，保持主文件名一致即可。

---

## 3. 音乐资产定义

建议前端建立音乐配置表：

```ts
export type MusicTrackId =
  | "dawn_of_the_trenches"
  | "iron_torrent"
  | "unknown_soldier"
  | "echoes_of_history";

export interface MusicTrack {
  id: MusicTrackId;
  titleZh: string;
  titleEn: string;
  src: string;
  defaultVolume: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}
```

推荐配置：

```ts
export const musicTracks: Record<MusicTrackId, MusicTrack> = {
  dawn_of_the_trenches: {
    id: "dawn_of_the_trenches",
    titleZh: "战壕的黎明",
    titleEn: "Dawn of the Trenches",
    src: "/assets/audio/music/dawn-of-the-trenches.mp3",
    defaultVolume: 0.55,
    loop: true,
    fadeInMs: 1800,
    fadeOutMs: 1600
  },
  iron_torrent: {
    id: "iron_torrent",
    titleZh: "钢铁洪流",
    titleEn: "Iron Torrent",
    src: "/assets/audio/music/iron-torrent.mp3",
    defaultVolume: 0.65,
    loop: true,
    fadeInMs: 800,
    fadeOutMs: 1200
  },
  unknown_soldier: {
    id: "unknown_soldier",
    titleZh: "无名战士",
    titleEn: "Unknown Soldier",
    src: "/assets/audio/music/unknown-soldier.mp3",
    defaultVolume: 0.5,
    loop: true,
    fadeInMs: 1800,
    fadeOutMs: 1800
  },
  echoes_of_history: {
    id: "echoes_of_history",
    titleZh: "历史的回响",
    titleEn: "Echoes of History",
    src: "/assets/audio/music/echoes-of-history.mp3",
    defaultVolume: 0.58,
    loop: false,
    fadeInMs: 1400,
    fadeOutMs: 1800
  }
};
```

---

# Part A：四首音乐的使用场景

## A.1 《战壕的黎明》（Dawn of the Trenches）

### 定位

主题曲 / 主旋律 / 危机主界面音乐。

### 音乐描述

以低沉的铜管和弦乐开场，逐渐构建成宏大的交响乐章，象征战争爆发前的压抑与命运的不可逆转。

### 建议使用场景

适合用于：

- 主菜单
- 案件选择界面
- 新游戏开场
- 七月危机序章
- 早期回合的背景音乐
- 危机尚未爆发但已经积累压力的阶段
- 玩家首次进入 `Case 001：1914 七月危机`

### 推荐触发条件

```ts
if (screen === "main_menu") playMusic("dawn_of_the_trenches");

if (screen === "case_intro") playMusic("dawn_of_the_trenches");

if (gameState.turn <= 4 && crisisStage === "stable" || crisisStage === "tense") {
  playMusic("dawn_of_the_trenches");
}
```

### 推荐使用阶段

| 阶段 | 是否使用 |
|---|---|
| 主菜单 | 是 |
| 案件开场 | 是 |
| 回合 1—4 | 是 |
| 回合 5 以后 | 视危机阶段而定 |
| 全面战争触发后 | 否 |
| 结局报告 | 通常否 |

### 设计说明

这首曲子应该建立游戏的“历史阴影”。  
它不应太频繁被切断，适合承担长期底色。

玩家一进入游戏，就应该听到一种感觉：

> 这不是普通历史选择题，而是一场正在走向灾难的系统调试。

---

## A.2 《钢铁洪流》（Iron Torrent）

### 定位

高压战斗曲 / 危机爆发曲 / 系统失控音乐。

### 音乐描述

节奏强劲，通过密集打击乐和爆发性铜管，展现战场残酷、紧张与工业时代战争力量。

### 建议使用场景

适合用于：

- 战争概率进入高危
- 危机阶段进入 `war_imminent`
- 触发军事动员链
- 俄国总动员
- 德国最后通牒
- 德国入侵比利时
- 全面战争结局判定
- 不可逆节点连续触发
- Time Advance Report 中出现严重升级

### 推荐触发条件

```ts
if (crisisStage === "war_imminent" || crisisStage === "irreversible") {
  playMusic("iron_torrent");
}

if (flags.russian_general_mobilization) {
  playMusic("iron_torrent");
}

if (flags.germany_invaded_belgium) {
  playMusic("iron_torrent");
}

if (warProbability >= 80) {
  playMusic("iron_torrent");
}
```

### 推荐使用阶段

| 阶段 | 是否使用 |
|---|---|
| 回合 1—4 | 通常否 |
| 回合 5—7 | 危机爆发时可短暂使用 |
| 回合 8—12 | 是，尤其动员与战争迫近阶段 |
| 不可逆节点 | 是 |
| 全面战争结局 | 是，可先使用后转入《无名战士》 |
| 和平类结局 | 否 |

### 设计说明

这首曲子不要太早使用。  
如果一开始就进入强战斗音乐，会破坏七月危机“逐步滑坡”的结构。

它最适合在玩家意识到“系统已经压不住了”的时候出现。

典型场景：

```txt
不可逆节点已触发：俄国总动员。
军事时间表刚性 +10。
全面战争概率 +12。
```

此时切入《钢铁洪流》，玩家会明显感受到局势从外交危机转为军事机器接管。

---

## A.3 《无名战士》（Unknown Soldier）

### 定位

哀悼曲 / 失败反思曲 / 战争代价主题。

### 音乐描述

充满哀悼与反思，以柔和弦乐和木管为主，辅以合唱，表达对生命消逝的悲悯和对和平的渴望。

### 建议使用场景

适合用于：

- 全面战争结局报告
- 延迟战争结局报告
- 局部战争但伤亡惨重的结局
- 玩家失败复盘
- “历史事故报告”中的牺牲与代价段落
- 查看战争后果说明
- 关键人物或平民代价相关情报
- 玩家触发不可逆节点后的反思弹窗

### 推荐触发条件

```ts
if (ending.type === "total_war") {
  playMusic("unknown_soldier");
}

if (ending.type === "delayed_war") {
  playMusic("unknown_soldier");
}

if (ending.type === "localized_war" && finalVariables.war_probability >= 60) {
  playMusic("unknown_soldier");
}

if (screen === "casualty_report" || screen === "failure_reflection") {
  playMusic("unknown_soldier");
}
```

### 推荐使用阶段

| 阶段 | 是否使用 |
|---|---|
| 主菜单 | 否 |
| 早期回合 | 否 |
| 动员阶段 | 可作为短暂过场使用 |
| 全面战争结局 | 是 |
| 失败复盘 | 是 |
| 战争代价说明 | 是 |
| 高压和平结局 | 可低音量使用，但不是首选 |

### 设计说明

《无名战士》应该用于提醒玩家：

> 失败不是数值没调好，而是真实生命被历史系统吞没。

它适合在《钢铁洪流》之后使用。  
例如全面战争结局触发时：

1. 不可逆节点触发：《钢铁洪流》
2. 结局判定画面：《钢铁洪流》淡出
3. 历史事故报告展开：《无名战士》淡入

这样可以形成从“系统失控”到“战争代价”的情绪转折。

---

## A.4 《历史的回响》（Echoes of History）

### 定位

结局曲 / 胜利曲 / 复盘希望曲。

### 音乐描述

作为结局或胜利曲，它在展现胜利喜悦的同时，保留深沉历史厚重感，旋律宏大而充满希望。

### 建议使用场景

适合用于：

- 高压和平结局
- 国际会议冻结危机结局
- 巴尔干局部战争被成功控制的结局
- 玩家完成一局后的总结界面
- 结算报告分享界面
- Credits / 制作人员名单
- 首次达成较好结局
- 教学 Demo 成功完成

### 推荐触发条件

```ts
if (ending.type === "coercive_peace") {
  playMusic("echoes_of_history");
}

if (ending.type === "conference_freeze") {
  playMusic("echoes_of_history");
}

if (ending.type === "localized_war" && finalVariables.war_probability < 60) {
  playMusic("echoes_of_history");
}

if (screen === "credits") {
  playMusic("echoes_of_history");
}
```

### 推荐使用阶段

| 阶段 | 是否使用 |
|---|---|
| 主菜单 | 可作为二周目菜单版本 |
| 成功结局 | 是 |
| 会议冻结结局 | 是 |
| 高压和平结局 | 是 |
| 制作人员名单 | 是 |
| 全面战争结局 | 否 |
| 动员阶段 | 否 |

### 设计说明

这首曲子不是单纯“胜利欢呼”。  
它应该表达：

> 你没有改写历史成为童话，但你让系统没有彻底崩溃。

适合在结算报告里展示玩家关键行动、最终变量、事故复盘和分享短句时播放。

---

# Part B：基于危机阶段的音乐切换逻辑

## B.1 危机阶段到音乐的默认映射

```ts
const crisisStageMusicMap = {
  stable: "dawn_of_the_trenches",
  tense: "dawn_of_the_trenches",
  ultimatum: "dawn_of_the_trenches",
  mobilization: "iron_torrent",
  war_imminent: "iron_torrent",
  irreversible: "iron_torrent"
};
```

## B.2 结局到音乐的默认映射

```ts
const endingMusicMap = {
  total_war: "unknown_soldier",
  delayed_war: "unknown_soldier",
  localized_war_bad: "unknown_soldier",
  localized_war_controlled: "echoes_of_history",
  conference_freeze: "echoes_of_history",
  coercive_peace: "echoes_of_history",
  low_credibility_miracle: "echoes_of_history"
};
```

## B.3 更细的优先级规则

音乐选择优先级建议如下：

```txt
1. 用户手动关闭音乐
2. 特殊剧情 / 结局强制音乐
3. 不可逆节点音乐
4. 当前危机阶段音乐
5. 默认场景音乐
```

对应逻辑：

```ts
function resolveMusicCue(context: MusicContext): MusicTrackId | null {
  if (context.userMutedMusic) return null;

  if (context.screen === "ending_report") {
    return resolveEndingMusic(context.ending);
  }

  if (context.justTriggeredIrreversibleEvent) {
    return "iron_torrent";
  }

  if (context.screen === "main_menu" || context.screen === "case_intro") {
    return "dawn_of_the_trenches";
  }

  return resolveCrisisStageMusic(context.crisisStage);
}
```

---

# Part C：具体触发点建议

## C.1 主菜单

播放：

```txt
《战壕的黎明》
```

说明：

- 低音量循环。
- 作为游戏主旋律。
- 进入案件后不要立刻切断，可通过淡入淡出延续。

---

## C.2 案件开场

播放：

```txt
《战壕的黎明》
```

说明：

- 继续使用主旋律。
- 可在案件介绍文字出现时略微提高音量。
- 进入第一回合后保持。

---

## C.3 回合 1—4

播放：

```txt
《战壕的黎明》
```

适合表达：

- 刺杀后的压抑
- 外交失真
- 空白支票
- 最后通牒形成前的暗流

不要过早使用《钢铁洪流》。

---

## C.4 回合 5—7

默认仍可使用：

```txt
《战壕的黎明》
```

但如果出现以下情况，切换到：

```txt
《钢铁洪流》
```

触发条件：

- `war_probability >= 70`
- `alliance_lock_in >= 70`
- `austrian_hardline >= 80`
- 奥匈宣战相关 flag 触发
- 玩家推进后触发高风险 specialRule

---

## C.5 回合 8—12

默认根据危机阶段判断：

| 条件 | 音乐 |
|---|---|
| 动员未触发，战争概率 < 70 | 《战壕的黎明》 |
| 俄国动员压力高 | 《钢铁洪流》 |
| 军事时间表刚性高 | 《钢铁洪流》 |
| 德国入侵比利时 | 《钢铁洪流》 |
| 系统不可逆 | 《钢铁洪流》 |

---

## C.6 不可逆节点触发

播放：

```txt
《钢铁洪流》
```

建议：

- 如果当前正在播放《战壕的黎明》，在 800ms 内淡出。
- 《钢铁洪流》快速淡入。
- 同时播放一个短音效，例如 `sfx-irreversible-lock.wav`。

---

## C.7 结局报告

结局报告不应统一播放同一首音乐，而应根据结局类型选择。

| 结局 | 音乐 |
|---|---|
| 全面战争 | 《无名战士》 |
| 延迟战争 | 《无名战士》 |
| 巴尔干局部战争，风险仍高 | 《无名战士》 |
| 巴尔干局部战争，成功控制 | 《历史的回响》 |
| 国际会议冻结危机 | 《历史的回响》 |
| 高压和平 | 《历史的回响》 |
| 低可信奇迹 | 《历史的回响》，但建议低音量或加异常音效 |

---

## C.8 Credits / Demo 结束

播放：

```txt
《历史的回响》
```

说明：

- 适合用于完成 Demo 后的收束。
- 可以配合“历史事故报告归档”的视觉。

---

# Part D：音乐播放实现要求

## D.1 淡入淡出

不要硬切音乐。  
所有曲目切换都应使用 fade。

推荐：

```txt
普通切换：1500ms fade out + 1500ms fade in
高危切换：800ms fade out + 800ms fade in
结局切换：1800ms fade out + 1800ms fade in
```

## D.2 音量

建议默认音量：

```txt
主题 / 背景：0.45—0.55
战斗 / 高压：0.55—0.65
哀悼 / 反思：0.45—0.55
胜利 / 结局：0.5—0.6
```

不要盖过 UI 音效。

## D.3 用户控制

必须提供：

- 音乐开关
- 音效开关
- 音乐音量
- 音效音量

建议存入 localStorage：

```ts
interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}
```

## D.4 浏览器自动播放限制

不要假设页面加载后音乐一定会自动播放。  
应在用户第一次点击“开始游戏”或“进入案件”后启动音乐。

建议：

```ts
await audioManager.unlockAudio();
playMusic("dawn_of_the_trenches");
```

---

# Part E：推荐补充音效清单

你可以继续用 Manus 生成以下音效。  
这些音效会显著提升“调试器 + 历史档案 + 危机压迫感”。

---

## E.1 UI 基础音效

### `sfx-ui-hover.wav`

用途：

- hover 卡牌
- hover 时间线节点
- hover 变量项

风格：

```txt
轻微、克制、低频木质或纸张质感，不要科幻过强。
```

---

### `sfx-ui-click.wav`

用途：

- 普通按钮点击
- 关闭弹窗
- 打开详情

风格：

```txt
短促、干净、像档案按钮或机械按键。
```

---

### `sfx-ui-confirm.wav`

用途：

- 确认使用卡牌
- 确认推进时间

风格：

```txt
低沉但明确，带一点盖章或电报确认感。
```

---

## E.2 档案与情报音效

### `sfx-intel-open.wav`

用途：

- 打开情报卡
- 阅读档案

风格：

```txt
纸张翻动 + 轻微抽屉/文件夹声音。
```

---

### `sfx-document-stamp.wav`

用途：

- 结算报告盖章
- 不可逆节点盖章
- 卡牌状态变成已错过

风格：

```txt
厚重印章落下，带短暂纸面震动。
```

---

### `sfx-telegram-received.wav`

用途：

- 新情报出现
- 回合开始收到外交电报
- 危机事件通知

风格：

```txt
短促电报码 / 老式电报机，不要太长。
```

---

## E.3 卡牌相关音效

### `sfx-card-select.wav`

用途：

- 选择干预卡

风格：

```txt
纸牌轻触 + 文件滑动。
```

---

### `sfx-card-use.wav`

用途：

- 使用干预卡

风格：

```txt
文件递交、签字、轻微盖章混合。
```

---

### `sfx-card-locked.wav`

用途：

- 点击条件不足卡牌
- 点击 AP 不足卡牌

风格：

```txt
轻微锁扣声，不要太刺耳。
```

---

### `sfx-card-expired.wav`

用途：

- 卡牌因推进时间而过期
- 已错过窗口

风格：

```txt
纸张被收走、档案封存、短促低沉。
```

---

## E.4 变量与风险音效

### `sfx-variable-up.wav`

用途：

- 风险变量上升
- 战争概率上升

风格：

```txt
短促上行音，带一点警告感。
```

---

### `sfx-variable-down.wav`

用途：

- 风险变量下降
- 外交信任上升

风格：

```txt
短促下行音，冷静、克制。
```

---

### `sfx-risk-warning.wav`

用途：

- 变量进入 high
- 危机阶段升级

风格：

```txt
低频警告，不要像现代警报器那么刺耳。
```

---

### `sfx-risk-critical.wav`

用途：

- 变量进入 critical
- 全面战争概率超过 80

风格：

```txt
沉重、短促、类似远处警钟或金属低鸣。
```

---

## E.5 时间推进音效

### `sfx-time-advance.wav`

用途：

- 点击推进时间
- 时间线向前移动

风格：

```txt
时钟齿轮 + 纸张翻页 + 低频过渡。
```

---

### `sfx-turn-briefing.wav`

用途：

- 新回合开始
- 危机简报打开

风格：

```txt
档案页展开 + 轻微电流/电报提示。
```

---

## E.6 不可逆与反噬音效

### `sfx-backlash-trigger.wav`

用途：

- 卡牌反噬触发

风格：

```txt
短促红色警报感，带文件撕裂或系统错误感。
```

---

### `sfx-irreversible-lock.wav`

用途：

- 不可逆节点触发

风格：

```txt
重锁扣 + 低频冲击 + 远处鼓点。
```

---

### `sfx-war-threshold.wav`

用途：

- 全面战争概率跨过关键阈值
- 系统进入战争迫近

风格：

```txt
沉重铜管短音 + 战争机器启动感。
```

---

## E.7 结局报告音效

### `sfx-ending-report-open.wav`

用途：

- 结算报告打开

风格：

```txt
厚文件夹打开 + 纸张展开。
```

---

### `sfx-ending-stamp-success.wav`

用途：

- 高压和平、国际会议冻结、较好结局

风格：

```txt
庄重但不浮夸的盖章声，带轻微亮色尾音。
```

---

### `sfx-ending-stamp-failure.wav`

用途：

- 全面战争、延迟战争、失败结局

风格：

```txt
沉重盖章，低频下坠，无胜利感。
```

---

# Part F：第一批最值得生成的音效

如果只先生成 10 个，优先级如下：

```txt
sfx-ui-click.wav
sfx-card-select.wav
sfx-card-use.wav
sfx-intel-open.wav
sfx-document-stamp.wav
sfx-time-advance.wav
sfx-risk-warning.wav
sfx-backlash-trigger.wav
sfx-irreversible-lock.wav
sfx-ending-report-open.wav
```

这 10 个能覆盖：

- 基础 UI
- 情报阅读
- 用卡
- 推进时间
- 风险提示
- 反噬
- 不可逆节点
- 结算报告

---

# Part G：Codex 接入任务说明

可以直接给 Codex：

```txt
请根据 AUDIO_CUE_GUIDE.md 接入游戏音乐和基础音效系统。

要求：

1. 新建目录：
   - public/assets/audio/music/
   - public/assets/audio/sfx/

2. 新建音频配置：
   - src/audio/musicTracks.ts
   - src/audio/sfxTracks.ts
   - src/audio/audioManager.ts

3. 实现功能：
   - playMusic(trackId)
   - stopMusic()
   - crossfadeMusic(nextTrackId)
   - playSfx(sfxId)
   - setMusicVolume(volume)
   - setSfxVolume(volume)
   - muteMusic()
   - muteSfx()

4. 音乐根据以下场景切换：
   - 主菜单 / 案件开场 / 回合 1—4：Dawn of the Trenches
   - 动员阶段 / 战争迫近 / 不可逆节点：Iron Torrent
   - 全面战争 / 延迟战争 / 失败复盘：Unknown Soldier
   - 高压和平 / 国际会议冻结 / 较好结局 / Credits：Echoes of History

5. 音效先支持 fallback：
   - 如果音效文件不存在，不要报错。
   - console.warn 一次即可。

6. 必须提供设置项：
   - musicEnabled
   - sfxEnabled
   - musicVolume
   - sfxVolume
   - 保存到 localStorage

7. 注意浏览器自动播放限制：
   - 只有用户点击“开始游戏”或“进入案件”后再初始化 audio context。

8. 不要改动核心 game engine。
9. 保持现有测试环境可运行。
```

---

# 最终原则

音乐系统的目标不是“填满背景”，而是帮玩家理解局势：

- 《战壕的黎明》：历史阴影正在形成。
- 《钢铁洪流》：军事机器开始接管。
- 《无名战士》：失败意味着生命代价。
- 《历史的回响》：系统没有彻底崩溃，但历史仍留下回声。

一句话：

> 音乐不是奖励玩家发动战争，而是提醒玩家战争为何可怕。
