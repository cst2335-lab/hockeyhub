# ★★★ 文档索引（GoGoHockey）

本目录存放项目相关 Markdown 及文档资料。**文件名以 `★★★` 开头的是优先阅读的核心文档**，便于在文件列表中快速定位。

---

## 当前状态（快照 · 2026-04）

| 项 | 说明 |
|----|------|
| 主分支 | `main`（与 `origin/main` 同步时请本地 `git pull`） |
| 框架 | Next.js 15（App Router）、TypeScript、Tailwind、Supabase、next-intl（en/fr） |
| 主题 | `next-themes` + `class="dark"`；暗色变量见 `app/globals.css`、`docs/★★★THEMING.md` |
| 数据脚本 | `npm run db:import-rinks` — 见 `docs/★★★RENEW_RINKS.md` |
| AI / 本地约定 | 根目录 `★★★AGENTS.md` |

---

## 核心文档（★★★）

| 文档 | 说明 |
|------|------|
| [★★★RENEW_RINKS.md](./★★★RENEW_RINKS.md) | 刷新 `rinks` 表（CSV 导入优先，或 SQL） |
| [★★★THEMING.md](./★★★THEMING.md) | CSS 变量、暗色模式与卡片/表单约定 |

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) | **任务与阶段规划**：已完成 / 进行中 / 下阶段任务一览 |
| [V2_REVIEW_NEXT_PHASE.md](./V2_REVIEW_NEXT_PHASE.md) | **V2 评审下阶段**：P0/P1 已完成，P2 进行中（主路径服务端兜底 + legacy 直写收敛已落地） |
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
- **V2_REVIEW_NEXT_PHASE.md**：V2 三方分析综合评审结论，P0/P1 已完成；P2 进行中（XSS、SEO 复核收尾）。
- **CHANGELOG_IMPROVEMENTS.md**：按修改周期记录的优化内容，历史汇总。
- **ENHANCEMENT_ROADMAP.md**：核心业务增强、体验优化、架构改进、实施优先级。
- **PROJECT_REVIEW_REPORT.md**：项目定位、技术栈、功能模块、审查要点。
- **UI_VISUAL_SPEC_FOR_REUSE.md**：颜色、字体、组件等设计规范，便于跨项目复用。
- **SUPABASE_RLS.sql**：RLS 策略覆盖 game_invitations、bookings、notifications、profiles、rinks、payments、rink_updates_log 等表。
- **★★★THEMING.md**：与 `next-themes` 配合的暗色 token；预订页等表单须避免浅色字叠在浅色底上。

---

## 仓库与 Cursor

- 根目录 **[★★★AGENTS.md](../★★★AGENTS.md)**：环境变量、常用命令、注意事项（含 CSV 导入与主题）。

---

*返回 [项目根目录](../)*
