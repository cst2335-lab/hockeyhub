# 权限与路由保护

本分支实现基于角色的访问控制（RBAC）与路由保护。

---

## 1. 角色定义

| 角色 | 说明 | 来源 |
|------|------|------|
| `player` | 普通球员/用户 | 默认，注册时或 profiles.role 默认值 |
| `parent` | 家长 | profiles.role |
| `club_admin` | 俱乐部管理员 | profiles.role |
| `rink_manager` | 冰场管理员 | profiles.role 或 rink_managers 表（verified=true） |
| `super_admin` | 超级管理员 | profiles.role |

当前实现：**Manage Rink** 仅对 `rink_manager` 开放，判定为 `profiles.role = 'rink_manager'` 或存在于 `rink_managers` 且 `verified = true`。

---

## 2. 数据库：profiles.role

在 Supabase SQL Editor 中执行：

```sql
-- 为 profiles 增加 role 列，默认 player
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'player';

-- 可选：为已有 rink_managers（verified）同步角色
-- UPDATE profiles p SET role = 'rink_manager'
-- FROM rink_managers r WHERE r.user_id = p.id AND r.verified = true;
```

合法取值：`player`、`parent`、`club_admin`、`rink_manager`、`super_admin`。应用层与 RLS 可据此扩展策略。

---

## 3. 受保护路由

| 路径 | 所需角色 | 未授权时重定向 |
|------|----------|----------------|
| `/[locale]/manage-rink` | rink_manager | `/[locale]/dashboard` |

保护位置：
- **Dashboard 布局**：若当前路径为 manage-rink 且用户不是 rink_manager，则重定向到 dashboard。
- **Manage Rink 页面**：若加载后用户无对应 verified rink，则重定向到 dashboard。

---

## 4. 与 rink_managers 的关系

- **rink_managers** 表仍为“谁可以管理哪家冰场”的数据源；**profiles.role** 为全局角色，便于后续扩展（如俱乐部、多角色）。
- 判定“是否为冰场管理员”时同时考虑：`profiles.role = 'rink_manager'` 或 `rink_managers` 中存在该 user 且 `verified = true`，满足其一即视为 rink_manager。

---

## 5. 相关文件

- `app/[locale]/(dashboard)/layout.tsx` — 解析 role / rink_managers，保护 manage-rink 路由
- `app/[locale]/(dashboard)/manage-rink/page.tsx` — 页面级重定向（无 rink 时）
- `docs/SUPABASE_RLS.sql` — 含 profiles.role 的迁移说明（可选）
