# Tencil Brand Guidelines

## Logo Variants

| Context | Format | Size | Color | File |
|---------|--------|------|-------|------|
| Full logo (docs, hero) | SVG / PNG | Any | Full color | `assets/logo-full.svg` |
| Icon (plugin, favicon) | SVG / PNG | 16x16, 32x32, 64x64, 128x128 | Full color + monochrome | `assets/logo-icon.svg` |
| ASCII (CLI header) | Text | N/A | Monochrome | `assets/logo-ascii.txt` |
| Monochrome (print, grayscale) | SVG | Any | Black/white | `assets/logo-mono.svg` |
| Badge (README shields) | SVG | 64px | Full color | `assets/badge-tencil.svg` |

## CLI Assets

| Element | Where | Format | File | Status |
|---------|-------|--------|------|--------|
| Logo header | `tencil start`, version output | ASCII text | `cli/assets/logo.txt` | Not yet designed |
| Spinner | Progress indicators | Unicode | `cli/assets/spinners.ts` | Not yet designed |
| Status icons | Command output (✓, ✗, ⚠, ℹ) | Unicode | `cli/src/logger.ts` | Defined |
| Color palette | Terminal output | ANSI codes | `cli/src/config.ts` | TBD |

## Plugin Assets (Penpot, VSCode, JetBrains, etc.)

| Plugin | Icon Size | Formats | Where | File |
|--------|-----------|---------|-------|------|
| **Penpot Plugin** | 128x128, 512x512 | PNG | Penpot plugin marketplace | `plugins/penpot/assets/icon.png` |
| **VSCode Extension** | 128x128 | PNG | VSCode marketplace | `extensions/vscode/assets/icon.png` |
| **JetBrains Plugin** | 240x240 | PNG | JetBrains marketplace | `extensions/jetbrains/assets/icon.png` |
| **Figma Plugin** (future) | 128x128 | PNG | Figma community | `extensions/figma/assets/icon.png` |

## Web & Marketing

| Asset | Where | Format | Size | File |
|-------|-------|--------|------|------|
| Favicon | studio.tencil.dev | ICO / PNG | 16x16, 32x32, 48x48 | `web/public/favicon.ico` |
| Logo (light) | Docs, website | SVG | Responsive | `web/assets/logo-light.svg` |
| Logo (dark) | Dark mode | SVG | Responsive | `web/assets/logo-dark.svg` |
| Hero illustration | Landing page | PNG / SVG | 1200x600 | `web/assets/hero.svg` |
| "Made with Tencil" badge | User README shields | SVG | 64x20 | `web/assets/badge-made-with.svg` |
| `.tencil` file badge | File format | SVG | 64x20 | `web/assets/badge-tencil-format.svg` |

## Typography

| Use | Font | Weight | Color | File |
|-----|------|--------|-------|------|
| Headings | TBD | Bold | Primary | TBD |
| Body | TBD | Regular | Text | TBD |
| Monospace (code) | Fira Code / Source Code Pro | Regular | Neutral | System font |

## Color Palette

| Name | Hex | Use | Light Mode | Dark Mode |
|------|-----|-----|-----------|-----------|
| Primary | TBD | Logo, highlights, CTAs | TBD | TBD |
| Secondary | TBD | Accents, badges | TBD | TBD |
| Text | TBD | Body text | TBD | TBD |
| Background | TBD | Canvas | TBD | TBD |
| Success | #10B981 | Status icons (✓) | — | — |
| Error | #EF4444 | Status icons (✗) | — | — |
| Warning | #F59E0B | Status icons (⚠) | — | — |
| Info | #3B82F6 | Status icons (ℹ) | — | — |

## Status Icon Set

| Icon | Unicode | Use | Meaning |
|------|---------|-----|---------|
| ✓ | U+2713 | Success | Operation completed |
| ✗ | U+2717 | Error | Operation failed |
| ⚠ | U+26A0 | Warning | Caution needed |
| ℹ | U+2139 | Info | Informational |
| ➜ | U+279C | Arrow | Next step |
| ⟳ | U+27F3 | Spinner | Loading |

---

## Deployment Checklist

- [ ] Logo finalized (full color, icon, ASCII, mono variants)
- [ ] Spinner animation chosen and coded
- [ ] Color palette locked
- [ ] CLI header ASCII art generated
- [ ] README badges generated
- [ ] Penpot plugin UI mockup designed
- [ ] VSCode extension icon added to manifest
- [ ] Favicon generated for web
- [ ] Brand guidelines documented (this file, completed)
