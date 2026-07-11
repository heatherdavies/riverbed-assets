# Flow: A Water Sanctuary — Expo App

A native iOS/Android app wrapping the Flow water meditation experience.

## Architecture

**Hybrid approach:** The water canvas (WebGL/Three.js liquid glass shader) runs inside a `WKWebView` via `react-native-webview`. The web bundle is loaded from local assets — no internet connection required.

```
flow-expo/
  App.tsx              ← Main entry: full-screen WebView
  assets/
    web/               ← Bundled web app (copy from water_playground_3d/dist/public/)
      index.html
      assets/          ← JS/CSS bundles
      backgrounds/     ← Scene background images
      manus-storage/   ← Custom scene images + audio files
  eas.json             ← EAS Build configuration
  app.json             ← Expo app configuration
```

## Updating the Water Canvas

When you make changes to the web prototype (`water_playground_3d`):

```bash
# 1. Build the web app
cd water_playground_3d
npm run build

# 2. Copy the build output into the Expo project
cp -r dist/public/* ../riverbed-assets/flow-expo/assets/web/

# 3. Also download any new manus-storage assets (if new scenes/audio were added)
# See the download script in scripts/download-assets.sh

# 4. Commit and rebuild with EAS
cd ../riverbed-assets
git add -A && git commit -m "Update water canvas bundle"
eas build --platform ios --profile production
```

## First-Time Setup (on your server)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login
# Username: heatherdavies

# Install dependencies
cd flow-expo
npm install

# Configure EAS (first time only — sets up Apple signing)
eas build:configure
```

## Building for TestFlight

```bash
# Build for internal testing (TestFlight)
eas build --platform ios --profile preview

# Build for App Store submission
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

## App Details

| Field | Value |
|-------|-------|
| App Name | Flow: A Water Sanctuary |
| Bundle ID | ca.homeflowapp.flow |
| Expo Owner | heatherdavies |
| Version | 1.0.0 |
| Privacy Policy | https://homeflowapp.ca/privacy.html#flow |

## Before Submitting to App Store

Fill in `eas.json` submit section:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@email.com",
      "ascAppId": "your-app-store-connect-app-id",
      "appleTeamId": "your-team-id"
    }
  }
}
```
