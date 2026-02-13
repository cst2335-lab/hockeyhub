# GoGoHockey 修改方案

综合功能完善、用户体验、技术架构、国际化、安全、性能及 **UI 视觉更新优化** 的完整修改方案。

**参考**：[UI_VISUAL_SPEC_FOR_REUSE.md](./UI_VISUAL_SPEC_FOR_REUSE.md)  
**阶段二（2026-02）**：导航与功能按钮逻辑、Dashboard 与主页导航视觉统一已完成，见 [PHASE2_NAV_AND_BUTTON_TASKS.md](./PHASE2_NAV_AND_BUTTON_TASKS.md)、[DEV_LOG_2026-02-13.md](./DEV_LOG_2026-02-13.md)。

---

## 一、UI 视觉更新优化（新增）

### 1.1 设计规范落地

| 项目 | 位置 | 说明 |
|------|------|------|
| **色彩体系** | `tailwind.config.js`、`globals.css` | 将 gogo-dark `#18304B`、primary `#0E4877`、secondary `#64BEF0` 统一为 CSS 变量与 Tailwind 主题 |
| **Navbar** | `components/layout/navbar.tsx` | 背景 `#18304B`，浅色文字，hover/active 白色，与 spec 一致 |
| **Hero** | `components/features/hero-section.tsx` | 渐变 `#18304B → #0E4877 → #64BEF0`，白字 |
| **按钮** | `components/ui/button.tsx` | 主按钮白底深蓝字，hover 灰色，focus ring `#64BEF0` |
| **卡片** | `components/ui/card.tsx`、GameCard、RinkCard | 边框、hover 状态、图标包装器样式统一 |

### 1.2 视觉一致性

- [ ] **链接**：浅色背景用 `text-slate-600` hover `text-[#0E4877]`；深色/Footer 用白字 hover `#64BEF0`
- [ ] **Section 标题**：统一使用 `#64BEF0` 或 primary
- [ ] **选择/焦点**：selection `bg-[#64BEF0]/30`，focus ring `ring-2 ring-[#64BEF0]`

### 1.3 页面级视觉优化

| 页面 | 优化项 |
|------|--------|
| 首页 | Hero 渐变、比赛卡片悬停效果、间距与留白 |
| 比赛列表 | 筛选区、卡片网格、空状态插画或文案 |
| 冰场列表 | 价格标签、Quick Stats 区域视觉层级 |
| 预订页 | 表单分组、价格摘要区、按钮层级 |
| Dashboard | 统计卡片、图表配色与 gogo 色板一致 |
| 登录/注册 | 表单布局、品牌色强调 |

### 1.4 响应式与动效

- [ ] **断点**：sm/md/lg/xl 与现有布局一致，重点检查移动端
- [ ] **过渡**：`transition` 时长统一（如 150ms–200ms）
- [ ] **骨架屏**：Loading 使用与卡片结构一致的 Skeleton

### 1.5 无障碍

- [ ] **对比度**：文字与背景满足 WCAG AA
- [ ] **焦点可见**：所有可交互元素有清晰 focus 样式
- [ ] **色盲友好**：关键信息不单独依赖颜色区分

---

## 二、功能完善（高优先级）

### 2.1 支付流程
- **位置**：`app/api/bookings/`、`app/[locale]/(dashboard)/book/[rinkId]/`
- 预订页已有价格计算（时段费率 × 时长）
- 新建 `/api/stripe/checkout` 处理支付会话
- 预订状态：pending → confirmed（支付成功）→ cancelled
- 配置 Stripe Webhook 处理异步回调
- 48 小时内可退款，收取 10% 手续费

### 2.2 权限系统
- **位置**：`middleware.ts`、`lib/supabase/`、profiles 表
- 角色：player, parent, club_admin, rink_manager, super_admin
- profiles 表添加 role 字段
- 中间件/布局检查路由权限：如 `/manage-rink` 仅 rink_manager

### 2.3 预订确认流程
- **位置**：`app/api/bookings/create/route.ts`
- Resend 发送确认邮件（预订详情 + 取消链接）
- 提前 24 小时发送提醒邮件
- 取消规则：提前 24 小时全额退款，否则不退

---

## 三、用户体验

### 3.1 统一加载状态
- **新建**：`components/ui/skeleton.tsx`、`app/[locale]/(dashboard)/loading.tsx`
- 各数据页使用 Suspense + Skeleton

### 3.2 表单优化
- **位置**：`games/new/`、`book/[rinkId]/`
- 字段级实时校验（zod）
- 错误信息国际化（messages/errors.json）
- 防重复提交（disabled + loading state）

### 3.3 错误边界
- **新建**：`app/[locale]/error.tsx`、`components/error-boundary.tsx`
- 统一错误页，提供「返回」或「重试」按钮

---

## 四、技术架构

### 4.1 React Query 迁移
- **位置**：games、rinks、clubs 等
- 替换手写 useEffect 数据请求

### 4.2 抽离通用 Hooks
- **新建**：`lib/hooks/`
  - useAuth、useBookings、useNotifications、useDebounce

### 4.3 SEO 优化
- **位置**：`app/[locale]/layout.tsx`、各页 metadata
- 每页添加 metadata（title、description、openGraph）
- 添加 sitemap.ts、robots.ts

---

## 五、国际化补充

### 5.1 完善翻译
- **位置**：messages/en.json、fr.json
- games/、clubs/、bookings/、notifications/ 等模块补齐

### 5.2 日期格式化
- **位置**：lib/utils/formatters.ts
- 按 locale 使用 date-fns 的 enUS、fr

---

## 六、安全强化

### 6.1 Supabase RLS
- 为 games、bookings、notifications、profiles 等表配置 RLS 策略

### 6.2 API 路由验证
- 所有 POST/PUT/DELETE 检查认证

### 6.3 输入清理
- **位置**：lib/utils/sanitize.ts
- 富文本场景使用 DOMPurify

---

## 七、性能优化

### 7.1 图片优化
- 使用 `next/image`，priority/lazy 合理配置
- 压缩 PNG/JPG → WebP

### 7.2 分页/虚拟滚动
- 比赛列表超过 20 条时分页或使用 react-virtual

---

## 八、其他建议

### 8.1 测试覆盖
- 新建 `__tests__/`、vitest.config.ts
- 单元测试、集成测试、E2E（Playwright）

### 8.2 监控与日志
- Sentry、Vercel Analytics

### 8.3 文档完善
- API 文档、部署指南、贡献指南

---

## 九、优先级建议（含 UI 视觉）

| 优先级 | 项目 | 说明 |
|--------|------|------|
| **P0（立即）** | 4 加载状态、6 错误边界、12 RLS、13 API 验证 | 安全与基础体验 |
| **P1（本周）** | 1 支付、3 确认邮件、7 React Query、10 翻译、**UI 1.1–1.2 规范落地** | 核心闭环 + 视觉统一 |
| **P2（两周）** | 2 权限、5 表单、8 Hooks、9 SEO、11 日期、15 图片、**UI 1.3–1.4 页面优化** | 进阶体验与视觉细化 |
| **P3（迭代）** | 14 输入清理、16 分页、17 测试、18 监控、19 文档、**UI 1.5 无障碍** | 长期质量 |

---

## 十、实施顺序建议

1. **第一批（P0）**：加载状态、错误边界、RLS、API 验证
2. **第二批（P1）**：确认邮件 → 翻译 → React Query → 支付；同步推进 **UI 色彩与 Navbar/Hero/按钮规范**
3. **第三批（P2）**：权限、表单、Hooks、SEO、日期、图片；推进 **各页视觉优化**
4. **第四批（P3）**：输入清理、分页、测试、监控、文档、**无障碍**

---

*本方案将 UI 视觉更新优化与功能、体验、架构修改统一规划。*
