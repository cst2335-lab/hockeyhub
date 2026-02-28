# GoGoHockey 任务与阶段规划

基于 [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md)、[PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md)、[CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) 整理。

**下阶段优先**：V2 三方分析综合评审结论，见 [V2_REVIEW_NEXT_PHASE.md](./V2_REVIEW_NEXT_PHASE.md)。
**状态更新（2026-02-28）**：V2 P0 / P1 已完成，当前聚焦 P2 收尾。

---

## 一、任务总览

| 状态 | 数量 | 说明 |
|------|------|------|
| **已完成** | §二 | 测试、文档、PWA、i18n、监控、UI 视觉、无障碍、表单与错误、导航优化、P0–P2 增强 |
| **进行中** | §三 | 无（当前无进行中任务） |
| **下阶段** | §四 | V2 评审 P2（XSS、语言包精简、SEO JSON-LD、Zod 兜底） |

---

## 二、已完成任务

### 2.1 chore/next-phase-ops-and-polish 已完成项

| 任务 | 说明 |
|------|------|
| §一 2 测试 | `npm run test` 已通过（Vitest，14 个用例） |
| §二 6 文档 | [DEPLOYMENT.md](./DEPLOYMENT.md)、[API.md](./API.md) 已建；docs/README 已更新索引 |
| §二 7 PWA | `public/sw.js` 对 `/login`、`/register`、`/dashboard`、`/bookings`、`/manage-rink`、`/notifications` 不再使用缓存 |
| §二 8 i18n | Manage Rink 页文案全部迁入 messages（en/fr）；manageRink、nav 命名空间 |
| §二 5 监控 | 集成 `@sentry/nextjs`；设置 `NEXT_PUBLIC_SENTRY_DSN` 后启用上报 |
| §三 9 UI 视觉 | globals.css 增加 `.link-light`、`.link-dark`、`.input-focus`；`:focus-visible`、`::selection` 使用 #64BEF0 |
| §三 10 无障碍 | `:focus-visible` 明显焦点环，可交互元素键盘聚焦可见 |
| §三 11 表单与错误 | common、book 增加 i18n key；预订页错误提示全部使用 i18n |
| **导航优化（2026-02）** | 移除 Post Game 按钮；全站白天/黑夜视觉模式（next-themes）；Navbar 双主题适配；移除 Hero 底部波浪形白色过渡 |
| **Figma 方案落地（2026-02）** | Hero 主标题「Making Hockey Accessible for Everyone」；首页「Everything You Need」四卡（Find a Team、Register for a League、Get Equipment、Improve Your Skills）；主导航增加 About、Community；Footer 五栏（Clubs & Leagues、Coaches & Parents、Sports、Company、Resources）；About 占位页；公网 Navbar 移动端第二行导航；Contact 页 i18n + 主题 token |
| **i18n 与主题收尾（2026-02）** | Privacy、Terms、Profile、My Games、Bookings 详情、Clubs new、Games 新建/编辑 等页 i18n + 主题 token；Manage Rink、Games 列表/详情/新建/编辑、Notifications、Bookings [id]、book/[rinkId]、error.tsx 等 gray/white 替换为主题 token；Profile 编辑 / Games 新建 Cancel 使用 actions.cancel；games 命名空间（gameTitle、gameStatus、saveChanges、saving、status*Label、contactSharedHint）；myGames（editSubtitle、backToMyGames、noPermission） |
| **全站主题统一（2026-02）** | Navbar、Dashboard 顶栏、hero-section、notification-bell、theme-toggle、LocaleSwitcher、error-boundary、game-card、AuthActions、RatingStars 等组件 gray/slate → theme tokens；旧路由 (dashboard)/(auth)/register 及 clubs、games/[id]、profile 等页统一为主题 token；globals.css 中 .glass-dark、.skeleton、.divider、.link-light、.scrollbar-thin 使用主题变量 |
| **导航与 Dashboard 优化（2026-02）** | Dashboard 主导航：Play（Ice Rinks、Find Game）、Community（Clubs）；用户头像下拉：Profile、Dashboard、Sign Out；移除 Profile/My Games/My Bookings 独立导航；合并 My Games、My Bookings、Season Statistics 入 Dashboard 页面；/my-games、/bookings 重定向到 /dashboard；主页 Hero 移除居中用户头像/名称；导航栏增加搜索框；Dashboard 使用 Disclosure 汉堡菜单（lg 以下折叠）；globals.css 增加 .scrollbar-hide；UserAvatar 增加 onDark 变体；Stripe 支付成功跳转 /dashboard?session_id=...；Dashboard 页处理 session_id 并显示支付成功 toast 后清除 URL；bookings 列表页移除 session_id 逻辑；预订详情「返回」改为「Back to Dashboard」并链到 /dashboard；legacy app/(dashboard) 导航移除 My Games/My Bookings，编辑/预订/订场页返回与跳转统一为 /dashboard |
| **P0 增强（feat/p0-enhancements-2026-02-15）** | 预订取消政策：lib/booking/policies.ts（24h 全额、12–24h 50%、&lt;12h 不退）；取消 API 接入 getRefundAmountCents；i18n 更新 cancelConfirm。Stripe Webhook：app/api/webhooks/stripe/route.ts，签名校验，checkout.session.completed 更新 booking 为 confirmed 并写入 stripe_payment_intent_id，payment_intent.payment_failed 记录。RBAC：SUPABASE_RLS.sql 增加「Rink managers can update own rinks」策略。移动端底部导航：components/layout/bottom-nav.tsx（Play、Community、Dashboard、Profile），Dashboard 布局接入并 main 增加 pb-14 |
| **P1 骨架屏与错误边界（2026-02）** | 骨架屏：components/ui/skeleton.tsx 增加 GameCardSkeleton、RinkCardSkeleton；Skeleton 基础组件使用 bg-muted。Games 页加载态改为页面骨架 + 6 张 GameCardSkeleton；Rinks 页加载态改为页面骨架 + 6 张 RinkCardSkeleton。错误边界：app/[locale]/error.tsx 使用 common.error、errorPageDesc、tryAgain、backToHome（i18n）；app/[locale]/(dashboard)/error.tsx 新建，Dashboard 内错误展示「Back to Dashboard」+ Try again；common 增加 errorPageDesc、backToHome、backToDashboard（en/fr） |
| **P2 SEO、推荐与性能（2026-02）** | SEO：games/[id]/layout.tsx 中 generateMetadata 拉取比赛并设置 title/description/openGraph；app/sitemap.ts 异步 sitemap，拉取 game_invitations 生成 /[locale]/games/[id] 条目；app/[locale]/layout.tsx 增加 JSON-LD（WebSite + Organization，含 SearchAction）。推荐：lib/matching/score.ts 实现 scoreGameMatch、sortGamesByMatch（age_group、skill_level、location）；Games 页增加「recommended」排序，有用户偏好时按匹配度排序。预订提醒：Dashboard 页 upcomingReminder（24h 内首笔 confirmed 预订）展示横幅 +「View booking」链接。性能：components/ui/logo.tsx 使用 next/image 替代 img；首页 HeroSection、GameCard 使用 next/dynamic 代码分割（ssr: true） |
| **V2 P1 ROI 收口（2026-02-28）** | 已完成 HydrationBoundary、图片三层策略、Cron 安全、数据可信度标签、预订规则 UI 化；Top 20 `image_verified=true` 已批量落地（`npm run db:mark-top20-images -- --apply`），脚本支持 `image_url` 为空时回退按名称前 20 标记 |

### 2.2 阶段二（feat/nav-dashboard-and-cta）已完成

- 公网 Navbar 增加 Dashboard、通知仅铃铛；Hero 按登录态切换 CTA
- 登录后跳转 Dashboard；Footer 已登录显示 Dashboard
- clubs/new、bookings 按钮链与 locale 修复
- Dashboard 顶栏与主页视觉统一（Logo、深色栏、底部渐变条）
- RLS 补充：payments、rink_updates_log

详见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)。

---

## 三、进行中任务

当前无进行中任务。

---

## 四、下阶段任务

> **完整任务与实施说明**（含 SQL、验收标准、评分预期）：[V2_REVIEW_NEXT_PHASE.md](./V2_REVIEW_NEXT_PHASE.md)。本节仅列摘要，避免重复。

| 优先级 | 任务摘要 |
|--------|----------|
| **已完成** | P0（预订冲突 DB 约束、Webhook 幂等、调试路由保护、RBAC 确认） |
| **已完成** | P1（HydrationBoundary、图片三层策略、Cron 安全、数据可信度、预订规则 UI 化） |
| **P2** | XSS、语言包精简、SEO JSON-LD、Zod 兜底 |
| **其他** | E2E、PWA、i18n 收尾（按需） |

**实施顺序**：已完成 P0 → P1；下一阶段 P2 → 其他。

---

## 五、分支与实施计划

| 分支名 | 包含任务 | 说明 |
|--------|----------|------|
| **`feat/v2-p0-safety`** | DB 约束、Webhook 幂等、调试路由保护、RBAC 确认 | V2 评审 P0（已完成） |
| **`feat/v2-p1-roi`** | HydrationBoundary、图片策略、Cron 安全、数据可信度 | V2 评审 P1（已完成） |
| **`chore/next-phase-ops-and-polish`** | 测试、监控、文档、PWA、i18n、UI/无障碍、导航/主题 | 已完成 |

### 创建分支示例

```bash
git checkout main
git pull origin main
git checkout -b feat/v2-p0-safety
```

---

*本文档随项目进展更新。*
