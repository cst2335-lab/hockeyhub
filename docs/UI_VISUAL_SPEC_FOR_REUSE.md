# GoGoHockey UI Visual Spec — For Reuse in Other Projects

> **Purpose:** Give this doc to Cursor (or any AI) in another project to replicate the same visual language. Copy the sections you need.

---

## 1. Design philosophy

- **Trust & clarity:** Deep blue palette for a professional, sporty feel.
- **Hierarchy:** Dark blue for nav/hero, primary blue for actions and headings, secondary blue for accents and links.
- **Contrast:** White text on dark blue; dark text on light backgrounds; secondary blue for hover and focus.

---

## 2. Color palette

| Role | Hex | Usage |
|------|-----|--------|
| **Dark (nav, hero base)** | `#18304B` | Header/nav background, hero start, footer accents |
| **Primary** | `#0E4877` | Buttons, headings, icons, borders (light mode) |
| **Secondary (accent)** | `#64BEF0` | Links, hover, focus ring, badges, section titles |

**Tailwind / CSS variable mapping:**

- `gogo-dark` → `#18304B`
- `gogo-primary` → `#0E4877`
- `gogo-secondary` → `#64BEF0`

---

## 3. CSS variables (paste into `globals.css` or equivalent)

```css
:root {
  --gogo-primary: 207 79% 26%;    /* #0E4877 */
  --gogo-secondary: 201 82% 67%;  /* #64BEF0 */
  --gogo-dark: 214 52% 19%;       /* #18304B */
}
```

If using Tailwind with HSL:

```css
/* Tailwind theme extend */
colors: {
  gogo: {
    primary: '#0E4877',
    secondary: '#64BEF0',
    dark: '#18304B'
  }
}
```

Use in classes: `bg-gogo-primary`, `text-gogo-secondary`, `border-gogo-dark`, `hover:bg-gogo-primary`, `focus-visible:ring-gogo-secondary`.

---

## 4. Hero / section gradients

- **Full hero:** `linear-gradient(to bottom, #18304B, #0E4877, #64BEF0)` (dark → primary → accent).
- **Shorter hero (e.g. page title bar):** `linear-gradient(to bottom, #18304B, #0E4877)`.
- **Overlay on image:** `#18304B` at 85% opacity over background image.

Use white text on these gradients. Optional: subtle pulse dot in secondary, e.g. `bg-[#64BEF0]`.

---

## 5. Buttons

- **Primary (main CTA):** White background, `#18304B` text, hover light gray. Border radius pill or `rounded-lg`. Focus ring: `#64BEF0`.
- **On dark (hero/footer):** White bg, `#18304B` text, shadow. Hover: `white/90`.
- **Secondary / outline:** Border and text `gogo-primary` (light) or `gogo-secondary` (dark). Fill on hover with same color, text white.

---

## 6. Links and interactive text

- Default link on light: `text-slate-600` (or neutral), hover `text-[#0E4877]`.
- On dark or in footer: white, hover `text-[#64BEF0]`.
- Section titles / footer column titles: `#64BEF0`.

---

## 7. Navigation bar

- Background: `#18304B` (gogo-dark).
- Nav items: light gray text (e.g. `text-sky-100`), hover white, active white with slightly lighter blue bg (e.g. `bg-sky-900/90`).
- Logo: no extra tint; keep contrast on dark bar.
- Sticky, with border and shadow for separation.

---

## 8. Cards and surfaces

- Cards: white (light) / dark slate (dark mode), border `border-slate-200` (light) or `border-slate-700` (dark).
- Hover: border or ring in primary/secondary, e.g. `hover:border-gogo-secondary`.
- Icon wrappers: small rounded square, `bg-gogo-primary` or `bg-[#0E4877]`, white icon.

---

## 9. Selection and focus

- Text selection: `bg-[#64BEF0]/30` and `text-[#18304B]` (light); dark mode adjust for contrast.
- Focus ring: `ring-2 ring-[#64BEF0]` (or `ring-gogo-secondary`) with offset for buttons/inputs.

---

## 10. Cursor prompt (copy for another project)

Use this when asking Cursor to apply the spec:

```
Apply this UI visual spec to the app:

- Colors: dark #18304B (nav/hero), primary #0E4877 (buttons, headings), accent #64BEF0 (links, hover, focus).
- Add CSS variables --gogo-primary, --gogo-secondary, --gogo-dark and Tailwind theme colors gogo.primary, gogo.secondary, gogo.dark.
- Nav bar: background #18304B, light text, white on hover/active.
- Hero sections: gradient from #18304B to #0E4877 (optionally to #64BEF0); white text.
- Primary buttons: white bg, #18304B text, focus ring #64BEF0.
- Links: default neutral, hover #0E4877 (light) or #64BEF0 (on dark).
- Cards: white/dark surface, border; hover border or ring in primary/accent.
- Keep selection and focus rings using #64BEF0 for accessibility.
```

---

*Source: GoGoHockey Ottawa. Adjust hex codes if you need a different shade.*
