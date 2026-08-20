import CoreHaptics
import Foundation

/// Keeps one continuous haptic event alive while sculpting and updates its character in real time.
final class ClayHapticController {
    private var engine: CHHapticEngine?
    private var player: CHHapticAdvancedPatternPlayer?
    private var isPlaying = false

    init() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            let engine = try CHHapticEngine()
            engine.isAutoShutdownEnabled = true
            engine.resetHandler = { [weak engine] in
                try? engine?.start()
            }
            try engine.start()
            self.engine = engine
        } catch {
            self.engine = nil
        }
    }

    func beginTouch() {
        guard !isPlaying, let engine else { return }
        do {
            let event = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.16),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.22)
                ],
                relativeTime: 0,
                duration: 60
            )
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makeAdvancedPlayer(with: pattern)
            player.loopEnabled = true
            try player.start(atTime: CHHapticTimeImmediate)
            self.player = player
            isPlaying = true
        } catch {
            isPlaying = false
        }
    }

    /// Touch speed raises presence. Asymmetry brings a crisp, granular edge; centering returns the event to a softer hum.
    func update(touchVelocity: Float, asymmetry: Float, centeringProgress: Float) {
        guard let player, isPlaying else { return }
        let speed = (touchVelocity / 1_600).clamped(to: 0...1)
        let imbalance = (asymmetry / 0.055).clamped(to: 0...1)
        let intensity = (0.14 + speed * 0.52 + imbalance * 0.16).clamped(to: 0.08...0.92)
        let sharpness = (0.14 + imbalance * 0.74 - centeringProgress * 0.16).clamped(to: 0.04...0.92)

        do {
            try player.sendParameters([
                CHHapticDynamicParameter(parameterID: .hapticIntensityControl, value: intensity, relativeTime: 0),
                CHHapticDynamicParameter(parameterID: .hapticSharpnessControl, value: sharpness, relativeTime: 0)
            ], atTime: CHHapticTimeImmediate)
        } catch {
            stop()
        }
    }

    func endTouch() {
        stop()
    }

    private func stop() {
        try? player?.stop(atTime: CHHapticTimeImmediate)
        player = nil
        isPlaying = false
    }
}

