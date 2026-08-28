/*
 * Experimental tuning only. Broaden and space the hidden-top impulses while
 * increasing the already-vertical transport rate enough for each wavelet to
 * cross the visible field before its local energy settles.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_VARIED_TOP_INLET_EXPERIMENT')) {
  throw new Error('Expected the varied top-inlet experiment before tuning it.');
}
if (bundle.includes('FLOW_TUNED_VARIED_TOP_INLET')) {
  console.log('Varied Top Inlet tuning is already present.');
  process.exit(0);
}

const replacements = [
  ['te.uniforms.uFlowStep.value.set(0,se*.018)', 'te.uniforms.uFlowStep.value.set(0,se*.032)', 'vertical transport rate'],
  ['while(inletTimerRef.current>=.56){', 'while(inletTimerRef.current>=.96){', 'inlet cadence threshold'],
  ['inletTimerRef.current-=.56;', 'inletTimerRef.current-=.96;', 'inlet cadence reset'],
  ['const inletX=.14+.72*(.5+.5*Math.sin(inletTime*.47+Math.sin(inletTime*.13)*.75));', 'const inletX=.18+.64*(.5+.5*Math.sin(inletTime*.47+Math.sin(inletTime*.13)*.75));', 'inlet horizontal range'],
  ['const inletScale=.70+.55*(.5+.5*Math.sin(inletTime*.83+1.2));', 'const inletScale=1.30+.55*(.5+.5*Math.sin(inletTime*.83+1.2));', 'inlet breadth'],
  ['const inletForce=.24+.18*(.5+.5*Math.sin(inletTime*.61+2.1));', 'const inletForce=.32+.14*(.5+.5*Math.sin(inletTime*.61+2.1));', 'inlet force'],
];

for (const [target, replacement, label] of replacements) {
  const first = bundle.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (bundle.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  bundle = bundle.slice(0, first) + replacement + bundle.slice(first + target.length);
}

bundle += '\n/* FLOW_TUNED_VARIED_TOP_INLET */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied varied top-inlet tuning to ${bundlePath}.`);
