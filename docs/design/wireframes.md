# 低保真线框

> Phase 1 交付物。真实实现以 `src/pages` 为准；这里记录结构决策，不是像素稿。

## 1. 首页 Desktop

```text
┌ header: LX wordmark ───── nav 00–04 ───── search / theme / menu ┐
├ hairline ────────────────────────────────────────────────────────┤
│ LEERSXIE / PERSONAL ARCHIVE                    EST. 2026 · CN    │
│                                                                  │
│  ■ NOCTILUX / 夜航档案          │ CURRENT STATUS                  │
│  夜航                            │ ● 不常在线...                   │
│  档案.                           │ ARTICLES  PROJECTS  SINCE        │
│                                  │ 02        02        2026         │
│  我是 Leersxie...                │                                 │
│  喜欢化学...                     │ ARCHIVE INDEX / OPEN ACCESS     │
│  [翻阅记录] [关于我]             │ LATEST / 留言板                 │
├──────────────────────────────────┴─────────────────────────────────┤
│ INDEX / 01 最近记录                              全部 2 篇 →      │
│ 01  2026.10.05  留言板                         日常 / 1 分钟 →   │
│ 02  2026.03.31  乡土中国 [LOCKED]              个人 / 4 分钟 →   │
├───────────────────────────────────────────────────────────────────┤
│ INDEX / 02 正在做的东西                           全部项目 →    │
│ project rows: number / title / description / status / year       │
├───────────────────────────────────────────────────────────────────┤
│ COLOPHON / 03 一份安静的索引        description + 关于页 →       │
├───────────────────────────────────────────────────────────────────┤
│ footer: 归档 CTA │ pages / feeds / elsewhere │ license / build   │
│         music / motion toggle / back to top                      │
└───────────────────────────────────────────────────────────────────┘
```

## 2. 首页 Mobile

```text
[LX Leersxie]                    [search] [theme] [menu]
────────────────────────────────────────────────────────
LEERSXIE / PERSONAL ARCHIVE
EST. 2026 · CN
■ NOCTILUX / 夜航档案
夜航
档案.
intro copy
[翻阅记录] [关于我]
────────────────────────────────────────────────────────
CURRENT STATUS
ARTICLES / PROJECTS / SINCE
LATEST / 留言板
────────────────────────────────────────────────────────
最近记录 (single column rows)
────────────────────────────────────────────────────────
项目 (single column rows)
────────────────────────────────────────────────────────
footer
```

## 3. 文章详情

```text
breadcrumb: 首页 / 归档 / 标题
date · category · reading time · [LOCKED]
H1
description
tags
────────────────────────────────────────────────────────
[article body 720px]                     [TOC 210px sticky]
  h2 / h3, code frames, tables, images
  reading progress: 2px hairline at top
  code: language + copy; image: click to lightbox
────────────────────────────────────────────────────────
license
prev / next
related 3
comments (lazy Giscus)
```

Mobile: TOC collapses to `<details>`; body full width; footer single column.

## 4. 归档

```text
INDEX / ALL ENTRIES
归档                                     所有公开记录说明
[category filters] [tag filters]                    02 / 02
────────────────────────────────────────────────────────
2026                                    02 ENTRIES
01  2026.10.05  留言板 [PINNED]   #tag  日常/1分钟 →
02  2026.03.31  乡土中国 [LOCKED] #tag  个人/4分钟 →
────────────────────────────────────────────────────────
SUBSCRIBE / RSS / ATOM
```

筛选通过 query string 更新；无结果时显示 clear filters。

## 5. 搜索 Dialog

```text
backdrop
┌ FIND / ARCHIVE ─────────────────────────────── [x] ┐
│ 搜索档案                                            │
│ [🔍 留言________________________________________]   │
│ ↑↓ 选择   ENTER 打开   ESC 关闭                     │
│ 01  留言板       日常 / 2026.10.05                  │
│     摘要...                                        │
│     /guestbook/                                    │
│ 02 ...                                             │
└────────────────────────────────────────────────────┘
```

## 6. 项目 / 关于

```text
项目
大标题 + 说明
INDEX / 07                       ACTIVE 2 / SHIPPED 5
project card:
  [01 / 2026] [status]
  category
  title
  description
  stack tags
  real screenshot (lightbox) or deterministic glyph
  open / source
```

关于页：`你好`标题 + 段落正文 + 站内项目/外链，不堆砌简历字段。

## 7. 404

```text
404 / SIGNAL LOST
这个地址没有档案。
[回到首页] [搜索档案] [打开归档]
```

## 8. 组件状态

- Button: default / hover / focus-visible / active / disabled.
- Search: idle / loading / results / empty / index-error.
- Encrypted: locked / checking / error / unlocked.
- Music: closed / loading / playing / paused / error / retry.
- Archive: all / category / tag / empty.
- Theme: dark / light; motion: full / reduced.
- Lightbox: closed / open / single / multiple; Esc and focus return.

## 9. 断点

- 320 / 375 / 430 / 768 / 1024 / 1280 / 1440 / 1920。
- 1080px：主导航收进菜单。
- 760px：首页 ledger 堆叠、项目/归档单列、footer 单列、TOC 折叠。
- 640px：灯箱全屏。
- 所有布局按内容拥挤程度调整，不只按设备名。
