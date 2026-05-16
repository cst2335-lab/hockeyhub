# 任务与阶段规划

**更新**：2026-05-16

基于 [ARCHITECTURE.md](./ARCHITECTURE.md)、[CHANGELOG.md](./CHANGELOG.md) 整理。

**任务状态唯一权威**：**§三**（进行中）、**§四**（下阶段）；**§二** 为历史完成记录。V2 评审原文（SQL、验收）见 [archive/V2_APPENDIX.md](./archive/V2_APPENDIX.md)。

**状态**：V2 **P0 / P1 / P2 已全部落地**（2026-04-06）。全库文档与代码结构已于 2026-05 对齐。

---

## 一、任务总览

| 状态 | 位置 | 说明 |
|------|------|------|
| 已完成 | §二 | 测试、文档、PWA、i18n、V2 P0–P2、导航/主题、Stripe、RLS… |
| 进行中 | §三 | 无阻塞项；可选 E2E、产品增强 |
| 下阶段 | §四 | 路线图驱动 |

---

## 二、已完成任务（摘要）

| 里程碑 | 要点 |
|--------|------|
| 基础体验 | Toast、locale 预订链接、冲突检测、i18n、PWA、Sentry |
| 导航 / 主题 | Dashboard 合并 my-games/bookings；next-themes；Figma 首页落地 |
| P0 商业化 | 取消政策、Stripe Webhook、RLS、底部导航 |
| P1 / P2 | 骨架屏、SEO、sitemap、JSON-LD、React Query 注水、XSS 清洗、服务端 Zod API |
| V2 安全 | DB 排他约束、Webhook 幂等、调试路由生产屏蔽、图片策略、Cron 鉴权 |
| 结构整理 | SQL → `scripts/sql/`；legacy 路由 → `next.config` 重定向；`app/(dev)/` 调试页 |

完整条目见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 三、进行中任务

当前 **无 V2 阻塞项**。可选：E2E、比赛匹配/推送、i18n 边角（见 [ROADMAP.md](./ROADMAP.md)）。

---

## 四、下阶段任务

| 优先级 | 内容 |
|--------|------|
| 已完成 | V2 P0–P2（安全、SEO、主路径服务端化） |
| 按需 | E2E、PWA 深化、产品路线图项 |

实施顺序：以 [ROADMAP.md](./ROADMAP.md) 与产品需求排期。

---

## 五、分支记录（历史）

| 分支 | 说明 |
|------|------|
| `feat/v2-p0-safety` | DB 约束、Webhook 幂等、调试路由、RBAC |
| `feat/v2-p1-roi` | HydrationBoundary、图片策略、Cron |
| `feat/v2-p2-*` | XSS、JSON-LD、metadata |
| `chore/next-phase-ops-and-polish` | 测试、监控、文档、PWA |
| `chore/project-structure-and-docs` | 文档/SQL/目录整理 |

---

*V2 附录详见 [archive/V2_APPENDIX.md](./archive/V2_APPENDIX.md)*
