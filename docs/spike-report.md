# 技术 Spike 报告：React + TypeScript + Vite SSG

> 状态：**通过**，足以作为新站技术底座。
> 日期：2026-10-25
> 验证对象：本仓库 `main` 工作区，生产构建 `dist/`
> 旧站未被修改；旧源码在 `../legacy/master`。

## 1. 为什么做这个 spike

设计说明书要求先证明新方案能生成真正可索引的静态博客，而不是退回 Astro/Mizuki 或变成纯客户端 SPA。这个 spike 用真实内容验证：

- 每篇文章独立 HTML；
- SEO 元信息在源码中；
- 深层 URL 可直达；
- RSS / sitemap / robots 可产出；
- Pagefind 索引可用；
- GitHub Pages 路径与 404 逻辑成立；
- 加密正文不泄漏到 HTML / 搜索索引；
- GitHub Pages 部署结构成立（工作流配置完成，远端部署尚未执行）。

## 2. 实现方式

没有引入完整的 SSR 框架，也没有安装多套 Vite 插件：

1. `vite build` 生成客户端 assets 和 `dist/index.html` 模板。
2. `tsx scripts/prerender.ts` 读取 Markdown、生成路由数据、用 `react-dom/server` 渲染每个页面，将 body 注入模板，同时写入 SEO head、JSON-LD 和 hydration data。
3. 同一份 `PageData` 由浏览器端 `hydrateRoot` 接管，避免首屏空白。
4. `pagefind --site dist` 为构建产物建立静态搜索索引。
5. `scripts/serve.mjs` 模拟 GitHub Pages 的 clean URL + `404.html` 行为。
6. `scripts/e2e.mjs` 用 Playwright-core 驱动本机 Edge，验证深链、搜索键盘、加密解锁、无 JS、外部评论 iframe 和响应式。

关键文件：

- [src/server/content.ts](../src/server/content.ts)
- [src/server/document.ts](../src/server/document.ts)
- [src/server/seo.ts](../src/server/seo.ts)
- [src/server/feeds.ts](../src/server/feeds.ts)
- [scripts/prerender.ts](../scripts/prerender.ts)
- [src/entry-server.tsx](../src/entry-server.tsx)
- [src/main.tsx](../src/main.tsx)

## 3. 结果

### 3.1 静态生成

| 检查 | 结果 | 证据 |
|---|---|---|
| 独立 HTML | 通过 | 11 个 HTML：首页、归档、项目、关于、友链、RSS/Atom 说明页、2 篇规范文章、1 个兼容副本、404；项目页 base 为 `/LX-blog2.0/` |
| 文章 URL | 通过 | `/guestbook/`、`/posts/xiangtuzhongguo-analysis/` |
| 兼容 URL | 通过 | `/posts/guestbook/`，`noindex` + canonical `/guestbook/` |
| 深层 URL | 通过 | `pnpm preview` 下均为 200 |
| 404 | 通过 | 未知路径返回 HTTP 404 且加载 `404.html` |
| 草稿隔离 | 通过 | 4 篇文章中仅 2 篇进入 HTML / sitemap；cs2、first-blog 不生成 |
| 无 JS 可读 | 通过 | 标题与留言板正文在禁用 JS 的浏览器中可见 |
| 输出目录 | 通过 | `dist/` 可直接静态托管 |

### 3.2 SEO

每页源码包含：

- `<title>`、`meta description`、canonical、robots；
- Open Graph、Twitter Card、1200×630 默认分享图；
- 文章页 `BlogPosting` + `BreadcrumbList` JSON-LD；
- 首页 `WebSite` + `Person` JSON-LD；
- `lang="zh-CN"`、主题色、RSS / Atom alternate link。

已确认：

| 检查 | 结果 |
|---|---|
| sitemap 9 条 canonical URL（均带 `/LX-blog2.0/` 前缀） | 通过 |
| 兼容副本不在 sitemap | 通过 |
| 404 noindex | 通过 |
| 副本页 canonical 指向规范文章 | 通过 |
| 加密文章正文不进入 HTML | 通过 |
| `费孝通` 等正文词不被 Pagefind 命中 | 通过 |

旧 Astro 站点的两个 sitemap 入口已保留：

- `/sitemap-index.xml`
- `/sitemap-0.xml`

同时提供新的 `/sitemap.xml`。旧 API 也保留为静态 JSON：

- `/api/allPostMeta.json`
- `/api/calendar-data.json`

### 3.3 RSS / sitemap / robots

- `/rss.xml`：RSS 2.0，1 个公开非加密 item。
- `/atom.xml`：Atom，1 个公开非加密 entry。
- `/sitemap.xml`：9 条 URL，文章有 `lastmod`。
- `/sitemap-index.xml` / `/sitemap-0.xml`：兼容旧入口。
- `/robots.txt`：允许抓取，禁止 `/api/`、`/pagefind/`，指向 sitemap。
- 加密文章与草稿均被排除出 feed。

### 3.4 Pagefind 中文检索

构建日志：**5 pages / 523 words / zh-cn**。索引页面为关于、友链、项目、留言板、加密文章元数据。

浏览器实测（`docs/search-baseline.json`）：

| 查询 | 结果数 | 首条结果 |
|---|---:|---|
| `留言` | 3 | `/guestbook/` |
| `乡土` | 1 | `/posts/xiangtuzhongguo-analysis/` |
| `Koishi` | 1 | `/projects/` |
| `化学` | 1 | `/about/` |
| `费孝通`（仅加密正文） | 0 | — |
| `完全不存在的词` | 0 | — |

结论：

- 在现有中文内容量（2 篇公开文章 + 3 个页面）上，标题、正文词和英文技术栈都能命中。
- Pagefind 不支持 zh-cn stemming；这是已知限制，不是当前阻塞。
- 加密正文没有泄漏到索引；标题/描述仍可被检索，这是有意的元数据行为。
- 搜索 UI 已实现 ↑ / ↓、Enter、Esc、焦点陷阱和焦点返回，不是 Pagefind 默认 UI。

### 3.5 构建体积 / 时间

| 指标 | 值 |
|---|---:|
| 主页 HTML | 83.96KB raw / 19.84KB gzip（含内联 CSS） |
| 主 JS | 292.22KB raw / 89.83KB gzip |
| 主 CSS | 59.40KB raw / 13.60KB gzip（构建后内联，独立文件移除） |
| 字体 | 仅 Latin 子集按需加载；woff2 约 62.7KB（Space Grotesk + JetBrains Mono） |
| `dist/` | 约 2.1MB |
| Pagefind 索引 | 523 words / 5 pages |
| Vite build | 0.8–2.9s（本机） |
| Pagefind | 0.3s |

对比旧站基线：HTML 275KB、JS 入口 95KB、CSS 299KB、`dist/` 36MB。新站主页 HTML 含内联 CSS 83.96KB / 19.84KB gzip，主 JS 89.83KB gzip；`dist/` 约 2.1MB。

当前主 JS 为单入口，所有页面组件一次加载；后续可通过 `React.lazy` / 组件级拆分降低，但不是 P0。

### 3.6 GitHub Pages 项目路径

LX-blog2.0 是项目站，真实公开路径是 `https://leersxie.github.io/LX-blog2.0/`，不是根路径。构建通过 `SITE_BASE=/LX-blog2.0/` 注入：

- Vite `base` + `__SITE_BASE__`；
- `withBase()` 处理 JSX / Markdown / feed / sitemap / OG；
- canonical / sitemap / RSS / robots 使用完整绝对 URL；
- Pagefind 结果 URL 在客户端补 base；
- preview server 支持前缀挂载；
- link-check 在带 base 的产物上 0 缺失。

本地 base 构建和 `BASE_URL=http://127.0.0.1:4321/LX-blog2.0` 的完整 E2E 已通过。

### 3.7 质量审计

| 审计 | 结果 |
|---|---|
| axe（7 页桌面 + 2 页移动） | 9 次扫描 / 0 violations |
| Lighthouse 移动端 `/` | 99 / 100 / 100 / 100；LCP 1.6s，TBT 60ms，CLS 0 |
| Lighthouse `/guestbook/` | 92 / 100 / 100 / 100；LCP 1.3s，TBT 350ms，CLS 0.002 |
| Lighthouse `/archive/` | 91 / 100 / 100 / 100；LCP 1.2s，TBT 390ms，CLS 0 |

本地 Lighthouse 为 Edge、移动端模拟、单次运行；CI run 40174081094 的共享 runner 为 76/87/89（A11y/Best/SEO 仍 100），说明共享 CPU 会显著拉低 Performance。两者都不是真实手机网络。

### 3.8 浏览器验收

`pnpm test:e2e` 全部通过：

- 首页 200、唯一 H1、无横向溢出；
- Pagefind 搜索命中；
- ArrowDown 激活结果；
- Escape 关闭并返回焦点；
- Enter 打开搜索结果；
- Meting 243 首曲目加载；
- GTM 脚本在交互后注入；
- 桌面 / 平板 / 手机无横向溢出；
- 手机 3 个 header 控件均存在；
- 六个页面 200 / 404 + 唯一 H1；
- 加密文章 200，HTML 无明文；
- 正确密码可解锁；
- 禁用 JavaScript 后正文可读；
- Giscus iframe 加载。

## 4. 未验证 / 限制

- **已部署**：<https://leersxie.github.io/LX-blog2.0/>，run 40174002331 的 quality/build/deploy/smoke 全绿。
- **已在 GitHub Actions Ubuntu + Node 22 跑过**：28 单测、build、links、Lighthouse/axe workflow 均通过。
- **Lighthouse 已跑**：本地 99/92/91；CI 共享 runner 76/87/89，波动明显，不能等同本地分。A11y/Best/SEO 两边全 100。
- **未做真实手机 / 软键盘 / 屏幕阅读器 / 200% 缩放**。
- **Giscus 只验证 iframe + legacy term**：没有真实 GitHub 登录发评论。
- **GTM 只验证脚本注入**：没有验证容器内的标签，没有 consent UI。
- **Meting**：最终 E2E 加载了 243 首曲目；音频实际播放、跳过、错误恢复没有长时间回归测试。
- **旧根 URL 未接管**：项目页在 `/LX-blog2.0/`，旧站根 `/guestbook/` 仍属于旧站。
- **所有公开配置为真实 ID**，但外部服务可用性不归本仓库控制。

## 5. 结论

React + TypeScript + Vite + **自建静态预渲染**在当前内容规模下满足：

- 每篇独立 HTML；
- 源码级 SEO；
- 深层 URL；
- RSS / sitemap / robots；
- Pagefind；
- GitHub Pages 静态目录；
- 无 SPA-only 退化。

没有出现“必须自建大量插件才能保证文章路由/元信息”的阻碍。当前唯一额外插件是 `@vitejs/plugin-react`；SSG 是 105 行的 prerender 脚本（内容读取与渲染另有模块），职责可控。

因此不需要退回 Astro/Mizuki。后续若需要更高阶的流式 SSR、ISR 或边缘渲染，可以再评估 Next.js；对当前纯静态个人博客，Vite + prerender 的成本更低、可解释性更好。
