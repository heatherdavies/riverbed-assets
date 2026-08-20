import SceneKit
import SwiftUI

struct ClayPottersWheelView: View {
    @State private var metrics = PotteryMesh.Metrics(asymmetry: 1, centeringProgress: 0)

    var body: some View {
        ZStack {
            Color(red: 0.075, green: 0.055, blue: 0.040)
                .ignoresSafeArea()

            PotterySceneRepresentable(metrics: $metrics)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                CenteringProgressView(progress: metrics.centeringProgress)
                    .padding(.top, 18)
                Spacer()
                instruction
                    .padding(.horizontal, 22)
                    .padding(.bottom, 26)
            }
        }
        .preferredColorScheme(.dark)
    }

    private var instruction: some View {
        VStack(spacing: 6) {
            Text(metrics.centeringProgress >= 0.965 ? "Centered" : "Shape with a grounded touch")
                .font(.system(size: 15, weight: .medium, design: .serif))
                .foregroundStyle(Color(red: 0.94, green: 0.81, blue: 0.63))
                .contentTransition(.opacity)
            Text("Press and draw to shape · Pinch to open or compress")
                .font(.system(size: 12, weight: .regular, design: .rounded))
                .foregroundStyle(.white.opacity(0.58))
        }
        .padding(.vertical, 13)
        .frame(maxWidth: .infinity)
        .background(.ultraThinMaterial.opacity(0.22), in: Capsule())
        .animation(.easeInOut(duration: 0.35), value: metrics.centeringProgress >= 0.965)
    }
}

private struct CenteringProgressView: View {
    let progress: Float

    var body: some View {
        VStack(spacing: 7) {
            ZStack {
                Circle()
                    .stroke(.white.opacity(0.15), lineWidth: 3)
                Circle()
                    .trim(from: 0, to: CGFloat(progress))
                    .stroke(
                        Color(red: 0.91, green: 0.69, blue: 0.42),
                        style: StrokeStyle(lineWidth: 3, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .shadow(color: Color(red: 0.95, green: 0.64, blue: 0.35).opacity(Double(progress) * 0.7), radius: 7)
                    .animation(.easeOut(duration: 0.18), value: progress)
                Image(systemName: progress >= 0.965 ? "circle.inset.filled" : "circle.dotted")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.82))
            }
            .frame(width: 42, height: 42)

            Text(progress >= 0.965 ? "CENTERED" : "CENTERING")
                .font(.system(size: 10, weight: .semibold, design: .rounded))
                .tracking(1.2)
                .foregroundStyle(.white.opacity(0.78))
            Text("\(Int((progress * 100).rounded()))% rotational balance")
                .font(.system(size: 11, weight: .regular, design: .rounded))
                .foregroundStyle(.white.opacity(0.52))
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
        .background(.black.opacity(0.18), in: RoundedRectangle(cornerRadius: 17, style: .continuous))
    }
}

private struct PotterySceneRepresentable: UIViewRepresentable {
    @Binding var metrics: PotteryMesh.Metrics

    func makeCoordinator() -> Coordinator {
        Coordinator(metrics: $metrics)
    }

    func makeUIView(context: Context) -> SCNView {
        let controller = context.coordinator.controller
        controller.onMetricsChanged = { [weak coordinator = context.coordinator] updatedMetrics in
            coordinator?.metrics.wrappedValue = updatedMetrics
        }
        return controller.sceneView
    }

    func updateUIView(_ uiView: SCNView, context: Context) {}

    final class Coordinator {
        let controller = PotterySceneController()
        var metrics: Binding<PotteryMesh.Metrics>

        init(metrics: Binding<PotteryMesh.Metrics>) {
            self.metrics = metrics
        }
    }
}
