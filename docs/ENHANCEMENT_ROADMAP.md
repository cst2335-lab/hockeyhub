# GoGoHockey 功能增强与优化路线图

**来源**：审查反馈与产品规划整理  
**用途**：供开发排期、AI 协作及评审参考  
**更新**：2026-04-06

---

## 一、核心业务功能增强

### 1.1 比赛匹配与推荐

| 属性 | 内容 |
|------|------|
| **模块** | 比赛匹配与推荐 |
| **类型** | 功能增强 |
| **优先级** | 高 |

**现状问题**：当前仅有「感兴趣」按钮，缺乏智能匹配机制。

**建议方案**：
- **智能推荐**：基于用户年龄、技能水平、位置偏好自动推荐合适比赛
- **匹配算法**：当双方都表示感兴趣时，自动发送通知并建立联系
- **候补名单**：名额已满时允许用户加入候补队列
- **快速匹配**：「找队友」功能，球员可快速寻找同水平临时队友

**实现位置**：`app/[locale]/(dashboard)/games/` + 新建 `lib/matching/` 算法模块。

---

### 1.2 预订管理

| 属性 | 内容 |
|------|------|
| **模块** | 预订管理 |
| **类型** | 功能增强 + 用户体验 |
| **优先级** | 高 |

**可增强功能**：

1. **预订提醒**
   - **已有**：Dashboard 对 **24h 内** 下一笔 confirmed 冰场预订展示提醒横幅 + 链至预订详情（站内）
   - **仍待**：邮件/赛前 2h 推送、与周期性预订联动的到期提醒；实现可选 Supabase Edge Functions 或 cron

2. **取消政策与退款**（**已落地**：`lib/booking/policies.ts`；取消 API 与 UI 已接入，详见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)、[NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §二）
   - 已支持：分档退款（如 24h / 12h 规则）、预订取消流程
   - 仍可增强：天气等不可抗力特殊流程、与 Stripe 退款自动化深度打通

3. **周期性预订**
   - 每周固定时段重复预订
   - 批量管理

---

### 1.3 支付与财务

| 属性 | 内容 |
|------|------|
| **模块** | 支付与财务 |
| **类型** | 功能完善 |
| **优先级** | 高 |

**当前状态（2026-04）**：Stripe 已接入冰场预订 **Checkout** 与 **Webhook**（`app/api/webhooks/stripe/route.ts`：签名校验、`checkout.session.completed` 更新预订、`payment_intent.payment_failed` 等；幂等与 DB 约束见 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §六 附录）。需配置 `STRIPE_*` 与 Webhook 密钥，见 `STRIPE_BOOKING_SETUP.md`。

**仍可增强（非 V2 P2 阻塞；与路线图排期）**：

1. **退款自动化**：与取消政策联动的 Stripe Refund API、人工兜底与管理视图  
2. **财务报表**：冰场收入、用户消费历史、税务相关记录  
3. **管理后台**（可选）：`app/[locale]/(dashboard)/admin/revenue/` 等

**已有实现位置**：
- `app/api/webhooks/stripe/route.ts`
- `lib/booking/policies.ts`（取消与退款金额计算）

---

## 二、用户体验优化

### 2.1 全局加载与错误处理

| 属性 | 内容 |
|------|------|
| **模块** | 全局加载与错误处理 |
| **类型** | 用户体验 |
| **优先级** | 中 |

- **统一骨架屏**：可复用 Skeleton（如 `GameCardSkeleton`、`RinkCardSkeleton`）— **已用于 Games/Rinks 列表加载态**（见 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §二）
- **错误边界**：页面级 `error.tsx` 等 — **已落地**；组件级 `<ErrorBoundary>` 仍可按需扩展
- **乐观更新**：React Query 乐观更新，「点赞」「感兴趣」即时反馈（按需迭代）

---

### 2.2 表单验证体验

| 属性 | 内容 |
|------|------|
| **模块** | 表单验证体验 |
| **类型** | 用户体验 |
| **优先级** | 中 |

- **实时验证**：输入时即时显示错误
- **字段级错误**：精确定位到字段
- **可访问性**：`aria-invalid`、`aria-describedby`、`role="alert"`

**位置**：Games、Bookings、Profile 等所有表单。

---

### 2.3 移动端优化

| 属性 | 内容 |
|------|------|
| **模块** | 移动端优化 |
| **类型** | 用户体验 + PWA |
| **优先级** | 高 |

- **底部导航**：**已实现**（`components/layout/bottom-nav.tsx`：Play、Community、Dashboard、Profile；与 §七 已完成的「移动端底部导航」一致）；后续可微调图标或增加入口
- **手势**：左右滑动切换 Dashboard 标签，下拉刷新
- **离线**：缓存已查看比赛/冰场，离线可浏览并标注「可能过时」
- **推送**：请求通知权限，比赛邀请、预订确认等实时推送

---

## 三、技术架构改进

### 3.1 数据请求层

| 属性 | 内容 |
|------|------|
| **模块** | 数据请求层 |
| **类型** | 技术架构 |
| **优先级** | 中 |

- **React Query**：已在 Games、Rinks、Dashboard、Clubs、Bookings、Notifications 等页使用；继续将剩余 `useEffect` 拉数迁移为 `useQuery`（缓存、去重、统一错误态）

```ts
// lib/queries/games.ts 示例
export const useGames = (filters) => {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => fetchGames(filters),
    staleTime: 5 * 60 * 1000,
  });
};
```

---

### 3.2 性能优化

| 属性 | 内容 |
|------|------|
| **模块** | 性能优化 |
| **类型** | 性能 |
| **优先级** | 中 |

- **图片**：Next.js `<Image>`、WebP、懒加载非首屏
- **代码分割**：动态导入重型组件（如图表），`dynamic(..., { loading: ChartSkeleton })`
- **虚拟列表**：列表 >50 项时考虑 react-window
- **预加载**：`<Link prefetch={true}>` 关键路由

---

### 3.3 SEO 增强

| 属性 | 内容 |
|------|------|
| **模块** | SEO 增强 |
| **类型** | SEO + 增长 |
| **优先级** | 低–中 |

- **现状**：`generateMetadata`（如 games 详情）、`sitemap.ts`、`robots.ts`、站点级 JSON-LD（WebSite + Organization）已落地（见 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §二）
- **已完成（V2 P2 · 2026-04）**：详情页与列表 JSON-LD/metadata 已补强（预订 `Reservation` + `noindex`、俱乐部列表等）；`serializeJsonLd` 递归清洗字符串
- **仍可增强**：更多 Schema.org 类型（SportsEvent 等）、冰场详情页 metadata 深化

---

## 四、安全与数据完整性

### 4.1 权限与角色管理（RBAC）

| 属性 | 内容 |
|------|------|
| **模块** | 权限与角色管理 |
| **类型** | 安全 + 功能增强 |
| **优先级** | 高 |

- **角色**：`player` | `parent` | `club_admin` | `rink_manager` | `super_admin`
- **profiles** 增加 `role`，RLS 按角色限制更新/查看
- **权限矩阵**（摘要）：

| 角色        | 发布比赛 | 管理俱乐部 | 管理冰场 | 查看所有预订 |
|-------------|----------|------------|----------|--------------|
| Player      | ✅       | ❌         | ❌       | 仅自己       |
| Club Admin  | ✅       | ✅         | ❌       | 俱乐部成员   |
| Rink Manager| ❌       | ❌         | ✅       | 所管理冰场   |
| Super Admin | ✅       | ✅         | ✅       | ✅           |

> **说明（2026-04）**：冰场管理权限与 `rink_managers`、RLS 已落地；上表为产品化目标矩阵。实施细节以 [ROLES_AND_ROUTE_GUARDS.md](./ROLES_AND_ROUTE_GUARDS.md)、[NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §六 附录（RBAC）为准。

---

### 4.2 输入安全

| 属性 | 内容 |
|------|------|
| **模块** | 输入安全 |
| **类型** | 安全 |
| **优先级** | 高 |

- **服务端验证**：API 层使用 Zod 等校验，不依赖仅客户端验证
- **SQL 注入**：自定义 SQL 使用参数化
- **XSS**：用户输入经 sanitize；`dangerouslySetInnerHTML` 前必须 sanitize
- **CSRF / Webhook**：Stripe webhook 验证签名

---

## 五、运营与增长功能

### 5.1 数据分析与洞察

| 属性 | 内容 |
|------|------|
| **模块** | 数据分析与洞察 |
| **类型** | 功能增强 |
| **优先级** | 低–中 |

- **管理员仪表板**：DAU/MAU、比赛发布与匹配率、冰场预订率、留存
- **行为分析**：热门冰场/时段、活跃时间、流失特征
- **实现**：可复用现有 Recharts / Tremor

---

### 5.2 社区功能

| 属性 | 内容 |
|------|------|
| **模块** | 社区功能 |
| **类型** | 功能增强 |
| **优先级** | 低 |

- **评论与评分**：赛后队友评价、冰场设施评分、信誉体系
- **论坛/讨论区**：技术交流、装备、赛事组织
- **成就系统**：如「参加 10 场比赛」「预订 5 个不同冰场」

---

### 5.3 国际化完善

| 属性 | 内容 |
|------|------|
| **模块** | 国际化完善 |
| **类型** | 国际化 |
| **优先级** | 中 |

- **语言**：产品仅 **en、fr**（渥太华双语）；zh、hi 已移除
- **日期**：date-fns + `enCA` / `frCA` 等 locale
- **货币**：CAD 符号与地区习惯

---

## 六、文档与测试、监控

### 6.1 文档与测试

| 属性 | 内容 |
|------|------|
| **模块** | 文档与测试 |
| **类型** | 可维护性 |
| **优先级** | 中 |

- **API 文档**：Swagger/OpenAPI
- **组件文档**：Storybook
- **测试**：单元（关键逻辑）、集成（预订/支付）、E2E（Playwright）

---

### 6.2 监控与运维

| 属性 | 内容 |
|------|------|
| **模块** | 监控与运维 |
| **类型** | 运维 |
| **优先级** | 中 |

- **错误追踪**：Sentry（已集成，需配置 DSN）
- **性能**：Vercel Analytics 或 Google Analytics
- **日志**：结构化日志便于排查

---

## 七、实施优先级建议

> **当前「未完成」以 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) §三、§四 为准**（V2 P0–P2 已闭环）。下表为**长期路线图**；细节与验收见 [§六 附录](./NEXT_PHASE_TASKS.md#v2-review-appendix)。

| 状态 | 优先级 | 项 | 说明 |
|------|--------|----|------|
| ✅ 已完成 | V2 P0 | Stripe Webhook（含幂等）、DB 预订约束、调试路由保护、RBAC/RLS 对齐 | 见 NEXT_PHASE §二、§六 |
| ✅ 已完成 | V2 P1 | HydrationBoundary、图片策略、Cron 安全、数据可信度、预订规则 UI | 同上 |
| ✅ 已完成 | V2 P2 | XSS 与 JSON-LD/SEO 收口 | 见 NEXT_PHASE §二、CHANGELOG §二十二 |
| ✅ 已完成 | — | 预订取消政策、移动端底部导航 | 见 CHANGELOG、NEXT_PHASE §二 |
| 📋 长期 | **P1** | 比赛智能匹配增强、预订提醒（邮件/推送）深化 | 与 V2 P2 无冲突，按需排期 |
| 📋 长期 | **P2** | PWA 推送、数据分析、性能 | 增长与性能 |
| 📋 长期 | **P3** | 社区论坛、成就、高级匹配 | 长期社区建设 |

---

## 八、相关文档

- [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md)：**任务与阶段规划**；V2 评审完整内容见 [§六 附录](./NEXT_PHASE_TASKS.md#v2-review-appendix)（P0/P1/P2，含 SQL、验收标准）
- [PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md)：项目综述与审查方向（§6.0 与 NEXT_PHASE 对齐）
- [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)：修改记录；**§二十一** 任务状态对齐、**§二十二** V2 P2 收口
