# 验收清单

> 状态：Phase 1/2 底座 + 核心页面。不是 Phase 6 的最终发布验收。
> 最后更新：2026-10-25

## 1. 内容

- [x] 旧站 4 篇文章均已复制到 `content/posts/`，正文未改。
- [x] 2 篇已发布文章可访问。
- [x] 2 篇草稿不生成 HTML / 不进 feed / 不进 sitemap。
- [x] `/guestbook/` 规范地址保留。
- [x] `/posts/guestbook/` 兼容副本保留，`noindex`，canonical 指向规范页。
- [x] `/posts/xiangtuzhongguo-analysis/` 保留。
- [x] about / friends 内容已迁移；friends 内部链接改为规范 `/guestbook/`。
- [x] 分类、标签、日期、置顶在归档/首页正确显示。
- [x] 无 Lorem ipsum；没有只交首页。
- [x] 没有文章封面 / 正文图片这一现实已反映在版式中。
- [ ] 迁移后逐篇正文 diff（人工逐字）尚未做；目前只核对了行数、元数据与构建输出。

## 2. 路由与功能

- [x] 首页、归档、文章、关于、项目、友链、404。
- [x] 深链 `/guestbook/`、`/posts/...` 直接访问 200。
- [x] 未知路径真实 404。
- [x] 主题切换（深/浅）持久化。
- [x] `/` 与 `Cmd/Ctrl+K` 搜索。
- [x] 搜索结果 ↑↓ / Enter / Esc、焦点陷阱、焦点返回。
- [x] Pagefind 构建 + 中文查询。
- [x] 加密文章：正文不入 HTML / Pagefind，正确密码可解锁。
- [x] Giscus iframe 懒加载。
- [x] GTM 交互后注入。
- [x] Meting 歌单加载、错误态、重试、网易云直达。
- [x] RSS / Atom / sitemap / robots。
- [x] 旧 sitemap 入口与 API 兼容输出。
- [x] 移动菜单。
- [x] Giscus 保留旧 discussion term（`guestbook/`）。
- [ ] Giscus 真实登录发评论。
- [ ] 音乐真实音频播放、切歌、失败恢复。
- [x] 项目图片灯箱（真实截图，Esc/焦点返回/方向键）。
- [x] 代码复制交互（生成 fixture；构建期 wrapper 有单测）。
- [ ] 文章内图片灯箱实机（现有文章无图片）。
- [ ] 旧分类/标签查询参数的服务端过滤（当前 JS 过滤，no-JS 下显示全部）。

## 3. SEO

- [x] 每页独立 title / description / canonical。
- [x] OG / Twitter / 默认 1200×630 图。
- [x] 文章 BlogPosting + BreadcrumbList。
- [x] 首页 WebSite + Person。
- [x] sitemap 仅规范 URL；副本/404 排除。
- [x] RSS / Atom 只含公开非加密内容。
- [x] 每页唯一 H1（link-check 已断言）。
- [x] 文章 OG 图逐篇生成；默认 OG 只用于非文章页。
- [x] 图片 alt / 装饰图空 alt（项目图片由按钮 aria-label 说明）。
- [ ] 逐文章 OG 图。
- [ ] Schema 校验器（Google Rich Results）实际运行。
- [ ] 外部链接爬虫 / 死链检查（当前只查内部）。
- [ ] 生产 GitHub Pages 的 HTTPS / 404 行为。

## 4. 无障碍

- [x] skip link、`main`、`nav`、`footer` 语义。
- [x] 全局 `focus-visible`。
- [x] 搜索 dialog 焦点管理。
- [x] 移动菜单 Esc、焦点、滚动锁。
- [x] 加密表单 label / error alert。
- [x] `prefers-reduced-motion` 全局 CSS。
- [x] 状态不只靠颜色。
- [x] axe（桌面 7 页 + 移动 2 页，9 次扫描 0 violations）。
- [x] 对比度通过 axe；`--faint` 不再用于正文/标签关键文字。
- [x] `prefers-reduced-motion` 与站点级减少动效开关的 Playwright 测试。
- [ ] 屏幕阅读器。
- [ ] 200% 缩放。
- [ ] 触屏实机 / 软键盘。

## 5. 性能

- [x] 静态 HTML 首屏内容，不依赖 JS。
- [x] 主 JS 89.83KB gzip，内联 CSS 13.60KB gzip，dist 约 2.1MB。
- [x] 无 WebGL / 动画库 / 第三方 UI 套件。
- [x] 字体只加载 Latin 子集；中文走系统字体。
- [x] 外部 Giscus / GTM / Meting 延迟加载。
- [x] Lighthouse（Performance / A11y / Best Practices / SEO）：首页 99/100/100/100，文章 92/100/100/100，归档 91/100/100/100。
- [x] LCP / TBT / CLS 本地移动端模拟测量（LCP 1.2–1.6s，TBT 60–390ms，CLS ≤0.002）。
- [ ] 真实 4G / 弱网。
- [ ] 页面级 JS 拆分（当前单入口）。

## 6. 安全 / 隐私

- [x] 密码不写在 markdown / git。
- [x] 加密正文不入 HTML、hydration data、feed、sitemap、Pagefind。
- [x] `.env.local` gitignored；CI 用 secret。
- [x] 外链 `noopener noreferrer`。
- [x] 无 `dangerouslySetInnerHTML` 用户输入。
- [ ] 密码轮换流程演练。
- [ ] CSP / 响应头（GitHub Pages 不支持，需要换平台）。
- [ ] GTM consent UI。
- [ ] Giscus / GTM / Meting 隐私说明的完整文案（页脚有简短披露）。

## 7. 工程

- [x] `pnpm check` 通过。
- [x] `pnpm test` 28/28。
- [x] `pnpm lint` 通过。
- [x] `pnpm build` 通过，11 HTML / 9 sitemap，Pagefind 523 词。
- [x] `pnpm links` 0 缺失。
- [x] `pnpm test:e2e` 全部通过（本机 Edge，项目 base）。
- [x] `pnpm dev` 与 `pnpm preview` 已运行；base 构建 + base preview 已运行。
- [x] GitHub Actions 配置存在。
- [x] CI 在 Ubuntu / Node 22 实际跑过（run 40174002331）。
- [x] 新仓库真实 GitHub Pages 部署 + smoke 通过（run 40174002331）。
- [ ] Lighthouse CI 性能预算门槛（目前只记录，不阻塞）。
- [ ] 生产回滚演练。
- [ ] 真实内容更新后的再验证（当前只有 4 篇）。

## 8. 结论

Phase 0–6 已完成并部署到 <https://leersxie.github.io/LX-blog2.0/>。剩余是发布后维护与未实机验证项：

1. Giscus 真实发评论、Meting 真实音频播放；
2. 真实手机、软键盘、屏幕阅读器、200% 缩放；
3. 加密密码轮换和私有内容源策略；
4. Lighthouse 性能预算门槛与周更趋势；
5. 旧根 URL 的最终接管方案（用户站/自定义域名）。
