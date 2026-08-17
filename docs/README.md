# GoGoHockey 文档索引

**更新**：2026-08-08 · 版本 2.0.0

---

## Assignment 4（最终提交）

| 文档 | 说明 |
|------|------|
| [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) | 最终功能状态、限制与后续增强 |
| [ASSIGNMENT_4_FEATURE_TRACEABILITY.md](./ASSIGNMENT_4_FEATURE_TRACEABILITY.md) | A1/A2 需求与设计 → 代码 → 最终状态对照表 |
| [ASSIGNMENT_4_TESTING_EVIDENCE.md](./ASSIGNMENT_4_TESTING_EVIDENCE.md) | 本地运行、测试与演示证据模板 |
| [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md) | Stripe Webhook 边界与技术债 |
| [ASSIGNMENT_4_CODE_PACKAGE_NOTES.md](./ASSIGNMENT_4_CODE_PACKAGE_NOTES.md) | 最终代码包说明 |

---

## 当前状态

| 项 | 说明 |
|----|------|
| **待办权威** | [TASKS.md](./TASKS.md) §三、§四（V2 P0–P2 已完成） |
| **架构与目录** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **框架** | Next.js 15、TypeScript、Tailwind、Supabase、next-intl（en/fr） |
| **主题** | `next-themes` + `app/globals.css` → [THEMING.md](./THEMING.md) |
| **冰场数据** | `npm run db:import-rinks` → [RENEW_RINKS.md](./RENEW_RINKS.md) |
| **SQL 脚本** | `scripts/sql/`（RLS、冰场图片、批量导入） |
| **环境变量示例** | 根目录 [.env.example](../.env.example) |
| **Live Application** | https://gogohockey-henna.vercel.app/en (Vercel + Supabase) |

---

## 指南

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 技术栈、目录结构、功能模块、审查要点 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel 部署与环境变量 |
| [THEMING.md](./THEMING.md) | 暗色模式、CSS 变量、品牌色板 |
| [RENEW_RINKS.md](./RENEW_RINKS.md) | 刷新 `rinks` 表（CSV 优先） |
| [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md) | Stripe 支付与 Webhook |
| [ROLES_AND_ROUTE_GUARDS.md](./ROLES_AND_ROUTE_GUARDS.md) | 权限与路由保护 |

## API

| 文档 | 说明 |
|------|------|
| [API.md](./API.md) | REST 路由说明 |
| [API_ERROR_CODES.md](./API_ERROR_CODES.md) | `errorCode` 对照表 |

## 规划与历史

| 文档 | 说明 |
|------|------|
| [TASKS.md](./TASKS.md) | 任务与阶段（当前未完成以 §三、§四 为准） |
| [ROADMAP.md](./ROADMAP.md) | 功能增强路线图 |
| [CHANGELOG.md](./CHANGELOG.md) | 历史修改日志 |
| [archive/V2_APPENDIX.md](./archive/V2_APPENDIX.md) | V2 评审原文（SQL、验收标准，已归档） |

---

*返回 [项目根目录](../)*
