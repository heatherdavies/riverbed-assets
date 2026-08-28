/*
 * Direct, reviewed downstream-flow integration.
 *
 * Each replacement is bounded by named shader/renderer markers rather than an
 * entire whitespace-sensitive source fragment. The edit preserves the
 * stationary riverbed texture and live ping-pong targets while applying:
 *   1) downstream advection to the previous height/velocity state;
 *   2) a sparse crest phase whose direction matches the advected state; and
 *   3) reduced isotropic refraction so downstream movement is readable.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_UNIDIRECTIONAL_DOWNWARD_FLOW')) {
  throw new Error('Expected the prior unidirectional water implementation before this direct integration.');
}
if (bundle.includes('FLOW_REVIEWED_ADVECTED_DOWNSTREAM_FLOW')) {
  console.log('Reviewed downstream-flow integration is already present.');
  process.exit(0);
}

function indexAfter(marker, from, label) {
  const index = bundle.indexOf(marker, from);
  if (index < 0) throw new Error(`Missing ${label}: ${marker}`);
  return index + marker.length;
}

function replaceBetween(startMarker, endMarker, replacement, label, from = 0) {
  const start = indexAfter(startMarker, from, `${label} start marker`);
  const end = bundle.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing ${label} end marker: ${endMarker}`);
  bundle = bundle.slice(0, start) + replacement + bundle.slice(end);
}

const solverStart = bundle.indexOf('`,LX=`');
if (solverStart < 0) throw new Error('Missing active simulation shader block.');
const displayStart = bundle.indexOf('`,zX=`');
if (displayStart < 0) throw new Error('Missing active display shader block.');

// Add the one per-pass downstream step immediately after the simulation texel
// size declaration. It is set from the real frame delta in the existing loop.
replaceBetween(
  '  uniform vec2 uTexel;\n',
  '  uniform float uTime;',
  '  uniform float uDownstreamStep;\n',
  'simulation advection uniform',
  solverStart
);

// Move the exact state read and its Laplacian neighbourhood downstream before
// propagation. With Flow's screen mapping, sampling a little higher in the
// previous state carries a feature from top toward bottom in the new frame.
replaceBetween(
  '  void main() {\n',
  '    float laplacian =',
  String.raw`    vec2 uv = vUv;

    // Live downstream advection. This moves the actual ping-pong state rather
    // than an image or overlay, so touch ripples and ambient current are
    // carried in the same top-to-bottom direction.
    vec2 advectedUv = clamp(
      uv + vec2(0.0, uDownstreamStep),
      uTexel * 0.5,
      vec2(1.0) - uTexel * 0.5
    );
    vec4 current = texture2D(uPrev, advectedUv);
    float h = current.r;
    float v = current.g;

    float leftHeight  = texture2D(uPrev, advectedUv - vec2(uTexel.x, 0.0)).r;
    float rightHeight = texture2D(uPrev, advectedUv + vec2(uTexel.x, 0.0)).r;
    float downHeight  = texture2D(uPrev, advectedUv - vec2(0.0, uTexel.y)).r;
    float upHeight    = texture2D(uPrev, advectedUv + vec2(0.0, uTexel.y)).r;

`,
  'advected simulation state lookup',
  solverStart
);

// Align the optional broad crest force to the same down-screen direction and
// soften it; it is a visual accent, not a competing transport layer.
replaceBetween(
  '    // One sparse, top-to-bottom crest family is injected into the same live\n',
  '\n\n    if (uPointerDown > 0.5) {',
  String.raw`    // A sparse accent crest shares the same visual top-to-bottom
    // direction as the advected state. Its low amplitude avoids overpowering
    // the actual transported height field.
    float downstreamPhase = uv.y * 10.5 + uTime * 1.80 + h * 520.0;
    float downstreamCrest = sin(downstreamPhase);
    h += downstreamCrest * 0.000035 * mix(1.0, edge, uContained);`,
  'legacy crest block',
  solverStart
);

// Supply and update the downstream step in the existing ping-pong simulation
// material. The value is intentionally tiny per pass for smooth transport.
const defaultUniform = 'uTime:{value:0},uCurrentStrength:{value:.00035}';
if (!bundle.includes(defaultUniform)) throw new Error('Missing simulation uniform defaults.');
bundle = bundle.replace(defaultUniform, 'uTime:{value:0},uDownstreamStep:{value:0},uCurrentStrength:{value:.00035}');
const frameUniform = 'te.uniforms.uTime.value+=se,te.uniforms.uCurrentStrength.value=.00035';
if (!bundle.includes(frameUniform)) throw new Error('Missing per-frame simulation uniforms.');
bundle = bundle.replace(frameUniform, 'te.uniforms.uTime.value+=se,te.uniforms.uDownstreamStep.value=se*.055,te.uniforms.uCurrentStrength.value=.00035');

// De-emphasize the chaotic height-gradient response, so it supports instead of
// obscuring the downstream state transport.
replaceBetween(
  '    // The gentle solver field is amplified only at display time, where it\n',
  '    float travel =',
  String.raw`    // The full simulation remains visible, but its isotropic normal
    // response is deliberately restrained so downstream transport is legible.
    vec2 broadGradient = vec2(hL - hR, hD - hU) * (14.0 * uReadability);
`,
  'display broad-gradient gain',
  displayStart
);

// Render one down-screen crest family only. It agrees with the advected state
// and uses no lateral or trailing detail that could read as counterflow.
replaceBetween(
  '    float travel = uDirection * uTime;\n',
  '    float slope = length(surfaceSlope);',
  String.raw`
    // Single soft crest family moving top-to-bottom in Flow's screen layout.
    // There is intentionally no lateral meander or secondary ripple phase.
    float downPhase = uv.y * 10.5 + travel * 1.80 + h * 780.0;
    float crestWave = sin(downPhase);
    vec2 fineRipple = vec2(
      cos(downPhase) * 0.0015,
      crestWave * 0.040
    ) * uReadability;
    vec2 surfaceSlope = broadGradient * 0.10 + fineRipple;
    `,
  'directional display response',
  displayStart
);

replaceBetween(
  '    vec2 refractOffset =',
  '    vec2 refractedBedUv =',
  ' broadGradient * 0.003 + fineRipple * 0.045;\n',
  'stationary-bed refraction scale',
  displayStart
);
replaceBetween(
  '    vec2 lightWarp =',
  '    float caustic =',
  ' uv + broadGradient * 0.022 + fineRipple * 0.22 + vec2(h * 1.05, -h * 0.80);\n',
  'height-warped caustic scale',
  displayStart
);

bundle += '\n/* FLOW_REVIEWED_ADVECTED_DOWNSTREAM_FLOW */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied reviewed downstream advection and reduced-isotropic-refraction integration to ${bundlePath}.`);
