# Design System — KINERA

**Document ID:** `KIN-DOC-08-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines concrete design tokens, typography hierarchy, HUD glassmorphism/panel rules, chart palettes, and WCAG 2.1 AA accessibility constraints (`KIN-3D-004`–`KIN-3D-005`).

## 2. Design Tokens & Typography

| Token Group | Token Name | Value / Rule |
| :--- | :--- | :--- |
| **Backgrounds** | `--bg-canvas`, `--bg-panel`, `--bg-elevated` | `#0E1116`, `rgba(21,26,34,0.88)`, `#1C232E` |
| **Text** | `--text-primary`, `--text-secondary`, `--text-muted` | `#F1F5F9`, `#A8B3C5`, `#7B879B` (all >= 4.5:1 AA on dark surfaces) |
| **Accents** | `--accent-cyan`, `--accent-blue`, `--accent-amber` | `#00E5FF`, `#3B82F6`, `#F59E0B` |
| **Typography** | Display / UI / Technical Mono | `Inter` / `Space Grotesk` (headings), `Inter` (UI), `JetBrains Mono` (canonical IDs, telemetry values, tabular alignment) |
| **Chart Series** | Multi-Config Overlay Colors | `Cyan (#00E5FF)`, `Blue (#3B82F6)`, `Amber (#F59E0B)`, `Emerald (#10B981)`, `Violet (#A855F7)`, `Coral (#FB7185)`, `Silver (#CBD5E1)` — paired with distinct line dash patterns for colorblind accessibility |

## 3. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-004** | Every numeric gauge, slider readout, and table cell shall use `tabular-nums` monospace rendering with explicit units displayed adjacent to every value. |
| **KIN-3D-005** | HUD sidebars and inspector drawers shall preserve >= 60% unobstructed central 3D/chart viewport on desktop and collapse cleanly into accessible drawers on tablet/mobile. |

## 4. Cross-References

- [`VISUAL_IDENTITY.md`](VISUAL_IDENTITY.md)
- [`../01-product-specification/APPLICATION_STRUCTURE.md`](../01-product-specification/APPLICATION_STRUCTURE.md)
- [`../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md)
