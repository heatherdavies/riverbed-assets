/*
 * Makes Flow's existing live rolling-wave field unmistakably top-to-bottom.
 * The refinement changes only the solver forcing and the height-derived
 * surface normal: the riverbed itself remains a stationary texture.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_TOP_TO_BOTTOM_ROLLING_WAVES')) {
  throw new Error('The initial rolling-wave refinement is required before directional crests can be strengthened.');
}
if (bundle.includes('FLOW_DOMINANT_DOWNWARD_CRESTS')) {
  console.log('Dominant downward crest refinement is already present.');
  process.exit(0);
}

const simulationTarget = String.raw`    // Broad, low-amplitude crests are a second live forcing term in the same
    // height field. In Flow's UV orientation, the positive time phase carries
    // the crests visually from the top of the screen down toward the bottom.
    float rollingPhase = uv.y * 28.0 + uTime * 2.45
                       + sin(uv.x * 5.0 + uTime * 0.20) * 0.62;
    float rollingCurrent = sin(rollingPhase + h * 2100.0);
    h += rollingCurrent * 0.000055 * mix(1.0, edge, uContained);`;

const simulationReplacement = String.raw`    // Source-of-truth directional crest field. In Flow's UV orientation, the
    // positive time phase carries each broad leading crest from top to bottom.
    // The small x component merely keeps the live water organic; it cannot
    // compete with or obscure the downward crest direction.
    float downwardPhase = uv.y * 17.5 + uTime * 3.10
                        + sin(uv.x * 2.2 + uTime * 0.14) * 0.15;
    float downwardCrest = sin(downwardPhase + h * 1600.0);
    h += downwardCrest * 0.000090 * mix(1.0, edge, uContained);`;

const presentationTarget = String.raw`    // These crests share the live solver's height and time state. The nearly
    // horizontal bands progress top-to-bottom, with modest cross-current
    // meander so they read as rolling shallow-water waves—not a uniform shine.
    float rollPhase = uv.y * 28.0 + travel * 2.45
                    + sin(uv.x * 5.0 + travel * 0.20) * 0.62
                    + h * 4600.0;
    float rollDetail = uv.y * 61.0 + uv.x * 7.0 + travel * 4.60 + h * 6100.0;
    float rollCrest = sin(rollPhase);
    vec2 fineRipple = vec2(
      cos(rollPhase + uv.x * 2.8) * 0.017 + sin(rollDetail) * 0.008,
      rollCrest * 0.066 + sin(rollDetail) * 0.020
    ) * uReadability;`;

const presentationReplacement = String.raw`    // Downward travelling, nearly horizontal crest faces dominate the water
    // read. The narrow leading crest has only a slight x meander, while small
    // height-coupled detail keeps the bands from becoming graphic stripes.
    float downPhase = uv.y * 17.5 + travel * 3.10
                    + sin(uv.x * 2.2 + travel * 0.14) * 0.15
                    + h * 3400.0;
    float crestWave = sin(downPhase);
    float leadingCrest = pow(max(crestWave, 0.0), 1.65);
    float trailingDetail = sin(uv.y * 56.0 + uv.x * 3.0 + travel * 4.1 + h * 5600.0);
    vec2 fineRipple = vec2(
      cos(downPhase) * 0.008 + trailingDetail * 0.003,
      crestWave * 0.105 + trailingDetail * 0.009
    ) * uReadability;`;

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

bundle = replaceOnce(bundle, simulationTarget, simulationReplacement, 'initial rolling-wave solver block');
bundle = replaceOnce(bundle, presentationTarget, presentationReplacement, 'initial rolling-wave display block');
bundle += '\n/* FLOW_DOMINANT_DOWNWARD_CRESTS */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Patched ${bundlePath} with dominant top-to-bottom live crests.`);
