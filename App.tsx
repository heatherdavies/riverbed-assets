/**
 * Flow: A Water Sanctuary
 * Main app entry — full-screen WebView loading the bundled water canvas.
 *
 * Architecture: Hybrid
 * - The water canvas (WebGL/Three.js) runs inside a WKWebView via react-native-webview
 * - The web bundle HTML is read at build time and injected as a string
 * - Assets (backgrounds, audio, images) are loaded from the app bundle via file:// URIs
 *
 * To update the water canvas:
 * 1. Run npm run build in the water_playground_3d project
 * 2. Copy dist/public/* into assets/web/
 * 3. Run npm run patch to fix paths for local loading
 * 4. Rebuild with EAS
 */

import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, StatusBar, Platform, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

// The bundled index.html — loaded as a static asset via react-native-webview's source.uri
// react-native-webview handles the file:// URI resolution on iOS automatically
// when using the `source` prop with a require() for an HTML file.
const WEB_HTML = require("./assets/web/index.html");

export default function App() {
  useKeepAwake();
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Brief delay for splash screen, then show the WebView
    const t = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync();
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // Android back button
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, []);

  if (!ready) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <WebView
        ref={webViewRef}
        // react-native-webview resolves require() HTML files to a file:// URI on iOS
        // and sets the correct baseURL so relative paths (./assets/, ./manus-storage/) resolve
        source={WEB_HTML}
        style={styles.webview}
        // Allow local file access for all bundled assets
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        // Core web features
        javaScriptEnabled
        domStorageEnabled
        // Disable scroll — water canvas handles all touch
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        // Dark background prevents white flash
        backgroundColor="#0a1a1a"
        // Audio without user interaction (meditation app)
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        // Android hardware acceleration
        androidHardwareAccelerationDisabled={false}
        onError={(e) => console.warn("WebView error:", e.nativeEvent)}
        onHttpError={(e) => console.warn("WebView HTTP error:", e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1a1a" },
  webview: { flex: 1, backgroundColor: "#0a1a1a" },
});
