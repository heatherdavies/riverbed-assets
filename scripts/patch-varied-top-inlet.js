/*
 * Experimental branch only: replace the uniform shader inlet with occasional,
 * varied local impulses at the already-hidden top simulation boundary. The
 * impulses use Flow's existing live drop queue, so they behave like the
 * user-loved finger/tap waves but are introduced above the visible frame and
 * then carried straight downward by the existing ping-pong transport.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_VERTICAL_INLET_OUTLET_EXPERIMENT')) {
  throw new Error('Expected the vertical inlet–outlet experiment before adding varied top impulses.');
}
if (bundle.includes('FLOW_VARIED_TOP_INLET_EXPERIMENT')) {
  console.log('Varied Top Inlet experiment is already present.');
  process.exit(0);
}

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

const inletStart = bundle.indexOf('    // The current has a real source: two gently varying wave trains are added');
const inletEnd = bundle.indexOf('    if (uPointerDown > 0.5)', inletStart);
if (inletStart < 0 || inletEnd < 0) {
  throw new Error('Could not locate the existing uniform inlet block.');
}
const quietInlet = String.raw`    // Ambient water enters through varied local impulses issued from the
    // hidden top boundary by the frame loop. The solver itself remains purely
    // live height/velocity propagation between those natural-looking inputs.
`;
bundle = bundle.slice(0, inletStart) + quietInlet + bundle.slice(inletEnd);

const refsTarget = 'A=ee.useRef(0),P=ee.useRef(0),I=ee.useRef([]),k=';
const refsReplacement = 'A=ee.useRef(0),P=ee.useRef(0),inletTimerRef=ee.useRef(.18),I=ee.useRef([]),k=';
bundle = replaceOnce(bundle, refsTarget, refsReplacement, 'top-inlet timer reference');

const frameTarget = 'te.uniforms.uDirection.value=1,te.uniforms.uContained.value=0;const Te=';
const frameReplacement = String.raw`te.uniforms.uDirection.value=1,te.uniforms.uContained.value=0;
    // Add an occasional, varied wave just inside the hidden upper buffer.
    // Its x-position, width, and force evolve slowly, while vertical transport
    // carries it through the visible surface and the lower absorber removes it.
    inletTimerRef.current+=se;
    while(inletTimerRef.current>=.56){
      inletTimerRef.current-=.56;
      const inletTime=te.uniforms.uTime.value;
      const inletX=.14+.72*(.5+.5*Math.sin(inletTime*.47+Math.sin(inletTime*.13)*.75));
      const inletScale=.70+.55*(.5+.5*Math.sin(inletTime*.83+1.2));
      const inletForce=.24+.18*(.5+.5*Math.sin(inletTime*.61+2.1));
      j(inletX,.988,inletScale,inletForce);
    }
    const Te=`;
bundle = replaceOnce(bundle, frameTarget, frameReplacement, 'top-inlet frame scheduling');

bundle += '\n/* FLOW_VARIED_TOP_INLET_EXPERIMENT */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied varied hidden-top inlet to ${bundlePath}.`);
