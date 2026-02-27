# API 接口说明

本文档列出 GoGoHockey 对外使用的 API 路由及用途，供前端与集成参考。认证方式：基于 Supabase Auth 的 session（Cookie）；需登录的接口在服务端通过 `requireAuth()` 校验。

---

## 预订与支付

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/bookings/create-checkout` | 创建待支付预订并返回 Stripe Checkout URL，前端重定向至该 URL | 需要 |
| POST | `/api/bookings/cancel` | 取消指定预订；若已支付则按规则退款（如 ≥48h 全额） | 需要 |
| POST | `/api/bookings/send-confirmation` | 手动重发预订确认邮件（可选） | 需要 |
| POST | `/api/webhooks/stripe` | Stripe Webhook（推荐）：处理支付事件并执行 `stripe_event_id` 幂等去重 | 使用 Stripe 签名验证 |
| POST | `/api/stripe/webhook` | Stripe Webhook（兼容旧路径）：处理支付事件并执行 `stripe_event_id` 幂等去重 | 使用 Stripe 签名验证 |

---

## 通知

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/notifications/test` | 测试发送通知（开发/调试用） | 需要 |

---

## 数据同步（内部/定时）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/sync-ottawa-rinks` | 同步 Ottawa 冰场数据；生产环境需 `Authorization: Bearer <CRON_SECRET>` 或测试模式 | CRON 密钥或测试 |

---

## 通用说明

- **需登录接口**：未认证时返回 `401`，body 为 `{ "error": "Unauthorized", "message": "Authentication required" }`。
- **Stripe Webhook**：必须在 Stripe Dashboard 配置端点 URL 与签名密钥，详见 [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md)。
- 其他写操作若新增，建议统一使用 `lib/api/auth.ts` 中的 `requireAuth()` 做认证。
