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

*文档生成时间：2025-02*
