# Clay Potter’s Wheel

This directory contains an **iOS 17+ native SwiftUI and SceneKit prototype** for the Earth experience. It is deliberately isolated from the current Expo/WebView water application so that it can become an Earth-native target or an Expo custom native view later without modifying the Water app’s runtime.

## Feature intent

The experience expresses the **Earth element** through measured, grounded interaction rather than a BTB compass treatment. A single finger shapes the vessel; two fingers provide a pinch-based compression/expansion gesture. The wheel takes time to accelerate and coast down, while progressive centering turns an irregular cross-section into a balanced rotational form.

| Layer | Implementation | Purpose |
| --- | --- | --- |
| Presentation | `PottersWheelView` | SwiftUI host with a quiet progress indicator and Centered confirmation. |
| Scene | `PotterySceneController` | SceneKit camera, PBR clay, wood wheel, soft shadows, interaction bridge, and display loop. |
| Clay | `PotteryMesh` | Rebuildable lathed mesh, per-ring radii, Laplacian smoothing, and asymmetry metric. |
| Motion | `WheelPhysics` | Fixed-step angular motion based on $\tau=I\alpha$ plus bounded centrifugal clay expansion. |
| Haptics | `ClayHapticController` | Core Haptics continuous feedback driven by gesture velocity and rotational imbalance. |
| Materials | `ClayTextureFactory` and `ClaySurface.metal` | Deterministic 2048px clay maps plus a Metal wet-sheen helper for future renderer migration. |

> **Prototype boundary:** The shipped scene uses SceneKit’s physically based lighting model and generated 2048px maps. `ClaySurface.metal` is a Metal helper library retained for a future custom renderer or RealityKit migration; it is not dynamically compiled by this SceneKit prototype.

## Add to an Xcode app

Create an iOS App target in Xcode with an **iOS 17.0** deployment target, then drag every Swift file in `Sources/` and `Resources/ClaySurface.metal` into the target. Add a `ClayPottersWheelView()` wherever the Earth app presents its interactive ritual. No third-party package is required.

```swift
import SwiftUI

@main
struct EarthApp: App {
    var body: some Scene {
        WindowGroup {
            ClayPottersWheelView()
        }
    }
}
```

The application must run on a physical iPhone for the intended tactile result. The simulator can render the scene but does not provide the device’s haptic hardware.

## Interaction model

| Gesture | Result | Haptic character |
| --- | --- | --- |
| One-finger vertical drag | Narrows or widens the nearest clay-height ring. | Continuous intensity follows drag speed. |
| Two-finger pinch | Compresses or expands the vessel radius around the touched height. | Wider pinches feel more present. |
| Idle wheel rotation | The wheel decays with friction; clay receives restrained speed-linked expansion. | A low grounded hum is maintained only while touching. |
| Increased symmetry | `centeringProgress` approaches one as angular variance falls. | Sharpness eases into a round, smooth hum. |

## Validation checklist

The Linux development environment cannot compile an iOS SceneKit target. Before attaching the module to an application target, validate it in Xcode on a device:

1. Confirm that the wheel, clay body, table, and directional soft shadow appear.
2. Drag the clay with one and then two fingers; ensure geometry changes smoothly rather than ring-to-ring.
3. Spin the wheel and release; verify it accelerates and gradually coasts down.
4. Confirm that haptic sharpness is more textured for an intentionally off-centre vessel and calmer after the **Centered** state appears.
5. Profile frame pacing in Instruments and reduce `angularSegments` from 128 to 96 on older devices if necessary.

## Reference APIs

SceneKit’s `physicallyBased` lighting model supplies the material response used by the clay and wood surfaces, while Core Haptics supports customized and dynamically updated haptic playback. [1] [2]

[1]: https://developer.apple.com/documentation/scenekit/scnmaterial/lightingmodel-swift.struct/physicallybased "Apple Developer Documentation — SCNMaterial Lighting Model"
[2]: https://developer.apple.com/documentation/corehaptics/chhapticadvancedpatternplayer "Apple Developer Documentation — CHHapticAdvancedPatternPlayer"
