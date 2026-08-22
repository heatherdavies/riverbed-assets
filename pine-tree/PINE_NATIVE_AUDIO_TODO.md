# Pine Tree — Native Forest Audio TODO

**Status:** Deferred by product decision. The browser review is intentionally silent until a genuine non-musical ambience source is chosen for the native iOS and Android HomeFlow experience.

## Product intent

The intended layer is not music. It should be a quiet, deep, slow ebb-and-flow of conifer forest air: subtle enough to support the ritual without becoming a foreground composition.

> The forest should feel present, not performed.

## Required audio qualities

| Required | Excluded |
|---|---|
| Deep, warm, slow natural ebb and flow | Flute, woodwind, piano, strings, guitar, brass, or synth lead |
| Diffuse pine-wind or forest-air texture | Drums, percussion, beat, rhythm section, melody, chords, or tonal pad |
| Low density with long periods of space | Foreground musical events, vocal texture, chanting, or obvious birdsong motifs |
| Seamless loop behavior with gentle scene crossfades | Abrupt loop seams, short repeating phrases, or rising musical tension |

## Source and licensing path

The generated music experiments were rejected because their audio audits found flute, piano, melody, chord progressions, or tonal pads despite exclusion prompts. Do **not** re-enable them.

| Priority | Future task | Acceptance criterion |
|---|---|---|
| 1 | Select a real pine-wind field recording for a review proof of concept. | Audibly non-musical; no foreground instrument; source terms recorded. |
| 2 | Clear the exact asset for mobile-app distribution or commission a recording. | Distribution permission is documented and suitable for HomeFlow production use. |
| 3 | Edit a long original recording into a seamless loop with two or three density variants. | No noticeable loop seam; low-volume listening remains calm for several minutes. |
| 4 | Implement native playback in the Expo Pine Tree module. | Sound starts only after user action, follows the parent preference, crossfades by day range, and stops immediately on exit. |
| 5 | Test on physical iOS and Android devices. | No autoplay violation, unwanted looping artifacts, or foreground musical character. |

## Candidate sources to vet later

1. [Pixabay pine forest sound-effects catalogue](https://pixabay.com/sound-effects/search/pine%20forest/) — confirm the terms of the exact selected asset before any production use.
2. [Bensound/Density Audio: Wind On Pine Trees In a Forest Ambience](https://www.bensound.com/sound-effects/wind-on-pine-trees-in-a-forest-ambience) — purchase the appropriate production licence if selected.
3. A commissioned original conifer-forest field recording — preferred for ownership and precise creative control.

## Current review state

The browser review should contain **no audio files, playback code, Sound controls, or musical interaction tones**. It remains a silent visual-and-tactile review surface until the native audio asset task is completed.
