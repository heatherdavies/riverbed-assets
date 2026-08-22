# Day 5 Natural-Finish Investigation

## User concern

After tracing the coil to its visible top, users can still need to make extra movements around the endpoint before the completion message appears.

## Measurement

A controlled trace following the visible coil from start to 90% of its path reached progress `0.6758`. Following the entire visible coil to its exact endpoint reached only `0.7445`, while the shared completion trigger still requires `0.999`.

## Root cause

Day 5 uses raw finger-travel distance as completion progress. The visual coil path is shorter than one unit of that distance model, so even a correct full trace leaves roughly 25% invisible progress unmet.

## Proposed correction

Set a Day 5-specific completion threshold of `0.74`, allowing the completion message to appear when the user finishes the visible coil. The coil drawing, pace, and gesture path would remain unchanged.

## Validation

A full controlled trace to the exact visible coil endpoint now reaches the normal completed Day 5 state without additional endpoint movement. The settled `Strengthened.` completion card and `CONTINUE TO BRANCHING OUT` control were visible immediately after the trace.
