# Scripts

| 路径 | 说明 |
|------|------|
| `sql/supabase-rls.sql` | Supabase RLS 策略（部署时在 SQL Editor 执行） |
| `sql/rinks-images.sql` | 冰场图片列与 Top 20 标记 |
| `sql/rinks-rows.sql` | 冰场批量 INSERT（备选，易报错） |
| `import-rinks-from-csv.mjs` | CSV 导入（推荐，`npm run db:import-rinks`） |
| `mark-top20-image-verified.mjs` | Top 20 `image_verified`（`npm run db:mark-top20-images`） |
| `fix-rinks-sql.mjs` | 修复 `rinks-rows.sql` 中 tsvector 转义 |
| `copy-pages.ps1` | 历史：从 legacy 路由复制 page 到 `[locale]`（已弃用） |

详见 [docs/RENEW_RINKS.md](../docs/RENEW_RINKS.md)。
