/*
 * Gentle display-only styling for the approved Flow current.
 *
 * This patch does not change the simulation, its ping-pong targets, the
 * downstream advection, or the riverbed coordinates. It adds only a restrained
 * downstream-facing light cue to the existing travelling crest phase, helping
 * the eye track top-to-bottom movement without turning water into bands.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_CLEAN_ENTRY_PRESENTATION_OVERSCAN')) {
  throw new Error('Expected the clean-entry current implementation before applying gentle directional styling.');
}
if (bundle.includes('FLOW_GENTLE_DOWNSTREAM_STYLING')) {
  console.log('Gentle downstream styling is already present.');
  process.exit(0);
}

const displayStart = bundle.indexOf('`,zX=`');
if (displayStart < 0) throw new Error('Missing active water display shader.');
const insertMarker = '    float vignette = 1.0 - smoothstep(0.34, 0.82, length(uv - 0.5));\n';
const insertAt = bundle.indexOf(insertMarker, displayStart);
if (insertAt < 0) throw new Error('Missing final display-lighting insertion marker.');

const styling = String.raw`    // Gentle downstream-facing crest light. This is display-only: the moving
    // crest phase is already part of the live height field, and the riverbed
    // remains sampled at its original, stationary screen coordinates.
    float crestMask = pow(max(crestWave, 0.0), 3.4);
    float downstreamFace = smoothstep(0.004, 0.030, -surfaceSlope.y);
    float surfaceDetail = smoothstep(0.006, 0.045, slope);
    float flowLight = crestMask * mix(0.38, 1.0, downstreamFace) * surfaceDetail;
    color += vec3(0.028, 0.067, 0.052) * flowLight * uReadability;

`;

bundle = bundle.slice(0, insertAt) + styling + bundle.slice(insertAt);
bundle += '\n/* FLOW_GENTLE_DOWNSTREAM_STYLING */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied gentle downstream display styling to ${bundlePath}.`);
