# 依赖登记

> 版本以 `pnpm-lock.yaml` 为准。体积一列区分“客户端产物”和“仅构建期使用”；所有许可证来自包元数据，发布前仍建议做一次法务级复核。
>
> 当前没有安装动画库（无 GSAP / Motion / anime.js），没有安装 UI 套件，没有安装 icon 字体包。动效用 CSS / WAAPI，图标来自 tree-shaken 的 Lucide。

## 客户端运行时

| 依赖 | 版本 | 许可证 | 体积 / 作用 | 降级 |
|---|---|---|---|---|
| `react` | 19.3.1 | MIT | UI 与 SSR 核心；计入 88.00KB gzip 主 bundle | 无（底座） |
| `react-dom` | 19.3.1 | MIT | `renderToString` + `hydrateRoot` | 无（底座） |
| `lucide-react` | 1.61.0 | ISC | 仅引用的 ~20 个线性图标，tree-shaken；CSS 字号控制 | 可换 inline SVG；图标全部有文本/aria 标签 |
| `@fontsource-variable/space-grotesk` | 5.3.0 | OFL-1.1 | 拉丁展示字体；实际只按 unicode-range 下载 latin（约 22KB woff2） | 系统 sans |
| `@fontsource-variable/jetbrains-mono` | 5.3.0 | OFL-1.1 | 标签/元信息等宽字体；latin 约 40KB woff2 | 系统 monospace |

## 仅构建期（不进入客户端 bundle）

| 依赖 | 版本 | 许可证 | 作用 | 降级 |
|---|---|---|---|---|
| `gray-matter` | 4.0.3 | MIT | 解析 frontmatter | 手写 YAML 子集解析 |
| `zod` | 4.6.7 | MIT | strict schema + 日期校验 | 手写 validator |
| `unified` / `remark-parse` / `remark-gfm` / `remark-rehype` / `rehype-slug` / `rehype-stringify` | 11 / 11 / 4 / 11 / 6 / 10 | MIT | Markdown / GFM / id / HTML | `marked` + sanitize 或保留 plain text |
| `rehype-highlight` | 7.0.2 | MIT | 构建期代码高亮 | 关闭高亮，保留 `<pre><code>` |
| `rehype-external-links` | 3.0.0 | MIT | 外链新窗口 + `rel` | 在 Markdown 中手写属性（不推荐） |
| `unist-util-visit` | 5.2.0 | MIT | 收集 h2/h3 作为 TOC | 正则解析（脆弱，仅 fallback） |

## 开发 / 质量 / 部署

| 依赖 | 版本 | 许可证 | 作用 | 降级 |
|---|---|---|---|---|
| `vite` | 8.3.5 | MIT | dev server + client build | 无（底座） |
| `@vitejs/plugin-react` | 6.1.2 | MIT | React JSX / Fast Refresh | 手写 esbuild JSX 配置 |
| `typescript` | 5.9.3 | Apache-2.0 | 类型检查 | 无（硬要求） |
| `tsx` | 4.23.15 | MIT | 运行 `prerender.ts` | 先将脚本编译为 JS 再执行 |
| `vitest` | 5.0.5 | MIT | 单元测试 | Node `node:test` |
| `pagefind` | 1.5.2 | MIT | 构建期索引 | 构建期 JSON + 客户端检索（仅备选） |
| `playwright-core` | 1.64.1 | Apache-2.0 | 本地浏览器验收；使用系统 Edge，不下载 Chromium | 手工浏览器验收 |
| `eslint` | 10.13.0 | MIT | lint | 无 |
| `typescript-eslint` | 8.72.0 | MIT | TS lint | ESLint 默认 parser |
| `eslint-plugin-react-hooks` | 7.1.1 | MIT | Hooks 规则 | 无 |
| `@eslint/js` | 10.0.1 | MIT | ESLint 推荐规则 | 无 |
| `globals` | 17.13.0 | MIT | 浏览器/Node 全局声明 | 手写 globals |
| `@types/*` | lock 版本 | MIT | node / react / hast 类型 | 无 |

## 产物体积

- 主 JS：**285.79KB raw / 88.00KB gzip**，单入口。当前未做页面级 `React.lazy`。
- 主 CSS：**54.89KB raw / 12.83KB gzip**。
- 字体：Latin 子集按需约 **62.7KB**（Space Grotesk 22.28KB + JetBrains Mono 40.40KB），其余 unicode-range 文件不会在中文页面请求。
- `dist/`：**1.4MB**（含 Pagefind 运行时文件、OG 图、项目图片、字体文件）。
- 构建输出：11 个 HTML、9 条 sitemap URL、5 页 Pagefind 索引（520 词）。

## 明确没有使用

- Tailwind / UnoCSS / CSS-in-JS；
- GSAP / Motion / anime.js / Lenis；
- 任何 WebGL / Three.js；
- 任何第三方 UI 组件库；
- 任何英文/中文 icon font；
- 任何自动下载字体的运行时脚本。

这符合“每个新增依赖必须有用途、体积、许可证和 fallback”的约束。
