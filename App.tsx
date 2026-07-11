/**
 * Flow: A Water Sanctuary
 * Main app entry — full-screen WebView loading the bundled water canvas.
 *
 * Architecture: Hybrid
 * - The water canvas (WebGL/Three.js) runs inside a WKWebView via react-native-webview
 * - The web bundle is loaded from local assets (no internet required)
 * - All interactions (touch, settings, forms) are handled inside the web bundle
 *
 * To update the water canvas:
 * 1. Run npm run build in the water_playground_3d project
 * 2. Copy dist/public/* into assets/web/
 * 3. Rebuild with EAS
 */

import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, StatusBar, Platform, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function App() {
  useKeepAwake();
  const webViewRef = useRef<WebView>(null);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Android back button — navigate back in WebView history if possible
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

  if (!appIsReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <WebView
        ref={webViewRef}
        // Load the bundled HTML from local assets — no internet required
        source={require("./assets/web/index.html")}
        style={styles.webview}
        // Allow local file access for backgrounds, audio, and all bundled assets
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        // JavaScript and storage
        javaScriptEnabled
        domStorageEnabled
        // Disable bouncy scroll — the water canvas handles its own touch
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        // Prevent white flash on load
        backgroundColor="#0a1a1a"
        // Allow audio to play without user interaction (meditation app)
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        // Hardware acceleration on Android
        androidHardwareAccelerationDisabled={false}
        // Ensure full-screen viewport including notch/home indicator
        injectedJavaScriptBeforeContentLoaded={`
          (function() {
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(meta);
          })();
          true;
        `}
        onError={(e) => console.warn("WebView error:", e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1a1a" },
  webview: { flex: 1, backgroundColor: "#0a1a1a" },
});
