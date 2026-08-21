# Day 3 to Day 4 Transition Investigation

## Scope

This investigation is limited to the handoff from the completed Day 3 `First light.` card to the Day 4 `Developing Trunk` introduction.

## Finding

The completed Day 3 flow invokes the same shared `setDay(4)` path used by direct navigation. That path updates Day 4 state, text, and introduction immediately, then replaces the shared base scene image source. A delayed-load simulation confirmed the overlap: while the Day 4 source was deliberately held, the application reported Day 4 and displayed its introduction, but the visible base source was still `day-03-seedling-reveal.png`.

## Proposed contained correction

Extend the existing image-ready transition gate to the Day 3-to-Day 4 handoff. The completed Day 3 card will remain on screen while the Day 4 image preloads and decodes. Day 4’s image and introduction will then activate together, avoiding Day 4 text over the Day 3 scene and avoiding a hard image swap. No Day 4 gesture behavior or other transition will change.

## Validation

A fresh build loaded successfully with the cache-busted Day 4 transition-gate script revision, ready for delayed-load and production-control validation. With a deliberately held Day 4 preload, a Day 4 request left the application and base scene on Day 3. Releasing the image-ready event then switched both the scene and application state to Day 4 together.

The actual `CONTINUE TO DEVELOPING TRUNK` control was then activated from the completed Day 3 card. The settled scene showed the Day 4 young-trunk photograph and the `Developing Trunk` introduction together, with no Day 3 image lingering beneath it.
