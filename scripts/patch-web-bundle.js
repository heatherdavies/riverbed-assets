#!/usr/bin/env node
/**
 * patch-web-bundle.js
 *
 * Patches the built web app's index.html for local file:// loading in iOS WKWebView.
 * Run this after copying the web build into assets/web/.
 *
 * Fixes applied:
 * 1. Convert absolute paths (/assets/, /manus-storage/, /backgrounds/) to relative (./)
 * 2. Remove the Manus debug collector script (not needed in production)
 * 3. Replace Google Fonts network link with a font-display:swap fallback
 *    (fonts load from the web if available, fall back to system fonts gracefully)
 * 4. Add safe-area-inset CSS for notch/Dynamic Island support
 * 5. Update viewport meta for viewport-fit=cover
 */

const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../assets/web/index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Convert absolute paths to relative paths
//    /assets/ → ./assets/
//    /manus-storage/ → ./manus-storage/
//    /backgrounds/ → ./backgrounds/
html = html.replace(/src="\/assets\//g, 'src="./assets/');
html = html.replace(/href="\/assets\//g, 'href="./assets/');
html = html.replace(/src="\/manus-storage\//g, 'src="./manus-storage/');
html = html.replace(/href="\/manus-storage\//g, 'href="./manus-storage/');
html = html.replace(/src="\/backgrounds\//g, 'src="./backgrounds/');
html = html.replace(/href="\/backgrounds\//g, 'href="./backgrounds/');

// Also fix crossorigin attribute on script/link tags with absolute paths
html = html.replace(/ crossorigin src="\/assets\//g, ' crossorigin src="./assets/');
html = html.replace(/ crossorigin href="\/assets\//g, ' crossorigin href="./assets/');

// 2. Remove the Manus debug collector script
html = html.replace(/<script src="\/__manus__\/debug-collector\.js"[^>]*><\/script>/g, "");
html = html.replace(/<script src="\.\/\/__manus__\/debug-collector\.js"[^>]*><\/script>/g, "");

// 3. Replace Google Fonts preconnect + link with a simpler version
//    Keep the link but add font-display:swap fallback in a style tag
//    The fonts will load from network when available, fall back to system fonts
html = html.replace(
  /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>/g,
  ""
);
html = html.replace(
  /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin \/>/g,
  ""
);
html = html.replace(
  /<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet" \/>/g,
  ""
);

// Add inline font fallback + safe-area CSS before </head>
const safeAreaAndFonts = `
  <style>
    /* Font fallbacks if Google Fonts unavailable (offline) */
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap');

    /* Safe area insets for notch / Dynamic Island / home indicator */
    :root {
      --safe-area-top: env(safe-area-inset-top, 0px);
      --safe-area-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-left: env(safe-area-inset-left, 0px);
      --safe-area-right: env(safe-area-inset-right, 0px);
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0a1a1a;
      /* Extend content behind notch */
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }

    #root {
      width: 100%;
      height: 100%;
    }
  </style>
`;

html = html.replace("</head>", safeAreaAndFonts + "\n</head>");

// 4. Update viewport meta to include viewport-fit=cover
html = html.replace(
  /content="width=device-width, initial-scale=1\.0, maximum-scale=1"/,
  'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"'
);

// Write the patched HTML back
fs.writeFileSync(htmlPath, html, "utf8");
console.log("✅ index.html patched successfully for local WebView loading");
console.log("   - Absolute paths converted to relative");
console.log("   - Manus debug script removed");
console.log("   - Safe-area CSS added for notch/Dynamic Island");
console.log("   - viewport-fit=cover added");
