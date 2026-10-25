# 组件清单

> 组件按职责分层，页面不直接处理 Markdown / frontmatter / 本地存储 / 加密 envelope。没有一套通用“卡片组件”被强行复用到所有页面。

## 布局

| 组件 | 路径 | 职责 | 状态 / 注意 |
|---|---|---|---|
| `App` | `src/App.tsx` | 页面选择、全局搜索/音乐开关、键盘 `/` 与 `Ctrl/Cmd+K` | 全局错误边界尚未加 |
| `SiteHeader` | `components/layout/SiteHeader.tsx` | wordmark、主导航、搜索、主题、移动菜单 | 菜单焦点与 Esc 已有；菜单打开时搜索会先关闭菜单 |
| `SiteFooter` | `components/layout/SiteFooter.tsx` | 归档 CTA、RSS/Atom/sitemap、社交、许可、构建信息、音乐入口 | 构建时间来自真实构建 |
| `SkipLink` | 内联于 App | 跳到 `#main` | 可见 focus |
| `Reader` | 页面级 `.page` 布局 | 1180px 容器 | 无全局页脚重叠 |

## 页面

| 页面 | 路径 | 数据输入 | 状态 |
|---|---|---|---|
| `HomePage` | `src/pages/HomePage.tsx` | posts、projects、publishedCount | 真实最近文章 + 4 个项目；空状态 |
| `ArchivePage` | `src/pages/ArchivePage.tsx` | posts、tags、categories | 服务端先渲染全部；客户端按 `?tag=` / `?category=` 筛选；清空；空结果 |
| `ArticlePage` | `src/pages/ArticlePage.tsx` | post、prev/next、related、headings | canonical / copy / encrypted / unlocked / no comments |
| `AboutPage` | `src/pages/AboutPage.tsx` | about html、projects、socials | 真实简介，无虚构履历 |
| `ProjectsPage` | `src/pages/ProjectsPage.tsx` | projectsData | 7 个项目；状态/分类/年份/源码；无图项目用编号占位 |
| `FriendsPage` | `src/pages/FriendsPage.tsx` | friendsData、friends html | 8 条稳定顺序；外链头像 fallback |
| `NotFoundPage` | `src/pages/NotFoundPage.tsx` | build、publishedCount | 搜索入口、返回首页、归档 |

## 文章

| 组件 | 路径 | 职责 | 状态 / 注意 |
|---|---|---|---|
| `ArticleBody` | `components/article/ArticleBody.tsx` | 渲染构建期 HTML | 仅信任仓库内容 |
| `EncryptedBody` | `components/article/EncryptedBody.tsx` | 密码输入、Web Crypto 解密、错误状态 | 不持久化密码；解锁后父级提升 HTML |
| `ReadingProgress` | `components/article/ReadingProgress.tsx` | 顶部 2px 进度条 | 仅 client；无动画依赖 |
| `ArticleToc` | `components/article/ArticleToc.tsx` | 桌面目录 + 当前标题高亮 | 解密后由父级更新 headings |
| `MobileToc` | 同上 | `<details>` 目录 | 无 JS 也可展开 |
| `Comments` | `components/comments/Comments.tsx` | Giscus，IntersectionObserver 懒加载，主题同步；`data-mapping="specific"` + legacy term | iframe/term 已测；真实登录发帖未测 |
| `ArticleInteractions` | `components/article/ArticleInteractions.tsx` | 代码复制、文章图片灯箱、Esc/方向键/焦点陷阱/焦点返回 | 项目图真实测试；代码复制用生成 fixture 测试 |
| `Article license` | 内联于 ArticlePage | CC BY-NC-SA 说明 | 外链带 noopener |
| `CodeFrame` | `server/rehype-code-frame.ts` | 语言标签 + 复制按钮 + 横向滚动 | 复制按钮无 JS 时隐藏 |
| `TableWrap` | `server/rehype-table-wrap.ts` | 可聚焦横向滚动表格容器 | 无 JS 仍可滚动 |
| `ImageLightbox` | 内嵌 ArticleInteractions | 图片放大、前后切换、焦点管理 | 项目图与文章图共用 |

## 搜索

| 组件 | 路径 | 职责 | 状态 |
|---|---|---|---|
| `SearchDialog` | `components/search/SearchDialog.tsx` | Pagefind 动态加载、去抖、结果、↑↓ / Enter / Esc、焦点陷阱 | 首次 WASM 加载期间显示 loading；索引缺失显示可操作错误 |
| `Pagefind index` | 构建后 `dist/pagefind/` | 5 页 / 520 词 | 中文无 stemming |

键盘：

- 在非输入元素上按 `/` 或 `Ctrl/Cmd+K` 打开；
- 方向键移动 active 结果；
- Enter 打开；
- Esc 关闭并返回搜索触发按钮；
- Tab 在 dialog 内循环。

## 音乐

| 组件 | 路径 | 职责 | 状态 |
|---|---|---|---|
| `MusicPlayer` | `components/music/MusicPlayer.tsx` | 打开时请求 Meting、曲目列表、播放/暂停/切歌/静音、进度、错误重试、网易云直达 | 默认不自动播放；`preload="none"`；音频跨域由第三方决定 |
| Meting config | `src/config/site.ts` | API 模板、server、playlist id、webUrl | 公开信息；不包含密码 |

## 主题 / 分析

| 组件 | 路径 | 职责 | 状态 |
|---|---|---|---|
| Theme toggle | `SiteHeader` | 切换 `data-theme` + localStorage | 首屏 inline script 防闪白；Giscus 接收 `noctilux:theme` |
| `MotionToggle` | `components/layout/MotionToggle.tsx` | 站点级 `data-motion="reduce"` | 持久化；系统媒体查询独立生效 |
| `GoogleTagManager` | `components/analytics/GoogleTagManager.tsx` | 交互或 8s 后注入 GTM；noscript iframe | 只测脚本注入；没有 consent UI |

## 服务端

| 模块 | 路径 | 职责 |
|---|---|---|
| `content.ts` | `src/server/content.ts` | Markdown 读取、Zod 校验、草稿过滤、permalink/alias、路由、页面数据 |
| `markdown.ts` | `src/server/markdown.ts` | remark/rehype 管线、h1 降级、slug、外链、代码高亮、TOC |
| `encrypt.ts` | `src/server/encrypt.ts` | AES-256-GCM + PBKDF2 envelope |
| `seo.ts` | `src/server/seo.ts` | canonical、OG、BlogPosting / BreadcrumbList / WebSite / Person |
| `feeds.ts` | `src/server/feeds.ts` | RSS、Atom、sitemap、sitemap-index、robots |
| `document.ts` | `src/server/document.ts` | HTML 模板替换、head tags、hydration data |

## 未完成 / 需要后续

- 组件级视觉回归截图（当前只做页面级）。
- 文章内图片灯箱（项目图已实测；现有文章无图片，文章图未实机点开）。
- 阅读进度/目录在超长文中的性能测试。
- 评论登录、提交、删除、主题切换的真实浏览器回归。
- 音乐播放/暂停/切歌的真实音频回归。
- 真实手机软键盘、屏幕阅读器与 200% 缩放。
- 搜索无结果、索引损坏、网络超时的自动化测试（错误 UI 已实现）。
- Lighthouse / axe / 真实设备。
