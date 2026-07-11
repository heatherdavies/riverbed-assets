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
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

SplashScreen.preventAutoHideAsync();

export default function App() {
  useKeepAwake();
  const webViewRef = useRef<WebView>(null);
  const [webUri, setWebUri] = useState<string | null>(null);

  useEffect(() => {
    async function loadWebApp() {
      try {
        // Download the bundled index.html to a local URI that WKWebView can load
        const asset = Asset.fromModule(require("./assets/web/index.html"));
        await asset.downloadAsync();

        if (asset.localUri) {
          // Copy to the document directory so relative asset paths resolve correctly
          const webDir = FileSystem.documentDirectory + "web/";
          const destUri = webDir + "index.html";
          const dirInfo = await FileSystem.getInfoAsync(webDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(webDir, { intermediates: true });
          }
          await FileSystem.copyAsync({ from: asset.localUri, to: destUri });
          setWebUri(destUri);
        }
      } catch (e) {
        console.warn("Failed to load web app:", e);
        // Fallback: load directly from asset URI
        const asset = Asset.fromModule(require("./assets/web/index.html"));
        await asset.downloadAsync();
        if (asset.localUri) setWebUri(asset.localUri);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    loadWebApp();
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

  if (!webUri) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <WebView
        ref={webViewRef}
        source={{ uri: webUri }}
        style={styles.webview}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        backgroundColor="#0a1a1a"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        androidHardwareAccelerationDisabled={false}
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
        onHttpError={(e) => console.warn("WebView HTTP error:", e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1a1a" },
  webview: { flex: 1, backgroundColor: "#0a1a1a" },
});
