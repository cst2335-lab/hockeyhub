# 下阶段需要修改的内容

基于 [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md)、[PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md)、[CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) 与开发日志整理。  
**说明**：阶段二导航与 RLS（payments、rink_updates_log）已完成，以下为尚未完成或待加强项。

---

## 一、高优先级（P0 / P1）

### 1. 支付流程
- **目标**：冰场预订与支付闭环。
- **位置**：`app/api/bookings/`、`app/[locale]/(dashboard)/book/[rinkId]/`。
- **内容**：
  - 新建 `/api/stripe/checkout`（或等价）处理支付会话。
  - 预订状态：pending → confirmed（支付成功）→ cancelled。
  - 配置 Stripe Webhook 处理异步回调。
  - 约定退款规则（如 48 小时内可退、10% 手续费等）。
- **依赖**：Stripe 已安装，需配置环境变量与 Webhook。

### 2. 测试
- **目标**：保证回归与关键流程可测。
- **内容**：
  - 运行 `npm run test` 验证现有单元测试通过。
  - 补充关键流程 E2E（如登录、预订、发布比赛），可选 Playwright。

### 3. 预订确认与取消规则
- **位置**：`app/api/bookings/`、Resend。
- **内容**：
  - 预订成功后发送确认邮件（详情 + 取消链接）。
  - 提前 24 小时提醒邮件（可选）。
  - 取消规则落地：如提前 24 小时全额退，否则不退；与支付/退款策略一致。

---

## 二、中优先级（P1 / P2）

### 4. 权限与角色
- **目标**：路由与功能按角色控制。
- **位置**：`middleware.ts`、`lib/supabase/`、profiles 表。
- **内容**：
  - profiles 表增加 role（如 player, parent, club_admin, rink_manager, super_admin）。
  - 中间件或布局中检查路由权限（如 `/manage-rink` 仅 rink_manager）。
  - 与现有 rink_managers 表逻辑统一。

### 5. 监控与可观测性
- **内容**：
  - 集成 Sentry（或等价）错误监控。
  - Vercel Analytics 或等价行为分析（可选）。

### 6. 文档
- **内容**：
  - API 文档（开放接口说明）。
  - 部署指南（Vercel + 环境变量 + Supabase）。
  - 贡献指南（可选）。

### 7. PWA 与缓存
- **内容**：
  - 检查 Service Worker 缓存策略，确保 `/login`、`/register` 等关键路径不被错误缓存，避免登录/注册异常。

### 8. i18n 收尾
- **内容**：
  - Dashboard 导航栏中仍为硬编码的文案（如 "Logout"）改为使用 messages 中的 key，统一 en/fr。

---

## 三、体验与视觉（P2）

### 9. UI 视觉一致性（未完成项）
- **链接**：浅色背景 `text-slate-600` hover `text-[#0E4877]`；深色/Footer 白字 hover `#64BEF0`。
- **Section 标题**：统一使用 gogo-secondary 或 primary。
- **选择/焦点**：selection `bg-[#64BEF0]/30`，focus ring `ring-2 ring-[#64BEF0]`。
- **响应式与动效**：过渡时长统一（如 150–200ms）；骨架屏与卡片结构一致。

### 10. 无障碍
- **内容**：对比度 WCAG AA、所有可交互元素 focus 可见、关键信息不单独依赖颜色。

### 11. 表单与错误提示
- **位置**：`games/new/`、`book/[rinkId]/` 等。
- **内容**：字段级错误展示、错误信息国际化（messages）、防重复提交已部分完成，可继续收紧一致性。

---

## 四、技术架构与性能（P2 / P3）

### 12. 数据请求
- **内容**：尚未使用 React Query 的页面逐步迁移，替换手写 `useEffect` 请求（部分已完成）。

### 13. API 路由验证
- **内容**：所有 POST/PUT/DELETE 路由统一做认证检查（已有 requireAuth 等，需覆盖全部写操作）。

### 14. 输入过滤与安全
- **内容**：富文本或用户生成内容使用 sanitize/DOMPurify；XSS/注入防护复查。

### 15. 性能
- **内容**：图片使用 `next/image`、懒加载；长列表分页或虚拟滚动（部分页面已有分页）。

### 16. SEO
- **内容**：各页 metadata、sitemap、robots 已部分存在，可按需补充 openGraph、结构化数据。

---

## 五、建议实施顺序

1. **支付 + 预订确认**：先打通预订→支付→确认邮件→取消规则。
2. **测试**：单元测试通过后，补 1～2 条关键 E2E。
3. **权限**：role 字段与 manage-rink 等路由保护。
4. **监控与文档**：Sentry、部署与 API 文档。
5. **PWA、i18n 收尾、UI 与无障碍**：按迭代排期。

---

## 六、分支与实施计划（已采纳）

按 **3 个分支** 实施，便于 code review、降低合并冲突，并支持部分并行。

| 分支名 | 包含任务 | 说明 |
|--------|----------|------|
| **`feat/stripe-payment-and-booking-flow`** | §一 1 支付流程、§一 3 预订确认与取消规则 | 核心业务闭环，独立分支便于 review 与回滚。 |
| **`feat/roles-and-route-guards`** | §二 4 权限与角色 | 与支付/UI 解耦，可与分支 1 并行。 |
| **`chore/next-phase-ops-and-polish`** | §一 2 测试、§二 5 监控、§二 6 文档、§二 7 PWA、§二 8 i18n 收尾、§三 9–11 UI/无障碍（已完成）；§四 12–16 架构与性能（留待后续） | 支撑类工作合并为一个分支，减少 PR 数量。详见「七、完成记录」。 |

### 执行顺序建议

1. 从 **main**（或当前集成分支）拉出 **分支 1**、**分支 2**，可并行开发。
2. **分支 1** 合并后，再基于最新 main 拉 **分支 3**（便于 E2E 覆盖已上线的支付流程）；若希望测试尽早合入，也可先做分支 3 中的单元测试与 E2E 骨架。
3. 合并顺序：建议 1 → 2 → 3，或 1、2 并行合并后再合并 3。

### 创建分支示例

```bash
git checkout main
git pull origin main
git checkout -b feat/stripe-payment-and-booking-flow
# 或
git checkout -b feat/roles-and-route-guards
# 或
git checkout -b chore/next-phase-ops-and-polish
```

---

## 七、chore/next-phase-ops-and-polish 完成记录

- **§一 2 测试**：`npm run test` 已通过（Vitest，14 个用例）。
- **§二 6 文档**：新增 [DEPLOYMENT.md](./DEPLOYMENT.md)（Vercel + 环境变量 + Supabase）、[API.md](./API.md)（预订/支付/通知/同步接口说明）；docs/README 已更新索引。
- **§二 7 PWA**：`public/sw.js` 对 `/login`、`/register`、`/dashboard`、`/bookings`、`/manage-rink`、`/notifications` 不再使用缓存，避免登录/状态异常。
- **§二 8 i18n**：Manage Rink 页文案全部迁入 `messages`（en/fr），使用 `manageRink` 与 `nav` 命名空间。
- **§二 5 监控**：集成 `@sentry/nextjs`；设置 `NEXT_PUBLIC_SENTRY_DSN` 后启用上报，未设则不上报；`instrumentation.ts`、`sentry.*.config.ts`、`app/global-error.tsx`；DEPLOYMENT.md 已补充 Sentry 说明。
- **§三 9 UI 视觉**：`globals.css` 增加 `.link-light`（浅色背景链接）、`.link-dark`（深色/Footer 链接）、`.input-focus` 与 `:focus-visible` 使用 `#64BEF0` 焦点环；`::selection` 已符合 spec。
- **§三 10 无障碍**：`:focus-visible` 使用明显焦点环（box-shadow 2px #64BEF0），可交互元素键盘聚焦可见。
- **§三 11 表单与错误**：`common` 增加 `required`、`formError`、`invalidEmail`、`tryAgain`；`book` 增加 `fillRequired`、`spanMidnight`、`slotBooked`、`checkoutFailed`、`invalidResponse`、`createFailed`；预订页 `book/[rinkId]` 错误提示全部使用 i18n。
- §四 12–16 架构与性能留待后续迭代。

---

*本文档随项目进展更新，与 MODIFICATION_PLAN、PROJECT_REVIEW_REPORT 保持一致。*
