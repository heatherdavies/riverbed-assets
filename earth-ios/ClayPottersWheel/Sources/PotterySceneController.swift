import SceneKit
import UIKit

final class PotterySceneController: NSObject, SCNSceneRendererDelegate, UIGestureRecognizerDelegate {
    let sceneView: SCNView
    var onMetricsChanged: ((PotteryMesh.Metrics) -> Void)?

    private let potteryMesh = PotteryMesh()
    private let clayNode = SCNNode()
    private let wheelNode = SCNNode()
    private let clayMaterial = SCNMaterial()
    private let haptics = ClayHapticController()
    private let groundingAudio = GroundingAudioController()

    private var wheelPhysics = WheelPhysics()
    private var isMeshDirty = true
    private var lastCentrifugalScale: Float = 1
    private var lastRenderTime: TimeInterval = 0
    private var activeTouchCount = 0

    init() {
        sceneView = SCNView(frame: .zero, options: nil)
        super.init()
        configureScene()
        configureGestures()
    }

    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        defer { lastRenderTime = time }
        guard lastRenderTime > 0 else { return }
        wheelPhysics.update(deltaTime: time - lastRenderTime)
        wheelNode.eulerAngles.y = wheelPhysics.angularPosition

        let centrifugalScale = wheelPhysics.centrifugalScale
        if isMeshDirty || abs(lastCentrifugalScale - centrifugalScale) > 0.0008 {
            clayNode.geometry = potteryMesh.makeGeometry(centrifugalScale: centrifugalScale)
            clayNode.geometry?.materials = [clayMaterial]
            lastCentrifugalScale = centrifugalScale
            isMeshDirty = false
        }

        let speedFraction = abs(wheelPhysics.angularVelocity) / 9.5
        let wetness = (0.18 + speedFraction * 0.38 + (activeTouchCount > 0 ? 0.18 : 0)).clamped(to: 0...0.75)
        clayMaterial.setValue(NSNumber(value: wetness), forKey: "wetness")
    }

    private func configureScene() {
        let scene = SCNScene()
        sceneView.scene = scene
        sceneView.backgroundColor = UIColor(red: 0.075, green: 0.055, blue: 0.040, alpha: 1)
        sceneView.delegate = self
        sceneView.isPlaying = true
        sceneView.rendersContinuously = true
        sceneView.preferredFramesPerSecond = 60
        sceneView.antialiasingMode = .multisampling4X
        sceneView.autoenablesDefaultLighting = false

        let camera = SCNCamera()
        camera.fieldOfView = 42
        camera.wantsHDR = true
        camera.exposureOffset = -0.35
        let cameraNode = SCNNode()
        cameraNode.camera = camera
        cameraNode.position = SCNVector3(1.52, 1.25, 2.55)
        cameraNode.look(at: SCNVector3(0, 0.62, 0))
        scene.rootNode.addChildNode(cameraNode)

        let keyLight = SCNLight()
        keyLight.type = .directional
        keyLight.intensity = 1_350
        keyLight.color = UIColor(red: 1.0, green: 0.77, blue: 0.56, alpha: 1)
        keyLight.castsShadow = true
        keyLight.shadowColor = UIColor(white: 0, alpha: 0.38)
        keyLight.shadowRadius = 10
        keyLight.shadowSampleCount = 24
        keyLight.automaticallyAdjustsShadowProjection = true
        let keyLightNode = SCNNode()
        keyLightNode.light = keyLight
        keyLightNode.eulerAngles = SCNVector3(-0.86, 0.55, 0.08)
        scene.rootNode.addChildNode(keyLightNode)

        let fillLight = SCNLight()
        fillLight.type = .omni
        fillLight.intensity = 240
        fillLight.color = UIColor(red: 0.48, green: 0.39, blue: 0.31, alpha: 1)
        let fillNode = SCNNode()
        fillNode.light = fillLight
        fillNode.position = SCNVector3(-1.4, 1.1, 1.2)
        scene.rootNode.addChildNode(fillNode)

        let floor = SCNFloor()
        floor.reflectivity = 0.04
        floor.reflectionFalloffEnd = 1.8
        let floorMaterial = SCNMaterial()
        floorMaterial.lightingModel = .physicallyBased
        floorMaterial.diffuse.contents = UIColor(red: 0.115, green: 0.082, blue: 0.055, alpha: 1)
        floorMaterial.roughness.contents = 0.92
        floor.materials = [floorMaterial]
        let floorNode = SCNNode(geometry: floor)
        floorNode.position.y = -0.03
        floorNode.castsShadow = false
        scene.rootNode.addChildNode(floorNode)

        configureWheel()
        configureClay()
    }

    private func configureWheel() {
        let wood = SCNMaterial()
        wood.lightingModel = .physicallyBased
        wood.diffuse.contents = ClayTextureFactory.wheelWood
        wood.roughness.contents = 0.46
        wood.metalness.contents = 0.0
        wood.wrapS = .repeat
        wood.wrapT = .repeat

        let wheel = SCNCylinder(radius: 0.80, height: 0.115)
        wheel.chamferRadius = 0.018
        wheel.materials = [wood]
        wheelNode.geometry = wheel
        wheelNode.position.y = 0.06
        wheelNode.name = "wheelhead"

        let rim = SCNTorus(ringRadius: 0.71, pipeRadius: 0.028)
        rim.materials = [wood]
        let rimNode = SCNNode(geometry: rim)
        rimNode.eulerAngles.x = .pi / 2
        rimNode.position.y = 0.121
        wheelNode.addChildNode(rimNode)

        let spindle = SCNCylinder(radius: 0.09, height: 0.20)
        spindle.materials = [wood]
        let spindleNode = SCNNode(geometry: spindle)
        spindleNode.position.y = 0.18
        wheelNode.addChildNode(spindleNode)
        sceneView.scene?.rootNode.addChildNode(wheelNode)
    }

    private func configureClay() {
        clayMaterial.name = "Wet Clay PBR"
        clayMaterial.lightingModel = .physicallyBased
        clayMaterial.diffuse.contents = ClayTextureFactory.clay.albedo
        clayMaterial.normal.contents = ClayTextureFactory.clay.normal
        clayMaterial.roughness.contents = ClayTextureFactory.clay.roughness
        clayMaterial.metalness.contents = 0.0
        clayMaterial.specular.contents = UIColor(white: 0.75, alpha: 1)
        clayMaterial.fresnelExponent = 1.15
        clayMaterial.isDoubleSided = false
        clayMaterial.wrapS = .repeat
        clayMaterial.wrapT = .repeat
        clayMaterial.shaderModifiers = [.surface: """
        #pragma arguments
        float wetness;
        #pragma body
        _surface.roughness = clamp(_surface.roughness - wetness * 0.33, 0.11, 0.84);
        _surface.specular.rgb = mix(_surface.specular.rgb, float3(1.0, 0.82, 0.62), wetness * 0.42);
        """]
        clayMaterial.setValue(NSNumber(value: 0.20), forKey: "wetness")

        clayNode.geometry = potteryMesh.makeGeometry(centrifugalScale: 1)
        clayNode.geometry?.materials = [clayMaterial]
        clayNode.position.y = 0.115
        clayNode.name = "clay"
        clayNode.castsShadow = true
        wheelNode.addChildNode(clayNode)
    }

    private func configureGestures() {
        let oneFingerPress = UIPanGestureRecognizer(target: self, action: #selector(handleOneFingerPress(_:)))
        oneFingerPress.minimumNumberOfTouches = 1
        oneFingerPress.maximumNumberOfTouches = 1
        oneFingerPress.delegate = self
        sceneView.addGestureRecognizer(oneFingerPress)

        let steadyPress = UILongPressGestureRecognizer(target: self, action: #selector(handleSteadyPress(_:)))
        steadyPress.minimumPressDuration = 0.18
        steadyPress.allowableMovement = 14
        steadyPress.numberOfTouchesRequired = 1
        steadyPress.delegate = self
        sceneView.addGestureRecognizer(steadyPress)

        let twoFingerPinch = UIPinchGestureRecognizer(target: self, action: #selector(handleTwoFingerPinch(_:)))
        twoFingerPinch.delegate = self
        sceneView.addGestureRecognizer(twoFingerPinch)
    }

    @objc private func handleOneFingerPress(_ gesture: UIPanGestureRecognizer) {
        switch gesture.state {
        case .began:
            activeTouchCount = 1
            haptics.beginTouch()
        case .changed:
            let location = gesture.location(in: sceneView)
            guard let height = clayHeight(at: location) else { return }
            let translation = gesture.translation(in: sceneView)
            gesture.setTranslation(.zero, in: sceneView)
            let velocity = gesture.velocity(in: sceneView)
            let radiusDelta = -Float(translation.y) * 0.00062
            wheelPhysics.addTouchTorque(horizontalVelocity: Float(velocity.x))
            sculpt(height: height, radiusDelta: radiusDelta, velocity: Float(hypot(velocity.x, velocity.y)))
        default:
            activeTouchCount = 0
            haptics.endTouch()
        }
    }

    @objc private func handleSteadyPress(_ gesture: UILongPressGestureRecognizer) {
        switch gesture.state {
        case .began:
            activeTouchCount = 1
            haptics.beginTouch()
            if let height = clayHeight(at: gesture.location(in: sceneView)) {
                // A sustained fingertip press gently compresses the nearest height band.
                sculpt(height: height, radiusDelta: -0.0045, velocity: 90)
            }
        case .changed:
            if let height = clayHeight(at: gesture.location(in: sceneView)) {
                sculpt(height: height, radiusDelta: -0.00035, velocity: 45)
            }
        default:
            activeTouchCount = 0
            haptics.endTouch()
        }
    }

    @objc private func handleTwoFingerPinch(_ gesture: UIPinchGestureRecognizer) {
        switch gesture.state {
        case .began:
            activeTouchCount = 2
            haptics.beginTouch()
        case .changed:
            let location = gesture.location(in: sceneView)
            guard let height = clayHeight(at: location) else { return }
            let radiusDelta = Float(gesture.scale - 1) * 0.042
            gesture.scale = 1
            let velocity = Float(abs(gesture.velocity) * 820)
            sculpt(height: height, radiusDelta: radiusDelta, velocity: velocity)
        default:
            activeTouchCount = 0
            haptics.endTouch()
        }
    }

    private func sculpt(height: Float, radiusDelta: Float, velocity: Float) {
        let before = potteryMesh.metrics()
        let centeringForce = (0.035 + before.centeringProgress * 0.10).clamped(to: 0.035...0.15)
        potteryMesh.sculpt(at: height, radiusDelta: radiusDelta, centeringForce: centeringForce)
        isMeshDirty = true

        let metrics = potteryMesh.metrics()
        haptics.update(
            touchVelocity: velocity,
            asymmetry: metrics.asymmetry,
            centeringProgress: metrics.centeringProgress
        )
        groundingAudio.cueIfNeeded(centeringProgress: metrics.centeringProgress)
        DispatchQueue.main.async { [weak self] in
            self?.onMetricsChanged?(metrics)
        }
    }

    private func clayHeight(at screenPoint: CGPoint) -> Float? {
        let hits = sceneView.hitTest(screenPoint, options: [.searchMode: SCNHitTestSearchMode.closest.rawValue])
        guard let hit = hits.first(where: { $0.node === clayNode }) else { return nil }
        return (hit.localCoordinates.y / potteryMesh.height).clamped(to: 0...1)
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        false
    }
}
