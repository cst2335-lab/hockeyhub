# Stripe 支付与预订流程配置

本分支实现冰场预订 → Stripe Checkout → 确认邮件 → 取消与退款闭环。

---

## 1. 环境变量

在 `.env.local` 中配置：

- `STRIPE_SECRET_KEY` — Stripe 密钥（测试用 `sk_test_...`）
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — 前端用（本流程由服务端创建 Session，可选）
- `STRIPE_WEBHOOK_SECRET` — Webhook 签名密钥（`whsec_...`）
- `RESEND_API_KEY`、`RESEND_FROM` — 确认邮件（Webhook 中发送）
- `NEXT_PUBLIC_APP_URL` 或 `VERCEL_URL` — Checkout 成功/取消回调 URL 的基础地址

---

## 2. Supabase 表结构

为支持退款，需在 `bookings` 表增加列（在 SQL Editor 中执行）：

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
```

---

## 3. Stripe Webhook

1. 在 Stripe Dashboard → Developers → Webhooks 添加端点。
2. URL：`https://你的域名/api/stripe/webhook`
3. 监听事件：`checkout.session.completed`
4. 将签名密钥填入 `STRIPE_WEBHOOK_SECRET`。

本地调试可用 Stripe CLI：`stripe listen --forward-to localhost:3000/api/stripe/webhook`，并将输出的 `whsec_...` 写入 `.env.local`。

---

## 4. 流程简述

- **预订**：用户填写日期/时段 → 调用 `POST /api/bookings/create-checkout` → 创建 `pending` 预订并返回 Stripe Checkout URL → 跳转支付。
- **支付成功**：Stripe 回调 `POST /api/stripe/webhook` → 将预订更新为 `confirmed`，写入 `stripe_payment_intent_id`，并发送确认邮件。
- **取消**：用户在我的预订详情页点击取消 → `POST /api/bookings/cancel` → 若已支付则按规则退款（距开始 ≥48 小时全额退，否则退 90%），预订状态改为 `cancelled`。

---

## 5. 相关文件

- `app/api/bookings/create-checkout/route.ts` — 创建预订与 Checkout Session
- `app/api/stripe/webhook/route.ts` — 处理支付成功、更新预订、发邮件
- `app/api/bookings/cancel/route.ts` — 取消预订与退款
- `app/[locale]/(dashboard)/book/[rinkId]/page.tsx` — 预订页（跳转 Checkout）
- `app/[locale]/(dashboard)/bookings/[id]/page.tsx` — 预订详情（取消按钮）

---

## 6. 可选：提前 24 小时提醒邮件

当前未实现。后续可通过 Vercel Cron 或外部定时任务，每日查询「次日」的 `confirmed` 预订，调用 Resend 发送提醒邮件。
