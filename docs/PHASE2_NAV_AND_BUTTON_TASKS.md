# 下阶段修改任务：导航与功能按钮逻辑优化

## 一、问题概述

1. **登录后主页找不到 Dashboard 入口**  
   用户在首页（`/[locale]/`）看到的是「公网导航」Navbar，其中没有「Dashboard」按钮，无法从首页直接进入用户工作台。

2. **各页面功能按钮的逻辑链条不清晰**  
   公网导航、Dashboard 侧导航、首页 Hero、登录后跳转等多处入口分散，用户路径不统一，需要整体梳理并优化。

---

## 二、当前逻辑梳理

### 2.1 两套导航

| 场景 | 使用的布局 | 显示的导航 |
|------|------------|------------|
| 首页、条款/隐私/联系等 | `[locale]/layout.tsx` | **Navbar**（公网顶栏）+ Footer |
| `/dashboard`、`/games`、`/rinks` 等 | `[locale]/(dashboard)/layout.tsx` | **Dashboard 顶栏**（含 Dashboard、Games、My Games、Rinks、Bookings、Clubs 等） |

- `conditional-nav.tsx` 约定：当 URL 第二段属于 `dashboard, games, my-games, rinks, bookings, clubs, notifications, profile, manage-rink, book, games-test` 时，**隐藏**公网 Navbar/Footer，仅显示 Dashboard 布局内的导航。

### 2.2 公网 Navbar（`components/layout/navbar.tsx`）现状

- **未登录**：Logo、Games、Clubs、Rinks、登录、注册。
- **已登录**：Logo、Games、Clubs、Rinks、通知、「Post Game」、用户头像（Profile + 登出）。
- **缺失**：没有「Dashboard」或「我的工作台」入口，已登录用户从首页无法一眼找到进入 Dashboard 的按钮。

### 2.3 首页 Hero（`components/features/hero-section.tsx`）现状

- 主 CTA：「Find Games Now」→ `/[locale]/games`
- 次 CTA：「Get Started Free」→ `/[locale]/register`
- **问题**：不区分登录状态，已登录用户仍看到「Get Started Free」，没有「进入 Dashboard」或「我的比赛/预订」等入口。

### 2.4 登录后跳转（`LoginClient.tsx`）

- 登录成功：`window.location.href = \`/${locale}/games\``  
- 即进入 Dashboard 区域的「Games」页，此时会看到 Dashboard 顶栏（含 Dashboard 链接）。  
- **问题**：仅当用户「从登录页直接进 /games」时才能看到 Dashboard 导航；若用户之后回到首页，就再次失去 Dashboard 入口。

### 2.5 Dashboard 布局（`(dashboard)/layout.tsx`）

- 导航项：Dashboard、Games、My Games、Rinks、Bookings、Clubs、（Manage Rink 仅 rink manager）。
- 左侧 Logo 链接到 `withLocale('/')`，即**回到首页**。
- 一旦回到首页，又回到公网 Navbar，没有 Dashboard 按钮。

---

## 三、下阶段修改任务清单

### 任务 1：公网 Navbar 增加「Dashboard」入口（高优先级）

- **文件**：`components/layout/navbar.tsx`
- **内容**：
  - 仅在**已登录**时显示「Dashboard」链接，指向 `/[locale]/dashboard`。
  - 位置建议：放在「Games」之前，或紧接在 Games/Clubs/Rinks 一组之后、通知/Post Game 之前，与现有 `t('dashboard')` 文案一致。
- **验收**：登录后访问首页，顶栏可见「Dashboard」，点击进入 Dashboard 页。

---

### 任务 2：首页 Hero 按登录状态切换 CTA（高优先级）

- **文件**：`components/features/hero-section.tsx`
- **内容**：
  - 使用 Supabase client 或现有 auth 方式判断是否已登录（client 组件内 `getUser()` 或 hook）。
  - **已登录**：主 CTA 改为「Go to Dashboard」或「My Dashboard」→ `/[locale]/dashboard`；可保留「Find Games」为次要按钮 → `/[locale]/games`。
  - **未登录**：保持现有「Find Games Now」+「Get Started Free」。
- **验收**：未登录看到原有双按钮；登录后看到以 Dashboard 为主的 CTA。

---

### 任务 3：统一「进入应用」的语义（中优先级）

- **目标**：让「Dashboard」成为已登录用户从首页进入应用的唯一主入口，减少混淆。
- **可选调整**：
  - 公网 Navbar 的「Games」在已登录时是否改为「Find Games」并保持跳转 `/games`，或仅保留 Dashboard 作为「进入后台」入口，Games 仍作为功能入口，需产品确认。
  - 登录后跳转：维持 `/${locale}/games` 或改为 `/${locale}/dashboard`（若希望登录后先到总览再自行进 Games，可改为 dashboard）。
- **建议**：登录后跳转到 `/${locale}/dashboard`，与 Navbar/Hero 的「Dashboard」形成一致链条。

---

### 任务 4：Dashboard 布局内导航与公网 Navbar 的对应关系（中优先级）

- **现状**：Dashboard 内已有 Dashboard、Games、My Games、Rinks、Bookings、Clubs 等；公网 Navbar 有 Games、Clubs、Rinks。
- **优化**：
  - 确保两处「Games」「Clubs」「Rinks」指向同一路径（已基本一致）。
  - 公网 Navbar 已登录时：Dashboard 指向 `/dashboard`；Games/Clubs/Rinks 可保留，便于从首页直接进对应功能，或收起到「Dashboard」下的二级入口（视产品选择）。

---

### 任务 5：Footer 可选增加「Dashboard」链接（低优先级）

- **文件**：`components/layout/footer.tsx`
- **内容**：已登录时在 footer 增加「Dashboard」或「My Account」链接，与 Navbar 一致；未登录可不显示。
- **验收**：登录后 footer 可点击进入 Dashboard。

---

### 任务 6：各功能页内部按钮链条检查（中优先级）

- **范围**：Dashboard 下的 Games、My Games、Rinks、Bookings、Clubs、Profile、Notifications、Manage Rink、Book 等页面。
- **内容**：
  - 列表页的「新建 / 加入 / 预订」等主按钮是否指向正确页面（如 `/games/new`、`/book/[rinkId]`）。
  - 详情页的「返回列表」「编辑」「取消」等是否回到合理上一级。
  - 面包屑或「Back」是否一致使用 `router.back()` 或明确路径。
- **产出**：可列一张「页面 → 主要按钮 → 目标路由」表，便于后续统一改版。

---

### 任务 7：移动端与无障碍（建议）

- **Navbar**：新增 Dashboard 链接后，确保移动端菜单（若有）也包含该入口。
- **Dashboard 布局**：已有移动端折叠菜单，确认 Dashboard 项在移动端可见且可点。
- **焦点与 aria**：新加链接具备合理 `aria-label`，键盘可聚焦。

---

## 四、建议实施顺序

1. **任务 1**：公网 Navbar 增加 Dashboard（立刻解决「首页找不到 Dashboard」）。
2. **任务 2**：Hero 按登录状态切换 CTA（强化「登录后回首页」的体验）。
3. **任务 3**：登录后跳转改为 `/dashboard`（可选，与 1、2 形成统一心智）。
4. **任务 4**：梳理两套导航的对应关系并做小调整。
5. **任务 6**：各功能页按钮链条检查与表格化。
6. **任务 5、7**：Footer 与移动端/无障碍收尾。

---

## 五、涉及文件速查

| 文件 | 修改点 |
|------|--------|
| `components/layout/navbar.tsx` | 已登录时增加 Dashboard 链接 |
| `components/features/hero-section.tsx` | 按登录状态切换 CTA，已登录显示 Dashboard 入口 |
| `app/[locale]/(auth)/login/LoginClient.tsx` | 可选：登录成功跳转改为 `/dashboard` |
| `components/layout/footer.tsx` | 可选：已登录时增加 Dashboard 链接 |
| `app/[locale]/(dashboard)/layout.tsx` | 仅确认与公网 Navbar 路径一致，必要时微调文案/顺序 |
| 各 (dashboard) 子页面 | 任务 6：主按钮与返回逻辑检查 |

---

## 六、验收标准（简要）

- 已登录用户访问首页：能在顶栏和 Hero 明显看到「Dashboard」或等价入口，并成功进入 `/[locale]/dashboard`。
- 未登录用户：首页仍以「Find Games」「Get Started」为主，无 Dashboard 入口。
- 从登录页登录后：能进入 Dashboard 或 Games，且从首页再次进入应用时路径清晰、一致。
- 各功能页主要操作按钮指向正确、返回逻辑清晰，无死链或循环。

---

## 七、已完成修改记录（feat/nav-dashboard-and-cta）

| 任务 | 状态 | 修改摘要 |
|------|------|----------|
| 1. 公网 Navbar 增加 Dashboard | ✅ | 已登录时在顶栏左侧增加 Dashboard 链接（含 `aria-label`）；移动端在右侧增加可见的 Dashboard 入口 |
| 2. Hero 按登录状态切换 CTA | ✅ | 使用 Supabase 鉴权；已登录主 CTA「Go to Dashboard」→ `/dashboard`，次 CTA「Find Games」→ `/games`；未登录保持原双按钮；新增 `hero` 文案（en/fr） |
| 3. 登录后跳转统一 | ✅ | 登录成功由 `/${locale}/games` 改为 `/${locale}/dashboard` |
| 4. 两套导航对应关系 | ✅ | 已确认路径一致，无代码改动 |
| 5. Footer 增加 Dashboard | ✅ | 已登录时在 footer 导航中增加 Dashboard 链接，带 `aria-label` |
| 6. 功能页按钮链条 | ✅ | 修复 `clubs/new`：`router.push` 与 Cancel/成功跳转均使用 `withLocale`；移除重复无 locale 的顶栏，改为「Back to Clubs」链接；Bookings 空状态增加「Browse rinks to book」→ `/rinks` |
| 7. 移动端与无障碍 | ✅ | 新链接均带 `aria-label`；Navbar 移动端单独展示 Dashboard 入口 |
| **后续** 主页通知仅铃铛 | ✅ | 公网 Navbar 中通知入口去掉 “Notifications” 文案，仅保留铃铛图标 + 未读角标 |
| **后续** 导航视觉统一 | ✅ | Dashboard 顶栏与主页一致：`bg-[#18304B]`、同款 Logo 组件、相同链接/按钮样式、LocaleSwitcher、通知仅铃铛、底部渐变条；移动端同风格 |
