# Day 9 Background-Reveal Review

## Current behavior

The full mature-tree-and-forest photograph is visible immediately when Day 9 opens. The outward swipe currently adds only a faint light wash and a thin gold gesture curve; it does not reveal the forest photograph itself.

## Design assessment

Because the instruction says to reveal the wider forest landscape, showing the whole forest before the first swipe weakens the final ritual’s cause-and-effect. A swipe-gated reveal would make the final expansion feel earned and align the visual result with the instruction.

## Approved treatment

The user approved a smooth, swipe-gated forest reveal. The full scene image remains loaded underneath a dark, centre-opening canvas veil; this avoids any blank or delayed image state. The fresh cache-busted build loaded successfully before visual validation. At Day 9 opening, the mature pine is visible through a compact, soft circular opening while the wider forest remains held behind the veil.

Four outward swipes advanced Day 9 to `0.5694` progress and visibly expanded the forest beyond the tree, confirming the foreground-to-landscape cause-and-effect. Four additional outward swipes reached progress `1`; the complete forest view remained visible and the normal `Mature.` completion card appeared.
