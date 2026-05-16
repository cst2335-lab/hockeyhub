# V2 三方分析综合评审（归档）

**来源**：V2 三方分析综合评审（2026-02）  
**状态**：P0 / P1 / P2 均已落地（2026-04-06）  
**当前待办**：见 [TASKS.md](../TASKS.md) §三、§四

---

## 状态摘要

- ✅ P0：预订 DB 约束、Webhook 幂等、调试路由保护、RBAC
- ✅ P1：HydrationBoundary、图片策略、Cron、数据可信度、预订规则 UI
- ✅ P2：服务端 Zod、XSS/JSON-LD、legacy 路由收敛（`next.config` 重定向）

---

## P0 实施细节（原文）

### 1. 预订冲突 — 数据库排他约束

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

### 2. Stripe Webhook 幂等

```sql
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  processed_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id
  ON stripe_webhook_events(stripe_event_id);
```

实现：`app/api/webhooks/stripe/route.ts` + `lib/stripe/webhook-idempotency.ts`。

### 3. 生产环境调试路由

`middleware.ts` + `lib/security/debug-routes.ts`；页面位于 `app/(dev)/`。

### 4. RBAC

见 `scripts/sql/supabase-rls.sql`、`docs/ROLES_AND_ROUTE_GUARDS.md`。

---

## P1 验收要点

- 列表页 HydrationBoundary + React Query 预取
- 冰场图片三层策略；Top 20：`scripts/sql/rinks-images.sql` + `npm run db:mark-top20-images`
- Cron：`lib/security/cron-auth.ts`
- `data_source` / `image_verified` 徽章

---

## P2 验收要点

- 仅 en/fr；主路径写操作走 `app/api/*`
- `serializeJsonLd`、`sanitizePlainText`
- 预订/俱乐部/比赛 metadata 与 JSON-LD

---

## 评分表（修复后）

| 维度 | P0 后 | P1 后 |
|------|-------|-------|
| 支付安全 | 9/10 | 9/10 |
| 权限安全 | 8.5/10 | 9/10 |
| 预订可靠性 | 9.5/10 | 9.5/10 |
| 数据可信度 | 6/10 | 8.5/10 |
| UI/UX | 9/10 | 9/10 |
| SEO | 9/10 | 9.5/10 |

---

*归档自原 `NEXT_PHASE_TASKS.md` §六；勿作为当前待办清单使用。*
