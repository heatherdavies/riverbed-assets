# Day 3 Natural-Finish Investigation

## User concern

Day 3 eventually completes, but it can continue to ask for brushing after the dirt appears sufficiently clear to a user, which risks frustration.

## Measurement

Five broad, alternating finger-style sweeps across the visible soil footprint produced a visibly substantial reveal but only `0.5114` completion progress. A denser seven-sweep pattern reached only `0.7159`, despite covering the central visible soil area.

## Root cause

The present grid contains 99 cells, but only 58 of them contain visible soil alpha in the transparent dirt asset. The remaining 41 cells are blank space around the irregular soil shape. Day 3 currently counts all 99 cells, including invisible ones, so a user must brush well beyond visible dirt to reach the completion message. This is the confirmed reason the practice eventually completes but feels frustrating.

## Proposed correction

Count only the 58 cells that actually contain visible soil, and complete when 90% of those visible cells have been brushed. Continue to render every individual finger brush mark after completion, so no remaining visible soil is removed automatically.

## Validation

The same seven-pass natural sweep that previously stalled at `0.7159` now reached progress `1`. After the touch sequence settled, the `First light.` completion card appeared with the `CONTINUE TO DEVELOPING TRUNK` action.
