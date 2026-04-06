# GoGoHockey 任务与阶段规划

基于 [PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md)、[CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) 整理（早期独立修改方案文档已归档删除，历史见 CHANGELOG）。

**任务状态唯一权威**：**§三**（进行中）、**§四**（下阶段摘要）表示当前未完成与优先级；**§二** 为历史完成记录；**§六** 附录保留 V2 原始验收与 SQL，用于对照，**不等同**于「当前待办清单」（避免与 §三、§四 混淆）。

**下阶段优先**：V2 三方分析综合评审结论，摘要见 §四，**完整 SQL、验收标准与评分**见 [§六（附录）](#v2-review-appendix)。
**状态更新（2026-04-06）**：V2 **P0 / P1 / P2 已全部落地**（P2：`feat/v2-p2-xss-jsonld-sanitize`、`feat/v2-p2-seo-booking-clubs-metadata`）。全库说明类文档已对齐（见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) §二十一、§二十二）。

---

## 一、任务总览

| 状态 | 数量 | 说明 |
|------|------|------|
| **已完成** | §二 | 测试、文档、PWA、i18n、监控、UI 视觉、无障碍、表单与错误、导航优化、**V2 P0–P2** |
| **进行中** | §三 | 按需（E2E、产品增强等；无 V2 阻塞项） |
| **参考** | §四、[§六 附录](#v2-review-appendix) | 历史摘要与 V2 原文（SQL、验收） |

---

## 二、已完成任务

### 2.1 chore/next-phase-ops-and-polish 已完成项

| 任务 | 说明 |
|------|------|
| §一 2 测试 | `npm run test` 已通过（Vitest，**90** 个用例，含 `json-ld`、sanitize 等） |
| §二 6 文档 | [DEPLOYMENT.md](./DEPLOYMENT.md)、[API.md](./API.md) 已建；docs/★★★README 已更新索引 |
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
| **P2 主路径服务端兜底（2026-03）** | 已完成 `/[locale]` 主路径下 my-games/profile/clubs/register 写操作迁移至服务端 API（统一 `requireAuth` + Zod + sanitize），并新增 profile/club API 与错误码文档 |
| **V2 P2 XSS + SEO 收口（2026-04）** | **XSS**：`serializeJsonLd` 递归清洗字符串；比赛列表/详情、legacy `app/(dashboard)/games`、game-card 对用户可见字段 `sanitizePlainText`。**SEO/JSON-LD**：预订详情 `bookings/[id]/layout.tsx`（`generateMetadata` + `Reservation` JSON-LD，`noindex`）；`clubs/layout.tsx` 列表页 metadata；既有 `games/[id]`、`book/[rinkId]`、根 layout JSON-LD 经统一序列化 |

### 2.2 阶段二（feat/nav-dashboard-and-cta）已完成

- 公网 Navbar 增加 Dashboard、通知仅铃铛；Hero 按登录态切换 CTA
- 登录后跳转 Dashboard；Footer 已登录显示 Dashboard
- clubs/new、bookings 按钮链与 locale 修复
- Dashboard 顶栏与主页视觉统一（Logo、深色栏、底部渐变条）
- RLS 补充：payments、rink_updates_log

详见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)。

---

## 三、进行中任务

当前 **无 V2 评审阻塞项**。可选跟进：E2E、路线图中的比赛匹配/推送、i18n 边角（见 [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md)）。

---

## 四、下阶段任务

> **完整任务与实施说明**（含 SQL、验收标准、评分预期）：见 [§六 附录](#v2-review-appendix)。本节仅列摘要。

| 优先级 | 任务摘要 |
|--------|----------|
| **已完成** | P0（预订冲突 DB 约束、Webhook 幂等、调试路由保护、RBAC 确认） |
| **已完成** | P1（HydrationBoundary、图片三层策略、Cron 安全、数据可信度、预订规则 UI 化） |
| **已完成** | P2（XSS 防护与 JSON-LD/SEO 复核收口；语言与主路径 Zod 已完成） |
| **其他** | E2E、PWA、i18n 与产品增强（按需） |

**实施顺序**：V2 P0 → P1 → P2 **已闭环**；后续按产品与路线图排期「其他」项。

---

## 五、分支与实施计划

| 分支名 | 包含任务 | 说明 |
|--------|----------|------|
| **`feat/v2-p0-safety`** | DB 约束、Webhook 幂等、调试路由保护、RBAC 确认 | V2 评审 P0（已完成） |
| **`feat/v2-p1-roi`** | HydrationBoundary、图片策略、Cron 安全、数据可信度 | V2 评审 P1（已完成） |
| **`chore/next-phase-ops-and-polish`** | 测试、监控、文档、PWA、i18n、UI/无障碍、导航/主题 | 已完成 |
| **`feat/v2-p2-xss-jsonld-sanitize`** | JSON-LD 字符串递归清洗；比赛 UI `sanitizePlainText`；Vitest `json-ld` | V2 P2（已完成） |
| **`feat/v2-p2-seo-booking-clubs-metadata`** | `bookings/[id]`、`clubs` 布局级 metadata / JSON-LD | V2 P2（已完成） |

### 创建分支示例

```bash
git checkout main
git pull origin main
git checkout -b feat/v2-p0-safety
```

---

<a id="v2-review-appendix"></a>

## 六、附录：V2 三方分析综合评审（原文与实施细节）

**来源**：V2 三方分析综合评审（2026-02）  
**用途**：Beta 上线前必须完成项与后续迭代  
**优先级**：P0 阻塞商业化，P1 高 ROI，P2 后续迭代  

### 状态更新（2026-04-06）

- ✅ P0：已完成
- ✅ P1：已完成（包含 Top 20 `image_verified=true` 数据落地；`image_url` 为空时按名称前 20 回退标记）
- ✅ P2：已完成（主路径服务端化、legacy 收敛、**XSS/JSON-LD 收口** — 见 §二「V2 P2 XSS + SEO 收口」）

---

### 6.1 P0（本周，阻塞商业化）

#### 1. 预订冲突 — 数据库排他约束

**现状**：应用层 `hasSlotConflict` 在并发下必然失效，存在超卖风险。

**实施**：在 Supabase SQL Editor 中执行：

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING GIST (
  rink_id WITH =,
  tsrange(start_time, end_time, '[)') WITH &&
)
WHERE (status NOT IN ('cancelled'));
```

> 需确认 `bookings` 表使用 `timestamp` 或可转换为 `tsrange` 的列；若当前为 `time` 类型，需与 `booking_date` 组合构建 tsrange。

**验收**：两个并发请求抢同一时段，数据库拒绝其一，前端展示 "This slot is no longer available"。

---

#### 2. Stripe Webhook 幂等

**现状**：Webhook 已签名校验、后端计算金额，但无 `stripe_event_id` 去重，Stripe 重试可能重复更新 booking。

**实施**：

1. 新建表 `stripe_webhook_events`：
   ```sql
   CREATE TABLE IF NOT EXISTS stripe_webhook_events (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     stripe_event_id text UNIQUE NOT NULL,
     processed_at timestamptz DEFAULT now()
   );
   CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id
     ON stripe_webhook_events(stripe_event_id);
   ```

2. 在 `app/api/webhooks/stripe/route.ts` 中：处理前插入 `stripe_event_id`，若唯一冲突则直接返回 200（已处理）。

**验收**：同一 webhook 重复投递，仅第一次更新 booking，后续返回 200 无副作用。

---

#### 3. 生产环境调试路由保护

**现状**：`/check-database`、`/test-connection`、`/test-notifications` 在 middleware 中被排除，生产环境仍可访问。

**实施**：在 `middleware.ts` 顶部增加：

```ts
const DEBUG_ROUTES = ['/check-database', '/test-connection', '/test-notifications'];
// 若 NODE_ENV === 'production' 且 pathname 匹配，redirect 到 '/'
```

**验收**：生产环境下访问上述路径时 redirect 到首页。

---

#### 4. RBAC 落地确认

**现状**：`profiles.role` 在 SUPABASE_RLS.sql 中为注释；manage-rink 依赖 `rink_managers` 可工作，但与 RLS 设计不一致。

**实施**：

1. 确认 `profiles.role` 是否已执行：`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'player';`
2. 确认 middleware 或 layout 对越权路由的实际拦截行为
3. 统一 RLS 与代码逻辑

---

### 6.2 P1（已完成）

#### 5. React Query + HydrationBoundary（V2 特有问题）

**现状**：`/rinks`、`/games` 为 `'use client'` + `useQuery`，无服务端预取与注水，SEO 数据与首屏可能不一致。

**实施**：公开列表页使用服务端 `prefetchQuery` + `HydrationBoundary` + `dehydrate` 包裹，客户端复用预取数据。

**验收**：首屏 HTML 已含数据，无二次请求闪烁，SEO 与首屏一致。

---

#### 6. 图片三层策略

| 层级   | 方案                         | 成本   |
|--------|------------------------------|--------|
| 兜底层 | 统一默认占位图（SVG）        | 极低   |
| 自动层 | 导入时匹配图片源 + confidence 阈值 | 已有 findBestMatch 可扩展 |
| 人工层 | Admin 一键替换 + `image_verified=true` | 低     |

**验收**：冰场卡片 0 破图，Top 20 冰场达到 `image_verified=true`（可使用 [SQL_RINKS_IMAGES.sql](./SQL_RINKS_IMAGES.sql) **第二节**批量标记后人工复核）。

---

#### 7. Cron 接口安全三件套

- `Authorization: Bearer ${CRON_SECRET}` 验证
- diff 更新（不全量覆盖）
- 失败日志 + 可定位错误
- 生产环境禁用「测试模式绕过」

---

#### 8. 数据可信度标签

- `rinks` 表增加 `data_source`（official/imported/community）、`last_synced_at`
- 冰场卡片展示徽章
- 详情页增加「纠错入口」

---

#### 9. 预订规则 UI 化

- 取消弹窗显示「将退款金额」
- 确认邮件重复一遍退款规则

---

### 6.3 P2（已完成 · 2026-04-06）

- ✅ **zh/hi 语言精简**：当前仅保留 `en/fr`
- ✅ **Zod 服务端兜底（主路径）**：`/en|fr` 主路径下的核心写操作已迁移到服务端 API + 校验
- ✅ **XSS 防护复核**：`lib/utils/json-ld.ts` 递归清洗 JSON-LD 字符串；比赛相关页与 legacy `app/(dashboard)/games` 对用户可见字段 `sanitizePlainText`
- ✅ **SEO JSON-LD 全量复核**：站点/比赛/订场 JSON-LD 经 `serializeJsonLd`；新增预订详情 `Reservation` + `noindex`；俱乐部列表 `generateMetadata`
- ✅ **legacy 旧路由收敛（直写）**：`app/(dashboard)`、`app/(auth)` 历史页直写路径已迁移/下线到 `/{locale}` 主路径

---

### 6.4 V2 评分（修复后预期）

| 维度       | 当前 | 修复 P0 后 | 修复 P1 后 |
|------------|------|------------|------------|
| 支付安全   | 6/10 | 9/10       | 9/10       |
| 权限安全   | 6.5/10 | 8.5/10   | 9/10       |
| 预订可靠性 | 5/10 | 9.5/10     | 9.5/10     |
| 数据可信度 | 6/10 | 6/10       | 8.5/10     |
| UI/UX 完整度 | 9/10 | 9/10     | 9/10       |
| SEO 就绪度 | 9/10 | 9/10       | 9.5/10     |

---

### 6.5 一句话总结

> V2 已完成 P0、P1 与 P2 的核心闭环（含安全与 SEO 收口），已具备 Beta 上线骨架；后续以产品与路线图迭代为主。

---

*本文档随项目进展更新。*
