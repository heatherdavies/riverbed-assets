# Continuation and Day 9 Investigation

## Continuation delay

All forward handoffs now correctly wait for the next scene image to load and decode. The current implementation begins that work only after the user presses the completion-card continuation control. On a cold Safari image cache, the completed card consequently appears to ignore the press while the new photograph is fetched and decoded.

## Day 9 visual finish

The current Day 9 completion threshold is 65% progress. At a measured 48% progress, the forest already reads as fully open in the scene. The remaining 17% produces no meaningful visible change, requiring extra outward gesture after the visual payoff. The reveal rendering also maps raw progress directly to a large radial opening, causing the visible opening to reach the image bounds before completion.

## Contained correction proposed

Warm the next day image as soon as each current day begins, then reuse the warmed decode promise at continuation. Preserve the safe image-ready gate, but give the completion button an immediate `PREPARING NEXT DAY…` state only if a cold image is still pending.

Set the Day 9 natural finish at 50% and normalize the radial forest reveal against that target so the forest finishes opening at the same instant that `Mature.` becomes available. This removes the invisible final gesture while retaining the existing outward-swipe ritual.
The fresh correction build set Day 9 to 48% progress immediately below the proposed 50% natural-finish threshold. A visual check of this state is required to confirm whether the forest still appears fully open before the trigger; if so, the threshold will be tightened to the exact measured visual finish rather than leave any invisible residual gesture.
After tightening the natural finish to 48% and normalizing the visible reveal to that threshold, three guided Day 9 advances reached the completion state directly at the visually open forest. No additional invisible expansion was required.
A Day 1 → Day 2 transition was requested after the Day 2 image had been warmed in the background. The scene advanced within the short 80 ms verification window, confirming that the prewarm is reused by the existing image-ready gate rather than introducing a new wait at the continuation control.
