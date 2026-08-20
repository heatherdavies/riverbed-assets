import CoreGraphics
import UIKit

/// Builds offline PBR maps once at startup. The procedural maps avoid a network dependency while
/// retaining high-frequency clay grain, pore, and wetness detail at a 2048px source resolution.
enum ClayTextureFactory {
    struct Set {
        let albedo: UIImage
        let normal: UIImage
        let roughness: UIImage
    }

    static let clay = makeClaySet(size: 2_048)
    static let wheelWood = makeWood(size: 1_024)

    private static func makeClaySet(size: Int) -> Set {
        let albedo = image(size: size) { x, y in
            let macro = noise(x, y, scale: 64, seed: 17)
            let grain = noise(x, y, scale: 5, seed: 29)
            let pores = noise(x, y, scale: 2, seed: 101)
            let dampVein = pow(noise(x + y / 3, y, scale: 31, seed: 7), 8) * 0.28
            let red = 148 + macro * 19 + grain * 9 - pores * 6
            let green = 83 + macro * 15 + grain * 6 - pores * 3
            let blue = 53 + macro * 9 + grain * 3
            return Pixel(red, green, blue, 255).adding(dampVein * 24, dampVein * 12, dampVein * 5)
        }

        let normal = image(size: size) { x, y in
            let dx = heightAt(x + 1, y) - heightAt(x - 1, y)
            let dy = heightAt(x, y + 1) - heightAt(x, y - 1)
            let nx = (128 + dx * 95).clamped(to: 0...255)
            let ny = (128 + dy * 95).clamped(to: 0...255)
            return Pixel(nx, ny, 255, 255)
        }

        let roughness = image(size: size) { x, y in
            let fine = noise(x, y, scale: 5, seed: 61)
            let damp = pow(noise(x, y, scale: 42, seed: 83), 5)
            let value = (142 + fine * 58 - damp * 72).clamped(to: 38...222)
            return Pixel(value, value, value, 255)
        }

        return Set(albedo: albedo, normal: normal, roughness: roughness)
    }

    private static func makeWood(size: Int) -> UIImage {
        image(size: size) { x, y in
            let dx = Float(x - size / 2)
            let dy = Float(y - size / 2)
            let radius = sqrt(dx * dx + dy * dy)
            let angle = atan2(dy, dx)
            let grain = sin(radius * 0.17 + sin(angle * 7) * 5 + noise(x, y, scale: 14, seed: 311) * 6)
            let value = 0.5 + 0.5 * grain
            return Pixel(69 + value * 46, 36 + value * 25, 15 + value * 14, 255)
        }
    }

    private static func heightAt(_ x: Int, _ y: Int) -> Float {
        noise(x, y, scale: 5, seed: 97) * 0.72 + noise(x, y, scale: 19, seed: 223) * 0.28
    }

    private static func noise(_ x: Int, _ y: Int, scale: Int, seed: Int) -> Float {
        let xi = x / scale
        let yi = y / scale
        let tx = Float(x % scale) / Float(scale)
        let ty = Float(y % scale) / Float(scale)
        let a = hash(xi, yi, seed)
        let b = hash(xi + 1, yi, seed)
        let c = hash(xi, yi + 1, seed)
        let d = hash(xi + 1, yi + 1, seed)
        let ux = tx * tx * (3 - 2 * tx)
        let uy = ty * ty * (3 - 2 * ty)
        return lerp(lerp(a, b, ux), lerp(c, d, ux), uy)
    }

    private static func hash(_ x: Int, _ y: Int, _ seed: Int) -> Float {
        var value = UInt32(truncatingIfNeeded: x &* 374_761_393 &+ y &* 668_265_263 &+ seed &* 1_597_334_677)
        value = (value ^ (value >> 13)) &* 1_274_126_177
        value ^= value >> 16
        return Float(value & 0x00FF_FFFF) / Float(0x00FF_FFFF)
    }

    private static func lerp(_ a: Float, _ b: Float, _ t: Float) -> Float {
        a + (b - a) * t
    }

    private static func image(size: Int, pixel: (Int, Int) -> Pixel) -> UIImage {
        var bytes = [UInt8](repeating: 0, count: size * size * 4)
        for y in 0..<size {
            for x in 0..<size {
                let index = (y * size + x) * 4
                let sample = pixel(x, y)
                bytes[index] = UInt8(sample.r)
                bytes[index + 1] = UInt8(sample.g)
                bytes[index + 2] = UInt8(sample.b)
                bytes[index + 3] = UInt8(sample.a)
            }
        }
        let data = Data(bytes)
        let provider = CGDataProvider(data: data as CFData)!
        let image = CGImage(
            width: size,
            height: size,
            bitsPerComponent: 8,
            bitsPerPixel: 32,
            bytesPerRow: size * 4,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
            provider: provider,
            decode: nil,
            shouldInterpolate: true,
            intent: .defaultIntent
        )!
        return UIImage(cgImage: image)
    }

    private struct Pixel {
        let r: Float
        let g: Float
        let b: Float
        let a: Float

        init(_ r: Float, _ g: Float, _ b: Float, _ a: Float) {
            self.r = r
            self.g = g
            self.b = b
            self.a = a
        }

        func adding(_ red: Float, _ green: Float, _ blue: Float) -> Pixel {
            Pixel((r + red).clamped(to: 0...255), (g + green).clamped(to: 0...255), (b + blue).clamped(to: 0...255), a)
        }
    }
}
