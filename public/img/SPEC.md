# Public Image Specification / 图片资源规范

## Directory Structure / 目录结构

```
public/img/
├── SPEC.md          # This file / 本规范文件
├── logo/            # Brand logo assets / 品牌 Logo
│   ├── icon.svg     # Icon only (nav, favicon) / 纯图标（导航栏、favicon）
│   └── logo.svg     # Full logo with text / 完整 Logo 含文字
├── rinks/           # Rink card placeholders / 冰场卡片占位图
│   ├── placeholder.svg
│   ├── official.svg
│   ├── imported.svg
│   └── community.svg
├── icons/           # PWA & favicon / PWA 与网站图标
│   ├── icon.svg     # Favicon (SVG) / 网站图标
│   ├── icon-192.png # PWA 192×192
│   └── icon-512.png # PWA 512×512
├── patterns/        # Background patterns / 背景图案
│   └── grid.svg     # Grid pattern for hero/game-card / 网格背景
└── legacy/          # Unused Next.js defaults / 未使用的 Next 默认资源
    ├── vercel.svg
    ├── next.svg
    ├── globe.svg
    ├── file.svg
    └── window.svg
```

## Usage Paths / 引用路径

| Asset | Path | Used By |
|-------|------|---------|
| Logo icon | `/img/logo/icon.svg` | `Logo` component (navbar, hero, login, footer) |
| Favicon | `/img/icons/icon.svg` | `layout.tsx` metadata |
| PWA icon 192 | `/img/icons/icon-192.png` | `manifest.json`, `layout.tsx` |
| PWA icon 512 | `/img/icons/icon-512.png` | `manifest.json` |
| Grid pattern | `/img/patterns/grid.svg` | `hero-section`, `game-card` |
| Rink placeholders | `/img/rinks/*.svg` | `rinks` card image fallback/auto layers |

## Brand Colors (GoGoHockey) / 品牌色

- Primary: `#0E4877`
- Secondary: `#64BEF0`
- Light: `#C7EBFC`

## Icon Generation / 图标生成

1. Open `public/create-icons.html` in browser
2. Right-click each canvas → Save image as
3. Save to `public/img/icons/`:
   - `icon-192.png` (192×192)
   - `icon-512.png` (512×512)

## Rules / 规范

1. **New images** → Place in appropriate `img/` subfolder
2. **Logo** → Use `/img/logo/icon.svg` (icon) or `/img/logo/logo.svg` (full) only
3. **public/ root** → Only: `manifest.json`, `sw.js`, `create-icons.html`, `img/`
4. **Legacy** → `vercel.svg`, `next.svg`, `globe.svg`, `file.svg`, `window.svg` remain in `public/` root (Next.js defaults); do not reference in app code
