# ★★★ 主题与暗色模式（Theming）

项目使用 **Tailwind** `darkMode: ["class"]`、**next-themes**，在 `<html>` 上切换 `class="dark"`。

## CSS 变量（`app/globals.css`）

| Token | 浅色 (`:root`) | 暗色 (`.dark`) |
|--------|----------------|----------------|
| `--background` / `--foreground` | 页面底色与主文字 | 深底浅字 |
| `--card` / `--card-foreground` | 卡片底与卡片内主文字 | 深底浅字 |
| `--surface` | 软白区块 | **与 `--card` 对齐**（避免暗色下仍为近白底） |
| `--muted` / `--muted-foreground` | 次要背景与次要文字 | 暗色次要色 |
| `--border` / `--input` | 边框与表单控件 | 暗色边框 |

## 组件约定

1. **卡片与表单容器**：优先 `bg-card text-card-foreground border border-border`，不要用仅 `bg-surface` 承载与 `text-card-foreground` / `text-foreground` 混用却未设置暗色 `--surface` 的旧写法（会导致浅色字叠在近白底上）。
2. **文字**：用 `text-foreground`、`text-muted-foreground`、`text-card-foreground`，避免在主题容器内使用固定 `text-gray-*`（暗色下易对比度不足）。
3. **输入框**：`border-input bg-background text-foreground`，与全局 `--input` 一致。
4. **徽章 / 状态色**：浅色底 + 深色字时，为暗色模式补充 `dark:bg-*/40 dark:text-*` 等变体（见 `globals.css` 的 `.badge-*` 与 `components/ui/card.tsx`）。

## 相关依赖

- `next-themes`：主题切换组件见 Dashboard 侧栏等布局。
- 设计稿与色板参考：`docs/UI_VISUAL_SPEC_FOR_REUSE.md`。
