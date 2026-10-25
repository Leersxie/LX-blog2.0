# NOCTILUX 设计系统

> Phase 1 的可实施版本。设计来源：《Leersxie 博客全面重构设计说明书 v1.2》第 4 / 7 / 8 / 31 章。
> 设计口号：**工业编辑终端 × 个人档案**。它是一个安静的阅读站，不是游戏界面仿制品，也不是通用 SaaS 落地页。

## 1. 设计原则

1. **阅读优先**：正文、标题、间距先成立，装饰只做边界和索引。
2. **外层直角，内层小圆角**：页面和分区用 1px 细线定义；图片、输入、徽章用 3–6px。
3. **紫蓝是品牌色，橙色只做告警**：不把强调色铺成背景，不做渐变标题。
4. **索引感来自真实结构**：编号、年份、日期、分类、构建版本都是真数据；不编造系统状态。
5. **动效短、可跳过、有理由**：不强制开场，不逐字打字，不自动播放声音。
6. **真实文案**：不写“欢迎来到我的数字世界”“探索无限可能”。

## 2. Token

实现位置：[src/styles/tokens.css](../../src/styles/tokens.css)。深色为默认，浅色为可选。

### 2.1 颜色

| Token | 深色 | 浅色 | 用途 |
|---|---|---|---|
| `--bg` | `#0b0c11` | `#f1efe9` | 页面底 |
| `--bg-soft` | `#0e1017` | `#ebe8e1` | 面板/抽屉 |
| `--surface` | `#12141c` | `#e7e4dc` | 输入、代码、选中态 |
| `--surface-raised` | `#171924` | `#f7f5f0` | 需要浮起的局部 |
| `--ink` | `#e9e7e3` | `#1b1c21` | 主文字 |
| `--ink-soft` | `#c0bdc9` | `#35363d` | 正文 |
| `--muted` | `#858497` | `#6b6a6c` | 辅助信息 |
| `--faint` | `#5f6070` | `#8d8b86` | 低权重元信息 |
| `--line` | `#282b38` | `#d0cbc0` | 普通分隔 |
| `--line-strong` | `#3b3f51` | `#b6b0a4` | 分区边界 |
| `--violet` | `#9a8cff` | `#5b4cc4` | 品牌 / 链接 / 激活 |
| `--violet-strong` | `#7c6cff` | `#4d3fb2` | 按压/聚焦 |
| `--blue` | `#6ea8ff` | `#2f5fa2` | 次级链接 / 进度 / 音乐 |
| `--orange` | `#e8965f` | `#a95824` | **仅告警**（兼容提示等） |
| `--red` | `#e97575` | `#a43d3d` | 错误 |
| `--green` | `#79b996` | `#397758` | 成功 / 进行中 |

使用约束：

- 品牌强调色只用于链接、激活、细线、焦点、状态点。
- 大面积背景只使用 `--bg` / `--surface`。
- 不使用紫蓝渐变文字、发光边框、彩色玻璃卡片。
- 对比度未做 axe / WCAG 实测；这是已知验收缺口，发布前必须补。

### 2.2 字体

| 角色 | 字体 | 说明 |
|---|---|---|
| 拉丁标题 / UI | Space Grotesk Variable | OFL-1.1，拉丁子集按需加载 |
| 等宽标签 / 日期 / 索引 | JetBrains Mono Variable | OFL-1.1，拉丁子集 |
| 中文正文 | 系统中文 sans | PingFang SC / Hiragino / Microsoft YaHei / Noto Sans SC 回退 |
| 中文标题 | 系统中文 sans | 以字重、字号、字距建立层级，不依赖装饰字体 |

不加载整套 CJK 字体；正文不采用萝莉体、手写体或低可读性展示字体。

### 2.3 字号 / 行高

| 角色 | 值 |
|---|---|
| 正文 | `16px` 手机 / `17.5px` 桌面，`line-height: 1.9` |
| 正文段间距 | `1.55em` |
| H1（页面） | `clamp(58px, 8vw, 110px)`，`line-height: 0.9` |
| 首页主标题 | `clamp(76px, 11vw, 146px)`，`line-height: 1.1` |
| H2（正文） | `clamp(25px, 3.1vw, 32px)`，`1.25` |
| H3 | `21px`，`1.35` |
| 元信息 | `9–11px` mono + `0.04–0.13em` letter-spacing |
| 按钮/标签 | `10–11px` mono / uppercase |

长文仍以 720px 左右的阅读宽度为上限；三栏只在首页/文章侧栏出现。

### 2.4 间距、网格、形状

- 页面最大宽：`--page: 1180px`。
- 阅读列：`--reading: 720px`。
- 页面水平 gutter：`clamp(18px, 3.6vw, 48px)`。
- 分区垂直节奏：`clamp(58px, 7vw, 90px)`。
- 外层容器：`0px` 圆角 + 1px 边界；允许局部斜切 `clip-path`（如 logo 方块）。
- 内层媒体 / 输入 / 徽章：`--radius-inner: 6px`；按钮/小标签：`3px`。
- 阴影只用于对话框/抽屉：`--shadow`。不让所有卡片都浮起。

### 2.5 动效 Token

| Token | 值 |
|---|---|
| `--dur-fast` | 120ms |
| `--dur` | 180ms |
| `--dur-slow` | 260ms |
| `--ease` | `cubic-bezier(0.22, 0.8, 0.22, 1)` |

所有动画在 `prefers-reduced-motion: reduce` 下强制降级为 0.01ms，滚动行为改为 `auto`。详见 [motion-spec.md](motion-spec.md)。

## 3. 布局

### Desktop

```text
[ header: wordmark | index nav | search / theme / menu ]
[ page 1180px ]
  home:  hero  =  7 columns typographic intro | 4 columns real ledger
         sections below on 12-col grid
  article: 760px reading column | 210px sticky TOC
  archive/projects: full-width editorial rows
[ footer: 1.4fr index CTA | 3 small link columns ]
```

### Tablet / Mobile

- `≤1080px`：主导航收起到全屏菜单；文章 TOC 变为 `<details>`。
- `≤760px`：首页 right ledger 改为堆叠；项目/归档行去列；footer 单列。
- 触控目标最小 38–44px；按钮和导航链接有可见边框或下划线。
- 没有 hover-only 功能；搜索、音乐、菜单都有触控入口。

## 4. 组件状态

| 组件 | 状态 |
|---|---|
| 按钮 | default / hover / focus-visible / active / disabled / loading |
| 输入 | default / focus / error / disabled |
| 搜索 | idle / loading / results / empty / index-unavailable |
| 加密卡 | locked / loading / error / unlocked |
| 音乐 | closed / loading / playing / paused / error / retry |
| 归档筛选 | all / category / tag / empty |
| 文章 | canonical / legacy copy（noindex）/ encrypted / unlocked |
| 评论 | placeholder / lazy iframe / unavailable link |
| 主题 | dark / light / persisted |

组件清单见 [component-inventory.md](component-inventory.md)。

## 5. 图标与媒体

- 图标：Lucide，仅按需 16–18px 线性图标；不把 emoji 当功能图标。
- 项目图：本地 webp，内层 6px 圆角，lazy。
- 默认 OG：1200×630，项目内生成并随构建发布。
- 头像：外部 URL 时使用 `referrerPolicy="no-referrer"`、懒加载和字母 fallback。
- 没有全屏动漫横幅，没有背景视频。
- 每篇文章有独立 OG 图；默认 OG 只用于首页/非文章页。
- 文章图片支持灯箱；项目图使用真实截图并支持放大。
- 代码块有语言标签、复制按钮和横向滚动；表格有可聚焦滚动容器。

## 6. 无障碍基线

- 每页唯一 `h1`（link-check 会验证）。
- `<header>` / `<nav>` / `<main>` / `<footer>` 语义。
- Skip link、`aria-current`、`aria-expanded`、`aria-live`、可见 focus ring。
- 搜索 dialog：焦点陷阱、Esc 关闭、关闭后焦点返回触发按钮。
- 移动菜单：Esc 关闭、焦点移动、关闭后返回按钮。
- 颜色不是唯一状态信号：加密/状态都有文字。
- 减少动态效果支持（系统媒体查询 + 页脚站点级开关，持久化）。
- 灯箱焦点陷阱、Esc、方向键、焦点返回；代码复制有文本反馈。
- 未做：屏幕阅读器实机、真实手机、对比度测量。

## 7. 设计债务

1. 首页主标题的「档案」描边字在极窄屏可能贴近下方文案，需要继续在 320px 与 200% 缩放下验收。
2. 项目页在没有图片时使用几何占位；占位信息真实但视觉重复，Phase 5 再做差异化。
3. 文章页 TOC 在加密解锁后会重建，但超长文章滚动高亮仍需真实长文测试。
4. 浅色主题目前只做了 token 级验证，没有逐组件对比度验收。
5. 默认 OG 全站共用，未做逐文章生成图。
6. 单入口 JS 未做页面级拆分；当前 89.83KB gzip，后续可优化。
7. 文章页 Lighthouse 移动端 Performance 92，TBT 350ms；主因是长文首屏样式/布局，已用 `content-visibility` 延后折叠区布局。
8. 首页 83.96KB HTML 包含内联 CSS；首屏更快，但跨页不缓存。后续可做按页 critical CSS。
