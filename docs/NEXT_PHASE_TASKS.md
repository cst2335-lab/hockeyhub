# GoGoHockey 任务与阶段规划

基于 [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md)、[PROJECT_REVIEW_REPORT.md](./PROJECT_REVIEW_REPORT.md)、[CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) 整理。

---

## 一、任务总览

| 状态 | 数量 | 说明 |
|------|------|------|
| **已完成** | §二 | 测试、文档、PWA、i18n、监控、UI 视觉、无障碍、表单与错误、导航优化、白天/黑夜模式 |
| **进行中** | §三 | 无（当前无进行中任务） |
| **下阶段** | §四 | 支付流程、预订确认、权限与角色、架构与性能 |

---

## 二、已完成任务

### 2.1 chore/next-phase-ops-and-polish 已完成项

| 任务 | 说明 |
|------|------|
| §一 2 测试 | `npm run test` 已通过（Vitest，14 个用例） |
| §二 6 文档 | [DEPLOYMENT.md](./DEPLOYMENT.md)、[API.md](./API.md) 已建；docs/README 已更新索引 |
| §二 7 PWA | `public/sw.js` 对 `/login`、`/register`、`/dashboard`、`/bookings`、`/manage-rink`、`/notifications` 不再使用缓存 |
| §二 8 i18n | Manage Rink 页文案全部迁入 messages（en/fr）；manageRink、nav 命名空间 |
| §二 5 监控 | 集成 `@sentry/nextjs`；设置 `NEXT_PUBLIC_SENTRY_DSN` 后启用上报 |
| §三 9 UI 视觉 | globals.css 增加 `.link-light`、`.link-dark`、`.input-focus`；`:focus-visible`、`::selection` 使用 #64BEF0 |
| §三 10 无障碍 | `:focus-visible` 明显焦点环，可交互元素键盘聚焦可见 |
| §三 11 表单与错误 | common、book 增加 i18n key；预订页错误提示全部使用 i18n |
| **导航优化（2026-02）** | 移除 Post Game 按钮；全站白天/黑夜视觉模式（next-themes）；Navbar 双主题适配；移除 Hero 底部波浪形白色过渡 |
| **Figma 方案落地（2026-02）** | Hero 主标题「Making Hockey Accessible for Everyone」；首页「Everything You Need」四卡（Find a Team、Register for a League、Get Equipment、Improve Your Skills）；主导航增加 About、Community；Footer 五栏（Clubs & Leagues、Coaches & Parents、Sports、Company、Resources）；About 占位页；公网 Navbar 移动端第二行导航；Contact 页 i18n + 主题 token |
| **i18n 与主题收尾（2026-02）** | Privacy、Terms、Profile、My Games、Bookings 详情、Clubs new、Games 新建/编辑 等页 i18n + 主题 token；Manage Rink、Games 列表/详情/新建/编辑、Notifications、Bookings [id]、book/[rinkId]、error.tsx 等 gray/white 替换为主题 token；Profile 编辑 / Games 新建 Cancel 使用 actions.cancel；games 命名空间（gameTitle、gameStatus、saveChanges、saving、status*Label、contactSharedHint）；myGames（editSubtitle、backToMyGames、noPermission） |
| **全站主题统一（2026-02）** | Navbar、Dashboard 顶栏、hero-section、notification-bell、theme-toggle、LocaleSwitcher、error-boundary、game-card、AuthActions、RatingStars 等组件 gray/slate → theme tokens；旧路由 (dashboard)/(auth)/register 及 clubs、games/[id]、profile 等页统一为主题 token；globals.css 中 .glass-dark、.skeleton、.divider、.link-light、.scrollbar-thin 使用主题变量 |
| **导航与 Dashboard 优化（2026-02）** | Dashboard 主导航：Play（Ice Rinks、Find Game）、Community（Clubs）；用户头像下拉：Profile、Dashboard、Sign Out；移除 Profile/My Games/My Bookings 独立导航；合并 My Games、My Bookings、Season Statistics 入 Dashboard 页面；/my-games、/bookings 重定向到 /dashboard；主页 Hero 移除居中用户头像/名称；导航栏增加搜索框；Dashboard 使用 Disclosure 汉堡菜单（lg 以下折叠）；globals.css 增加 .scrollbar-hide；UserAvatar 增加 onDark 变体；Stripe 支付成功跳转 /dashboard?session_id=...；Dashboard 页处理 session_id 并显示支付成功 toast 后清除 URL；bookings 列表页移除 session_id 逻辑；预订详情「返回」改为「Back to Dashboard」并链到 /dashboard；legacy app/(dashboard) 导航移除 My Games/My Bookings，编辑/预订/订场页返回与跳转统一为 /dashboard |

### 2.2 阶段二（feat/nav-dashboard-and-cta）已完成

- 公网 Navbar 增加 Dashboard、通知仅铃铛；Hero 按登录态切换 CTA
- 登录后跳转 Dashboard；Footer 已登录显示 Dashboard
- clubs/new、bookings 按钮链与 locale 修复
- Dashboard 顶栏与主页视觉统一（Logo、深色栏、底部渐变条）
- RLS 补充：payments、rink_updates_log

详见 [PHASE2_NAV_AND_BUTTON_TASKS.md](./PHASE2_NAV_AND_BUTTON_TASKS.md)、[CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)。

---

## 三、进行中任务

当前无进行中任务。支付、权限等分支待启动。

---

## 四、下阶段任务

### 4.1 高优先级（P0 / P1）

| 任务 | 说明 |
|------|------|
| **支付流程** | 新建 `/api/stripe/checkout`；预订 pending → confirmed（支付成功）→ cancelled；配置 Stripe Webhook；约定退款规则（如 48 小时内可退） |
| **预订确认与取消** | 预订成功后发送确认邮件（详情 + 取消链接）；提前 24 小时提醒（可选）；取消规则落地 |
| **测试** | 补充关键流程 E2E（登录、预订、发布比赛），可选 Playwright |

### 4.2 中优先级（P1 / P2）

| 任务 | 说明 |
|------|------|
| **权限与角色** | profiles 增加 role；middleware 或布局检查路由权限（如 /manage-rink 仅 rink_manager）；与 rink_managers 统一 |
| **PWA 与 i18n 收尾** | 检查 Service Worker 缓存策略；Dashboard 导航栏剩余硬编码文案迁入 messages |

### 4.3 架构与性能（P2 / P3，留待后续）

- 尚未使用 React Query 的页面逐步迁移
- API 路由统一认证检查
- 输入过滤与安全（富文本 sanitize、XSS/注入防护）
- 图片 next/image、懒加载；长列表分页或虚拟滚动
- SEO：openGraph、结构化数据补充

---

## 五、建议实施顺序

1. **支付 + 预订确认**：打通预订→支付→确认邮件→取消规则
2. **测试**：补 1～2 条关键 E2E
3. **权限**：role 字段与 manage-rink 等路由保护
4. **PWA、i18n 收尾**：按迭代排期

---

## 六、分支与实施计划

| 分支名 | 包含任务 | 说明 |
|--------|----------|------|
| **`feat/stripe-payment-and-booking-flow`** | 支付流程、预订确认与取消规则 | 核心业务闭环 |
| **`feat/roles-and-route-guards`** | 权限与角色 | 可与支付分支并行 |
| **`chore/next-phase-ops-and-polish`** | 测试、监控、文档、PWA、i18n、UI/无障碍、导航/主题 | 已完成 |

### 创建分支示例

```bash
git checkout main
git pull origin main
git checkout -b feat/stripe-payment-and-booking-flow
# 或
git checkout -b feat/roles-and-route-guards
```

---

*本文档随项目进展更新。*
