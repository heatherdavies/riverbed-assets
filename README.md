# Flow: A Water Sanctuary — Capacitor iOS App

Native iOS app wrapping the Flow water meditation experience using Capacitor.

## Why Capacitor?

Capacitor uses a custom `capacitor://localhost` URL scheme that iOS treats as a secure origin, allowing WebGL to run from bundled local files. This is the correct approach for WebGL web apps on iOS.

## Project Structure

```
flow-capacitor/
  capacitor.config.json   ← Capacitor config (bundle ID, app name)
  www/                    ← Bundled web app (the water canvas)
    index.html
    assets/               ← JS/CSS bundles
    backgrounds/          ← Scene background images
    manus-storage/        ← Custom images + audio
  ios/                    ← Generated Xcode project (run: npx cap add ios)
  patch-index.js          ← Patches index.html for local loading
```

## First-Time Setup (on your server)

```bash
# 1. Install dependencies
npm install

# 2. Add the iOS platform (generates the ios/ Xcode project)
npx cap add ios

# 3. Sync web assets into the iOS project
npx cap sync ios

# 4. Commit the ios/ folder
git add ios/
git commit -m "Add Capacitor iOS project"
git push origin main
```

## Building for TestFlight

Use Xcode or EAS (requires bare workflow setup):

```bash
# With Xcode (on Mac):
npx cap open ios
# Then Archive → Distribute App → TestFlight

# Or build the ios/ folder directly with xcodebuild
```

## Updating the Water Canvas

```bash
# 1. Rebuild in water_playground_3d
cd ../water_playground_3d && npm run build

# 2. Copy new build
cp -r dist/public/* ../flow-capacitor/www/

# 3. Re-download manus-storage assets
# (run the download script)

# 4. Patch and sync
cd ../flow-capacitor
node patch-index.js
npx cap sync ios
git add -A && git commit -m "Update web bundle" && git push
```

## App Details

| Field | Value |
|-------|-------|
| Bundle ID | ca.homeflowapp.flow |
| App Name | Flow: A Water Sanctuary |
| Privacy Policy | https://homeflowapp.ca/privacy.html#flow |
