/**
 * patch-index.js
 * Patches the web bundle for Capacitor local loading.
 * Run after copying the web build into www/.
 *
 * Fixes:
 * 1. index.html: add root div, move script to end of body, fix paths, add safe-area CSS
 * 2. JS bundle: replace absolute /manus-storage/ and /backgrounds/ paths with ./
 */

const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// ── 1. Patch index.html ──────────────────────────────────────────────────────
const htmlPath = path.join(wwwDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Add <base href> so absolute paths like /manus-storage/ resolve correctly in Capacitor
// This must be the first element in <head>
// Use ./ (relative) so it works on both iOS (capacitor://localhost) and Android (https://localhost)
if (!html.includes('<base href')) {
  html = html.replace('<head>', '<head>\n  <base href="./">');
}

// Find the JS bundle filename dynamically
const jsBundleMatch = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
const jsBundleSrc = jsBundleMatch ? jsBundleMatch[1] : null;

// Remove the script tag from head (we'll add it to the end of body)
if (jsBundleSrc) {
  html = html.replace(new RegExp(`<script[^>]*src="${jsBundleSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*></script>`), '');
}

// Remove manus debug script
html = html.replace(/<script src="\/__manus__\/debug-collector\.js"[^>]*><\/script>/g, '');
html = html.replace(/<script src="\.\/\/__manus__\/debug-collector\.js"[^>]*><\/script>/g, '');

// Fix absolute paths to relative in HTML
html = html.replace(/src="\/assets\//g, 'src="./assets/');
html = html.replace(/href="\/assets\//g, 'href="./assets/');
html = html.replace(/src="\/manus-storage\//g, 'src="../manus-storage/');
html = html.replace(/href="\/manus-storage\//g, 'href="../manus-storage/');
html = html.replace(/src="\/backgrounds\//g, 'src="../backgrounds/');
html = html.replace(/href="\/backgrounds\//g, 'href="../backgrounds/');

// Remove type=module and crossorigin
html = html.replace(/<script type="module" crossorigin src="/g, '<script src="');
html = html.replace(/<link rel="stylesheet" crossorigin href="/g, '<link rel="stylesheet" href="');

// Update viewport
if (!html.includes('viewport-fit=cover')) {
  html = html.replace(
    /content="width=device-width, initial-scale=1\.0[^"]*"/,
    'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"'
  );
}

// Add safe area CSS and root div before </head>
const safeAreaCSS = `
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#0a1a1a; }
    #root { width:100%; height:100%; }
  </style>`;

if (!html.includes('safe-area-inset') && !html.includes('#root {')) {
  html = html.replace('</head>', safeAreaCSS + '\n</head>');
}

// Ensure <div id="root"> exists in body
if (!html.includes('<div id="root">') && !html.includes("<div id='root'>")) {
  html = html.replace('<body>', '<body>\n    <div id="root"></div>');
}

// Add Capacitor image loader patch + JS bundle at end of body
const capacitorImagePatch = `
  <script>
  // Patch Image loading for Capacitor WKWebView
  // Three.js TextureLoader uses new Image() which may fail on capacitor:// URLs
  // This patch intercepts image loading and uses fetch+blob instead
  (function() {
    var OrigImage = window.Image;
    function PatchedImage(w, h) {
      var img = new OrigImage(w, h);
      var origSrcDescriptor = Object.getOwnPropertyDescriptor(OrigImage.prototype, 'src');
      var patchedSet = function(val) {
        if (val && (val.startsWith('capacitor://') || val.startsWith('https://localhost') || val.startsWith('../') || val.startsWith('./')) && !val.startsWith('data:')) {
          fetch(val)
            .then(function(r) { return r.blob(); })
            .then(function(blob) {
              var url = URL.createObjectURL(blob);
              origSrcDescriptor.set.call(img, url);
            })
            .catch(function(e) {
              origSrcDescriptor.set.call(img, val);
            });
        } else {
          origSrcDescriptor.set.call(img, val);
        }
      };
      Object.defineProperty(img, 'src', {
        set: patchedSet,
        get: function() { return origSrcDescriptor.get.call(img); },
        configurable: true
      });
      return img;
    }
    PatchedImage.prototype = OrigImage.prototype;
    window.Image = PatchedImage;
  })();
  </script>`;

if (jsBundleSrc && !html.includes(jsBundleSrc)) {
  const relativeSrc = jsBundleSrc.startsWith('/') ? '.' + jsBundleSrc : jsBundleSrc;
  html = html.replace('</body>', capacitorImagePatch + `\n    <script src="${relativeSrc}"></script>\n  </body>`);
} else if (!html.includes('PatchedImage')) {
  html = html.replace('</body>', capacitorImagePatch + '\n  </body>');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ index.html patched');

// ── 2. Patch JS bundle — fix absolute paths to relative ─────────────────────
const assetsDir = path.join(wwwDir, 'assets');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

for (const jsFile of jsFiles) {
  const jsPath = path.join(assetsDir, jsFile);
  let js = fs.readFileSync(jsPath, 'utf8');

  // Replace "/manus-storage/ with "../manus-storage/
  const before = js.length;
  js = js.replace(/"\s*\/manus-storage\//g, '"../manus-storage/');
  js = js.replace(/'\s*\/manus-storage\//g, "'../manus-storage/");
  js = js.replace(/`\s*\/manus-storage\//g, '`../manus-storage/');

  // Replace "/backgrounds/ with "../backgrounds/
  js = js.replace(/"\s*\/backgrounds\//g, '"../backgrounds/');
  js = js.replace(/'\s*\/backgrounds\//g, "'../backgrounds/");

  const after = js.length;
  fs.writeFileSync(jsPath, js, 'utf8');
  console.log(`✅ ${jsFile} patched (${before !== after ? 'paths fixed' : 'no changes needed'})`);
}

console.log('\n✅ All patches applied successfully');
console.log('   Run: npx cap sync ios');
