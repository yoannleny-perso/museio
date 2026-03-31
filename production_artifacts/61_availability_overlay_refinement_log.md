# 61 Availability Overlay Refinement Log

## Summary

Extended availability by layering imported external busy blocks on top of creator-defined rules and existing booking holds.

## What Changed

- public availability generation still comes from the existing booking availability engine
- imported external busy blocks now persist with provider/account metadata
- creator-facing calendar workspace exposes a conflict center baseline
- public booking continues to expose only safe windows

## Conflict Center Coverage

- manual unavailable blocks
- vacation blocks
- imported external calendar busy blocks
- active booking holds

## Public Safety Rule Preserved

Public `/:handle/book` availability does not expose:

- raw external event titles
- provider source labels
- raw provider statuses
- internal metadata

It only exposes the resulting safe availability windows.

## Assumptions

- overlay subtraction remains the correct model for external conflicts
- creator conflict visibility should be richer than public visibility

## Risks

- future recurring events and timezone edge cases will need deeper sync logic
- public-safe slot exposure depends on continuing to keep raw conflicts out of public contracts

## Approval Gates

- approve external blocks as overlays, not engine replacement
- approve conflict center as a separate creator-facing surface
