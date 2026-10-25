# Phase 1/2 阶段报告

> 日期：2026-10-25
> 范围：新仓库初始化、技术 spike、设计系统，以及可运行的最小底座 + 核心页面。
> 旧博客：未修改，仍在 `../legacy/master` / 原 GitHub 仓库。
> 实际技术结论：React 19 + TypeScript + Vite 8 + 自建静态预渲染通过。

---

## 1. 已完成

### 1.1 新仓库 / 工程

- 新建独立 Git 仓库：`noctilux/`，默认分支 `main`。旧博客目录未被写入。
- Vite 8 + React 19 + TypeScript 5.9。
- Vite 客户端构建 + `tsx scripts/prerender.ts` 静态生成。
- `pnpm dev`：Vite middleware + SSR dev。
- `pnpm build`：Vite → prerender → Pagefind。
- `pnpm preview`：静态 clean URL + 404。
- CI：`quality → build → deploy`，GitHub Pages artifact 流程。
- 锁文件、`.nvmrc`、`.env.example`、`.gitignore`。

### 1.2 设计系统

- 深色 / 浅色 token。
- 紫蓝品牌色，橙色只做兼容提示/告警。
- 外层直角、内层 3–6px 圆角、细线、索引编号、工业编辑式网格。
- 中文正文 16 / 17.5px，行高 1.85–1.9。
- Space Grotesk / JetBrains Mono 拉丁子集，中文系统字体。
- 动效 CSS/WAAPI，120–260ms，`prefers-reduced-motion` 降级。
- 没有任何动画库、UI 套件、WebGL。

### 1.3 页面 / 功能

- 首页、归档、项目、关于、友链、RSS/Atom 说明页、文章页、404。
- 深链、canonical、唯一 H1。
- 文章 Markdown → HTML，目录、代码高亮、外链安全属性。
- 草稿过滤。
- 加密文章 AES-256-GCM envelope + 浏览器 Web Crypto；正文不进 HTML/feed/sitemap/Pagefind。
- Pagefind 搜索：构建索引、↑↓/Enter/Esc、焦点陷阱、焦点返回。
- Giscus：懒加载，按 pathname 映射，深/浅主题同步。
- GTM：交互后/8s 注入，不阻塞首屏。
- Meting：243 首曲目加载、错误/重试、网易云直达；不自动播放。
- RSS、Atom、sitemap、sitemap-index、sitemap-0、robots、旧 API 兼容 JSON。
- 旧 `/guestbook/` 与 `/posts/guestbook/` 双 URL 保留（副本 noindex）。
- 兼容旧 `/rss/`、`/atom/` HTML 入口。
- 无 JS 可读。

### 1.4 内容迁移

- 4 篇文章从旧仓库复制：
  - guestbook（发布）
  - xiangtuzhongguo-analysis（发布、加密）
  - first-blog（草稿）
  - cs2（草稿、加密）
- 正文未改。
- about / friends 页面内容迁移；friends 内部链接改为规范 `/guestbook/`。
- projects：6 个项目保持旧语义，“本站”项目描述更新为新栈。
- 逐篇台账：[content-migration.csv](content-migration.csv)
- 路由台账：[route-map.csv](route-map.csv)

---

## 2. 真实验证证据

### 2.1 命令

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
pnpm links
pnpm test:e2e
pnpm search:check
```

均在本机 Windows、Node 24.18.0、pnpm 10.22.0、Edge 156 上执行。

### 2.2 结果

| 检查 | 结果 |
|---|---|
| `tsc --noEmit` | 通过 |
| Vitest | **5 文件 / 24 测试通过** |
| ESLint | 通过 |
| Vite build | 通过；主 JS **285.79KB / 88.00KB gzip**；CSS **54.89KB / 12.83KB gzip** |
| prerender | **11 HTML + RSS/Atom/sitemap×3/robots/API×2 = 19 文件** |
| Pagefind | **5 页 / 520 词 / zh-cn**，0.814s |
| `pnpm links` | 11 HTML、17 个内部目标，0 缺失 |
| `pnpm test:e2e` | 全部通过 |
| `pnpm search:check` | 6 个中文查询通过，加密正文 0 命中 |
| `dist/` | 1.4MB |
| dev server | `/`、文章、归档、404、feed、sitemap、API 均验证 |

关键 E2E：

- 首页 200、唯一 H1、无横向溢出；
- Pagefind 搜索、方向键、Esc 关闭、焦点返回、Enter 打开；
- Meting 243 首曲目；
- GTM 注入；
- 桌面/平板/手机无溢出；
- 11 个 HTML 中 6 个核心页面 200/404 + 唯一 H1；
- 加密文章 HTML 无明文，正确密码可解锁；
- 无 JS 正文可读；
- Giscus iframe 出现。

### 2.3 截图

- [首页 桌面](../screenshots/home-desktop.png)
- [首页 手机](../screenshots/home-mobile.png)
- [搜索](../screenshots/search-desktop.png)
- [手机菜单](../screenshots/menu-mobile.png)
- [文章](../screenshots/guestbook-desktop.png)
- [加密文章锁定](../screenshots/locked-desktop.png)
- [解锁后](../screenshots/unlocked-desktop.png)
- [音乐面板](../screenshots/music-desktop.png)
- [归档](../screenshots/archive-desktop.png)
- [项目](../screenshots/projects-desktop.png)
- [关于](../screenshots/about-desktop.png)
- [友链](../screenshots/friends-desktop.png)
- [404](../screenshots/404-desktop.png)

---

## 3. 未执行（not-run）

- 新仓库真实 GitHub 远端 / Pages 部署
- GitHub Actions Ubuntu + Node 22 首次运行
- Lighthouse / Core Web Vitals
- axe / 屏幕阅读器 / 200% 缩放
- 真实手机、触屏、软键盘
- Giscus 登录发评论 / 删除 / 主题切换
- Meting 实际音频播放、切歌、错误恢复长时间回归
- GTM 容器内标签行为
- 真实内容增长后的性能 / 搜索回归
- 加密密码轮换演练
- 逐篇正文人工 diff
- 页面级 JS 拆分 / 逐文章 OG 图 / 静态分类标签落地页

---

## 4. 与说明书 / 旧站的差异与决策

| 项 | 决策 / 现实 |
|---|---|
| 技术栈 | 没有退回 Astro；使用 React + Vite + 自建 prerender。没有安装大型 SSG 插件。 |
| 视觉 | 完全重做，没有复用 Mizuki 布局/CSS/组件。 |
| 路由 | 保留旧规范 URL、兼容副本、旧 sitemap/API、`/rss/`、`/atom/`；旧禁用功能页和 `/links/` 不再创建。 |
| 加密 | 从旧 CryptoJS AES 迁移到 AES-256-GCM envelope；密码从公开 frontmatter 改为构建 secret。**正文仍在仓库 Markdown 中**，所以真正保密要求私有内容源。 |
| 内容分离 | 当前仍使用仓库内 `content/`，没有恢复旧站的内容仓库同步。 |
| 搜索 | 保留 Pagefind；真实中文查询可命中；无 stemming，当前内容量小。 |
| 音乐 | 保留 Meting；不自动播放；失败有错误和外部链接。 |
| 评论 | 保留 Giscus 原配置；评论数据仍在本仓库 Discussions。 |
| 统计 | 保留 GTM 原 ID；延迟加载；没有 consent 面板。 |
| 分页 | 没有实现旧 `/2/`；当前 2 篇内容，归档是完整列表。 |
| 功能页 | anime / diary / albums / devices / skills / timeline 旧站均关闭，新站不重建。 |
| 样式文件 | 单一 CSS 文件（54.89KB），没有 Tailwind；这是有意简化构建和依赖。 |
| `v2` 分支 | 没有使用 v2 的 Next.js 代码；新仓库完全独立。 |

---

## 5. 下一阶段有限任务

1. **部署验证**：创建新 GitHub 仓库，配置 `POST_PASSWORD_XIANGTU`，首次跑通 Actions 与 Pages；验证 404、旧 URL、HTTPS。
2. **质量门禁**：在 CI 中加入 Lighthouse/axe（或至少 npm 脚本与报告 artifact），在 Ubuntu Node 22 实跑。
3. **真实功能回归**：Giscus 登录发帖；Meting 播放/切歌；移动端触屏与软键盘。
4. **内容补齐**：替换测试文章/项目为真实内容；确认是否需要恢复更多旧文章；密码轮换。
5. **设计精修**：逐页长标题、超长代码、表格、移动端 320px / 200% 缩放；补逐文章 OG。
6. **可选工程优化**：按页面 `React.lazy` 拆分主 JS；静态分类/标签页；分页（若文章增长到 20+）。

---

## 6. 回滚

- 这是独立新仓库，旧博客完全未改；回滚新站不会影响旧站。
- 工程回滚：`git reset --hard <initial commit>`（工作区尚未连接远端）。
- 内容回滚：删除/恢复 `content/` 文件并重新构建；旧正文仍在旧仓库。
- 部署回滚：GitHub Pages deployment history 或 revert commit。
- 密码变更：更新 secret 后重新构建；旧密文不再匹配新密码。
