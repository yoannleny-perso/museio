# 07 — Figma Handoff Instructions

## What Antigravity should do first

Treat the Figma-generated code as a **visual and interaction seed**.

It must perform these tasks before coding the production app:

1. inventory routes, views, and overlays
2. inventory tokens, colors, spacing, radius, shadows, and motion styles
3. inventory reusable components and anti-patterns
4. identify mock data and fake business logic
5. identify architecture assumptions that should not survive

## What to extract

### Design tokens
- color scales
- typography
- spacing
- radius
- elevation
- motion durations and easing

### Component primitives
- buttons
- inputs
- fields
- tabs
- badges
- cards
- empty states
- bottom sheets
- nav bars
- section wrappers
- finance charts
- portfolio media blocks

### Public-vs-operational split
Antigravity must explicitly separate:
- operational app components
- portfolio/public components

These should not be one giant shared style bucket.

## What to reject or rewrite

- duplicated inline styles
- hardcoded routes
- magic-number business rules
- fake asynchronous loaders that hide real missing state design
- UI-owned payment logic
- non-typed forms
- seed-only shortcuts used to fake interactivity

## Target outcome

The production system should feel visually close to the Figma seed where the seed is excellent, but should be cleaner, more coherent, more accessible, and more maintainable.

## Required artifact

Antigravity must write `production_artifacts/02_design_system_extraction_plan.md` describing:
- tokens kept
- tokens revised
- components kept
- components rewritten
- public portfolio visual language strategy
- finance visual language strategy
