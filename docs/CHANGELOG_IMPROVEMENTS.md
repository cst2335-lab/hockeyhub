# GoGoHockey 网站优化修改日志

本文档详细记录截至目前的修改完善工作。

---

## 一、冰场预订链接 Locale 修复

**日期**：2025-02  
**优先级**：高  
**文件**：`app/[locale]/(dashboard)/rinks/page.tsx`

### 修改内容
- 添加 `usePathname` 获取当前 locale
- 新增 `withLocale` 辅助函数
- 将 "Book Now" 链接从 `href={/book/${r.id}}` 改为 `href={withLocale(\`/book/${r.id}\`)}`

### 解决的问题
- 从法语路由（如 `/fr/rinks`）点击预订会错误跳转到 `/book/xxx`，丢失 locale
- 修复后保持语言上下文正确

---

## 二、Toast 替代 alert

**日期**：2025-02  
**优先级**：高  
**文件**：
- `app/[locale]/layout.tsx` - 添加 Sonner `<Toaster />`
- `app/[locale]/(dashboard)/book/[rinkId]/page.tsx`
- `app/[locale]/(dashboard)/my-games/page.tsx`
- `app/[locale]/(dashboard)/manage-rink/page.tsx`
- `app/[locale]/(dashboard)/games/new/page.tsx`
- `app/[locale]/(dashboard)/games/[id]/page.tsx`
- `app/[locale]/(dashboard)/games/[id]/edit/page.tsx`
- `app/[locale]/(dashboard)/bookings/[id]/page.tsx`

### 修改内容
- 引入 `toast` from `sonner`
- 将 `alert()` 替换为 `toast.success()` / `toast.error()` / `toast.info()`
- 在根布局中添加 `<Toaster position="top-center" richColors closeButton />`

### 解决的问题
- 原生 `alert()` 会阻塞界面
- Toast 提供非侵入式、可关闭的提示体验

---

## 三、预订结束时间计算修复

**日期**：2025-02  
**优先级**：高  
**文件**：`app/[locale]/(dashboard)/book/[rinkId]/page.tsx`

### 修改内容
- 使用 `date-fns` 的 `parse`、`addHours`、`format` 替代手动计算
- `calcEndTime` 返回 `{ endTime, endDate, isOvernight }`
- 增加跨夜校验：若 `isOvernight` 为 true，提示 "Bookings cannot span midnight..." 并阻止提交

### 解决的问题
- 原逻辑 `(h + durHours) % 24` 在跨夜时产生错误（如 22:00 + 3h → 01:00 次日，但 `booking_date` 未变）
- 现逻辑正确计算结束时间，并禁止跨夜预订

---

## 四、冰场可用时段校验

**日期**：2025-02  
**优先级**：高  
**文件**：`app/[locale]/(dashboard)/book/[rinkId]/page.tsx`

### 修改内容
- 新增状态：`existingBookings`、`loadingSlots`
- 新增 `fetchExistingBookings`：按 rinkId + bookingDate 查询非 cancelled 预订
- 新增 `hasSlotConflict`：判断请求时段与已有预订是否重叠
- 选择日期后自动加载该日期的已有预订
- 时段下拉框中：已占用时段显示 "(booked)" 并禁用
- 提交前再次校验冲突，冲突时 toast 提示并阻止提交

### 解决的问题
- 原无冲突检查，可能造成同一冰场同一时段重复预订
- 现支持前端冲突检测与提交前二次校验

---

## 五、i18n 全面应用

**日期**：2025-02  
**优先级**：高  
**文件**：
- `messages/en.json`、`messages/fr.json` - 扩展翻译 key
- `components/layout/footer.tsx`
- `components/layout/navbar.tsx`
- `app/[locale]/(dashboard)/rinks/page.tsx`
- `app/[locale]/(dashboard)/book/[rinkId]/page.tsx`
- `app/[locale]/(dashboard)/dashboard/page.tsx`

### 修改内容

#### 5.1 翻译文件扩展
- `nav`：privacy, terms, contact
- `actions`：bookNow, confirmBooking
- `footer`：poweredBy
- `rinks`：title, available, searchPlaceholder, allPrices, budget, standard, premium, sortByName, sortByPrice, allCities, clearFilters, noMatch, quickStats, totalRinks, avgPrice, lowestPrice, highestPrice, bandBudget, bandStandard, bandPremium
- `book`：title, rinkDetails, bookingInfo, date, startTime, duration, selectTime, hour, hours, priceSummary, iceTime, platformFee, total, creating, checkingAvailability, booked, slotsBookedHint
- `dashboard`：title, openGames, upcomingBookings, totalRinks

#### 5.2 组件更新
- Footer：Powered by Vercel、Privacy、Terms、Contact 使用翻译
- Navbar：Games、Clubs、Rinks、Notifications、Post Game、Profile、Logout、Login、Sign Up 使用翻译
- Rinks 页：标题、筛选、排序、统计等使用翻译
- Book 页：表单标签、价格摘要、按钮文案使用翻译
- Dashboard：标题与指标标签使用翻译

### 解决的问题
- 大量硬编码英文，不利于多语言
- 现支持英语/法语切换

---

## 六、Footer 真实链接

**日期**：2025-02  
**优先级**：高  
**文件**：
- 新建 `app/[locale]/privacy/page.tsx` - 隐私政策页
- 新建 `app/[locale]/terms/page.tsx` - 服务条款页
- 新建 `app/[locale]/contact/page.tsx` - 联系页
- `components/layout/footer.tsx`

### 修改内容
- 新建 Privacy Policy、Terms of Service、Contact 三页
- Footer 使用 `usePathname` 获取 locale，将 Privacy/Terms/Contact 链接到对应页面
- 链接格式：`/privacy`、`/terms`、`/contact`，并通过 `withLocale` 保持多语言

### 解决的问题
- 原链接为 `href="#"`，无实际内容
- 现提供可访问的隐私、条款、联系页面

---

## 七、通知未读数徽章

**日期**：2025-02  
**优先级**：中  
**文件**：`components/layout/navbar.tsx`

### 修改内容
- 新增状态 `unreadCount`
- 新增 `loadUnreadCount`（`useCallback`）从 `notifications` 表统计未读数
- 在 `useEffect` 中：用户登录后加载未读数，并订阅 Supabase `postgres_changes` 实时更新
- 在通知铃铛旁显示红色数字徽章：`unreadCount > 0` 时显示，>99 显示 "99+"
- 为 Link 添加 `aria-label` 提升可访问性

### 解决的问题
- 原无未读数提示
- 现可在 Navbar 直接看到未读通知数量

---

## 八、Bug 修复：useCallback 未导入

**日期**：2025-02  
**文件**：`components/layout/navbar.tsx`

### 修改内容
- 在 React 导入中加入 `useCallback`

### 解决的问题
- 运行时错误：`useCallback is not defined`
- 因使用 `useCallback` 但未导入导致

---

## 修改文件汇总

| 类型 | 文件路径 |
|------|----------|
| 新建 | `app/[locale]/privacy/page.tsx` |
| 新建 | `app/[locale]/terms/page.tsx` |
| 新建 | `app/[locale]/contact/page.tsx` |
| 修改 | `app/[locale]/layout.tsx` |
| 修改 | `app/[locale]/(dashboard)/book/[rinkId]/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/rinks/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/dashboard/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/my-games/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/manage-rink/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/games/new/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/games/[id]/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/games/[id]/edit/page.tsx` |
| 修改 | `app/[locale]/(dashboard)/bookings/[id]/page.tsx` |
| 修改 | `components/layout/navbar.tsx` |
| 修改 | `components/layout/footer.tsx` |
| 修改 | `messages/en.json` |
| 修改 | `messages/fr.json` |

---

## 技术栈与依赖

- **框架**：Next.js 15.5.12
- **国际化**：next-intl
- **Toast**：sonner
- **日期处理**：date-fns
- **数据库**：Supabase

---

## 九、P0 修改方案实施（2026-02）

**日期**：2026-02  
**分支**：feature/ui-and-improvements-2026-02-12

### 9.1 统一加载状态
- **新建**：`components/ui/skeleton.tsx`（Skeleton、DashboardSkeleton、CardListSkeleton、FormSkeleton）
- **新建**：`app/[locale]/(dashboard)/loading.tsx`（Dashboard 骨架屏）
- **新建**：`app/[locale]/loading.tsx`（Locale 级 LoadingSpinner）

### 9.2 错误边界
- **新建**：`app/[locale]/error.tsx`（统一错误页，提供「重试」「返回首页」）
- **新建**：`components/error-boundary.tsx`（可复用 ErrorBoundary 组件）

### 9.3 API 路由验证
- **新建**：`lib/api/auth.ts`（`requireAuth()` 辅助函数）
- **修改**：`app/api/notifications/test/route.ts` 使用 requireAuth 替代手动 token 解析

### 9.4 RLS 策略文档
- **新建**：`docs/SUPABASE_RLS.sql`（game_invitations、game_interests、bookings、notifications、profiles、rinks 的 RLS 策略，需在 Supabase SQL Editor 中执行）

---

## 十、P1 修改方案实施（2026-02）

**日期**：2026-02  
**分支**：feature/ui-and-improvements-2026-02-12

### 10.1 i18n 扩展
- **修改**：`messages/en.json`、`messages/fr.json`
- 新增 `games`：gamesFound、filtered、postGame、searchPlaceholder、dateFilterAll/Upcoming/Past、sortByDate/Interest/Views、clearFilters、spotsLeft、full、interested、views
- 新增 `clubs`：title、noClubs、beFirst、registerClub
- 新增 `bookings`：title、noBookings
- 新增 `notifications`：title、noNotifications、markAllRead、unreadCount

### 10.2 UI 视觉规范落地
- **修改**：`components/features/hero-section.tsx` — 渐变改为 gogo 色彩（gogo-dark → gogo-primary → gogo-secondary），主按钮白底深蓝字，次要按钮 outline + gogo-secondary
- **修改**：`components/features/game-card-working.tsx` — 顶部条、图标、徽章、按钮使用 gogo 色，卡片 hover 边框
- **修改**：`components/layout/footer.tsx` — 链接 hover 使用 gogo-primary
- **修改**：`app/[locale]/(dashboard)/rinks/page.tsx` — 卡片 hover 边框，Book Now 按钮 gogo-primary
- **修改**：`app/[locale]/(dashboard)/games/page.tsx` — 按钮、筛选器、焦点环使用 gogo 色
- **修改**：`app/globals.css` — 选中文本样式使用 gogo-secondary

### 10.3 React Query 迁移
- **新建**：`app/providers/query-provider.tsx`（QueryClientProvider）
- **修改**：`app/[locale]/layout.tsx` — 包裹 QueryProvider
- **修改**：`app/[locale]/(dashboard)/games/page.tsx` — 使用 useQuery 替代 useEffect + fetchGames
- **修改**：`app/[locale]/(dashboard)/rinks/page.tsx` — 使用 useQuery 替代 useEffect + fetchRinks

### 10.4 预订确认邮件
- **新建**：`app/api/bookings/send-confirmation/route.ts` — 使用 Resend 发送确认邮件（需 RESEND_API_KEY）
- **修改**：`app/[locale]/(dashboard)/book/[rinkId]/page.tsx` — 预订成功后调用 API 发送邮件（fire-and-forget）

---

## 十一、P2 修改方案实施（2026-02）

**日期**：2026-02

### 11.1 通用 Hooks
- **新建**：`lib/hooks/useAuth.ts` — 客户端认证状态（user、loading、signOut），订阅 onAuthStateChange
- **新建**：`lib/hooks/useDebounce.ts` — useDebounce(value, delay)、useDebouncedCallback(callback, delay)
- **新建**：`lib/hooks/index.ts` — 统一导出

### 11.2 日期格式化（locale 感知）
- **修改**：`lib/utils/format.ts`
- 新增 `formatDateByLocale(input, localeCode)`、`formatDateTimeByLocale(input, localeCode)`，使用 date-fns + enUS/fr locale
- `formatCurrency` 支持传入 locale 参数

### 11.3 SEO
- **修改**：`app/[locale]/layout.tsx` — generateMetadata：按 locale 生成 title、description、openGraph，themeColor 改为 gogo-dark
- **新建**：`app/sitemap.ts` — 为 en/fr 及静态路径生成 sitemap（baseUrl 取自 NEXT_PUBLIC_APP_URL 或 VERCEL_URL）
- **新建**：`app/robots.ts` — allow /，disallow /api/ 及测试页，sitemap 链接

### 11.4 表单优化
- **新建**：`lib/validations/game.ts` — createGameSchema（zod）：title、game_date、game_time、location、age_group、skill_level、description、max_players、contact_info
- **修改**：`app/[locale]/(dashboard)/games/new/page.tsx` — 提交前 zod 校验，字段级错误展示（fieldErrors），防重复提交（disabled + loading），按钮/输入框使用 gogo 色与 focus 环

### 11.5 图片优化
- **修改**：`next.config.mjs` — images.remotePatterns 添加 `**.supabase.co/storage/v1/object/public/**`，支持 Supabase 存储图片
- **新建**：`components/ui/optimized-image.tsx` — 封装 next/image，lazy 加载、quality 85，便于后续头像/冰场照片使用

### 11.6 预订表单 + 登录/注册 gogo 色
- **新建**：`lib/validations/booking.ts` — bookingFormSchema（bookingDate、startTime、hours 1–12）
- **修改**：`app/[locale]/(dashboard)/book/[rinkId]/page.tsx` — 提交前 zod 校验，表单/按钮 gogo 色
- **修改**：`app/[locale]/(auth)/login/LoginClient.tsx` — 按钮、链接、focus 环 gogo 色
- **修改**：`app/[locale]/(auth)/register/RegisterClient.tsx` — 按钮、链接、focus 环 gogo 色

### 11.7 useBookings / useNotifications Hooks
- **新建**：`lib/hooks/useBookings.ts` — useQuery 获取当前用户预订列表，依赖 useAuth
- **新建**：`lib/hooks/useNotifications.ts` — useQuery 获取通知列表，useMutation 支持 markAsRead、markAllAsRead、deleteNotification，realtime 订阅自动 invalidate
- **修改**：`lib/hooks/index.ts` — 导出 useBookings、useNotifications
- **修改**：`app/[locale]/(dashboard)/bookings/page.tsx` — 使用 useBookings，formatDateByLocale，i18n
- **修改**：`app/[locale]/(dashboard)/notifications/page.tsx` — 使用 useNotifications，formatDateTimeByLocale，i18n，gogo 色

### 11.8 全局 blue → gogo 色统一
- **Dashboard**：加载 spinner、统计卡片 border 与数字 gogo 色
- **Rinks**：加载 spinner、Quick Stats 区域 bg/text gogo 色
- **Games**：new/edit/[id] 表单 focus 环、Tips 框、按钮、status badge gogo 色
- **My-games**：spinner、tabs、按钮、matched 徽章、提示框 gogo 色
- **Manage-rink / Bookings**：spinner、按钮、详情数字 gogo 色
- **Clubs**：spinner、按钮、链接、verified 徽章 gogo 色
- **Navbar**：CTA 按钮渐变、底部装饰条 gogo 色
- **Layout**：侧边栏激活态 text-gogo-primary bg-gogo-secondary/10
- **Error / ErrorBoundary**：重试按钮 gogo-primary
- **Terms / Privacy / Contact**：返回链接 gogo 色
- **Notifications**：状态徽章 gogo 色
- **Profile / Profile Edit**：spinner、封面渐变、按钮、链接、徽章、focus 环 gogo 色
- **Games-test**：spinner、按钮 gogo 色

### 11.13 My-games 迁移 useQuery + withLocale
- **修改**：`app/[locale]/(dashboard)/my-games/page.tsx` — 使用 useQuery 替代 useEffect，useAuth 获取 user，queryClient.invalidateQueries 刷新数据，usePathname + withLocale 修复所有 Link 与 router.push('/login')

### 11.12 Clubs 迁移 useQuery + i18n
- **修改**：`app/[locale]/(dashboard)/clubs/page.tsx` — 使用 useQuery 替代 useEffect，移除重复 nav（使用 dashboard layout），Link + withLocale 保持 locale，i18n 全文案，Verified 徽章 gogo 色，isError 错误态
- **修改**：`messages/en.json`、`messages/fr.json` — clubs 新增 verified、visitWebsite、loadError

### 11.11 Dashboard useQuery + 无障碍
- **修改**：`app/[locale]/(dashboard)/dashboard/page.tsx` — 使用 useQuery 替代 useEffect，Promise.all 并行请求，isError 错误态，loadError i18n
- **修改**：`app/[locale]/(dashboard)/layout.tsx` — Notifications 链接、Logout 按钮添加 aria-label、focus-visible 焦点环
- **修改**：`messages/en.json`、`messages/fr.json` — dashboard 新增 loadError

### 11.10 权限：Manage Rink 仅对 rink_manager 可见 + 输入清理
- **修改**：`app/[locale]/(dashboard)/layout.tsx` — 查询 rink_managers 判断 isRinkManager，Manage Rink 链接仅对 verified rink_manager 显示；侧边栏导航改用 i18n（nav.dashboard、nav.myGames 等）
- **修改**：`messages/en.json`、`messages/fr.json` — nav 新增 manageRink、myGames、myBookings
- **新建**：`lib/utils/sanitize.ts` — sanitizePlainText 去除控制字符、限制长度，供富文本场景预留

### 11.9 Games / Rinks 列表分页
- **修改**：`app/[locale]/(dashboard)/games/page.tsx` — PAGE_SIZE=20，分页控件（Previous/Next、Page X of Y），筛选变化时重置页码
- **修改**：`app/[locale]/(dashboard)/rinks/page.tsx` — 同上分页逻辑
- **修改**：`messages/en.json`、`messages/fr.json` — games/rinks 新增 prevPage、nextPage、pageOf

---

## 十二、任务完成状态（2026-02）

### 已完成
- **P0**：加载状态、错误边界、RLS 文档、API 验证（requireAuth）
- **P1**：i18n、UI 规范落地、React Query（games/rinks/dashboard/clubs/my-games/bookings/notifications）、预订确认邮件
- **P2**：Hooks、日期格式化、SEO、表单 zod 校验、图片优化、全局 gogo 色、分页、Manage Rink 权限、sanitize 工具
- **P3**：Dashboard/Clubs/My-games useQuery、无障碍（aria-label、focus-visible）

### 11.14 测试基础设施
- **新建**：`vitest.config.ts` — node 环境，vite-tsconfig-paths 支持 @/ 路径
- **新建**：`__tests__/lib/utils/format.test.ts` — formatCurrency、formatDateByLocale、formatDateTimeByLocale
- **新建**：`__tests__/lib/utils/sanitize.test.ts` — sanitizePlainText
- **新建**：`__tests__/lib/validations/booking.test.ts` — bookingFormSchema
- **修改**：`package.json` — 新增 test、test:watch 脚本，devDependencies 添加 vitest、vite-tsconfig-paths

### 未完成（后续迭代）
- **支付流程**：Stripe checkout、Webhook（需配置 Stripe）
- **测试**：执行 `npm install` 后运行 `npm run test`
- **监控**：Sentry、Vercel Analytics
- **文档**：API 文档、部署指南、贡献指南

---

## 十三、阶段二导航与 RLS 补充（2026-02）

**日期**：2026-02  
**分支**：feat/nav-dashboard-and-cta  
**参考**：docs/PHASE2_NAV_AND_BUTTON_TASKS.md、docs/DEV_LOG_2026-02-13.md

### 13.1 阶段二：导航与功能按钮
- 公网 Navbar 已登录时增加 Dashboard 链接（含移动端）；主页通知改为仅铃铛图标 + 未读角标
- Hero 按登录状态切换 CTA：已登录主 CTA「Go to Dashboard」，次 CTA「Find Games」；未登录保持原双按钮；新增 hero 文案（en/fr）
- 登录成功跳转由 `/games` 改为 `/dashboard`
- Footer 已登录时增加 Dashboard 链接
- clubs/new 全部使用 withLocale，移除重复顶栏，改为「Back to Clubs」；Bookings 空状态增加「Browse rinks to book」→ /rinks
- Dashboard 顶栏与主页视觉统一：bg-[#18304B]、Logo 组件、相同链接样式、LocaleSwitcher、通知仅铃铛、底部渐变条

### 13.2 RLS 补充（消除 UNRESTRICTED）
- **payments**：启用 RLS，策略「Users can view own payments」（auth.uid() = user_id）；若表结构不同需调整 docs/SUPABASE_RLS.sql
- **rink_updates_log**：启用 RLS，已登录可读、仅可插入 updated_by = auth.uid() 的记录；sync 接口用 service role 写入

### 13.3 涉及文件（阶段二）
- components/layout/navbar.tsx、footer.tsx
- components/features/hero-section.tsx
- app/[locale]/(auth)/login/LoginClient.tsx
- app/[locale]/(dashboard)/layout.tsx、clubs/new/page.tsx、bookings/page.tsx
- messages/en.json、messages/fr.json（hero、bookings.browseRinksToBook）

---

## 十四、导航与视觉优化（2026-02）

**日期**：2026-02  
**分支**：chore/next-phase-ops-and-polish

### 14.1 导航栏优化
- **移除 Post Game 按钮**：公网 Navbar 中去掉「Post Game」入口，简化导航。
- **白天/黑夜视觉模式**：全站支持 light/dark 模式切换；集成 `next-themes`；新增 `ThemeProvider`、`ThemeToggle` 组件；Navbar 增加主题切换按钮。
- **Navbar 适配主题**：白天模式白底深色文字，黑夜模式深蓝底浅色文字；链接、按钮、用户菜单、LocaleSwitcher 均适配双主题。

### 14.2 Hero 区域
- **移除波浪形白色过渡**：Hero 底部波浪形 SVG 白色过渡已删除，视觉更简洁。

### 14.3 涉及文件
- `components/layout/navbar.tsx` — 移除 Post Game、添加 ThemeToggle、双主题样式
- `components/features/hero-section.tsx` — 移除底部波浪
- `app/providers/theme-provider.tsx` — 新建
- `components/ui/theme-toggle.tsx` — 新建
- `components/ui/logo.tsx` — Logo 文字支持 dark 模式
- `components/LocaleSwitcher.tsx` — 双主题样式
- `app/[locale]/layout.tsx` — 包裹 ThemeProvider

---

*文档生成时间：2025-02 | 更新：2026-02*
