# Day 3 Completion Investigation

## Reported symptom

The Day 3 soil brushes away successfully, but the practice can remain active without showing the completed state after the user has visually finished clearing it.

## Finding

The visual brush uses a large, soft radius (`0.065`) while completion counts a rigid 11-by-9 rectangular grid of 99 cell centres. The visual dirt footprint is irregular and does not occupy every corner of that rectangle. As a result, a natural finger sweep can make the visible soil appear clear while missing a small number of accounting-only cells; the completion trigger requires 99.9% progress and therefore never queues the completion card.

## Proposed contained correction

Set Day 3 completion at 88 registered cells (about 89% of the existing 99-cell accounting grid), which matches a clear-looking set of finger passes across the actual soil footprint. Retain every brush mark as the visual source of truth even after completion, so the correction does not automatically erase any soil the user did not touch. No other day's threshold or interaction would change.

## Validation

A natural nine-row finger-style sweep across the visible soil footprint reached a progress value of `1` at the new target, where the prior 99-cell target stalled at 88.9%. After the interaction settled, the `First light.` completion card appeared and the Day 3 completion marker was recorded. The fresh public preview is available on port 4236.
