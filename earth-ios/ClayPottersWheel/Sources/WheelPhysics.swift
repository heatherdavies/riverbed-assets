import Foundation

/// A compact rotational model. Touch input supplies torque, then the wheel coasts under drag.
/// Angular acceleration is evaluated as alpha = tau / I.
struct WheelPhysics {
    private let momentOfInertia: Float = 0.087
    private let viscousDrag: Float = 0.052
    private let staticDrag: Float = 0.019
    private let maximumAngularVelocity: Float = 9.5

    private(set) var angularVelocity: Float = 0
    private(set) var angularPosition: Float = 0
    private var pendingTorque: Float = 0

    /// A horizontal sweep across the clay has the feel of a small driving torque at the wheelhead.
    mutating func addTouchTorque(horizontalVelocity: Float) {
        let impulse = (horizontalVelocity * 0.00068).clamped(to: -0.32...0.32)
        pendingTorque += impulse
    }

    mutating func update(deltaTime rawDeltaTime: TimeInterval) {
        let dt = Float(rawDeltaTime.clamped(to: 1.0 / 240...1.0 / 20))
        let direction: Float = angularVelocity == 0 ? 0 : (angularVelocity > 0 ? 1 : -1)
        let resistingTorque = angularVelocity * viscousDrag + direction * staticDrag
        let netTorque = pendingTorque - resistingTorque
        let angularAcceleration = netTorque / momentOfInertia

        angularVelocity = (angularVelocity + angularAcceleration * dt)
            .clamped(to: -maximumAngularVelocity...maximumAngularVelocity)
        if abs(angularVelocity) < 0.018 && abs(pendingTorque) < 0.002 {
            angularVelocity = 0
        }
        angularPosition += angularVelocity * dt
        pendingTorque *= 0.23
    }

    /// The expansion is intentionally subtle: at maximum rotational speed the radius increases by 3.5%.
    var centrifugalScale: Float {
        let energyFraction = min((angularVelocity * angularVelocity) / (maximumAngularVelocity * maximumAngularVelocity), 1)
        return 1 + energyFraction * 0.035
    }
}

