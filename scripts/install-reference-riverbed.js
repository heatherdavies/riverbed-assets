const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceAsset = '/home/ubuntu/water_current_reference/flow_current_standalone/assets/shallow-riverbed.jpg';
const targetAsset = path.join(projectRoot, 'assets/web/backgrounds/shallow-riverbed-reference.jpg');
const bundlePath = path.join(projectRoot, 'assets/web/assets/index-CDavGNLu.js');
const staleUrl = '/manus-storage/koi_pond_teal_3b5cc487.jpg';
const referenceUrl = '/backgrounds/shallow-riverbed-reference.jpg';

if (!fs.existsSync(sourceAsset)) throw new Error(`Missing validated riverbed source: ${sourceAsset}`);
fs.copyFileSync(sourceAsset, targetAsset);

const bundle = fs.readFileSync(bundlePath, 'utf8');
if (!bundle.includes(staleUrl) && !bundle.includes(referenceUrl)) {
  throw new Error(`Could not find either the stale or reference default bed URL.`);
}
const patched = bundle.split(staleUrl).join(referenceUrl);
fs.writeFileSync(bundlePath, patched);
console.log(`Installed ${targetAsset} and confirmed the default riverbed URL.`);
