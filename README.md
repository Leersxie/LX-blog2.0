# NOCTILUX / 夜航档案

Leersxie 的新个人站。一个 **React + TypeScript + Vite** 的静态生成项目，和旧的 Astro / Mizuki 博客完全分离。

旧博客保留在 `../legacy/`，这个仓库不修改它。新站沿用旧站的有效内容、规范 URL 和功能语义，但视觉、组件、布局和工程组织全部重做。

> 当前状态：Phase 0/1/2 的静态生成底座和核心页面已落地；尚未做 Lighthouse、真实手机与完整发布验收。

## 已实现

- React 19 + TypeScript + Vite 8，构建期手写 SSG：每页独立 HTML，head 中有 title / description / canonical / OG / Twitter / JSON-LD。
- 文章 Markdown → HTML，构建时 frontmatter 校验、草稿过滤、目录生成、代码高亮。
- 旧 URL：`/posts/<slug>/`、`/guestbook/`、`/posts/guestbook/` 兼容副本。
- 加密文章：AES-256-GCM envelope + 浏览器 Web Crypto 解锁；正文不进入 HTML 或 Pagefind 索引。
- Pagefind 搜索：构建后索引，支持 ↑ / ↓、Enter、Esc、焦点陷阱与焦点返回。
- Giscus 评论（按 pathname 映射，懒加载）。
- GTM（首次交互后加载，不阻塞首屏）。
- Meting 歌单（打开面板时请求，不自动播放；失败有重试和网易云直达链接）。
- RSS、Atom、sitemap、sitemap-index、sitemap-0、robots、API 兼容 JSON。
- 深色 / 浅色主题、`prefers-reduced-motion`、键盘可达、无 JS 可读。
- GitHub Actions：typecheck、24 个单测、lint、构建、链接检查、GitHub Pages 部署。

## 快速开始

要求 Node.js 22+、pnpm 10.22.0。

```bash
pnpm install
cp .env.example .env.local
# 填入 POST_PASSWORD_XIANGTU。缺失时构建会明确失败，避免把加密正文误发布。
pnpm dev          # http://127.0.0.1:4321
pnpm build        # dist/ + Pagefind 索引
pnpm preview      # 静态预览，含真实 404
```

常用检查：

```bash
pnpm check        # tsc --noEmit
pnpm test         # Vitest
pnpm lint
pnpm links        # 构建后检查内部链接、资源、加密明文泄漏
pnpm test:e2e     # 需要本地 Edge；对构建产物做浏览器验收
```

`pnpm test:e2e` 依赖本地已安装的 Microsoft Edge（或设置 `EDGE_PATH`），不是 CI gate；CI 使用 `check / test / lint / build / links`。

## 目录

```text
content/
  posts/            文章 Markdown
  pages/            about / friends 页面正文
src/
  config/site.ts    公开配置：Giscus / GTM / Meting / 导航 / 文案
  server/           构建期内容读取、Markdown、SEO、feed、prerender 数据
  pages/            页面级 React 组件
  components/       layout / search / article / music / comments / analytics
  styles/           tokens / base / layout / pages / article / search / music
scripts/
  dev.mjs           Vite middleware + SSR dev server
  prerender.ts      全站静态 HTML / feed / sitemap / API 生成
  serve.mjs         静态 preview + 404
  link-check.mjs    构建产物链接与泄漏检查
  e2e.mjs           Playwright-core + Edge 的本机验收
docs/
  spike-report.md   技术 spike 证据
  design/           设计系统 / 组件清单 / 动效规范
  rebuild/          Phase 报告、内容迁移说明
```

## 内容与 URL

- 规范文章 URL：`/posts/<id>/`。
- 有 `permalink` 的文章：`/<permalink>/`，并额外生成 `/posts/<id>/` 的 `noindex` 兼容副本。
- 草稿：`draft: true`，不生成路由、不进 feed、不进 sitemap。
- 旧站当前内容：4 篇（2 已发布 / 2 草稿），其中 2 篇加密。
- 旧 `/guestbook/`、`/posts/guestbook/`、`/posts/xiangtuzhongguo-analysis/` 均已保留。
- 旧 `/sitemap-index.xml`、`/sitemap-0.xml`、`/api/allPostMeta.json`、`/api/calendar-data.json` 也已保留兼容输出。

加密流程、frontmatter 字段和新增文章步骤见 [docs/content.md](docs/content.md)。

## 文档

- [技术 spike 报告](docs/spike-report.md)
- [设计系统](docs/design/design-system.md)
- [组件清单](docs/design/component-inventory.md)
- [动效规范](docs/design/motion-spec.md)
- [依赖登记](docs/dependencies.md)
- [Phase 1/2 报告](docs/rebuild/phase-1-2-report.md)
- [验收清单](docs/acceptance-checklist.md)
- [内容迁移台账](docs/rebuild/content-migration.csv)
- [路由台账](docs/rebuild/route-map.csv)

## 部署

推送 `main` 后由 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 构建并部署到 GitHub Pages。

必须在仓库 Secrets 中配置：

- `POST_PASSWORD_XIANGTU`：加密文章构建密码。

没有该 secret 时主分支构建会失败；PR 使用一次性 placeholder，只验证构建，不部署。

详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 设计来源与边界

视觉方向来自《Leersxie 博客全面重构设计说明书 v1.2》第 4 / 7 / 8 / 31 章：`NOCTILUX / 夜航档案`、紫蓝品牌色、工业编辑式网格、直角外层、4–8px 内层媒体圆角、克制动效。没有复制旧 Mizuki 的布局或 CSS，也没有复制参考站点的素材、文案或整段代码。

代码许可见 [LICENSE](LICENSE)，原创内容按 [CC BY-NC-SA 4.0](content/LICENSE.md)。第三方依赖、字体与降级方案见 [docs/dependencies.md](docs/dependencies.md)。
