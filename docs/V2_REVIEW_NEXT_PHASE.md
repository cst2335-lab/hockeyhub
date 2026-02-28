# V2 三方分析综合评审 — 下阶段实施任务

**来源**：V2 三方分析综合评审（2026-02）  
**用途**：Beta 上线前必须完成项与后续迭代  
**优先级**：P0 阻塞商业化，P1 高 ROI，P2 后续迭代  

---

## 一、P0（本周，阻塞商业化）

### 1. 预订冲突 — 数据库排他约束

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

### 2. Stripe Webhook 幂等

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

### 3. 生产环境调试路由保护

**现状**：`/check-database`、`/test-connection`、`/test-notifications` 在 middleware 中被排除，生产环境仍可访问。

**实施**：在 `middleware.ts` 顶部增加：

```ts
const DEBUG_ROUTES = ['/check-database', '/test-connection', '/test-notifications'];
// 若 NODE_ENV === 'production' 且 pathname 匹配，redirect 到 '/'
```

**验收**：生产环境下访问上述路径时 redirect 到首页。

---

### 4. RBAC 落地确认

**现状**：`profiles.role` 在 SUPABASE_RLS.sql 中为注释；manage-rink 依赖 `rink_managers` 可工作，但与 RLS 设计不一致。

**实施**：

1. 确认 `profiles.role` 是否已执行：`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'player';`
2. 确认 middleware 或 layout 对越权路由的实际拦截行为
3. 统一 RLS 与代码逻辑

---

## 二、P1（下周，高 ROI）

### 5. React Query + HydrationBoundary（V2 特有问题）

**现状**：`/rinks`、`/games` 为 `'use client'` + `useQuery`，无服务端预取与注水，SEO 数据与首屏可能不一致。

**实施**：公开列表页使用服务端 `prefetchQuery` + `HydrationBoundary` + `dehydrate` 包裹，客户端复用预取数据。

**验收**：首屏 HTML 已含数据，无二次请求闪烁，SEO 与首屏一致。

---

### 6. 图片三层策略

| 层级   | 方案                         | 成本   |
|--------|------------------------------|--------|
| 兜底层 | 统一默认占位图（SVG）        | 极低   |
| 自动层 | 导入时匹配图片源 + confidence 阈值 | 已有 findBestMatch 可扩展 |
| 人工层 | Admin 一键替换 + `image_verified=true` | 低     |

**验收**：冰场卡片 0 破图，Top 20 冰场达到 `image_verified=true`（可使用 [SQL_TOP20_IMAGE_VERIFIED.sql](./SQL_TOP20_IMAGE_VERIFIED.sql) 批量标记后人工复核）。

---

### 7. Cron 接口安全三件套

- `Authorization: Bearer ${CRON_SECRET}` 验证
- diff 更新（不全量覆盖）
- 失败日志 + 可定位错误
- 生产环境禁用「测试模式绕过」

---

### 8. 数据可信度标签

- `rinks` 表增加 `data_source`（official/imported/community）、`last_synced_at`
- 冰场卡片展示徽章
- 详情页增加「纠错入口」

---

### 9. 预订规则 UI 化

- 取消弹窗显示「将退款金额」
- 确认邮件重复一遍退款规则

---

## 三、P2（后续迭代）

- **XSS 防护**：Server Actions 中强制 sanitize（`lib/utils/sanitize.ts` 已预留，需全面执行）
- **zh/hi 语言**：不完整语言包会造成混合语言体验，建议仅保留 en/fr
- **SEO JSON-LD**：`/rinks/[id]` 注入 LocalBusiness，`/games/[id]` 注入 SportsEvent（WebSite/Organization 已实现）
- **Zod 校验服务端兜底**：非法负载（负数金额、非法时间）返回 i18n 错误码

---

## 四、V2 评分（修复后预期）

| 维度       | 当前 | 修复 P0 后 | 修复 P1 后 |
|------------|------|------------|------------|
| 支付安全   | 6/10 | 9/10       | 9/10       |
| 权限安全   | 6.5/10 | 8.5/10   | 9/10       |
| 预订可靠性 | 5/10 | 9.5/10     | 9.5/10     |
| 数据可信度 | 6/10 | 6/10       | 8.5/10     |
| UI/UX 完整度 | 9/10 | 9/10     | 9/10       |
| SEO 就绪度 | 9/10 | 9/10       | 9.5/10     |

---

## 五、一句话总结

> V2 已具备生产系统骨架，前端体验全面领先 V1，但「三把锁」（DB 约束锁定库存、Webhook 幂等锁定资金、Middleware 锁定调试路由）尚未全部扣紧。这三件事完成后，V2 可直接进入 Beta 上线状态。
