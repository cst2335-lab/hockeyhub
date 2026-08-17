# GoGoHockey 架构说明

**版本**：2.0.0 · **更新**：2026-05-16

面向开发者与 AI 审查的项目现状说明。任务排期见 [TASKS.md](./TASKS.md)，功能规划见 [ROADMAP.md](./ROADMAP.md)。

---

## 项目定位

渥太华青少年冰球社区平台：发布/查找比赛、冰场浏览与预订、俱乐部管理、用户资料与通知。

**语言**：仅 `en`、`fr`（`messages/en.json`、`messages/fr.json`）。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15（App Router） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS、`next-themes` |
| 数据 / 认证 | Supabase（Auth + PostgreSQL + RLS） |
| 国际化 | next-intl |
| 表单 | react-hook-form + Zod |
| 数据请求 | TanStack React Query（主列表页） |
| 支付 | Stripe Checkout + Webhook |
| 邮件 | Resend（可选） |
| 监控 | Sentry（可选） |
| 测试 | Vitest（`npm run test`） |

---

## 目录结构

```
app/
├── [locale]/              # 主应用（en / fr）
│   ├── (auth)/            # 登录、注册
│   ├── (dashboard)/       # 业务：dashboard、games、rinks、book、bookings、clubs、profile…
│   ├── about|contact|privacy|terms/
│   └── layout.tsx
├── api/                   # Route Handlers（games、bookings、webhooks/stripe…）
└── (dev)/                 # 仅开发：check-database、test-connection、test-notifications
                           # 生产环境由 middleware 重定向到首页

components/
├── layout/                # Navbar、Footer、bottom-nav
├── features/              # Hero、GameCard 等业务组件
├── ui/                    # shadcn 风格基础组件
├── auth/ | notifications/ | rinks/ | rating/

lib/
├── supabase/              # client、server、service
├── queries/               # 服务端数据查询
├── hooks/                 # useAuth、useBookings…
├── validations/           # Zod schemas
├── booking/ | stripe/ | security/ | matching/ | rinks/
└── utils/                 # format、sanitize、json-ld

scripts/
├── sql/                   # supabase-rls.sql、rinks-images.sql、rinks-rows.sql
├── import-rinks-from-csv.mjs
├── mark-top20-image-verified.mjs
└── fix-rinks-sql.mjs

docs/                      # 项目文档（本目录）
messages/                  # i18n 文案
public/                    # 静态资源（img/ 见 public/img/SPEC.md）
```

### 路由约定

- **canonical 路径**：`/{locale}/...`（如 `/en/games`）。
- **无 locale 的旧路径**（`/games`、`/login` 等）：`next.config.mjs` 重定向到 `/en/...`。
- **`/my-games`、`/{locale}/bookings`（列表）**：重定向到 dashboard。
- **调试页**：`/check-database` 等位于 `app/(dev)/`，生产环境不可访问。

---

## 核心功能模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 首页 | `/{locale}` | Hero、CTA |
| 认证 | `/{locale}/login`、`register` | Supabase Auth |
| Dashboard | `/{locale}/dashboard` | 统计、我的比赛/预订、支付成功 toast |
| 比赛 | `/{locale}/games` | 列表、发布、详情、感兴趣、推荐排序 |
| 冰场 | `/{locale}/rinks` | 列表、搜索、预订入口 |
| 预订 | `/{locale}/book/[rinkId]` | 时段、冲突校验、Stripe Checkout |
| 预订详情 | `/{locale}/bookings/[id]` | 取消、退款规则 |
| 俱乐部 | `/{locale}/clubs` | 列表、新建 |
| 通知 | `/{locale}/notifications` | 列表、已读 |
| 资料 | `/{locale}/profile` | 查看、编辑（API + Zod） |
| 冰场管理 | `/{locale}/manage-rink` | 需 `rink_managers` 权限 |

---

## 安全与数据（已落地）

- **RLS**：见 `scripts/sql/supabase-rls.sql`（含 bookings、payments、rinks 等）。
- **预订排他**：DB `EXCLUDE` 约束 + 应用层冲突检测。
- **Stripe Webhook**：签名校验 + `stripe_webhook_events` 幂等。
- **写操作**：主路径经 `app/api/*` + `requireAuth` + Zod + `sanitizePlainText`。
- **XSS / SEO**：`serializeJsonLd`、关键 UI 字段清洗；sitemap、页面 metadata。

---

## 审查与反馈

1. **待办**：以 [TASKS.md](./TASKS.md) §三、§四 为准，勿将 CHANGELOG 中历史「未完成」当作现状。
2. **增强方向**：比赛匹配、E2E、i18n 边角 → [ROADMAP.md](./ROADMAP.md)。
3. **反馈格式**：模块 + 类型（Bug/增强/安全）+ 文件路径 + 优先级。

---

## 相关文档

- [docs/README.md](./README.md) — 文档索引
- [DEPLOYMENT.md](./DEPLOYMENT.md) — 环境变量与部署
- [API.md](./API.md)
