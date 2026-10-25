# 动效规范

## 1. 原则

- 动效只服务四件事：**状态反馈、层级变化、方向、连续性**。
- 页面加载不强制播放入场动画；静态内容先出现。
- 不使用逐字打字、无限粒子、滚动劫持、全屏鼠标追踪、自动播放声音。
- 默认时长 120 / 180 / 260ms；只有 loading spinner 是循环动画。
- 所有动效在 `prefers-reduced-motion: reduce` 下降级。

## 2. Token

| Token | 值 | 用途 |
|---|---|---|
| `--dur-fast` | 120ms | 小图标 / 颜色反馈 |
| `--dur` | 180ms | hover、focus、搜索 dialog、主题图标 |
| `--dur-slow` | 260ms | 移动菜单/抽屉进入 |
| `--ease` | `cubic-bezier(0.22, 0.8, 0.22, 1)` | 统一缓动 |

## 3. 动效清单

| 场景 | 实现 | 时长 | 减少动态 |
|---|---|---|---|
| 导航下划线 | `transform: scaleX()` | 180ms | 关闭 |
| 按钮/项目行 hover | 边框颜色 + 背景 + `translateY(-1px)` | 120–180ms | 关闭位移/过渡 |
| 搜索结果 active | 背景/颜色 | 120ms | 瞬时切换 |
| 搜索 dialog | `opacity` + `translateY(-8px)` | 180ms | 瞬时 |
| 移动菜单 panel | `translateX(20px)` + opacity | 260ms | 瞬时 |
| 音乐/搜索抽屉 | 同上 | 180–260ms | 瞬时 |
| 主题图标 | opacity 交叉 | 180ms | 瞬时 |
| 阅读进度条 | scroll 时直接 `scaleX` | 0（每帧） | 仍显示进度，不做平滑过渡 |
| 搜索/解密切换 spinner | `rotate` 循环 | 900ms | 停止循环，文本仍显示 |
| 项目图 hover | `scale(1.015)` | 260ms | 关闭 |
| 评论 lazy load | 无位移，直接出现 | — | 不变 |

没有：

- 页面切换动画；
- 首屏启动序列；
- 打字机（旧站首页的 typewriter 未迁移）；
- 视差 / 滚动驱动 WebGL；
- 自动轮播背景；
- 声音 / 音效；
- 自动播放音乐。

## 4. Reduced Motion

全局规则：

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

部分组件还有局部 `scrollIntoView` / CSS 平滑滚动；全局规则会覆盖。

**浏览器实测状态**：尚未在 Playwright 中显式 `emulateMedia({ reducedMotion: 'reduce' })` 验证；这是 Phase 6 的验收项。

## 5. 将来可加的效果（需重新评审）

- 文章 TOC 的细线进度（已有静态高亮，不依赖动画）。
- 只在桌面、非 reduced-motion、非低性能设备上启用的局部转场。
- 文章封面 CSS 生成的索引图形。

任何新增动效必须回答：它表达什么状态？用户能否跳过？减少动态模式是什么？是否阻塞内容？
