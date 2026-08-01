/**
 * patch-android.js
 * Patches the Android assets bundle to work with https://localhost scheme.
 * Run after npx cap sync android.
 *
 * Fixes:
 * 1. Replaces capacitor:// URL prefix with https://localhost/ in texture loading
 * 2. Expands the protocol check to also cover https: (Android scheme)
 */

const fs = require('fs');
const path = require('path');

const androidPublicDir = path.join(__dirname, 'android/app/src/main/assets/public');

// ── 1. Patch index.html ──────────────────────────────────────────────────────
const htmlPath = path.join(androidPublicDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Fix base href for Android
html = html.replace(/<base href="capacitor:\/\/localhost\/">/g, '<base href="./">');
html = html.replace(/<base href="capacitor:\/\/localhost">/g, '<base href="./">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ Android index.html patched');

// ── 2. Patch JS bundles ──────────────────────────────────────────────────────
const assetsDir = path.join(androidPublicDir, 'assets');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

let totalPatched = 0;

for (const jsFile of jsFiles) {
  const jsPath = path.join(assetsDir, jsFile);
  let js = fs.readFileSync(jsPath, 'utf8');
  const before = js;

  // Expand protocol check to also cover https://localhost (Android)
  // Original: window.location.protocol==="capacitor:"
  // Patched:  (window.location.protocol==="capacitor:"||window.location.protocol==="https:"&&window.location.hostname==="localhost")
  js = js.replace(
    /window\.location\.protocol==="capacitor:"/g,
    '(window.location.protocol==="capacitor:"||window.location.protocol==="https:"&&window.location.hostname==="localhost")'
  );

  // Fix capacitor://localhost/ URL prefix to use https://localhost/ on Android
  // Original: const W="capacitor://localhost/";
  // Patched:  const W=window.location.protocol==="capacitor:"?"capacitor://localhost/":"https://localhost/";
  js = js.replace(
    /const W="capacitor:\/\/localhost\/";/g,
    'const W=window.location.protocol==="capacitor:"?"capacitor://localhost/":"https://localhost/";'
  );

  if (js !== before) {
    fs.writeFileSync(jsPath, js, 'utf8');
    console.log(`✅ ${jsFile} patched (Android compatibility)`);
    totalPatched++;
  }
}

console.log(`\n✅ Android patch complete. ${totalPatched} JS files updated.`);
console.log('   Build the signed AAB in Android Studio and upload to Google Play.');
