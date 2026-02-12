# GoGoHockey

渥太华青少年冰球社区平台 —— 发布比赛、预订冰场、管理俱乐部。

---

## 快速开始

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

访问 [http://localhost:3000](http://localhost:3000)。默认会重定向到 `/en`（英语）。

---

## 技术栈

- **框架**：Next.js 15（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **数据库/认证**：Supabase
- **国际化**：next-intl（en、fr）

---

## 项目文档

详细文档位于 `docs/` 目录：

| 文档 | 说明 |
|------|------|
| [docs/README.md](./docs/README.md) | 文档索引 |
| [docs/PROJECT_REVIEW_REPORT.md](./docs/PROJECT_REVIEW_REPORT.md) | 项目综述报告（供审查与建议） |
| [docs/CHANGELOG_IMPROVEMENTS.md](./docs/CHANGELOG_IMPROVEMENTS.md) | 优化修改日志 |
| [docs/UI_VISUAL_SPEC_FOR_REUSE.md](./docs/UI_VISUAL_SPEC_FOR_REUSE.md) | UI 视觉规范 |

---

## 部署

推荐使用 [Vercel](https://vercel.com) 部署。需配置环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`（服务端操作用）

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [next-intl](https://next-intl-docs.vercel.app/)
