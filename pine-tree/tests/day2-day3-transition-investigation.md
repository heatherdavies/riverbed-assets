# Day 2 to Day 3 Transition Investigation

## Reported symptom

The user reports that the Day 2 photograph lingers visibly as Day 3 begins. The supplied iPhone Safari screen recording is `/home/ubuntu/upload/ScreenRecording_08-21-202613-38-21_1.mp4`.

## Scope

This investigation is limited to the handoff from the Day 2 root scene into the Day 3 seedling-and-soil scene. No other day or interaction behavior will be changed without approval.

## Finding

The recording shows the Day 3 introduction becoming visible at approximately 1.4 seconds while the prior Day 2 root photograph remains behind it. The Day 3 photograph then replaces it in a hard cut at approximately 1.57 seconds.

The cause is the shared base `#sceneImage` element. On a day change, its `src` is replaced immediately but its old decoded bitmap remains painted until the Day 3 source finishes loading. The current function updates the Day 3 text and introduction in the same synchronous call, so the user sees Day 3 UI over the stale Day 2 base image.

## Proposed contained correction

For the Day 2 to Day 3 handoff only, preload the Day 3 base scene and defer activating Day 3 UI until the new image has loaded. The old Day 2 completion card will remain on screen during that short preparation step; the Day 3 image and its introduction will then appear together. This removes both the overlap and the hard image flash without altering the Day 3 gesture, soil overlay, or any other day transition.

## Validation

With a deliberately held Day 3 preload, requesting Day 3 left the application on Day 2 and left the shared base image source set to `day-02-deep-anchor-match-endpoint.webp`. Releasing the simulated image-ready event then switched the application to Day 3 and set the base source to `day-03-seedling-reveal.png`. This confirms that Day 3 UI cannot activate over the stale Day 2 base scene.

The actual Day 2 guided interaction was also completed to make the production `CONTINUE TO FIRST LIGHT` button available for final activation testing. Activating it loaded the Day 3 seedling-and-soil scene together with the Day 3 introduction; the prior root photograph was not visible in the settled Day 3 state.
