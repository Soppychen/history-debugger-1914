# 发布到 Internet

本项目是 React + TypeScript + Vite 的静态前端应用。生产构建输出目录是 `dist/`，可以直接部署到 Netlify、Vercel、Cloudflare Pages 或 GitHub Pages。

## 发布前检查

```bash
npm install
npm test
npm run build
npm run preview
```

确认本地 preview 能正常打开后，再发布。

## 推荐：Netlify

仓库已经包含 `netlify.toml`，Netlify 导入 Git 仓库后会自动使用：

```txt
Build command: npm run build
Publish directory: dist
Node version: 20
```

步骤：

1. 将项目推到 GitHub。
2. 在 Netlify 选择 “Add new site” → “Import an existing project”。
3. 选择 GitHub 仓库。
4. 保持默认构建配置，点击 Deploy。
5. 部署完成后，Netlify 会给出公网试玩链接。

## Vercel

Vercel 也可以自动识别 Vite 项目。导入仓库后确认：

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Node.js Version: 20
```

## GitHub Pages

如果发布到 `https://用户名.github.io/仓库名/`，需要在 `vite.config.ts` 增加：

```ts
export default defineConfig({
  plugins: [react()],
  base: "/仓库名/",
});
```

如果使用自定义域名或根路径部署，保持默认 `base: "/"` 即可。

## 资源注意事项

- `public/assets` 会被复制进 `dist`，当前包含图片、音频、SVG、JSON 数据。
- 音频需要用户首次点击或按键后才能播放，这是浏览器自动播放策略。
- 目前音频文件使用 `.wav` 文件名，但体积约 25 MB；公开试玩前可以进一步压缩成 `.mp3` 或 `.ogg`，再更新 `src/audio/audioConfig.ts`。
- `netlify.toml` 已为 `/assets/*` 设置长期缓存，为 `/data/*.json` 设置短缓存，方便后续调整数据。
