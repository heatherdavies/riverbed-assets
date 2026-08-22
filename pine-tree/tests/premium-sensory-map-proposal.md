# Pine Tree Premium Sensory Map — Proposed First Release

## Design intent

The sensory layer should make the user feel more present in the forest, not more aware of an interface. It remains **off until the user chooses Sound On**, begins only after a user interaction so mobile browsers permit playback, and stays intentionally quiet. Haptics should confirm moments of meaning rather than fire constantly beneath every finger movement.

The existing controls remain simple: **Sound Off / On**, and **Haptics Off / Subtle / On**. Reduced Motion continues to govern visual motion only; it does not automatically remove sound or haptics selected by the user.

## Optional ambient soundscape

Three long-form, seamless woodland ambiences would cover the journey. Each is instrumental and environmental, with no melody, beat, narration, or vocals. A scene change crossfades the appropriate ambience over roughly 1.2 seconds; Sound Off fades the active ambience away rather than cutting it abruptly.

| Journey range | Ambience | Forest character |
|---|---|---|
| Days 1–3 | **Root & Soil** | Deep, open pine-forest air; a barely audible low wind in needles; very distant earth texture; sheltered and still. |
| Days 4–6 | **Trunk & Bough** | Slightly brighter moving air through branches; occasional distant wood resonance; spacious mid-canopy perspective. |
| Days 7–9 | **Weather & Vista** | Wide, cool wind above the canopy and softened distant woodland air; a little more openness as the journey matures, never stormy or cinematic. |

The default mix should sit well below the visual experience—more like an atmosphere the user gradually notices than background music. Each generated clip would be around 120 seconds, with matching starts and ends so loop restarts are unobtrusive. The clips would be generated with no percussion, no beat, no birdsong foreground, no melodic lead, and no vocals.

## Meaningful interaction sound

The current generic oscillator tone would be replaced by a tiny semantic palette. These sounds are short, soft, and only fire at interaction milestones, not every pointer move.

| Moment | Sound treatment |
|---|---|
| First meaningful contact | A nearly inaudible, warm wood-and-air acknowledgement. |
| Day 1 planting | A low, softened earth-settling resonance when the seed is planted. |
| Day 2 root path / Day 4 trunk / Day 5 coil | A restrained woody harmonic only as a new section of the form is meaningfully reached. |
| Day 3 clearing / Day 6 branching / Day 8 details | A light, dry natural texture as the user reveals something previously concealed. |
| Day 7 weathering | A brief airy lift when the canopy has visibly responded. |
| Day 9 full opening | A slow, luminous forest-air resolve, held beneath the completion card. |

## Haptic map

Haptic feedback becomes less frequent and more intentional. **Subtle** uses a single quiet tap for confirmations; **On** is a little more pronounced, but never a buzz-heavy pattern.

| Day or event | Haptic behavior |
|---|---|
| Day 1 | No vibration during the hold; one grounded pulse only when planting completes. |
| Day 2 | One small pulse when the taproot’s lower endpoint is reached. |
| Day 3 | One soft pulse when the seedling is fully revealed. |
| Day 4 | One measured pulse when the trunk reaches its upper visible form. |
| Day 5 | Four very light landmark pulses as the coil crosses each visible turn; one soft resolve at the top. |
| Day 6 | One light pulse when a new branch is genuinely completed, never for stray touches. |
| Day 7 | One low pulse when the canopy reaches its fullest sway. |
| Day 8 | One distinct light double-pulse for each of the five found details. |
| Day 9 | A calm two-part arrival pulse only as the forest fully opens and “Mature.” settles. |
| All completion cards | No additional buzz on top of a day-specific completion signal. |

## Accessibility and future module contract

The layer remains optional. Sound never starts unprompted, a Sound Off selection persists, and haptic events are suppressed entirely when Haptics is Off. The implementation will use a compact semantic event map—such as `plant`, `root-arrive`, `reveal`, `branch`, `detail-found`, and `mature`—rather than binding effects directly to browser gestures. This makes the same asset map and event contract portable to the future Expo module.

## Proposed contained scope

This first release includes the three ambience clips, smooth sound crossfades, the semantic interaction palette, and the refined haptic map above. It deliberately excludes spoken guidance, music, achievements, journaling, and any new controls beyond the existing Sound and Haptics settings.
Validation: the fresh build opened with Sound Off and no ambient playback. Enabling Sound On directly from the first-day screen changed the control to Sound On and initiated only `root-and-soil-ambience.mp3`.
Validation refinement: updated ambience playback so crossfade animation changes only volume and pausing state; direct playback now begins once per newly active ambience source rather than repeatedly during the fade.
Validation: with Sound On, beginning the Day 1 ritual triggered the early forest ambience only after the user pressed Begin. The Day 1 veil and action state remained visually unchanged.
Validation: after one Day 1 start, changing to Day 4 added exactly one `trunk-and-bough-ambience.mp3` playback request and changing to Day 7 added exactly one `weather-and-vista-ambience.mp3` request. No repeated play requests occurred during the transitions.
Validation: a Day 8 target touch preserved its 20% progress behavior and emitted the intended light double pattern `[10, 34, 10]` in Subtle mode. Day 9 reached normal completion and emitted a calm two-part arrival pattern `[22, 64, 16]` after the opening settled.
