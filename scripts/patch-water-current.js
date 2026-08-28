/*
 * Replaces the compiled Flow water shaders with the validated current-study
 * implementation. The repository currently contains its shipped web bundle but
 * not the corresponding water TypeScript source, so this script is retained to
 * make the integration auditable and repeatable after future bundle updates.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');

const simulationSource = String.raw`
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uCurrentStrength;
  uniform float uDirection;
  uniform float uContained;

  // Pointer interaction is retained from Flow. It remains a local trough and
  // does not replace or pause the continuous open-current seed.
  uniform vec2 uPointer;
  uniform vec2 uPrevPointer;
  uniform float uPointerDown;

  // Flow's rain/tap injection remains available as a one-pass local impulse.
  uniform float uDropActive;
  uniform vec2 uDropPos;
  uniform float uDropWidth;
  uniform float uDropCrater;

  float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 uv = vUv;
    vec4 current = texture2D(uPrev, uv);
    float h = current.r;
    float v = current.g;

    float leftHeight  = texture2D(uPrev, uv - vec2(uTexel.x, 0.0)).r;
    float rightHeight = texture2D(uPrev, uv + vec2(uTexel.x, 0.0)).r;
    float downHeight  = texture2D(uPrev, uv - vec2(0.0, uTexel.y)).r;
    float upHeight    = texture2D(uPrev, uv + vec2(0.0, uTexel.y)).r;
    float laplacian = leftHeight + rightHeight + downHeight + upHeight - 4.0 * h;

    // Source-of-truth height-and-velocity solver values.
    v += laplacian * 0.32;
    v *= 0.994;
    h += v;

    // Source-of-truth travelling open-current seed. uTime is elapsed seconds.
    float ambient = sin(uv.x * 22.0 + uTime * 0.7)
                  * cos(uv.y * 19.0 - uDirection * uTime * 0.55);

    // Open current is the default. The retained contained option uses only the
    // reference's gentle 5% absorbing boundary.
    float margin = 0.05;
    float ex = smoothstep(0.0, margin, uv.x) * smoothstep(0.0, margin, 1.0 - uv.x);
    float ey = smoothstep(0.0, margin, uv.y) * smoothstep(0.0, margin, 1.0 - uv.y);
    float edge = ex * ey;
    v *= mix(1.0, mix(0.985, 1.0, edge), uContained);
    h *= mix(1.0, mix(0.970, 1.0, edge), uContained);
    h += ambient * uCurrentStrength * mix(1.0, edge, uContained);

    if (uPointerDown > 0.5) {
      float distanceToStroke = segmentDistance(uv, uPrevPointer, uPointer);
      float impulse = smoothstep(0.055, 0.0, distanceToStroke);
      h -= impulse * 0.018;
    }

    if (uDropActive > 0.5) {
      float distanceToDrop = length(uv - uDropPos);
      float pit = smoothstep(uDropWidth, 0.0, distanceToDrop);
      float lipRadius = uDropWidth * 1.8;
      float lip = smoothstep(uDropWidth * 0.9, lipRadius, distanceToDrop)
                * smoothstep(lipRadius * 1.7, lipRadius, distanceToDrop);
      h -= pit * uDropCrater;
      h += lip * uDropCrater * 0.35;
    }

    gl_FragColor = vec4(h, v, 0.0, 1.0);
  }
`;

const presentationSource = String.raw`
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uHeight;
  uniform sampler2D uBed;
  uniform vec2 uTexel;
  uniform vec2 uResolution;
  uniform vec2 uCover;
  uniform float uTime;
  uniform float uDirection;
  uniform float uReadability;

  // Flow palette controls remain a restrained final colour treatment. They do
  // not move the background or substitute for the height-driven water response.
  uniform vec3 uTint;
  uniform float uTintStrength;
  uniform float uTintAdditive;
  uniform float uTintDepth;
  uniform float uAmbient;
  uniform float uBedExposure;
  uniform float uOvercast;
  uniform float uLightning;

  float waterCaustic(vec2 p) {
    p *= 54.0;
    float a = sin(p.x + sin(p.y * 1.23));
    float b = sin(p.y * 1.14 + sin(p.x * 0.91));
    float web = 1.0 - abs(a + b) * 0.5;
    return pow(clamp(web, 0.0, 1.0), 18.0);
  }

  void main() {
    vec2 uv = vUv;
    float h = texture2D(uHeight, uv).r;
    float hL = texture2D(uHeight, uv - vec2(uTexel.x, 0.0)).r;
    float hR = texture2D(uHeight, uv + vec2(uTexel.x, 0.0)).r;
    float hD = texture2D(uHeight, uv - vec2(0.0, uTexel.y)).r;
    float hU = texture2D(uHeight, uv + vec2(0.0, uTexel.y)).r;

    // The gentle solver field is amplified only at display time, where it
    // becomes refraction and a water-surface normal rather than large cells.
    vec2 broadGradient = vec2(hL - hR, hD - hU) * (38.0 * uReadability);
    float travel = uDirection * uTime;
    float sideMeander = sin(uv.x * 8.0 + travel * 0.23) * 0.35;
    float ripplePhaseA = uv.x * 30.0 + uv.y * 126.0 - travel * 5.2 + sideMeander + h * 4800.0;
    float ripplePhaseB = uv.x * 54.0 - uv.y * 88.0 - travel * 3.1 + h * 3600.0;
    float ripplePhaseC = (uv.x + uv.y) * 78.0 - travel * 2.2 + h * 2800.0;
    vec2 fineRipple = vec2(
      cos(ripplePhaseA) * 0.040 + cos(ripplePhaseB) * 0.017,
      sin(ripplePhaseB) * 0.034 + sin(ripplePhaseC) * 0.014
    ) * uReadability;
    vec2 surfaceSlope = broadGradient * 0.55 + fineRipple;
    float slope = length(surfaceSlope);

    // The riverbed texture is stationary; it is displaced only by the current
    // height field and its derived micro-surface, every rendered frame.
    vec2 refractOffset = broadGradient * 0.014 + fineRipple * 0.062;
    vec2 refractedBedUv = clamp(uv + refractOffset, vec2(0.001), vec2(0.999));
    vec2 bedUv = clamp((refractedBedUv - 0.5) * uCover + 0.5, vec2(0.001), vec2(0.999));
    vec3 bed = texture2D(uBed, bedUv).rgb * uBedExposure;
    vec3 waterTint = vec3(0.045, 0.29, 0.25);
    float depth = clamp(0.50 - h * 1.8, 0.0, 1.0);
    vec3 throughWater = mix(bed, waterTint, 0.13 + depth * 0.17);

    // Caustic flecks are static in texture space and are warped only by the
    // live height/slope field. There is deliberately no independent scroll.
    vec2 lightWarp = uv + broadGradient * 0.085 + fineRipple * 0.34 + vec2(h * 1.6, -h * 1.2);
    float caustic = waterCaustic(lightWarp);
    float causticDetail = waterCaustic(lightWarp * 1.91 + fineRipple * 0.20) * 0.32;
    float curvature = clamp(abs(hL + hR + hD + hU - 4.0 * h) * 2800.0, 0.0, 1.0);
    vec3 causticColor = vec3(0.79, 0.96, 0.76);
    throughWater += causticColor * (caustic * 0.020 + causticDetail * 0.009 + curvature * 0.012) * uReadability;

    // Tight, height-derived wet glints use a fixed oblique sky light.
    vec3 N = normalize(vec3(surfaceSlope.x * 1.25, surfaceSlope.y * 1.25, 1.9));
    vec3 light = normalize(vec3(-0.32, 0.38, 0.87));
    vec3 view = vec3(0.0, 0.0, 1.0);
    vec3 halfVector = normalize(light + view);
    float specular = pow(max(dot(N, halfVector), 0.0), 118.0);
    float crest = smoothstep(0.070, 0.160, slope);
    vec3 skyReflection = vec3(0.31, 0.58, 0.54) * pow(max(N.y, 0.0), 2.2);
    float fresnel = pow(1.0 - clamp(N.z, 0.0, 1.0), 1.8);
    vec3 color = throughWater + skyReflection * (0.10 + fresnel * 0.16);
    color += specular * vec3(0.96, 1.0, 0.90) * 0.58 * uReadability;
    color += crest * vec3(0.42, 0.75, 0.63) * 0.028 * uReadability;

    float tintMask = mix(1.0, depth, uTintDepth);
    color = mix(color, color * uTint + uTint * uTintAdditive, clamp(uTintStrength * tintMask, 0.0, 0.45));
    color *= uAmbient;

    if (uOvercast > 0.01) {
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(color, vec3(luma * 0.85), uOvercast * 0.45);
    }
    if (uLightning > 0.01) {
      vec3 boosted = 1.0 - exp(-color * (1.0 + uLightning * 2.8));
      color = max(color, boosted * uLightning);
    }

    float vignette = 1.0 - smoothstep(0.34, 0.82, length(uv - 0.5));
    color *= 0.72 + vignette * 0.28;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function replaceTemplate(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0 || source.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`Could not uniquely locate ${label} start marker.`);
  }
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Could not locate ${label} end marker.`);
  return source.slice(0, start + startMarker.length) + replacement + source.slice(end);
}

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

let bundle = fs.readFileSync(bundlePath, 'utf8');
if (bundle.includes('FLOW_CURRENT_REFERENCE_INTEGRATED')) {
  console.log('Water-current patch is already present.');
  process.exit(0);
}

bundle = replaceTemplate(bundle, 'LX=`', '`;function kX', simulationSource, 'simulation shader');
bundle = replaceTemplate(bundle, ',zX=`', '`;function BX', presentationSource, 'presentation shader');
bundle = replaceOnce(
  bundle,
  'uTime:{value:0},uPointer:{value:new st(.5,.5)}',
  'uTime:{value:0},uCurrentStrength:{value:.00035},uDirection:{value:1},uContained:{value:0},uPointer:{value:new st(.5,.5)}',
  'simulation current uniforms'
);
bundle = replaceOnce(
  bundle,
  'uTexel:{value:o.texelSize},uTime:{value:0}',
  'uTexel:{value:o.texelSize},uResolution:{value:new st(1,1)},uTime:{value:0},uDirection:{value:1},uReadability:{value:1}',
  'presentation current uniforms'
);
bundle = replaceOnce(
  bundle,
  'te.uniforms.uTime.value+=se;',
  'te.uniforms.uTime.value+=se,te.uniforms.uCurrentStrength.value=.00035,te.uniforms.uDirection.value=1,te.uniforms.uContained.value=0;',
  'per-frame current uniforms'
);
bundle = replaceOnce(
  bundle,
  'L.uTime.value+=Math.min(W,.05),L.uHeight.value=o.texture;',
  'L.uTime.value+=Math.min(W,.05),L.uHeight.value=o.texture,L.uResolution.value.set(v.width,v.height),L.uDirection.value=1;',
  'per-frame display texture binding'
);

bundle = bundle.replace('/* FLOW_CURRENT_REFERENCE_INTEGRATED */', '');
bundle += '\n/* FLOW_CURRENT_REFERENCE_INTEGRATED */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Patched ${bundlePath}`);
