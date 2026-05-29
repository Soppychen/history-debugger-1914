# 《历史现场调试器：1914》Android App 技术方案评审稿

日期：2026-05-21  
目标：把当前 React + TypeScript + Vite 网页试玩版封装为可安装、可测试、可上架演进的 Android App。

评审结论已更新：

- 第一版目标：离线试玩 APK，暂不考虑 Google Play 上架。
- 包名：`com.historydebugger.case1914`。
- App 中文名：`历史现场调试器：1914`。
- 屏幕方向：横屏优先。
- 分发渠道：暂不考虑国内渠道或 Google Play。
- 管理员后台：Android 第一版隐藏。
- 存档与榜单：第一版可继续本地存储；真实跨玩家天梯必须联网并接后端。

---

## 1. 结论摘要

推荐第一阶段采用 **Capacitor Android WebView 壳方案**：

```txt
现有 React/Vite 游戏核心
        ↓
npm run build 生成静态 dist
        ↓
Capacitor 同步到 android/
        ↓
Android Studio 构建 APK / AAB
```

理由：

- 当前游戏核心已经是完整 Web App，规则、图片、音频、存档、榜单 mock 都在前端闭环中。
- 目前没有重度原生能力需求，不值得重写为 Kotlin/原生 Android 或 React Native。
- Capacitor 允许保留 Web 技术栈，同时未来可逐步接入原生能力，如本地文件、震动反馈、分享、离线存储、推送等。
- Android App 第一版重点应是“可安装、可离线试玩、性能稳定、资源路径正确”，而不是重写 UI。

---

## 2. 当前项目评估

当前技术栈：

- React 19
- TypeScript
- Vite 7
- Plain CSS
- 静态 JSON 数据：`public/data`
- 静态图片/音频：`public/assets`
- 本地身份、存档、分析、榜单 mock：`localStorage`
- 构建入口：`npm run build`

当前 App 化优势：

- 已经是 SPA，适合直接嵌入 WebView。
- 数据和资源都在 `public/`，可以随 App 打包离线运行。
- 规则引擎不依赖服务端。
- `npm test` 已覆盖数据、路线、天梯、视觉资源和 build。

当前 App 化风险：

- `localStorage` 在 WebView 中可用，但长期可靠性和迁移能力不如 Capacitor Preferences / SQLite。
- 图片和音频资源体积已经明显增长，APK/AAB 体积需要监控。
- 手机竖屏下当前 UI 信息密度较高，需要单独做移动布局 QA。
- Android WebView 音频策略、返回键、状态栏、安全区、低端机性能都需要实机测试。

---

## 3. 方案对比

### 方案 A：Capacitor 封装现有 Web App（推荐）

实现方式：

- 安装 Capacitor。
- 初始化 native Android 工程。
- 将 `dist/` 同步到 Android WebView。
- 使用 Android Studio 构建和签名。

优点：

- 最快拿到 APK。
- 最大限度复用现有代码。
- 未来仍可接原生插件。
- Web 与 Android 可共用一套玩法逻辑。

缺点：

- 性能上限受 WebView 影响。
- 原生体验需要额外处理，如返回键、启动页、状态栏。
- 如果未来要复杂离线数据库，需要新增桥接层。

### 方案 B：PWA 安装

实现方式：

- 加 manifest、service worker。
- 用户从浏览器安装到桌面。

优点：

- 成本低。
- 仍走网页部署。

缺点：

- 不是标准 APK/AAB。
- 分发、留存、启动体验弱于 App。
- 国内 Android 生态兼容和安装体验不稳定。

适合作为补充，不建议作为主路线。

### 方案 C：React Native / Kotlin 原生重写

优点：

- 原生性能和体验最好。

缺点：

- 成本极高。
- 需要重写 UI、资源系统、存档、音频、规则桥接。
- 当前阶段收益不足。

不建议第一阶段采用。

---

## 4. 推荐技术架构

```txt
src/
  gameLogic.ts              # 核心玩法，继续平台无关
  assets/                   # 图片 manifest，继续平台无关
  audio/                    # 音频配置，Android 需实机验证
  analytics/ auth/ save/    # 第一阶段 local mock，后续替换为 Capacitor/后端 client

public/
  data/                     # 随包离线数据
  assets/                   # 随包离线图片、音频

android/
  app/                      # Capacitor 生成的 Android 工程

capacitor.config.ts
```

关键原则：

- 不复制规则逻辑到 Android 原生层。
- Android 只作为“运行容器 + 原生能力适配层”。
- 所有 gameplay 数据仍由 JSON / TypeScript 读取。
- Android 专属差异集中在 `platform/` 或 client 适配层，避免污染核心组件。

---

## 5. 版本和工具链建议

推荐使用当前 Capacitor 主线，但要注意环境要求。

官方文档显示：

- Capacitor 是面向 Web App 的跨平台原生运行时，可将现有现代 Web 项目转换为 Android/iOS/PWA 应用。
- Capacitor Android 由 Android Studio 配置和管理。
- Android 支持 API 24+，也就是 Android 7 或更高。
- 当前 Capacitor v8 环境要求 Node 22+，Android 开发需要 Android Studio 和 Android SDK；Capacitor v8 要求 Android Studio 2025.2.1+。

因此建议：

```txt
Node：22 LTS 或更高
Capacitor：v8
Android Studio：2025.2.1+
Android SDK：API 24+，建议同时安装当前稳定 API
输出：debug APK、release AAB
```

如果当前开发机暂时不方便升级到 Node 22 / Android Studio 2025.2.1，可以短期选择 Capacitor v7，但这会增加后续升级成本。我的建议是：**正式 Android 分支直接对齐 Capacitor v8**。

---

## 6. 第一阶段实施范围

第一阶段目标：可安装离线试玩 APK。

当前实施状态：

- 已接入 Capacitor Android。
- 已生成 `capacitor.config.ts` 和 `android/` 工程。
- 已增加 Android npm scripts。
- 已设置 Android 横屏优先。
- 已在 Android 原生环境中隐藏 `#admin` 管理员后台。
- `npm test` 与 `npm run android:sync` 已通过。
- 命令行 `./gradlew assembleDebug` 已通过，debug APK 已生成，详见 `docs/ANDROID_BUILD_RUNBOOK.md`。

包含：

1. 初始化 Capacitor：
   - `@capacitor/core`
   - `@capacitor/cli`
   - `@capacitor/android`
2. 新增 `capacitor.config.ts`：
   - appId：`com.historydebugger.case1914`
   - appName：`历史现场调试器：1914`
   - webDir：`dist`
3. 新增 Android 工程：
   - `android/`
4. 新增脚本：
   - `android:init`
   - `android:sync`
   - `android:open`
   - `android:run`
5. 保持现有 `npm test`。
6. App 内资源全部随包离线。
7. Android 端图标、启动页先用临时素材或现有品牌资产。
8. Android 第一版隐藏管理员后台入口。
9. 禁止引入复杂原生功能，先保证核心循环。

不包含：

- Google Play 正式上架。
- 国内应用商店分发。
- 云存档。
- 真实排行榜后端。
- Push。
- 登录 SDK。
- 支付。
- 原生重写 UI。

---

## 7. 目录和文件变更建议

新增：

```txt
capacitor.config.ts
android/
docs/ANDROID_BUILD_RUNBOOK.md
src/platform/
  platform.ts
  storageClient.ts
```

可选新增：

```txt
public/manifest.webmanifest
public/assets/app-icon/
```

`src/platform/storageClient.ts` 第一阶段可以只是包装 `localStorage`，为以后替换到 Capacitor Preferences 或 SQLite 留接口。

---

## 8. Android 适配项

### 8.1 资源路径

当前使用：

```txt
/assets/...
/data/...
```

Vite + Capacitor 打包后通常可继续工作，但需要实机验证：

- JSON 是否正常加载。
- 图片 manifest 是否命中。
- 音频是否能播放。
- fallback 是否正常。

验收点：

```txt
首次打开无白屏
Turn 1 事件图加载
卡牌类型图加载
结局图加载
音频解锁后能播放
```

### 8.2 返回键

Android 返回键建议规则：

```txt
如果有 modal 打开：关闭最上层 modal
否则如果在 leaderboard/admin/settings：回到主游戏
否则二次返回退出 App
```

可用 Capacitor App 插件处理。

第一阶段也可以先不接插件，使用默认 WebView 行为，但试玩体验会弱一些。

### 8.3 屏幕方向

评审决策：**横屏优先**。

当前 UI 信息密度高，建议：

```txt
第一版：横屏优先，必要时锁定 landscape
补充：保留竖屏降级体验或提示“横屏体验更佳”
```

如果第一版测试发现竖屏信息密度过高，可以直接锁横屏，降低移动布局成本。

### 8.4 安全区与状态栏

需要检查：

- 刘海屏顶部遮挡。
- Android 导航栏底部遮挡。
- Modal 是否可滚动。
- 结局报告是否可完整阅读。

建议 CSS 增加：

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### 8.5 音频

当前音频依赖用户手势解锁，这在 Android WebView 中仍然合理。

验收点：

- 点击“启用音频”后音乐播放。
- SFX 不明显延迟。
- 切后台/回前台后状态合理。

### 8.6 存档

第一阶段：

```txt
继续 localStorage
```

第二阶段：

```txt
Capacitor Preferences：小型 key-value，例如设置、玩家编码
SQLite / 文件系统：较多存档、分析事件、离线历史记录
```

原因：

- `localStorage` 对试玩足够。
- 但正式 App 需要更可靠迁移、备份和容量控制。

### 8.7 管理员后台

评审决策：**Android 第一版隐藏管理员后台**。

当前 Web 版本存在隐藏后台路由：

```txt
#admin
```

Android 第一版建议：

- 不在任何 UI 中提供入口。
- 在 Android 构建中拦截或禁用该 hash route。
- 如需内部测试，可保留 debug build 专用开关，但对外试玩 APK 默认隐藏。

---

## 9. 数据库判断

Android App 本身不强制需要数据库。

如果目标是：

```txt
单机试玩
离线体验
本地存档
本地个人榜单
```

则第一阶段不需要远程数据库。

当前项目里的“天梯 / 榜单”要分两类理解：

```txt
本地个人历史榜 / 本地 mock leaderboard：
不需要联网，不需要数据库，只存在当前设备。

真实跨玩家天梯：
必须联网，必须有后端数据库，客户端分数不能被信任。
```

因此第一版离线 APK 可以继续使用 localStorage，展示“个人历史榜”和“本地 mock 榜单”。但它不能被宣传为全服天梯或公平排行榜。

但如果目标升级为：

```txt
跨设备恢复
真实玩家账户
真实排行榜
后台分析所有玩家
防作弊重算
每周挑战统一分发
```

则需要后端数据库。推荐仍然是：

```txt
Supabase / Postgres
或 Netlify Functions + Supabase
```

Android 化与数据库可以分开做。建议先完成本地 APK，再接远程数据。

---

## 10. 构建流程草案

初始化：

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "历史现场调试器：1914" "com.historydebugger.case1914" --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

日常同步：

```bash
npm test
npm run build
npx cap sync android
npx cap run android
```

发布包：

```bash
npm test
npm run build
npx cap sync android
# Android Studio 生成 signed APK；暂不需要 AAB
```

---

## 11. 建议 npm scripts

```json
{
  "android:sync": "npm run build && npx cap sync android",
  "android:open": "npx cap open android",
  "android:run": "npm run build && npx cap run android",
  "android:copy": "npm run build && npx cap copy android"
}
```

是否把 `npm test` 放进 `android:sync`：

- 本地快速迭代可以不放。
- CI / release 必须放。

---

## 12. 测试计划

### 12.1 Web 回归

继续跑：

```bash
npm test
```

覆盖：

- JSON 读取
- 路线结局
- ladder seed / score
- visual assets
- TypeScript build

### 12.2 Android Debug APK 验收

设备矩阵：

```txt
Android 7 / API 24：最低兼容边界
Android 10：常见 WebView 分界
Android 14/15/16：现代设备
小屏手机：约 360x800 CSS px
大屏手机：约 430x930 CSS px
平板或横屏：可选
```

手动路线：

1. 首次打开 App。
2. 通过隐私弹窗。
3. 查看 Turn 1 简报。
4. 阅读情报。
5. 使用一张干预卡。
6. 推进回合。
7. 手动存档。
8. 重启 App 后读档。
9. 走到结局。
10. 查看 HDB 分数和结局图。
11. 查看本地榜单。
12. 切后台再回到 App。
13. 断网启动，确认可离线玩。

### 12.3 Android 专项

- 返回键关闭弹窗。
- 音频解锁与暂停。
- 大图片内存压力。
- 低端机滚动流畅度。
- WebView 清缓存后恢复逻辑。
- APK/AAB 体积。

---

## 13. CI/CD 建议

第一阶段：

```txt
GitHub Actions 跑 npm test
本地 Android Studio 出 debug APK
```

第二阶段：

```txt
GitHub Actions 或 EAS/Appflow/自建 Runner 构建 AAB
上传 artifact
手动签名或安全注入 keystore
```

注意：

- Android signing keystore 不应提交到 Git。
- GitHub Secrets 保存 keystore base64、alias、password。
- release AAB 应带版本号和 changelog。

---

## 14. 版本策略

建议：

```txt
Web version：0.1.x
Android versionName：0.1.0
Android versionCode：1
package id：com.historydebugger.case1914
```

以后：

```txt
每次公网/Android 测试发布递增 versionCode
玩法大版本递增 versionName
```

---

## 15. 隐私与合规

第一版不申请敏感权限。

建议：

- 不申请定位。
- 不申请通讯录。
- 不申请相机。
- 不申请存储权限，除非实现导出文件到系统目录。
- 默认本地存储，隐私说明中写明。

如果后续接远程分析：

- 需要隐私政策。
- 需要用户同意。
- 需要说明匿名数据类型。
- 排行榜提交要明确告知。

---

## 16. 主要风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| WebView 低端机性能不足 | 滚动卡顿 | 限制动画，压缩图片，懒加载 |
| APK 体积过大 | 安装门槛高 | 图片压缩，AAB 分发 |
| localStorage 数据丢失 | 玩家存档风险 | 第二阶段迁移 Preferences/SQLite |
| Android 返回键体验差 | 容易误退出 | 接 Capacitor App 插件 |
| 音频策略差异 | 无声或延迟 | 保留手动启用音频，实机 QA |
| Node/Capacitor 版本冲突 | 构建失败 | Android 分支统一 Node 22 |

---

## 17. 实施里程碑

### M1：Android 壳可运行

- 安装 Capacitor。
- 生成 Android 工程。
- debug APK 可安装。
- 核心 12 回合可跑。

### M2：移动体验修正

- 安全区。
- 返回键。
- 竖屏布局修正。
- 音频与资源 QA。

### M3：发布准备

- App icon / splash。
- release signing。
- versionCode。
- APK 构建。
- 隐私说明。

### M4：正式能力增强

- Preferences/SQLite。
- 远程账号/排行榜。
- 后端分析。
- 防作弊重算。

---

## 18. 评审问题

已确认：

1. 第一版 Android 是“离线试玩 APK”，暂不考虑 Google Play AAB。
2. 包名使用 `com.historydebugger.case1914`。
3. App 中文名使用 `历史现场调试器：1914`。
4. 第一版可继续使用 `localStorage`；本地个人榜不需要联网，真实跨玩家天梯需要联网和后端数据库。
5. 横屏优先。
6. 目前不考虑国内分发渠道。
7. Android 第一版隐藏管理员后台。

---

## 参考资料

- Capacitor 官方文档：<https://capacitorjs.com/docs>
- Capacitor Android 文档：<https://capacitorjs.com/docs/android>
- Capacitor 环境要求：<https://capacitorjs.com/docs/getting-started/environment-setup>
- Android Studio 安装文档：<https://developer.android.com/studio/install>
