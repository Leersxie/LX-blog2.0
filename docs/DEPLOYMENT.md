# 部署与运维

## 1. 目标

| 项 | 值 |
|---|---|
| GitHub 仓库 | <https://github.com/Leersxie/LX-blog2.0> |
| Pages 地址 | <https://leersxie.github.io/LX-blog2.0/> |
| 构建 base | `/LX-blog2.0/` |
| 部署方式 | GitHub Actions → Pages artifact → `actions/deploy-pages` |
| 构建产物 | `dist/`（含 `.nojekyll`、`404.html`、Pagefind、feed、sitemap、API JSON） |

项目页不是根用户站，因此所有内部 URL 都经过 `withBase()`；Vite `base` 与 `SITE_BASE` 必须一致。部署工作流已经设置：

```yaml
env:
  SITE_BASE: /LX-blog2.0/
```

本地 root 开发可以省略 `SITE_BASE`；生产构建必须带项目前缀：

```powershell
$env:SITE_BASE = "/LX-blog2.0/"
pnpm build
$env:SITE_BASE = "/LX-blog2.0/"
pnpm preview
# http://127.0.0.1:4321/LX-blog2.0/
```

bash：

```bash
SITE_BASE=/LX-blog2.0/ pnpm build
SITE_BASE=/LX-blog2.0/ pnpm preview
```

## 2. 首次部署清单

- [x] 新仓库 `Leersxie/LX-blog2.0` 创建并启用 Pages（build type: workflow）。
- [x] 配置 secret `POST_PASSWORD_XIANGTU`。
- [x] 工作流设置 `SITE_BASE=/LX-blog2.0/`。
- [x] 构建、link check、Pagefind 索引。
- [ ] 首次真实 Actions 运行（提交并推送后由本阶段完成）。
- [ ] 部署后 smoke 的真实结果（由 workflow 的 `smoke` job 记录）。

如在新环境重建：

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
2. Settings → Secrets and variables → Actions → 新建 `POST_PASSWORD_XIANGTU`。
3. 如未来发布 cs2，再添加 `POST_PASSWORD_CS2`。
4. 推送 `main`，等待 `CI & Deploy` 的 `quality → build → deploy → smoke`。

## 3. CI 结构

```text
quality (ubuntu, Node 22)
  install → check → test → lint
build
  install → build (SITE_BASE) → links → upload artifact
deploy (main only)
  actions/deploy-pages
smoke (main only)
  curl 首页 / 文章 / RSS / sitemap / Pagefind
  未知路径必须返回 404
```

另有手动/每周 [`.github/workflows/lighthouse.yml`](../.github/workflows/lighthouse.yml)：

- 生产 base 构建；
- 启动 preview server；
- Lighthouse 3 页 + axe 9 次扫描；
- 上传 `docs/lighthouse/`、`docs/a11y-report.json`。

PR 不能拿到生产密码：build job 在 PR 事件使用 `ci-placeholder`，只验证构建，不部署。

## 4. 本地验收

```bash
pnpm build
pnpm links
pnpm preview                 # 另一个终端
BASE_URL=http://127.0.0.1:4321/LX-blog2.0 pnpm test:e2e
BASE_URL=http://127.0.0.1:4321/LX-blog2.0 pnpm search:check
BASE_URL=http://127.0.0.1:4321/LX-blog2.0 pnpm audit:a11y
BASE_URL=http://127.0.0.1:4321/LX-blog2.0 pnpm audit:lighthouse
```

Windows PowerShell 使用 `$env:BASE_URL = "..."; pnpm test:e2e`。

## 5. 缓存 / 安全头

GitHub Pages 不支持自定义响应头：

- 没有 CSP / X-Frame-Options / Permissions-Policy；
- `public/_headers` 不会生效；
- 第三方 Giscus / GTM / Meting 的隐私和 CSP 需要换托管平台后再补。

若迁移到 Cloudflare Pages / Netlify，需要重新验证 base path、404 和响应头，不要假设当前行为可移植。

## 6. URL 兼容

- 项目路径下：`https://leersxie.github.io/LX-blog2.0/guestbook/`。
- 旧站根路径：`https://leersxie.github.io/guestbook/` 仍由旧仓库提供，**不会自动跳到新站**。
- 新站保留旧路径结构、兼容副本、旧 sitemap 入口和旧 API；要接管根 URL，需要把同一 `dist/` 部署到用户站仓库或自定义域名，并重新生成 canonical/sitemap。
- 不要在没有确认的情况下删除旧站；两者可以并行验证。

## 7. 回滚

- **部署回滚**：GitHub Pages 部署历史回退，或 revert 代码后重新触发 workflow。
- **仓库回滚**：`git reset --hard <known-good-commit>`；不要强推到旧博客仓库。
- **内容回滚**：恢复 `content/` 后重新构建；旧正文仍在旧仓库。
- **密码轮换**：更新 secret 后重新部署；旧密文不再匹配新密码。
- **旧站**：始终保留，不参与新站部署。

## 8. 已知限制

- 未做真实手机、软键盘、屏幕阅读器实机。
- Lighthouse 是移动端模拟 + 本地 Edge；不是真实网络。
- Giscus 只验证 iframe/term，未验证登录发评论。
- Meting 只验证歌单加载；未做长时间音频回归。
- GTM 只验证注入；没有 consent UI。
- 项目页部署路径使旧根 URL 不能自动复用；这是 GitHub Pages 项目站的限制。
