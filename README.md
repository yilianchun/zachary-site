# zachary-site

Zachary 的个人主页，计划使用 Astro 构建并部署到 Cloudflare Pages。

详细搭建、部署和维护记录见 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)。

## Scripts

- `npm run dev`：本地开发预览
- `npm run build`：类型检查并生成静态站点
- `npm run preview`：预览构建产物

## Content

- 博客文章：在 `src/content/blog/` 新增 Markdown 文件。
- Docs 资源：在 `src/content/docs/` 新增 JSON 文件。
- Life 记录：在 `src/content/life/` 新增 JSON 文件，图片可先放在 `public/life/`。

## Deploy

Cloudflare Pages 推荐配置：

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`