# GoGoHockey

渥太华青少年冰球社区平台 —— 发布比赛、预订冰场、管理俱乐部。

---

## 快速开始

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)（默认重定向到 `/en`）。

环境变量与命令见 [AGENTS.md](./AGENTS.md)。

---

## 技术栈

- **框架**：Next.js 15（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS · `next-themes`
- **数据库 / 认证**：Supabase
- **国际化**：next-intl（en、fr）
- **支付**：Stripe（冰场预订）

---

## 项目结构

```
app/[locale]/     # 主应用（多语言）
app/api/          # API 路由
app/(dev)/        # 开发调试页（生产不可访问）
components/       # UI 与业务组件
lib/              # Supabase、校验、业务逻辑
scripts/sql/      # 数据库 SQL 脚本
docs/             # 文档索引 → docs/README.md
messages/         # i18n 文案
```

详见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/README.md](./docs/README.md) | 文档索引 |
| [AGENTS.md](./AGENTS.md) | 环境变量、命令、开发约定 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 架构与模块说明 |
| [docs/TASKS.md](./docs/TASKS.md) | 当前任务与阶段 |
| [docs/THEMING.md](./docs/THEMING.md) | 主题与品牌色 |
| [docs/RENEW_RINKS.md](./docs/RENEW_RINKS.md) | 冰场数据导入 |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | 部署指南 |

---

## 部署

推荐使用 [Vercel](https://vercel.com)。必填环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`（服务端）

完整清单见 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)。
