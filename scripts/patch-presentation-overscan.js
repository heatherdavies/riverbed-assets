/*
 * Clean-entry presentation overscan for the approved advected Flow current.
 *
 * The live simulation remains untouched. Only uHeight lookups are shifted away
 * from the upper and lower simulation edges, so formation and outflow happen
 * just beyond the visible frame. Riverbed sampling continues to use the
 * original screen UV and therefore stays completely stationary.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_REVIEWED_ADVECTED_DOWNSTREAM_FLOW')) {
  throw new Error('Expected the reviewed advected-flow implementation before applying presentation overscan.');
}
if (bundle.includes('FLOW_CLEAN_ENTRY_PRESENTATION_OVERSCAN')) {
  console.log('Clean-entry presentation overscan is already present.');
  process.exit(0);
}

const displayStart = bundle.indexOf('`,zX=`');
if (displayStart < 0) throw new Error('Missing active water display shader.');
const startMarker = '    vec2 uv = vUv;\n';
const endMarker = '    // The full simulation remains visible, but its isotropic normal\n';
const start = bundle.indexOf(startMarker, displayStart);
if (start < 0) throw new Error('Missing display UV sampling start marker.');
const end = bundle.indexOf(endMarker, start + startMarker.length);
if (end < 0) throw new Error('Missing display gradient marker.');

const replacement = String.raw`    vec2 uv = vUv;

    // Display only the settled vertical interior of the same live height map.
    // With Flow's screen UV layout, y=1 is the visible top and y=0 the bottom.
    // The top 7.5% and bottom 7.5% of the simulator therefore remain beyond
    // the viewport, letting already-formed current enter above and leave below.
    // The background riverbed deliberately keeps using the original screen coordinates later in the shader.
    vec2 simUv = vec2(uv.x, mix(0.075, 0.925, uv.y));
    float h = texture2D(uHeight, simUv).r;
    float hL = texture2D(uHeight, simUv - vec2(uTexel.x, 0.0)).r;
    float hR = texture2D(uHeight, simUv + vec2(uTexel.x, 0.0)).r;
    float hD = texture2D(uHeight, simUv - vec2(0.0, uTexel.y)).r;
    float hU = texture2D(uHeight, simUv + vec2(0.0, uTexel.y)).r;

`;

bundle = bundle.slice(0, start) + replacement + bundle.slice(end);
bundle += '\n/* FLOW_CLEAN_ENTRY_PRESENTATION_OVERSCAN */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied clean-entry presentation overscan to ${bundlePath}.`);
