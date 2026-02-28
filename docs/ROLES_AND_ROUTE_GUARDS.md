# 权限与路由保护

本分支实现基于角色的访问控制（RBAC）与路由保护。

---

## 1. 角色定义

| 角色 | 说明 | 来源 |
|------|------|------|
| `player` | 普通球员/用户 | 默认，注册时或 profiles.role 默认值 |
| `parent` | 家长 | profiles.role |
| `club_admin` | 俱乐部管理员 | profiles.role |
| `rink_manager` | 冰场管理员 | `rink_managers`（`verified=true`） |
| `super_admin` | 超级管理员 | profiles.role |

当前实现：**Manage Rink** 仅对 `rink_managers.verified = true` 用户开放，确保与 RLS 策略一致。

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

- **rink_managers** 表是“谁可以管理哪家冰场”的唯一授权来源（当前实现）。
- **profiles.role** 保留为全局角色扩展字段（俱乐部/后台等），但不单独授予 manage-rink 权限。

---

## 5. 相关文件

- `app/[locale]/(dashboard)/layout.tsx` — 解析 role / rink_managers，保护 manage-rink 路由
- `app/[locale]/(dashboard)/manage-rink/page.tsx` — 页面级重定向（无 rink 时）
- `docs/SUPABASE_RLS.sql` — 含 profiles.role 的迁移说明（可选）
