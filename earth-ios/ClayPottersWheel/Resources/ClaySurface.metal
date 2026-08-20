#include <metal_stdlib>
using namespace metal;

// Shared Metal utility for a future custom SceneKit program, RealityKit material, or Metal renderer.
// The current prototype uses SceneKit's native physically based material path.
struct ClayMaterialInputs {
    float3 baseColor;
    float roughness;
    float wetness;
};

static float hash21(float2 p) {
    p = fract(p * float2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

static float granularClay(float2 uv) {
    float fine = hash21(floor(uv * 2048.0));
    float medium = hash21(floor(uv * 256.0));
    return mix(medium, fine, 0.42);
}

/// Returns a low-roughness, grazing-angle sheen that increases only on damp microstructure.
half3 clayWetSheen(
    ClayMaterialInputs material,
    float2 uv,
    float3 normal,
    float3 viewDirection,
    float3 lightDirection
) {
    float grain = granularClay(uv);
    float dampness = saturate(material.wetness + (grain - 0.52) * 0.18);
    float3 halfVector = normalize(viewDirection + lightDirection);
    float fresnel = pow(1.0 - saturate(dot(normal, viewDirection)), 5.0);
    float glossExponent = mix(18.0, 96.0, dampness);
    float specular = pow(saturate(dot(normal, halfVector)), glossExponent);
    float sheen = (specular * 0.68 + fresnel * 0.32) * dampness;
    return half3(sheen * float3(0.96, 0.82, 0.68));
}

float clayRoughness(float baseRoughness, float2 uv, float wetness) {
    float grain = granularClay(uv);
    float varied = baseRoughness + (grain - 0.5) * 0.16;
    return clamp(mix(varied, 0.18, wetness), 0.08, 0.92);
}
