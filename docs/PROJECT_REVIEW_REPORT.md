# GoGoHockey 项目综述报告

**用途**：供其他 AI 及人员进行全局审查，对网站优化提升、尤其是功能完善提出意见建议。  
**版本**：2.0.0  
**更新日期**：2025-02

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
| 国际化 | next-intl | 支持 en、fr 等 |
| 表单 | react-hook-form + zod | - |
| UI 组件 | Radix UI、shadcn/ui 风格 | - |
| Toast | Sonner | - |
| 日期 | date-fns | - |
| 图表 | Recharts、Tremor | - |
| 支付（依赖已安装） | Stripe | 尚未接入业务流程 |
| 邮件 | Resend | 依赖已安装 |
| 数据请求 | @tanstack/react-query | 已安装，部分页面未使用 |

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
├── supabase/                 # Supabase 客户端
└── utils/                    # 工具函数、格式化
messages/                     # i18n 文案 (en.json, fr.json, zh.json, hi.json)
```

---

## 四、核心功能模块

| 模块 | 路径 | 功能简述 |
|------|------|----------|
| 首页 | `/` | Hero、最近比赛展示 |
| 登录/注册 | `/login`, `/register` |  Supabase Auth |
| Dashboard | `/dashboard` | 统计：开放比赛数、预订数、冰场数 |
| 比赛 | `/games` | 列表、筛选、发布、详情、编辑、感兴趣、评分 |
| 我的比赛 | `/my-games` | 我发布的、我感兴趣的 |
| 冰场 | `/rinks` | 列表、搜索、筛选、预订入口 |
| 冰场预订 | `/book/[rinkId]` | 选择日期时段、冲突校验、提交预订 |
| 我的预订 | `/bookings` | 预订列表、详情、取消 |
| 俱乐部 | `/clubs` | 列表、新建 |
| 通知 | `/notifications` | 列表、已读/未读、删除 |
| 个人资料 | `/profile` | 查看、编辑 |
| 冰场管理 | `/manage-rink` | 冰场信息维护（需权限） |

---

## 五、已完成的优化（概要）

详细记录见 [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)。摘要如下：

1. **冰场预订链接**：locale 感知，避免语言上下文丢失  
2. **提示方式**：Toast 替代 alert，提升体验  
3. **预订时间**：正确计算结束时间，禁止跨夜预订  
4. **冰场时段**：冲突检测、已占时段禁用、提交前二次校验  
5. **i18n**：Footer、Navbar、Rinks、Book、Dashboard 等使用 next-intl  
6. **Footer 链接**：Privacy、Terms、Contact 对应真实页面  
7. **通知徽章**：Navbar 显示未读数量  
8. **Bug 修复**：Navbar 中 `useCallback` 正确导入  

---

## 六、请重点审查的方向

### 6.1 功能完善

- [ ] **支付流程**：Stripe 已安装但未接入预订流程，应如何设计支付、退款、失败处理？  
- [ ] **权限与角色**：冰场管理、俱乐部管理等是否需要 RBAC？  
- [ ] **数据校验**：Supabase RLS、服务端校验是否充分？  
- [ ] **预订流程**：是否需增加确认邮件、取消规则、提醒逻辑？  
- [ ] **比赛匹配**：当前「感兴趣」流程是否满足需求？是否需自动匹配或推荐？  

### 6.2 用户体验

- [ ] **加载与错误**：是否需要统一 Loading/骨架屏/错误边界？  
- [ ] **表单体验**：是否需更明确的校验提示、字段级错误展示？  
- [ ] **移动端**：响应式、PWA 离线体验是否足够？  
- [ ] **无障碍**：aria、键盘导航、语义化标签是否完善？  

### 6.3 技术架构

- [ ] **数据请求**：是否全面采用 React Query 替代手写 `useEffect`？  
- [ ] **组件复用**：是否存在重复逻辑可抽离为 hooks 或共享组件？  
- [ ] **性能**：图片、长列表、懒加载等是否需要优化？  
- [ ] **SEO**：meta、sitemap、结构化数据是否需加强？  

### 6.4 国际化

- [ ] **覆盖范围**：Games、Clubs、Bookings、Notifications 等是否仍需补充 i18n？  
- [ ] **语言支持**：zh、hi 已存在但可能不完整，是否需要补齐或简化？  
- [ ] **日期/数字**：是否需要按地区格式化日期和货币？  

### 6.5 安全与合规

- [ ] **RLS 策略**：Supabase 行级安全是否覆盖全部敏感表？  
- [ ] **输入过滤**：XSS、注入等防护是否到位？  
- [ ] **隐私合规**：Cookie、GDPR 等是否需要专门处理？  

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
【建议】在预订成功后可增加邮件确认
【优先级】中
【位置】app/[locale]/(dashboard)/book/[rinkId]/page.tsx
```

---

## 八、相关文档

- [MODIFICATION_PLAN.md](./MODIFICATION_PLAN.md)：完整修改方案（含 UI 视觉优化）  
- [CHANGELOG_IMPROVEMENTS.md](./CHANGELOG_IMPROVEMENTS.md)：详细修改记录  
- [README.md](../README.md)：项目说明与运行方式  
- [docs/README.md](./README.md)：文档索引  

---

*本报告用于项目全局审查，欢迎对网站优化与功能完善提出意见建议。*
