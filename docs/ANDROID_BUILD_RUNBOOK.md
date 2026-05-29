# Android 本地构建运行手册

目标：生成《历史现场调试器：1914》第一版离线试玩 APK。

## 前置要求

- Node 22+，当前开发机已验证 Node 24 可用。
- JDK 21。本机已通过 Homebrew 安装 `openjdk@21`。
- Android Studio 2025.2.1+，或 Android command line tools。
- Android SDK API 24+，本机已安装 Android 36 平台与 build-tools。

## 常用命令

```bash
npm test
npm run android:sync
npm run android:open
```

运行到设备：

```bash
npm run android:run
```

只复制 Web 资源：

```bash
npm run android:copy
```

## 当前 Android 决策

- package id：`com.historydebugger.case1914`
- App 名称：`历史现场调试器：1914`
- 第一版目标：离线试玩 APK
- 屏幕方向：横屏锁定
- 管理员后台：Android 中隐藏
- 存储：第一版继续 localStorage

## APK 构建

打开 Android Studio 后：

```txt
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

或命令行：

```bash
cd android
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./gradlew assembleDebug
```

Debug APK 通常位于：

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## 当前本机构建记录

已完成：

- `npm test` 通过。
- `npm run android:sync` 通过。
- Capacitor 已生成 `android/` 工程。
- Web 资源已同步到 Android assets。
- 已安装 JDK 21：`/opt/homebrew/opt/openjdk@21`。
- 已安装 Android command line tools。
- 已安装 Android SDK platform-tools、Android 36 平台、build-tools。
- 已写入本机专用 `android/local.properties` 指向 SDK 目录。
- 已通过 `./gradlew assembleDebug` 生成 debug APK。

本机 SDK 路径：

```txt
/opt/homebrew/share/android-commandlinetools
```

本机 debug APK 输出：

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

注意：Capacitor Android 当前编译使用 Java source 21，JDK 17 会报 `无效的源发行版：21`。本项目本机命令行构建使用 JDK 21。

## 验收清单

1. 首次打开无白屏。
2. 横屏显示。
3. Turn 1 图片和卡牌图片加载。
4. 情报卡可打开。
5. 可用卡并推进回合。
6. 可存档读档。
7. 铁人模式禁用读档。
8. 结局报告显示 HDB 分数和结局图。
9. 断网后可启动并游玩。
10. `#admin` 不进入管理员后台。
