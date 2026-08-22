# Day 9 Natural-Finish Investigation

## User concern

The full forest appears before the `Mature.` completion message, so users can feel compelled to keep expanding after the visual payoff is already present.

## Measurement

At Day 9 progress `0.64`, the forest reads as fully revealed in the mobile scene, while the shared completion trigger still requires progress `0.999`. The remaining gesture work therefore has no visible purpose.

## Proposed correction

Use a Day 9-specific completion threshold of `0.65`, keeping the existing swipe-reveal visual treatment unchanged. The completion message would arrive as the forest reaches its natural visual finish instead of after additional invisible progress.

## Validation

A fresh cache-busted build loaded successfully, ready for an actual outward-swipe completion check. Six short outward swipes reached progress `0.4780`; three additional moderate outward swipes crossed the new natural-finish threshold and produced the normal completed Day 9 state, rather than requiring progress `0.999`.
