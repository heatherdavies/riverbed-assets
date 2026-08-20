import AVFoundation
import Foundation

extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}

/// A brief, low-volume sine chord used only when balance is achieved.
final class GroundingAudioController {
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)!
    private var tone: AVAudioPCMBuffer?
    private var lastCueDate = Date.distantPast

    init() {
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default, options: [.mixWithOthers])
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        tone = makeTone()
    }

    func cueIfNeeded(centeringProgress: Float) {
        guard centeringProgress >= 0.965,
              Date().timeIntervalSince(lastCueDate) > 2.5,
              let tone else { return }
        lastCueDate = Date()

        do {
            try engine.start()
            player.stop()
            player.volume = 0.12
            player.scheduleBuffer(tone, at: nil, options: [])
            player.play()
        } catch {
            // Audio feedback is supplemental; the visual and haptic experience remains usable without it.
        }
    }

    private func makeTone() -> AVAudioPCMBuffer? {
        let frames = AVAudioFrameCount(44_100 * 0.52)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frames) else { return nil }
        buffer.frameLength = frames
        guard let samples = buffer.floatChannelData?[0] else { return nil }

        for frame in 0..<Int(frames) {
            let t = Float(frame) / 44_100
            let envelope = min(1, t / 0.06) * min(1, (0.52 - t) / 0.16)
            let fundamental = sin(2 * .pi * 196 * t)
            let fifth = sin(2 * .pi * 294 * t) * 0.18
            samples[frame] = (fundamental + fifth) * envelope * 0.22
        }
        return buffer
    }
}
