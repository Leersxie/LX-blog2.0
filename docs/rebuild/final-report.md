# Phase 0–6 完成报告

> 日期：2026-10-25
> 仓库：<https://github.com/Leersxie/LX-blog2.0>
> 生产：<https://leersxie.github.io/LX-blog2.0/>
> 最新生产构建 commit：`8a04eda`（部署 run `40174002331`）
> 最新 Lighthouse/axe run：`40174081094`
>
> 旧博客 `Leersxie/Leersxie.github.io` 与 `../legacy/` **未修改**。本仓库是独立项目，不是旧站分支。

## 1. 阶段结论

| Phase | 状态 | 主要产物 |
|---|---|---|
| 0 审计 | ✅ | 父目录 `docs/rebuild/audit-report.md`、路由/内容/资源台账、旧站截图、typecheck/测试基线 |
| 1 设计系统 | ✅ | tokens、设计系统、组件清单、动效规范、低保真线框、真实内容原型 |
| 2 技术底座 | ✅ | React 19 + Vite 8 + 自建 prerender、静态路由、内容 Schema、Pagefind、Pages base path |
| 3 核心页面 | ✅ | Header/Footer、首页、文章、归档、搜索、关于、项目、友链、RSS/Atom、404 |
| 4 内容/功能 | ✅ | 4 篇内容、旧 URL、加密、Giscus、GTM、Meting、feed、sitemap、OG、兼容 API |
| 5 视觉精修 | ✅ | 响应式、灯箱、代码复制、表格、reduced-motion、对比度、320/1920、内容延后布局 |
| 6 验收/发布 | ✅ | 28 单测、E2E、axe、Lighthouse、CI、Pages 部署、post-deploy smoke、README、回滚 |

这不是只交首页或只交静态骨架：11 个 HTML、9 条 sitemap、2 篇公开内容、加密、搜索、评论、音乐、统计、旧 URL 和兼容 API 都已接入；生产部署与 smoke 已真实执行。

## 2. 实际生产状态

### 2.1 GitHub Pages

- URL：<https://leersxie.github.io/LX-blog2.0/>
- Pages 配置：`build_type: workflow`，public，HTTPS enforced。
- 部署 run：<https://github.com/Leersxie/LX-blog2.0/actions/runs/40174002331>
- 结果：quality ✅ → build ✅ → deploy ✅ → post-deploy smoke ✅。
- 首次失败原因已修复：
  1. 草稿 `cs2` 也要求 `POST_PASSWORD_CS2`，导致 CI 失败；现在加密草稿不要求 secret，发布后才要求。
  2. smoke 的 `curl | grep -q` 触发 SIGPIPE；现在先落盘再 grep，并在 run 中通过。
- 真实线上检查：
  - `/` 200，`<title>Leersxie · 夜航档案`；
  - `/guestbook/` 200；
  - `/rss.xml`、`/sitemap.xml`、`/pagefind/pagefind.js` 200；
  - 不存在的路径返回 **404**；
  - 加密文章 HTML 无正文；线上用密码解锁成功；
  - Giscus 线上 iframe 1 个，term 为 legacy `guestbook/`。

### 2.2 项目 base path

GitHub Pages 项目站的真实路径是 `/LX-blog2.0/`，不是根路径。实现：

- `SITE_BASE=/LX-blog2.0/`；
- Vite `base` + 构建期 `__SITE_BASE__`；
- `withBase()` 覆盖 JSX、Markdown、canonical、OG、feed、sitemap、robots、Pagefind 结果；
- preview server 和 link-check 支持前缀；
- GitHub Actions 设置 `SITE_BASE`。

**限制**：旧站根 URL（如 `/guestbook/`）仍属于旧站；新站是 `/LX-blog2.0/guestbook/`。若要接管根 URL，需要把同一构建迁到用户站仓库或自定义域名。本阶段没有擅自改旧站部署。

## 3. 工程与测试证据

本机：Windows、Node 24.18.0、pnpm 10.22.0、Edge 156。
CI：Ubuntu、Node 22、pnpm 10.22。

| 检查 | 结果 | 证据 |
|---|---|---|
| `pnpm check` | 通过 | 本地 + CI |
| `pnpm test` | **28/28** | 5 个测试文件 |
| `pnpm lint` | 通过，0 warning | 本地 + CI |
| `pnpm build` | 11 HTML / 19 预渲染文件 + `.nojekyll` | 本地 + CI |
| Pagefind | **5 页 / 523 词 / zh-cn** | 构建日志 |
| `pnpm links` | 11 HTML、16 内部目标、0 缺失 | 带 base 的产物 |
| `pnpm test:e2e` | 全部通过（约 50 条断言） | 本机 Edge，base URL |
| `pnpm search:check` | 6 查询通过；加密正文 0 命中 | 线上也通过 |
| axe | **9 次扫描 / 0 violations**（7 桌面 + 2 移动） | 本地 + CI |
| Lighthouse 本地 | 首页 **99** / 文章 **92** / 归档 **91**；A11y/Best/SEO 全 100 | [lighthouse-report.md](../lighthouse-report.md) |
| Lighthouse CI | 首页 **76** / 文章 **87** / 归档 **89**；A11y/Best/SEO 全 100 | [lighthouse-ci-report.md](../lighthouse-ci-report.md)；共享 runner 更慢更抖动 |
| 线上 smoke | 全部通过 | deploy run 的 `smoke` job |

### 3.1 关键 E2E

- 首页 200 / 唯一 H1 / 无横向溢出；
- 搜索 `留言`、结果带分类/日期、↑↓、Enter、Esc、焦点返回；
- 站点级减少动效 + 系统 `prefers-reduced-motion`；
- Meting 243 首曲目加载；
- GTM 交互后注入；
- 390 / 768 / 1440 / 320 / 1920 无横向溢出；
- 移动菜单高度 782px；
- 项目图灯箱、Esc、焦点返回；
- 代码复制写入剪贴板；
- 加密文章 HTML 无明文，密码解锁成功；
- 无 JS 正文可读；
- Giscus iframe + legacy term。

### 3.2 体积

| 指标 | 值 |
|---|---:|
| 首页 HTML | 83.96KB raw / 19.84KB gzip（含内联 CSS） |
| 主 JS | 292.22KB raw / 89.83KB gzip |
| 内联 CSS | 59.40KB raw / 13.60KB gzip |
| `dist/` | 约 2.1MB |
| 旧站基线 | HTML 275KB、JS 95KB、CSS 299KB、dist 36MB |

CSS 在 prerender 后内联进每个 HTML，独立 CSS 文件被删除；折叠区使用 `content-visibility: auto` 降低首屏 style/layout 长任务。代价是 HTML 更大、跨页不缓存 CSS；换取了 FCP/LCP 和首屏稳定性。

## 4. 页面与功能落地

- 首页：真实介绍、状态、最近文章、真实项目、索引/页脚；无假在线状态。
- 归档：年份分组、分类/标签筛选、query 可回退、空状态、清除筛选。
- 文章：面包屑、元信息、目录、阅读进度、Markdown、代码高亮/复制、表格滚动、图片灯箱、许可、上下篇、相关、评论。
- 搜索：Pagefind、键盘、焦点、category/date meta、无结果/错误状态。
- 加密：AES-256-GCM envelope + Web Crypto；密码不持久化；正文不入 HTML/feed/sitemap/Pagefind。
- 评论：Giscus 懒加载，保留旧 discussion term，主题同步。
- 音乐：Meting 懒加载、错误/重试/直达；不自动播放。
- 统计：GTM 交互后/8s 注入；无 consent UI（已知）。
- SEO：canonical、OG/Twitter、JSON-LD、每篇 OG、sitemap、RSS/Atom、robots。
- 兼容：`/posts/guestbook/` noindex 副本、旧 sitemap 入口、旧 API JSON、`/rss/`、`/atom/`。
- 无障碍：skip link、唯一 H1、focus-visible、dialog/lightbox 焦点管理、减少动效、无 JS。

## 5. 内容迁移

| 内容 | 状态 | 说明 |
|---|---|---|
| guestbook | 已迁移 | `/guestbook/` 规范 + `/posts/guestbook/` noindex 副本 |
| xiangtuzhongguo-analysis | 已迁移、加密 | 密码来自 `POST_PASSWORD_XIANGTU`（CI secret） |
| first-blog | 草稿 | 不生成 HTML，不在 feed/sitemap |
| cs2 | 草稿、加密 | 不要求 secret，直到发布 |
| about / friends | 已迁移 | friends 内部链接改为规范 guestbook |
| projects | 已迁移 | 6 个原有项目 + “本站”项目描述更新 |

迁移台账见 [content-migration.csv](content-migration.csv)，路由见 [route-map.csv](route-map.csv)。

## 6. 与说明书 / 旧站的差异

- 技术栈：没有使用 Astro/Mizuki；React + Vite + 自建 prerender 通过静态/SEO/深链验证。
- 视觉：没有复制 Mizuki 布局/CSS；采用 NOCTILUX 工业编辑系统。
- 部署：项目页 `/LX-blog2.0/`，不是根站；旧根 URL 不能自动复用，已明确记录。
- Giscus：从 pathname 改为 `specific` + legacy term，避免 base path 破坏旧讨论。
- 加密：从旧公开 frontmatter 密码升级为构建 secret；**正文仍在仓库 Markdown 中**，真保密需私有内容源。
- 搜索：继续 Pagefind，中文无 stemming；当前 523 词语料下可用。
- 音乐：Meting 保留；真实音频播放未回归。
- 分页：未实现 `/2/`；当前 2 篇内容，归档是完整列表。
- 旧功能页 anime/diary/albums/devices/skills/timeline 原本关闭，不重建。
- 单入口 JS 暂未做页面级拆分；CI 共享 runner 的 Performance 波动较大。
- 无自定义响应头（GitHub Pages 限制），无 CSP。

## 7. 未执行 / 风险

- 真实手机、软键盘、屏幕阅读器、200% 缩放。
- Giscus 真实登录发评论、删除、权限流程。
- Meting 实际音频播放、切歌、长时间错误恢复。
- GTM 容器内标签行为；没有 consent UI。
- Lighthouse 是模拟移动端；CI 共享 runner 的 76/87/89 与本地 99/92/91 不能等同。
- 旧站根 URL 未接管；若要替代线上根站，需要单独切换方案。
- 依赖更新 PR（Dependabot）仍开放，未自动合并。
- GitHub Actions 的 Node 20 action deprecation warning 来自 action 运行时，不是项目 Node 版本。

## 8. 文件变更概览

新增/重写的主要模块：

- `src/lib/url.ts`、`src/server/rehype-base-links.ts`：base path。
- `src/server/rehype-code-frame.ts`、`rehype-table-wrap.ts`：代码/表格增强。
- `src/components/article/ArticleInteractions.tsx`：复制 + 灯箱。
- `src/components/layout/MotionToggle.tsx`：站点级减少动效。
- `src/server/seo.ts`、`feeds.ts`、`document.ts`：canonical/OG/feed/sitemap/robots。
- `src/server/content.ts`：OG、草稿加密 secret 宽松处理。
- `scripts/axe.mjs`、`scripts/lighthouse.mjs`、`scripts/e2e.mjs`、`search-check.mjs`。
- `.github/workflows/deploy.yml`、`lighthouse.yml`、`dependabot.yml`。
- `docs/design/wireframes.md`、`docs/lighthouse*`、`docs/a11y-report.json`。

## 9. 后续维护任务

1. 配好真实手机/屏幕阅读器回归；补 200% 缩放截图。
2. 决定是否接管根 URL（用户站仓库或自定义域名），并重新生成 canonical/sitemap。
3. Giscus 发评论与 Meting 音频的真实回归。
4. 轮换旧密码，考虑把加密正文移出公开仓库。
5. 页面级 JS 拆分 / critical CSS，缩小 89.83KB gzip 主 bundle。
6. 处理 Dependabot PR，建立 Lighthouse 性能趋势和预算。
7. 补 GTM consent 或隐私说明。

## 10. 回滚

- **部署回滚**：GitHub Pages deployment history 回退到 `8a04eda` 之前，或 revert 后重新 push。
- **代码回滚**：`git reset --hard <known-good>`；不要影响旧博客仓库。
- **内容回滚**：恢复 `content/` 后重新构建。
- **密码回滚/轮换**：更新 GitHub secret 后重新部署。
- **项目页**：删除 Pages 部署不会影响旧站；旧站始终独立运行。
