# UI 优化梳理（参考 TeamSnap 后的系统整改）

## 一、已识别问题

| 类别 | 问题 | 位置 |
|------|------|------|
| **导航栏** | 按钮/链接间距偏紧 | navbar.tsx `gap-6`、右侧 `gap-3` |
| **Footer** | 视觉单薄、无层次 | footer.tsx 仅 border-t + bg-background |
| **卡片** | 硬编码 gray/white，暗色下对比差 | game-card-working、rinks 卡片、dashboard 统计卡 |
| **白底文字** | 浅色背景上用 gray-600 等，暗色模式未适配 | 多处 `text-gray-600`、`bg-white` |
| **非主页** | Dashboard/Games/Rinks/Clubs/Bookings 未统一主题 | 固定 gray、white，无 text-foreground/bg-card |
| **白天/黑夜** | Dashboard 顶栏无主题切换、内容区未完全随主题 | dashboard/layout 固定深蓝；部分页面未用 CSS 变量 |

## 二、整改原则

1. **统一使用主题 token**：`text-foreground`、`text-muted-foreground`、`bg-background`、`bg-card`、`border-border`、`bg-muted`，避免硬编码 `text-gray-*`、`bg-white`。
2. **导航与右侧分组**：适当加大 nav 项间距、右侧图标与登录组间距。
3. **Footer**：增加背景层次（如 muted）、顶部分割线、暗色模式适配。
4. **卡片**：背景/边框/文字全部用 token，暗色下可读。
5. **Dashboard**：顶栏支持主题切换并随主题变色；内容区已用 `bg-background` 的保持，其余改为 token。

## 三、实施清单

- [x] 导航栏间距（gap-8、右侧 gap-4）
- [x] Footer 视觉与主题（bg-muted/30、border-border、暗色适配）
- [x] GameCard 主题 token + 暗色（bg-card、text-foreground、text-muted-foreground、dark 边框/徽章）
- [x] Dashboard 统计卡 + 页面文字/背景（bg-card、text-muted-foreground、border-border）
- [x] Rinks 页 toolbar/card/空态/分页/Quick Stats（全部 token + 暗色）
- [x] Games 页筛选/列表/分页（token + i18n）
- [x] Dashboard layout 顶栏主题切换 + 随主题变色（ThemeToggle、白天/黑夜 nav）
- [x] Clubs、Bookings、Auth 等页面 token 替换（card、foreground、muted、SlimLayout、Login/Register）
