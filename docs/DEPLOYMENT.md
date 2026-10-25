# 部署

## 1. 当前假设

- 部署目标：GitHub Pages，仓库根路径。
- 规范站点：`https://leersxie.github.io`（见 `src/config/site.ts`）。
- 构建产物：`dist/`，含 `.nojekyll`、`404.html`、Pagefind、RSS、sitemap 与兼容 API。
- 工作流：[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)。

**这个新目录目前没有远端 remote，也没有实际部署。** 旧站仍由旧仓库的 `master` 发布，保持不动。

## 2. 首次部署到新仓库

1. 在 GitHub 创建新仓库（不要复用旧博客仓库的 `master`，除非你明确准备切换生产）。
2. 在本地新仓库中：
   ```bash
   git add .
   git commit -m "feat: initialize NOCTILUX static site"
   git remote add origin git@github.com:<owner>/<new-repo>.git
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 仓库 Settings → Secrets and variables → Actions → New repository secret：
   - `POST_PASSWORD_XIANGTU`：加密文章的实际密码。
   - 如未来发布 cs2（目前为草稿），再添加 `POST_PASSWORD_CS2`。
5. 等待 `CI & Deploy` 的 `quality → build → deploy` 完成。
6. 如果仓库不是 `<owner>.github.io` 根站点，而是项目页，需要同步修改：
   - `src/config/site.ts` 的 `site.url`；
   - `vite.config.ts` 的 `base`；
   - 站内绝对路径（当前按根路径写死，项目页需要统一加 base helper）。
   当前未实现项目子路径，首次部署请使用根站点，或先完成 base path 改造。

## 3. CI 做了什么

`quality`：

- `pnpm check`：TypeScript 全量检查；
- `pnpm test`：24 个单元测试；
- `pnpm lint`：ESLint，不自动修改。

`build`：

- `pnpm install --frozen-lockfile`；
- `POST_PASSWORD_XIANGTU` 来自 secret；PR 使用一次性 `ci-placeholder`，只验证构建，不部署；
- `pnpm build`：Vite → prerender → Pagefind；
- `pnpm links`：内部链接、资源、加密泄漏检查；
- 非 PR 上传 `dist/` 为 Pages artifact。

`deploy`：

- 只在 `main` push 时运行；
- `actions/deploy-pages@v4`；
- 没有 Lighthouse gate。Lighthouse / CWV 仍待补（见 `docs/acceptance-checklist.md`）。

## 4. 本地预览

```bash
pnpm build
pnpm preview
# http://127.0.0.1:4321
```

`preview` 模拟：

- 目录末尾斜杠重定向；
- `/posts/guestbook/`、`/guestbook/` 等 clean URL；
- 未知路径返回真实 404；
- `/rss.xml`、`/sitemap.xml`、`/api/*` 静态输出；
- `.js` / `.css` / 图片的静态类型。

## 5. 缓存与安全头

GitHub Pages 不支持自定义响应头。以下文件不会在当前托管上生效：

- `public/_headers`（未创建）；
- `vercel.json`（未创建）。

因此不要声称新站有 CSP / X-Frame-Options。若切到 Cloudflare Pages / Netlify / Vercel，再补等价配置并重新验证。评论和统计是第三方 iframe/script，生产环境需单独审视隐私和 CSP。

## 6. 回滚

- **部署回滚**：GitHub Actions 的 Pages 部署历史可回退到上一版本；或在 `main` 上 revert 对应 commit 后重新部署。
- **仓库回滚**：本仓库保留初始 commit；旧博客仍在旧仓库，不受影响。
- **内容回滚**：`content/posts` 是纯文本，删除/恢复文章只影响下一次构建；发布前用 `pnpm build` + `pnpm links` 验证。
- **secret 轮换**：更新 `POST_PASSWORD_XIANGTU` 后重新部署；旧部署的密文不被新密码解开，需要重新构建。

## 7. 已知限制

- 未在真实 GitHub Pages 上验证；本报告只验证了静态目录和模拟 404。
- 未做 Lighthouse / Core Web Vitals。
- 未做真实移动设备 / 触屏 / 屏幕阅读器。
- 评论需要 GitHub Discussions + giscus App；当前只验证 iframe 出现，未验证登录发帖。
- 统计 GTM 只验证脚本注入；没有 consent UI。
- Meting API 由第三方提供，播放依赖其 CDN；失败时显示错误、重试和网易云歌单链接。
