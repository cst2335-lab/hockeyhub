# GoGoHockey 项目文档

本目录存放项目相关 Markdown 及文档资料。

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) | **任务与阶段规划**：已完成 / 进行中 / 下阶段任务一览 |
| [V2_REVIEW_NEXT_PHASE.md](./V2_REVIEW_NEXT_PHASE.md) | **V2 评审下阶段**：P0/P1 已完成，当前聚焦 P2（DB 约束、Webhook 幂等、HydrationBoundary 等已落地） |
| [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) | **修改日志**：历史改动汇总 |
| [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md) | **功能增强路线图**：比赛匹配、预订管理、支付、RBAC、SEO 等 |
| [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md) | **修改方案**：功能、体验、架构、UI 视觉（早期规划） |
| [PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md) | **项目综述**：供 AI/人工全局审查与提建议 |
| [UI_VISUAL_SPEC_FOR_REUSE.md](./UI_VISUAL_SPEC_FOR_REUSE.md) | **UI 视觉规范**：可供其他项目复用 |
| [SUPABASE_RLS.sql](./SUPABASE_RLS.sql) | Supabase 行级安全策略 SQL |
| [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md) | Stripe 支付与预订流程配置 |
| [ROLES_AND_ROUTE_GUARDS.md](./ROLES_AND_ROUTE_GUARDS.md) | 权限与路由保护说明 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 部署指南（Vercel + 环境变量 + Supabase） |
| [API.md](./API.md) | API 接口说明 |
| [API_ERROR_CODES.md](./API_ERROR_CODES.md) | API 错误码对照表（`errorCode`） |

---

## 文档说明

- **NEXT_PHASE_TASKS.md**：任务总览及分支实施计划；下阶段以 V2 评审为优先。
- **V2_REVIEW_NEXT_PHASE.md**：V2 三方分析综合评审结论，P0/P1 已完成，当前推进 P2（XSS、SEO、Zod）。
- **CHANGELOG_IMPROVEMENTS.md**：按修改周期记录的优化内容，历史汇总。
- **ENHANCEMENT_ROADMAP.md**：核心业务增强、体验优化、架构改进、实施优先级。
- **PROJECT_REVIEW_REPORT.md**：项目定位、技术栈、功能模块、审查要点。
- **UI_VISUAL_SPEC_FOR_REUSE.md**：颜色、字体、组件等设计规范，便于跨项目复用。
- **SUPABASE_RLS.sql**：RLS 策略覆盖 game_invitations、bookings、notifications、profiles、rinks、payments、rink_updates_log 等表。

---

*返回 [项目根目录](../)*
