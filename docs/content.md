# 内容维护

## 1. 新增文章

在 `content/posts/` 新建 `.md`，或复制现有文章。最小 frontmatter：

```yaml
---
title: 文章标题
published: 2026-10-25
description: 一句话摘要，用于列表和 SEO
category: 日常
tags: [标签A, 标签B]
draft: false
---
```

正文从下一行开始。构建时通过 `zod` strict schema 校验；未知字段会让构建失败，而不会静默丢弃。

## 2. Frontmatter 字段

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` | string，非空 | 必填 | 页面 H1 与 SEO 标题 |
| `published` | date | 必填 | `YYYY-MM-DD`；用于排序、sitemap |
| `updated` | date | 可选 | 有则用于 JSON-LD 与 lastmod |
| `description` | string | 可选 | 列表摘要、SEO description；为空时自动截取正文 |
| `category` | string | `未分类` | 归档分类 |
| `tags` | string[] | `[]` | 归档标签 |
| `draft` | boolean | `false` | 为 true 时不生成路由、不进 feed/sitemap |
| `pinned` | boolean | `false` | 首页排序优先 |
| `cover` | string | 可选 | `/public` 绝对路径或远程 URL；构建时验证本地文件 |
| `comment` | boolean | `true` | 是否显示 Giscus |
| `lang` | string | `zh-CN` | 保留字段 |
| `permalink` | path | 可选 | 例如 `guestbook` → `/guestbook/`，同时生成 `/posts/<id>/` 兼容副本 |
| `alias` | path | 可选 | 生成 `/posts/<alias>/` 兼容副本 |
| `encrypted` | boolean | `false` | 需要配合 `passwordEnv` |
| `passwordEnv` | string | 可选 | 构建环境变量名；不能写密码本身 |
| `passwordHint` | string | 可选 | 解锁界面的提示 |

`permalink` / `alias` 只允许字母、数字、下划线、连字符和单层 `/`。路由冲突会让构建失败。

## 3. 草稿

`draft: true` 的文章不会产生 HTML。它们可以留在仓库内，方便继续编辑。测试会断言 cs2 与 first-blog 不在路由中。

## 4. 加密文章

新站不在 frontmatter 保存明文密码。流程：

1. frontmatter 写：
   ```yaml
   encrypted: true
   passwordEnv: POST_PASSWORD_XIANGTU
   ```
2. 在 `.env.local` 或 CI secrets 中提供：
   ```dotenv
   POST_PASSWORD_XIANGTU=你的密码
   ```
3. 构建时 `src/server/encrypt.ts` 使用 AES-256-GCM + PBKDF2-SHA256（240,000 iterations）加密渲染后的正文。
4. HTML / `window.__NOCTILUX_DATA__` / Pagefind 只得到 envelope（salt、iv、ciphertext、tag），没有正文。
5. 读者输入密码后由 Web Crypto 在本地解密并插入页面；不写 localStorage / sessionStorage。

**重要安全边界**：文章正文仍然以明文存在于本仓库的 Markdown 中。当前加密保护的是“站点访客”的阅读权限，不是仓库读者的权限。若需要真正的机密性：

- 内容仓库必须私有，或正文只存在于外部构建环境；
- GitHub Actions 只在受信任分支使用 secret；
- 不要把 `.env.local` 提交；
- 轮换密码需要重新构建，旧密文会随旧构建失效。

当前本地开发使用旧站密码（`.env.local`，gitignored），仅用于平滑迁移。新仓库首次部署前建议更换。

## 5. 旧 URL / 兼容

- 规范 `guestbook`：`/guestbook/`
- 兼容副本：`/posts/guestbook/`，`noindex` + canonical `/guestbook/`
- 规范文章：`/posts/xiangtuzhongguo-analysis/`
- 旧 sitemap 入口：`/sitemap-index.xml`、`/sitemap-0.xml`
- 旧 API：`/api/allPostMeta.json`、`/api/calendar-data.json`
- `/rss.xml`、`/atom.xml` 保留

兼容副本不进入 sitemap、Pagefind 或评论（避免同一文章被搜索两次、评论被拆成两份）。

## 6. 页面正文

`content/pages/about.md`、`friends.md` 没有 frontmatter 要求，正文会被渲染。正文里的 `#` 在构建时降为 `h2`，避免与页面标题形成第二个 `h1`。

## 7. Markdown 能力

- GFM：表格、任务列表、删除线。
- `rehype-slug`：标题自动 id，用于 TOC 与锚点。
- `rehype-highlight`：代码高亮。
- 外链自动加 `target="_blank" rel="nofollow noopener noreferrer"`。
- 原始 HTML 不会当作可执行标记渲染；需要复杂组件时，在 React 页面层实现，不要把正文和视觉组件耦合。

## 8. 每篇文章的 OG 图

默认 OG 图在 `public/og-default.png`。每篇已发布文章会优先使用：

```text
public/og/<文章文件名>.png
```

生成脚本：

```bash
python scripts/make-og.py
```

它会读取 `content/posts/*.md` 的标题、日期、分类、标签，为已发布文章生成确定性的 1200×630 PNG，并跳过草稿。图片生成依赖 Pillow 与 Windows 中文字体；生成结果应提交，CI 只引用文件，不需要 Pillow。新增/修改标题后手动重跑并在 PR diff 中检查。

## 9. 发布前检查

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
pnpm links
pnpm test:e2e   # 本机 Edge；项目页需 BASE_URL
pnpm search:check
```

`pnpm links` 会检查：

- 所有内部 href / src / srcset 是否指向构建产物；
- 每页是否恰好一个 h1；
- 加密正文的关键词是否泄漏到 HTML。
