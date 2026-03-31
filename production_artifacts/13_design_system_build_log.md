# 13 Design System Build Log

## Summary

Phase 2 turned `packages/ui` into a real shared design-system package instead of a token stub.

## Implemented

- normalized shared tokens for:
  - color
  - typography
  - spacing
  - radius
  - elevation
  - motion
- built shared web primitives for:
  - buttons
  - icon buttons
  - cards
  - badges
  - chips
  - fields
  - inputs
  - textareas
  - selects
  - toggles
  - section shells
  - sheets
  - dividers
  - empty/loading/error state panels
- added native theme helpers for React Native surfaces
- promoted portfolio theme presets into canonical shared ownership and re-exported them through `packages/ui`

## Key Decisions

- Figma visuals were used as reference only. No generated Figma code was copied into production packages.
- Portfolio theme presets now live in shared domain ownership so API and clients use the same theme truth.
- Operational shell primitives and public portfolio composition remain separate. `packages/ui` contains primitives, while portfolio page composition stays in app code.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Notes

- The shared packages now emit fresh runtime JS instead of relying on stale `dist` artifacts.
- The final runtime fix was:
  - explicit `noEmit: false` in shared package build tsconfigs
  - explicit `.js` relative export/import specifiers for built ESM compatibility

## Remaining Design-System Gaps

- tabs and richer navigation primitives are still page-local rather than packaged
- motion remains intentionally light in this slice
- native component primitives are still thinner than web primitives
