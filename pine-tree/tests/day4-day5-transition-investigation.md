# Day 4-to-Day 5 Transition Investigation

## Finding

The shared `setDay()` image-ready gate currently covers only Day 2 → Day 3 and Day 3 → Day 4. The Day 4 → Day 5 transition is not included.

## Effect

When Day 4 completes, Day 5 state and its opening can activate immediately while the new Day 5 photograph is still loading. The browser may therefore hold the Day 4 trunk scene visibly underneath the incoming Day 5 state, which creates the same stale-image overlap previously corrected for earlier transitions.

## Contained correction

Extend the existing image-ready gate to Day 4 → Day 5 only. The completed Day 4 card remains visible while Day 5’s photograph loads and decodes; Day 5’s scene and opening activate together after the new image is ready.

## Validation

The fresh build reached the actual completed Day 4 state through the guided path, ready for testing with the production continuation control.
The actual `CONTINUE TO STRONGER STRUCTURE` control was used from a completed Day 4 state. Day 5’s photograph and reflective opening arrived together, with no Day 4 trunk image visible beneath the Day 5 state.
