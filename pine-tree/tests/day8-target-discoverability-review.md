# Day 8 Target Discoverability Review

## Current presentation

Day 8 shows five small, low-contrast circles over a close-up pine scene: one needle cluster, two cone clusters, and two sap points on the trunk.

## Finding

The circles preserve the natural photograph but are easy to miss against dark bark, needles, and cone texture. The opening instruction identifies categories rather than showing the user where to begin, so target discovery may feel like searching rather than a guided observation ritual.

## Design objective

Add a subtle first-touch guidance treatment that makes all five details discoverable without using labels, leader lines, or an instructional diagram.

## Implementation validation

The fresh cache-busted Day 8 guidance build loaded, entered the Day 8 practice state, and ran the first 1.5 seconds of the staggered hint sequence without interaction errors.
The staggered guidance is visibly present across all five Day 8 locations: one needle cluster, two cones, and two sap points. The warm rings and halos remain small enough to preserve the close-up photograph rather than creating a labeled diagram.
The existing Day 8 touch map remains unchanged: the rendered target positions were calculated successfully for the needle cluster, two cones, and two sap points before direct interaction verification.
A production pointer event was sent to the calculated needle-cluster target. Progress advanced to 20%, and the touched needle target became the distinct revealed glow while the remaining four targets stayed available with their guidance treatment.
