# 部署指南（Vercel + Supabase）

将 GoGoHockey 部署到 Vercel 并配置 Supabase 与环境变量。

## 1. 前置条件

- Node.js 18+
- Vercel 与 Supabase 账号
- 可选：Stripe、Resend（支付与邮件）

## 2. Supabase

- 创建项目，获取 Project URL 与 anon key。
- Authentication → URL Configuration：设置 Site URL 与 Redirect URLs（含生产域名与 localhost）。
- 在 SQL Editor 执行 `docs/SUPABASE_RLS.sql` 中的策略与迁移。
- 使用 Stripe 时参考 `STRIPE_BOOKING_SETUP.md` 配置表与 Webhook。

## 3. Vercel 环境变量

| 变量 | 说明 |
|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key |
| STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET | 支付流程 |
| RESEND_API_KEY / RESEND_FROM | 确认邮件 |
| NEXT_PUBLIC_APP_URL | 应用根 URL |
| CRON_SECRET | 定时任务鉴权（建议必填，生产环境接口会校验） |

## 4. 本地开发

复制 `.env.example` 为 `.env.local`，填入上述变量后运行 `npm run dev`。Stripe 本地调试见 `STRIPE_BOOKING_SETUP.md`。

## 5. Sentry（可选）

设置 `NEXT_PUBLIC_SENTRY_DSN` 后启用错误上报；不设则应用正常运行、不上报。上传 source map 需在 CI 中配置 `SENTRY_ORG`、`SENTRY_PROJECT`、`SENTRY_AUTH_TOKEN`。

## 6. 相关文档

SUPABASE_RLS.sql、STRIPE_BOOKING_SETUP.md、API.md、README.md
