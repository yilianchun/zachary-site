# Zachary Site 项目总结

更新时间：2026-05-08

本文档总结 Zachary 个人主页从本地搭建、GitHub 提交到 Cloudflare Pages 部署与域名绑定的完整过程，并给出之后维护和扩展的方法。

## 1. 当前结论

项目已经完成第一版上线。

- 本地项目路径：`D:\Desktop\vps\zachary-site`
- GitHub 仓库：`https://github.com/yilianchun/zachary-site`
- Cloudflare Pages 项目：`zachary-site`
- Pages 默认访问地址：`https://zachary-site.pages.dev`
- 自定义域名：`https://993216.xyz`
- 生产分支：`main`
- 构建命令：`npm run build`
- 构建输出目录：`dist`

已经验证过：

- 本地 `npm run build` 通过。
- GitHub `main` 分支已经推送到远程仓库。
- Cloudflare Pages 首次部署成功。
- `https://zachary-site.pages.dev` 可以访问。
- `https://993216.xyz` 可以访问，并返回 `200 OK`。
- `993216.xyz` 的权威名称服务器是 Cloudflare：`chin.ns.cloudflare.com` 和 `sonny.ns.cloudflare.com`。

## 2. 关于注册商自定义名称服务器和 Pages 自定义域

你之前在域名注册商那里把 `993216.xyz` 托管到 Cloudflare，并设置了自定义名称服务器：

- `chin.ns.cloudflare.com`
- `sonny.ns.cloudflare.com`

这和现在在 Cloudflare Pages 里绑定 `993216.xyz` 没有冲突。它们是同一条部署链路里的两个不同层级。

简单说：

1. 注册商的名称服务器设置决定“谁来管理这个域名的 DNS”。
2. 你把名称服务器改成 Cloudflare，意思是让 Cloudflare 成为 `993216.xyz` 的权威 DNS 管理方。
3. Cloudflare Pages 的自定义域绑定，是在 Cloudflare DNS 内部给 `993216.xyz` 添加指向 Pages 项目的记录。
4. 因为 Cloudflare 已经是 DNS 管理方，所以 Pages 可以自动添加并管理这条记录。

也就是说，注册商处的 Cloudflare 名称服务器是前提，Pages 自定义域是结果。两者不是冲突，而是配合。

Cloudflare 为根域名 `993216.xyz` 添加的是类似这样的记录：

```text
类型：CNAME
名称：993216.xyz
目标：zachary-site.pages.dev
代理：开启
TTL：自动
```

根域名通常不能在普通 DNS 中直接使用 CNAME，但 Cloudflare 支持 CNAME flattening，所以这种配置是允许的。

可能产生冲突的情况主要有这些：

- Cloudflare DNS 里同时存在其他指向根域名 `993216.xyz` 的 A、AAAA 或 CNAME 记录。
- 同一个根域名被绑定到了另一个 Pages 项目或其他 Cloudflare 服务。
- 注册商那里设置的名称服务器不是当前 Cloudflare 账户要求的那一组。
- 域名开启了 DNSSEC，但注册商侧 DS 记录和 Cloudflare 侧 DNSSEC 配置不一致。
- HTTPS 证书还在签发或验证中，短时间内访问不稳定。

目前检查结果正常：名称服务器已经指向 Cloudflare，`https://993216.xyz` 也能正常访问。

## 3. 本地项目搭建

### 3.1 技术栈

项目使用 Astro 构建静态站点。

主要依赖：

- `astro`
- `@astrojs/check`
- `@astrojs/rss`
- `@astrojs/sitemap`
- `typescript`

项目是静态站点，最终会生成 `dist` 目录，由 Cloudflare Pages 托管。

### 3.2 npm 脚本

项目脚本定义在 `package.json` 中：

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
```

用途如下：

- `npm run dev`：启动本地开发服务器，适合边写边看。
- `npm run build`：先运行 Astro/TypeScript 检查，再生成静态产物。
- `npm run preview`：预览已经构建出来的 `dist` 目录。

本地部署前最重要的验证命令是：

```powershell
npm run build
```

这条命令通过，说明代码、内容集合、动态路由和静态构建都没有阻塞问题。

### 3.3 Astro 配置

`astro.config.mjs` 当前配置：

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://993216.xyz',
  integrations: [sitemap()],
});
```

这里的 `site` 用于 sitemap、canonical URL、RSS 等需要站点根地址的地方。因为最终正式域名是 `993216.xyz`，所以这里配置为：

```text
https://993216.xyz
```

### 3.4 TypeScript 配置

`tsconfig.json` 最终修复为：

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

这里有一个重要经验：

- TypeScript 7 会提示 `baseUrl` 弃用，所以没有继续使用 `"baseUrl": "."`。
- 如果不设置 `baseUrl`，`paths` 的目标必须是相对路径。
- 因此应该写成 `"./src/*"`，而不是 `"src/*"`。

这个问题已经修复并验证：VS Code 诊断无错误，本地构建通过。

## 4. 站点结构

### 4.1 页面结构

当前站点包含这些主要页面：

- `/`：首页入口，显示 Zachary、Blog、Docs、Life、Email。
- `/blog/`：博客列表。
- `/blog/[slug]/`：博客文章详情。
- `/blog/archive/`：博客归档。
- `/blog/categories/[category]/`：按分类查看文章。
- `/blog/tags/[tag]/`：按标签查看文章。
- `/docs/`：资源索引。
- `/life/`：生活记录时间线。
- `/rss.xml`：RSS 订阅。
- `/robots.txt`：搜索引擎爬虫配置。
- `/404`：404 页面。

### 4.2 主要源码目录

```text
src/
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    404.astro
    robots.txt.ts
    rss.xml.ts
    blog/
    docs/
    life/
  content/
    blog/
    docs/
    life/
  styles/
    global.css
  utils/
    blog.ts
    content.ts
```

### 4.3 内容集合

内容集合定义在 `src/content.config.ts`。

目前有三类内容：

1. `blog`：博客文章，使用 Markdown 或 MDX。
2. `docs`：资源链接，使用 JSON、YAML 或 YML。
3. `life`：生活记录，使用 JSON、YAML 或 YML。

Astro 当前使用 `loader: glob(...)` 的写法来加载内容，这符合新版 Astro Content Collections 的模式。

## 5. 已完成的本地功能

### 5.1 首页

首页是整个个人站点生态的入口。

已经实现：

- Zachary 大标题。
- `Blog`、`Docs`、`Life` 三个入口。
- 顶部导航。
- 邮箱入口。
- 轻量、干净、偏技术感的视觉风格。
- 响应式布局。

之前首页在较窄宽度下出现标题和入口列表重叠，后来通过调整 `.hero-panel` 和 `.hero-title` 修复：

- 降低大标题的视口缩放强度。
- 在 `980px` 以下让布局从双列变为单列。
- 验证结果是不重叠、没有横向溢出。

### 5.2 Blog

博客功能包括：

- 文章列表。
- 文章详情页。
- 分类页。
- 标签页。
- 归档页。
- RSS feed。
- 草稿字段 `draft`。

博客内容放在：

```text
src/content/blog/
```

文章示例结构：

```md
---
title: 文章标题
date: 2026-05-08
summary: 文章摘要
category: 分类名
tags:
  - 标签一
  - 标签二
draft: false
---

正文内容。
```

### 5.3 Docs

Docs 是资料和资源索引。

内容放在：

```text
src/content/docs/
```

单条资源示例：

```json
{
  "title": "资源标题",
  "description": "资源说明",
  "group": "分组名称",
  "url": "https://example.com",
  "tags": ["tag1", "tag2"]
}
```

适合放：

- 学习资源。
- 研究工具。
- 写作工具。
- GMT、地球物理相关资料。
- 娱乐或生活中想长期保存的链接。

### 5.4 Life

Life 是公开生活片段时间线。

内容放在：

```text
src/content/life/
```

图片可以放在：

```text
public/life/
```

单条记录示例：

```json
{
  "date": "2026-05-08",
  "text": "今天更新了个人站点。",
  "location": "Wuhan",
  "images": [
    {
      "src": "/life/example.jpg",
      "alt": "图片描述"
    }
  ]
}
```

### 5.5 SEO 和基础站点文件

已经配置：

- favicon。
- Open Graph / Twitter card 基础信息。
- canonical URL。
- sitemap。
- robots.txt。
- 404 页面。
- RSS feed。

这些功能让站点更适合公开访问、搜索引擎收录和长期维护。

## 6. GitHub 工作

### 6.1 仓库信息

GitHub 仓库：

```text
https://github.com/yilianchun/zachary-site
```

本地远程地址：

```text
origin  https://github.com/yilianchun/zachary-site.git
```

主分支：

```text
main
```

### 6.2 已完成的提交

目前主要提交包括：

```text
6c5f257 Initial Zachary site
b065382 Fix TypeScript tsconfig warning
840fcf3 Fix tsconfig paths mapping
```

其中：

- `Initial Zachary site`：第一版站点主体，包括 Astro 项目、首页、Blog、Docs、Life、SEO、样式等。
- `Fix TypeScript tsconfig warning`：移除了已弃用的 `baseUrl`。
- `Fix tsconfig paths mapping`：把 `paths` 目标修成 `./src/*`，彻底解决未设置 `baseUrl` 时的路径错误。

### 6.3 日常 Git 流程

以后每次修改后建议按这个流程走：

```powershell
Set-Location 'D:\Desktop\vps\zachary-site'
git status
npm run build
git add .
git commit -m "Describe your change"
git push
```

说明：

- `git status`：查看哪些文件被改动。
- `npm run build`：提交前确认本地构建通过。
- `git add .`：暂存改动。
- `git commit -m "..."`：创建提交。
- `git push`：推送到 GitHub。

推送到 GitHub 后，Cloudflare Pages 会自动拉取最新代码并重新部署。

## 7. Cloudflare Pages 工作

### 7.1 已创建 Pages 项目

Cloudflare Pages 项目名：

```text
zachary-site
```

连接的 GitHub 仓库：

```text
yilianchun/zachary-site
```

项目默认域名：

```text
https://zachary-site.pages.dev
```

### 7.2 构建配置

Cloudflare Pages 当前构建配置：

```text
Framework preset: Astro
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: 留空
```

首次部署日志中已经确认：

- 成功克隆 GitHub 仓库。
- 使用提交 `840fcf3 Fix tsconfig paths mapping`。
- 执行 `npm run build`。
- Astro 检查结果为 `0 errors`。
- 输出目录为 `/opt/buildhome/repo/dist/`。
- 站点成功发布到 Cloudflare 全球网络。

### 7.3 自定义域

已经在 Cloudflare Pages 的 `zachary-site` 项目里添加自定义域：

```text
993216.xyz
```

Cloudflare 自动添加的 DNS 记录含义是：

```text
993216.xyz -> zachary-site.pages.dev
```

访问地址：

```text
https://993216.xyz
```

绑定后 Cloudflare 后台可能显示“正在初始化”，并提示最长可能需要 48 小时。这通常是 DNS 和证书状态刷新，不一定表示网站不可用。当前实际访问已经成功。

### 7.4 域名托管状态

`993216.xyz` 在注册商处使用 Cloudflare 名称服务器：

```text
chin.ns.cloudflare.com
sonny.ns.cloudflare.com
```

这说明 Cloudflare 是这个域名的权威 DNS。以后凡是和 `993216.xyz` 有关的解析记录，优先在 Cloudflare DNS 面板里改，不要再去注册商那里改普通 DNS 记录。

注册商那里通常只需要维护：

- 域名续费。
- 名称服务器是否仍然指向 Cloudflare。
- 如启用 DNSSEC，确认 DS 记录与 Cloudflare 配置一致。

## 8. 以后如何维护

### 8.1 本地开发维护

进入项目目录：

```powershell
Set-Location 'D:\Desktop\vps\zachary-site'
```

启动开发服务器：

```powershell
npm run dev
```

提交前构建检查：

```powershell
npm run build
```

预览构建产物：

```powershell
npm run preview
```

如果本地开发服务器出现缓存或依赖预构建异常，可以先停止 dev server，再重新运行：

```powershell
npm run dev
```

### 8.2 添加博客文章

在 `src/content/blog/` 新增 Markdown 文件，例如：

```text
src/content/blog/my-new-note.md
```

写好 frontmatter：

```md
---
title: 新文章标题
date: 2026-05-08
summary: 这是一句话摘要。
category: Research
tags:
  - Astro
  - Notes
draft: false
---

正文内容。
```

然后运行：

```powershell
npm run build
git add .
git commit -m "Add new blog post"
git push
```

### 8.3 添加 Docs 资源

在 `src/content/docs/` 新增 JSON 文件，例如：

```text
src/content/docs/new-resource.json
```

内容示例：

```json
{
  "title": "资源名称",
  "description": "资源用途说明",
  "group": "Research",
  "url": "https://example.com",
  "tags": ["tool", "reference"]
}
```

注意 `url` 必须是合法 URL，否则 `astro check` 会报错。

### 8.4 添加 Life 记录

在 `src/content/life/` 新增 JSON 文件，例如：

```text
src/content/life/new-memory.json
```

内容示例：

```json
{
  "date": "2026-05-08",
  "text": "今天记录一点生活片段。",
  "location": "Wuhan",
  "images": []
}
```

如果要加图片，把图片放到：

```text
public/life/
```

然后在 JSON 里引用：

```json
{
  "src": "/life/photo.jpg",
  "alt": "图片说明"
}
```

### 8.5 修改首页

首页文件：

```text
src/pages/index.astro
```

全局样式文件：

```text
src/styles/global.css
```

如果以后要调整首页入口、文案、布局或视觉风格，主要改这两个文件。

修改大标题、布局和响应式样式时，要特别注意：

- 宽屏不要让标题和入口列表重叠。
- 窄屏要单列堆叠。
- 不要出现横向滚动条。
- 修改后至少检查一次桌面宽度和移动端宽度。

## 9. 以后如何扩展

### 9.1 在同一个 Astro 项目内扩展

如果只是增加站点栏目，建议继续放在同一个 Astro 项目里。

例如：

- `/projects/`：项目作品集。
- `/notes/`：短笔记。
- `/reading/`：阅读记录。
- `/tools/`：常用工具入口。

做法是在 `src/pages/` 下新增页面目录或 `.astro` 文件。

例如：

```text
src/pages/projects/index.astro
```

适合这种方式的场景：

- 页面风格和主站一致。
- 内容量不算特别大。
- 不需要单独的构建系统。
- 不需要单独部署权限或独立域名。

### 9.2 使用子路径做多子站结构

如果你想做类似“一个主站，下面有多个区域”的结构，可以先用子路径：

```text
https://993216.xyz/blog/
https://993216.xyz/docs/
https://993216.xyz/life/
https://993216.xyz/projects/
```

优点：

- 管理简单。
- 一个 GitHub 仓库。
- 一个 Cloudflare Pages 项目。
- SEO 权重集中在主域名。

这是目前最推荐的扩展方式。

### 9.3 使用子域名做独立子站

如果以后某个模块变得很大，可以拆成子域名：

```text
https://blog.993216.xyz
https://docs.993216.xyz
https://lab.993216.xyz
https://photos.993216.xyz
```

这时有两种方案。

方案一：仍然用同一个 Astro 项目，但在 Cloudflare 里做路由或重定向。这种方式适合轻量页面。

方案二：每个子站单独一个 GitHub 仓库和 Cloudflare Pages 项目。这种方式适合真正独立的应用，例如：

- 一个摄影站。
- 一个课程资料站。
- 一个交互式工具站。
- 一个需要不同技术栈的实验项目。

如果采用方案二，每个子站都重复一次：

```text
GitHub 仓库 -> Cloudflare Pages 项目 -> 绑定子域名
```

例如：

```text
blog.993216.xyz -> blog-site.pages.dev
lab.993216.xyz -> lab-site.pages.dev
```

### 9.4 内容规模变大后的建议

当博客、Docs、Life 内容变多后，可以逐步加：

- 博客全文搜索。
- 更细的分类和标签页。
- Docs 按主题分组过滤。
- Life 按年份归档。
- 图片压缩和懒加载策略。
- sitemap 分拆或更明确的 SEO 元数据。
- RSS 增强，例如按分类输出 feed。

这些都可以在当前 Astro 架构上继续演进。

## 10. 常见问题排查

### 10.1 本地构建失败

先运行：

```powershell
npm run build
```

重点看错误来自哪里：

- 如果是 Markdown frontmatter，检查博客文章字段是否缺失。
- 如果是 Docs 的 `url`，检查是否是完整 URL。
- 如果是 Life 的图片，检查路径是否写成 `/life/xxx.jpg`。
- 如果是 TypeScript 配置，检查 `tsconfig.json` 的 `paths` 是否仍为 `"./src/*"`。

### 10.2 GitHub 没有更新

检查远程：

```powershell
git remote -v
```

应该看到：

```text
https://github.com/yilianchun/zachary-site.git
```

检查当前分支：

```powershell
git branch --show-current
```

应该是：

```text
main
```

然后重新推送：

```powershell
git push
```

### 10.3 Cloudflare 没有自动部署

检查：

- GitHub 是否已经 push 到 `main`。
- Cloudflare Pages 项目是否连接的是 `yilianchun/zachary-site`。
- Production branch 是否是 `main`。
- 构建命令是否是 `npm run build`。
- 输出目录是否是 `dist`。

如果 Cloudflare 构建失败，先在本地运行同一条命令：

```powershell
npm run build
```

本地也失败，就先修本地。本地通过但 Cloudflare 失败，就看 Cloudflare 构建日志。

### 10.4 `993216.xyz` 访问异常

按顺序检查：

1. 注册商名称服务器是否仍是 `chin.ns.cloudflare.com` 和 `sonny.ns.cloudflare.com`。
2. Cloudflare DNS 是否存在 `993216.xyz -> zachary-site.pages.dev` 的记录。
3. Cloudflare Pages 的 `自定义域` 页面是否显示 `993216.xyz` 已激活。
4. 是否有重复的 A、AAAA、CNAME 记录占用了根域名。
5. HTTPS 证书是否还在初始化。
6. 如果启用了 DNSSEC，注册商侧 DS 记录是否和 Cloudflare 一致。

当前状态下，`https://993216.xyz` 已经可以访问。

## 11. 推荐维护节奏

建议采用这个节奏维护：

1. 平时写内容，只改 `src/content/`。
2. 调整页面结构，改 `src/pages/`。
3. 调整样式，改 `src/styles/global.css`。
4. 每次提交前运行 `npm run build`。
5. 构建通过后 `git commit`。
6. `git push` 后等待 Cloudflare 自动部署。
7. 部署后打开 `https://993216.xyz` 检查首页和刚改的页面。

这个流程的好处是：

- 本地先发现问题。
- GitHub 保存历史版本。
- Cloudflare 自动部署。
- 域名始终指向最新稳定构建。

## 12. 下一步可做事项

短期可以做：

- 补充真实博客文章。
- 增加 Docs 资源。
- 给 Life 添加真实图片。
- 检查手机端样式。
- 给首页增加更明确的个人介绍，但保持简洁。

中期可以做：

- 增加 `/projects/` 页面。
- 增加站内搜索。
- 增加博客按年份归档。
- 给 Docs 增加筛选或搜索。
- 优化图片体积和加载速度。

长期可以做：

- 建立子域名子站，例如 `lab.993216.xyz`。
- 将大型模块拆成独立 GitHub 仓库和独立 Pages 项目。
- 用 Cloudflare Analytics 或 Web Analytics 观察访问情况。
- 建立更系统的内容维护规则。

当前第一版已经具备完整闭环：本地开发、GitHub 版本管理、Cloudflare Pages 自动部署、自定义域名访问。