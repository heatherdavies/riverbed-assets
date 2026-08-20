import SceneKit
import simd

/// A lathed clay body whose radius is independently represented at each height and angle.
/// The angular samples allow the experience to expose and progressively settle real asymmetry.
final class PotteryMesh {
    struct Metrics: Equatable {
        let asymmetry: Float
        let centeringProgress: Float
    }

    let verticalSegments: Int
    let angularSegments: Int
    let height: Float

    private(set) var radii: [[Float]]
    private var geometryVersion = 0

    init(verticalSegments: Int = 64, angularSegments: Int = 128, height: Float = 1.18) {
        self.verticalSegments = verticalSegments
        self.angularSegments = angularSegments
        self.height = height
        self.radii = Self.makeInitialRadii(verticalSegments: verticalSegments, angularSegments: angularSegments)
    }

    func makeGeometry(centrifugalScale: Float) -> SCNGeometry {
        var vertices: [SCNVector3] = []
        var normals: [SCNVector3] = []
        var texcoords: [CGPoint] = []
        vertices.reserveCapacity((verticalSegments + 1) * (angularSegments + 1))
        normals.reserveCapacity((verticalSegments + 1) * (angularSegments + 1))
        texcoords.reserveCapacity((verticalSegments + 1) * (angularSegments + 1))

        for ring in 0...verticalSegments {
            let sourceRing = min(ring, verticalSegments - 1)
            let z = Float(ring) / Float(verticalSegments) * height
            for segment in 0...angularSegments {
                let sourceSegment = segment % angularSegments
                let angle = Float(sourceSegment) / Float(angularSegments) * 2.0 * .pi
                let radius = radius(atRing: sourceRing, segment: sourceSegment) * centrifugalScale
                vertices.append(SCNVector3(radius * cos(angle), z, radius * sin(angle)))
                normals.append(surfaceNormal(ring: sourceRing, segment: sourceSegment))
                texcoords.append(CGPoint(
                    x: CGFloat(segment) / CGFloat(angularSegments),
                    y: CGFloat(ring) / CGFloat(verticalSegments)
                ))
            }
        }

        var indices: [UInt32] = []
        indices.reserveCapacity(verticalSegments * angularSegments * 6)
        let stride = angularSegments + 1
        for ring in 0..<verticalSegments {
            for segment in 0..<angularSegments {
                let a = UInt32(ring * stride + segment)
                let b = UInt32((ring + 1) * stride + segment)
                let c = UInt32((ring + 1) * stride + segment + 1)
                let d = UInt32(ring * stride + segment + 1)
                indices += [a, b, d, d, b, c]
            }
        }

        let geometry = SCNGeometry(
            sources: [
                SCNGeometrySource(vertices: vertices),
                SCNGeometrySource(normals: normals),
                SCNGeometrySource(textureCoordinates: texcoords)
            ],
            elements: [SCNGeometryElement(indices: indices, primitiveType: .triangles)]
        )
        geometry.name = "ClayLatheMesh-\(geometryVersion)"
        geometryVersion += 1
        return geometry
    }

    /// Deforms the nearest height band and then relaxes the ring/angle lattice with a Laplacian pass.
    /// The inverse angular deformation lightly pulls existing wobble toward a circular cross-section.
    func sculpt(at normalizedHeight: Float, radiusDelta: Float, centeringForce: Float) {
        let targetRing = Int((normalizedHeight.clamped(to: 0...1) * Float(verticalSegments - 1)).rounded())
        let influence = max(2, verticalSegments / 10)

        for ring in 0..<verticalSegments {
            let distance = Float(abs(ring - targetRing)) / Float(influence)
            guard distance < 2.2 else { continue }
            let falloff = exp(-0.5 * distance * distance)
            let average = radii[ring].reduce(0, +) / Float(angularSegments)

            for segment in 0..<angularSegments {
                let localWobble = radii[ring][segment] - average
                let settling = localWobble * centeringForce * falloff
                radii[ring][segment] = (radii[ring][segment] + radiusDelta * falloff - settling)
                    .clamped(to: 0.075...0.62)
            }
        }
        laplacianSmooth(iterations: 2, strength: 0.24)
    }

    func laplacianSmooth(iterations: Int, strength: Float) {
        guard iterations > 0 else { return }
        for _ in 0..<iterations {
            var next = radii
            for ring in 0..<verticalSegments {
                for segment in 0..<angularSegments {
                    let up = radii[max(0, ring - 1)][segment]
                    let down = radii[min(verticalSegments - 1, ring + 1)][segment]
                    let left = radii[ring][(segment - 1 + angularSegments) % angularSegments]
                    let right = radii[ring][(segment + 1) % angularSegments]
                    let neighborhood = (up + down + left + right) * 0.25
                    next[ring][segment] = (radii[ring][segment] + strength * (neighborhood - radii[ring][segment]))
                        .clamped(to: 0.075...0.62)
                }
            }
            radii = next
        }
    }

    func metrics() -> Metrics {
        var normalizedVariance: Float = 0
        for ring in 0..<verticalSegments {
            let mean = radii[ring].reduce(0, +) / Float(angularSegments)
            let variance = radii[ring].reduce(Float.zero) { partial, sample in
                partial + (sample - mean) * (sample - mean)
            } / Float(angularSegments)
            normalizedVariance += sqrt(variance) / max(mean, 0.001)
        }
        let asymmetry = normalizedVariance / Float(verticalSegments)
        let centering = (1 - asymmetry / 0.055).clamped(to: 0...1)
        return Metrics(asymmetry: asymmetry, centeringProgress: centering)
    }

    private func radius(atRing ring: Int, segment: Int) -> Float {
        radii[ring][segment]
    }

    private func surfaceNormal(ring: Int, segment: Int) -> SCNVector3 {
        let previousRing = max(0, ring - 1)
        let nextRing = min(verticalSegments - 1, ring + 1)
        let previousSegment = (segment - 1 + angularSegments) % angularSegments
        let nextSegment = (segment + 1) % angularSegments
        let dz = max((radius(atRing: nextRing, segment: segment) - radius(atRing: previousRing, segment: segment)) * 0.5, -0.8)
        let angularGradient = radius(atRing: ring, segment: nextSegment) - radius(atRing: ring, segment: previousSegment)
        let angle = Float(segment) / Float(angularSegments) * 2 * .pi
        let radial = SIMD3<Float>(cos(angle), -dz * 1.3, sin(angle))
        let tangent = SIMD3<Float>(-sin(angle) * angularGradient, 0, cos(angle) * angularGradient)
        let normal = simd_normalize(radial - tangent)
        return SCNVector3(normal.x, normal.y, normal.z)
    }

    private static func makeInitialRadii(verticalSegments: Int, angularSegments: Int) -> [[Float]] {
        (0..<verticalSegments).map { ring in
            let t = Float(ring) / Float(verticalSegments - 1)
            let profile: Float
            switch t {
            case ..<0.14: profile = 0.24 + t * 0.45
            case ..<0.46: profile = 0.305 + sin((t - 0.14) * .pi / 0.32) * 0.055
            case ..<0.78: profile = 0.34 - (t - 0.46) * 0.30
            default: profile = 0.244 - (t - 0.78) * 0.42
            }
            return (0..<angularSegments).map { segment in
                let theta = Float(segment) / Float(angularSegments) * 2 * .pi
                let wobble = sin(theta * 3 + t * 9) * 0.012 + cos(theta * 5 - t * 5) * 0.006
                return (profile + wobble).clamped(to: 0.075...0.62)
            }
        }
    }
}

