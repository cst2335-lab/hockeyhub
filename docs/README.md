# GoGoHockey 项目文档

本目录存放项目相关 Markdown 及文档资料。

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md) | **修改方案**：功能、体验、架构、UI 视觉等完整规划 |
| [PHASE2_NAV_AND_BUTTON_TASKS.md](./PHASE2_NAV_AND_BUTTON_TASKS.md) | **阶段二任务**：导航与功能按钮逻辑优化（含完成记录） |
| [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) | **下阶段任务**：待完成内容清单 + 3 分支实施计划（支付、权限、运维与收尾） |
| [PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md) | 项目综述报告，供 AI/人工全局审查与提建议 |
| [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) | 网站优化修改日志（历史改动汇总） |
| [UI_VISUAL_SPEC_FOR_REUSE.md](./UI_VISUAL_SPEC_FOR_REUSE.md) | UI 视觉规范，可供其他项目复用 |
| [SUPABASE_RLS.sql](./SUPABASE_RLS.sql) | Supabase 行级安全策略 SQL |
| [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md) | Stripe 支付与预订流程配置（环境变量、Webhook、表结构） |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 部署指南（Vercel + 环境变量 + Supabase） |
| [API.md](./API.md) | API 接口说明（预订、支付、通知、同步） |
| [DEV_LOG_2026-02-12.md](./DEV_LOG_2026-02-12.md) | 开发日志 2026-02-12（Hero/登录/双导航等） |
| [DEV_LOG_2026-02-13.md](./DEV_LOG_2026-02-13.md) | 开发日志 2026-02-13（阶段二导航、视觉统一、文档整理） |

---

## 文档说明

- **MODIFICATION_PLAN.md**：完整修改方案（含 UI 视觉），按优先级排序。
- **PHASE2_NAV_AND_BUTTON_TASKS.md**：阶段二导航与按钮任务清单及完成记录。
- **NEXT_PHASE_TASKS.md**：下阶段待修改内容及 3 分支实施计划（feat/stripe-payment-and-booking-flow、feat/roles-and-route-guards、chore/next-phase-ops-and-polish）。
- **PROJECT_REVIEW_REPORT.md**：项目定位、技术栈、功能模块、审查要点。
- **CHANGELOG_IMPROVEMENTS.md**：按修改周期记录的优化内容，历史汇总。
- **UI_VISUAL_SPEC_FOR_REUSE.md**：颜色、字体、组件等设计规范，便于跨项目复用。
- **SUPABASE_RLS.sql**：RLS 策略覆盖 game_invitations、bookings、notifications、profiles、rinks、payments、rink_updates_log 等表。
- **DEV_LOG_*.md**：按日期记录的开发日志，便于追溯单次迭代内容。

---

*返回 [项目根目录](../)*
