# GoGoHockey 项目综述报告

**用途**：供其他 AI 及人员进行全局审查，对网站优化提升、尤其是功能完善提出意见建议。  
**版本**：2.2.0  
**更新日期**：2026-04-05

---

## 一、项目概述

### 1.1 项目定位
**GoGoHockey** 是一款面向渥太华青少年冰球社区的平台，主要功能包括：
- 发布/查找冰球比赛邀请
- 冰场信息浏览与在线预订
- 俱乐部管理
- 用户注册、个人资料、通知

### 1.2 目标用户
- 青少年冰球球员及家长
- 冰球俱乐部
- 冰场运营方

### 1.3 部署与环境
- **框架**：Next.js 15（App Router）
- **部署**：支持 Vercel
- **PWA**：已配置 manifest 与 Service Worker

---

## 二、技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15.5+ | App Router |
| 语言 | TypeScript | - |
| 样式 | Tailwind CSS | - |
| 数据库/后端 | Supabase | 认证、PostgreSQL、实时订阅 |
| 国际化 | next-intl | 仅 **en、fr**（路由与 messages） |
| 表单 | react-hook-form + zod | - |
| UI 组件 | Radix UI、shadcn/ui 风格 | - |
| Toast | Sonner | - |
| 日期 | date-fns | - |
| 图表 | Recharts、Tremor | - |
| 支付 | Stripe | 已接入冰场预订 Checkout 与 Webhook（需配置 `STRIPE_*` 与 Webhook 密钥）；见 `STRIPE_BOOKING_SETUP.md` |
| 邮件 | Resend | 依赖已安装 |
| 数据请求 | @tanstack/react-query | Games、Rinks、Dashboard、Clubs 等已用；少数页面仍可能用 `useEffect` 拉数 |

---

## 三、项目结构概览

```
app/
├── [locale]/                 # 多语言路由 (en, fr)
│   ├── (auth)/               # 登录、注册
│   ├── (dashboard)/          # 主业务：游戏、冰场、预订、俱乐部、通知、个人资料等
│   ├── privacy/              # 隐私政策
│   ├── terms/                # 服务条款
│   ├── contact/              # 联系页面
│   └── layout.tsx
├── api/                      # API 路由
├── check-database/           # 调试/检查
├── test-connection/          # 调试
└── test-notifications/       # 调试
components/
├── layout/                   # Navbar、Footer
├── features/                 # 业务组件（如 GameCard、HeroSection）
├── ui/                       # 基础 UI 组件
└── notifications/            # 通知相关
lib/
├── supabase/                 # Supabase 客户端、服务端、service
├── utils/                    # 工具函数、格式化、sanitize
├── hooks/                    # useAuth、useBookings、useNotifications、useDebounce
├── validations/              # zod 校验（game、booking）
└── api/                      # API 辅助（如 auth requireAuth）
messages/                     # i18n 文案（仅 en.json、fr.json；zh/hi 已从产品移除）
```

---

## 四、核心功能模块

| 模块 | 路径 | 功能简述 |
|------|------|----------|
| 首页 | `/` | Hero、最近比赛展示 |
| 登录/注册 | `/login`, `/register` |  Supabase Auth |
| Dashboard | `/dashboard` | 统计、我发布的/感兴趣的比赛、我的预订列表、赛季统计；支付成功跳转并在此展示 toast |
| 比赛 | `/games` | 列表、筛选、发布、详情、编辑、感兴趣、评分 |
| 冰场 | `/rinks` | 列表、搜索、筛选、预订入口 |
| 冰场预订 | `/book/[rinkId]` | 选择日期时段、冲突校验、提交预订（支付成功跳转 Dashboard） |
| 预订详情 | `/bookings/[id]` | 单条预订详情、取消；返回链到 Dashboard |
| 俱乐部 | `/clubs` | 列表、新建 |
| 通知 | `/notifications` | 列表、已读/未读、删除 |
| 个人资料 | `/profile` | 查看、编辑 |
| 冰场管理 | `/manage-rink` | 冰场信息维护（需权限） |

**说明**：`/my-games`、`/bookings` 已重定向至 `/dashboard`，其内容已合并进 Dashboard 页；列表与赛季统计均在 Dashboard 内展示。

---

## 五、已完成的优化（概要）

详细记录见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)。摘要如下：

1. **冰场预订链接**：locale 感知，避免语言上下文丢失  
2. **提示方式**：Toast 替代 alert，提升体验  
3. **预订时间**：正确计算结束时间，禁止跨夜预订  
4. **冰场时段**：冲突检测、已占时段禁用、提交前二次校验  
5. **i18n**：Footer、Navbar、Rinks、Book、Dashboard 等使用 next-intl  
6. **Footer 链接**：Privacy、Terms、Contact 对应真实页面  
7. **通知徽章**：Navbar 显示未读数量（当前为仅铃铛图标 + 角标）  
8. **Bug 修复**：Navbar 中 `useCallback` 正确导入  
9. **阶段二导航与按钮（2026-02）**：公网 Navbar 与 Hero 增加 Dashboard 入口，登录后跳转 Dashboard，Footer 已登录显示 Dashboard，clubs/bookings 按钮链与 locale 修复，Dashboard 顶栏与主页视觉统一（Logo、深色栏、通知仅铃铛），详见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)、[NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md)  
10. **RLS 补充（2026-02）**：`payments`、`rink_updates_log` 已补充行级安全策略，消除 UNRESTRICTED，见 [SUPABASE_RLS.sql](./SUPABASE_RLS.sql)  
11. **导航与视觉优化（2026-02）**：移除 Post Game 按钮；全站白天/黑夜视觉模式（next-themes）；Navbar 双主题适配；移除 Hero 底部波浪形白色过渡，详见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md) §十四。  
12. **导航与 Dashboard 优化（2026-02）**：主导航改为 Play（Ice Rinks、Find Game）、Community（Clubs）；用户头像下拉为 Profile、Dashboard、Sign Out；My Games、My Bookings、Season Statistics 合并入 Dashboard；`/my-games`、`/bookings` 重定向至 `/dashboard`；Stripe 支付成功跳转 `/dashboard?session_id=...`，Dashboard 页处理 session_id 并展示支付成功 toast 后清除 URL；预订详情「返回」改为 Back to Dashboard；legacy `app/(dashboard)` 导航与链接统一为 Dashboard；Navbar「Get Started」白底按钮文字对比度修复（`[&_a.bg-white]:text-gogo-primary`），详见 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md)。

---

## 六、请重点审查的方向

### 6.0 状态权威（必读）

**「当前未完成 / 进行中」任务**以 [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md) **§三、§四** 为唯一权威；本节的勾选仅辅助审查，**不得**与 §三、§四 矛盾。V2 评审的原始 SQL、验收标准见同文档 [§六 附录](./NEXT_PHASE_TASKS.md#v2-review-appendix)。

**V2 结论摘要（截至 2026-04）**：

- **已完成**：V2 **P0**（预订 DB 排他约束、Stripe Webhook 幂等、生产环境调试路由保护、RBAC/RLS 与代码对齐）、**P1**（HydrationBoundary、图片三层策略、Cron 安全、数据可信度标签、预订规则 UI 化等）。  
- **主路径写操作**：`/[locale]` 核心写接口已 **服务端化**，配合 **Zod** 与 **sanitize**（错误码见 [API_ERROR_CODES.md](./API_ERROR_CODES.md)）。  
- **进行中（V2 P2 收尾）**：**XSS**（legacy 等入口 sanitize 全量复核）、**SEO JSON-LD**（各详情页结构化数据与转义策略全量复核）。

### 6.1 已完成能力（审查时勿当作未开工单）

- [x] **支付 / 预订**：Stripe Checkout、Webhook（签名校验与幂等）、取消政策与退款金额（`lib/booking/policies.ts`）、预订确认邮件（Resend，需配置 `RESEND_API_KEY`）、DB 排他约束防超卖  
- [x] **权限与路由**：RLS、`rink_managers`、manage-rink 可见性；middleware / layout 与业务一致（细节见 `ROLES_AND_ROUTE_GUARDS.md`）  
- [x] **列表与 SEO 基线**：HydrationBoundary、meta、sitemap、站点级 JSON-LD；Games 推荐排序、Dashboard 预订提醒横幅  
- [x] **加载与错误**：骨架屏（Games/Rinks 等）、页面级 `error.tsx`  
- [x] **国际化**：上线语言仅 **en / fr**（zh、hi 已移除）

### 6.2 进行中（与 NEXT_PHASE_TASKS §三 一致）

- [ ] **XSS 防护**：剩余 legacy 等入口的输出与 sanitize 巡检  
- [ ] **SEO JSON-LD**：详情页结构化数据与转义策略全量复核  

### 6.3 长期产品与技术问题（非 V2 P2 阻塞；见路线图排期）

- [ ] **比赛匹配**：自动匹配、候补名单、更强通知（见 [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md)）  
- [ ] **数据请求模式**：是否全面统一为 React Query，减少零散 `useEffect`  
- [ ] **组件复用**：重复逻辑是否抽 hooks / 共享组件  
- [ ] **性能**：长列表、懒加载、图片等持续优化  
- [ ] **i18n 边角**：en/fr 文案持续补全  
- [ ] **日期与货币**：locale 格式化是否需进一步深化（已有 `formatDateByLocale` 等）  
- [ ] **隐私合规**：Cookie 同意、GDPR 等是否需专门流程  

### 6.4 安全与合规

- [x] **RLS 策略**：game_invitations、game_interests、bookings、notifications、profiles、rinks、**payments**、**rink_updates_log** 已启用 RLS，见 [SUPABASE_RLS.sql](./SUPABASE_RLS.sql)；执行后需在 Dashboard 确认无 UNRESTRICTED。  
- [ ] **输入过滤**：与 §6.2 XSS 收尾一致  
- [ ] **隐私合规**：与 §6.3 长期项一致  

---

## 七、审查者反馈指引

如您为 **AI 或人工审查者**，建议按以下方式反馈：

1. **按模块反馈**：说明涉及的功能模块或页面  
2. **标注类型**：Bug / 优化建议 / 功能增强 / 安全 / 性能 / 可维护性  
3. **尽量具体**：指明文件或组件、问题描述、可选方案或示例代码  
4. **注明优先级**：高 / 中 / 低，便于排期  

**示例格式**：
```
【模块】冰场预订
【类型】功能增强
【建议】可增加赛前短信提醒（除现有邮件与 Dashboard 横幅外）
【优先级】中
【位置】app/[locale]/(dashboard)/book/[rinkId]/page.tsx
```

---

## 八、相关文档

- [NEXT_PHASE_TASKS.md](./NEXT_PHASE_TASKS.md)：任务与阶段规划；**当前未完成**以 §三、§四 为准  
- [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md)：功能增强路线图（比赛匹配、预订管理、支付增强、PWA、SEO 等与 P0–P3）  
- [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)：详细修改记录  
- [SUPABASE_RLS.sql](./SUPABASE_RLS.sql)：Supabase RLS 策略（含 payments、rink_updates_log）  
- [DEPLOYMENT.md](./DEPLOYMENT.md)、[API.md](./API.md)：部署与 API 说明  
- [README.md](../README.md)：项目根目录说明与运行方式  
- [docs/★★★README.md](./★★★README.md)：文档索引  

---

*本报告用于项目全局审查，欢迎对网站优化与功能完善提出意见建议。*
