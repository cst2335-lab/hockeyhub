# 主题与视觉规范

项目使用 **Tailwind** `darkMode: ["class"]`、**next-themes**，在 `<html>` 上切换 `class="dark"`。

---

## CSS 变量（`app/globals.css`）

| Token | 浅色 (`:root`) | 暗色 (`.dark`) |
|--------|----------------|----------------|
| `--background` / `--foreground` | 页面底色与主文字 | 深底浅字 |
| `--card` / `--card-foreground` | 卡片底与卡片内主文字 | 深底浅字 |
| `--surface` | 软白区块 | **与 `--card` 对齐** |
| `--muted` / `--muted-foreground` | 次要背景与次要文字 | 暗色次要色 |
| `--border` / `--input` | 边框与表单控件 | 暗色边框 |

## 组件约定

1. **卡片与表单**：`bg-card text-card-foreground border border-border`，避免在主题容器内单独 `bg-surface` 叠 `text-card-foreground` 导致对比度不足。
2. **文字**：`text-foreground`、`text-muted-foreground`，避免固定 `text-gray-*`。
3. **输入框**：`border-input bg-background text-foreground`。
4. **状态徽章**：浅色底需补 `dark:bg-*/40 dark:text-*`（见 `globals.css` `.badge-*`）。

## 品牌色板

| 角色 | Hex | Tailwind |
|------|-----|----------|
| 深色（导航、Hero） | `#18304B` | `gogo-dark` |
| 主色 | `#0E4877` | `gogo-primary` |
| 强调 | `#64BEF0` | `gogo-secondary` |

Hero 渐变示例：`#18304B` → `#0E4877` → `#64BEF0`；主按钮白底 + `gogo-primary` 文字；焦点环使用 `gogo-secondary`。

## 相关

- `components/ui/theme-toggle.tsx`、`app/providers/theme-provider.tsx`
- [ARCHITECTURE.md](./ARCHITECTURE.md)
