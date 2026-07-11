/**
 * Flow: A Water Sanctuary
 * Main app entry — full-screen WebView loading the bundled water canvas.
 *
 * Architecture: Hybrid with local HTTP server
 * - @dr.pogodin/react-native-static-server serves the web bundle from localhost
 * - WebView loads http://localhost:<port>/index.html
 * - All relative paths (./assets/, ./manus-storage/, ./backgrounds/) resolve correctly
 * - Works offline, no file:// permission issues
 */

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";
import StaticServer from "@dr.pogodin/react-native-static-server";
import { resolveAssetSource } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function App() {
  useKeepAwake();
  const webViewRef = useRef<WebView>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const serverRef = useRef<StaticServer | null>(null);

  useEffect(() => {
    async function startServer() {
      try {
        // Resolve the path to the bundled web assets
        // The assets/web folder is included in the app bundle
        const asset = resolveAssetSource(require("./assets/web/index.html"));
        // Extract the directory path from the asset URI
        const assetUri = asset.uri;
        // Get the directory containing the web assets
        const webDir = assetUri.substring(0, assetUri.lastIndexOf("/"));

        // Start a local HTTP server pointing at the web assets directory
        const server = new StaticServer(0, webDir, { keepAlive: true });
        serverRef.current = server;

        const url = await server.start();
        console.log("Static server started at:", url);
        setServerUrl(`${url}/index.html`);
      } catch (e) {
        console.warn("Static server failed:", e);
        // Fallback: try direct require() approach
        setServerUrl("fallback");
      } finally {
        SplashScreen.hideAsync();
      }
    }

    startServer();

    return () => {
      if (serverRef.current) {
        serverRef.current.stop();
        serverRef.current = null;
      }
    };
  }, []);

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

  if (!serverUrl) {
    return <View style={styles.container} />;
  }

  // Fallback to direct require() if server failed
  const source =
    serverUrl === "fallback"
      ? require("./assets/web/index.html")
      : { uri: serverUrl };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <WebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        originWhitelist={["*"]}
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
        onError={(e) => console.warn("WebView error:", JSON.stringify(e.nativeEvent))}
        onMessage={(e) => console.log("WebView message:", e.nativeEvent.data)}
        injectedJavaScript={`
          window.onerror = function(msg, src, line, col, err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', msg, src, line}));
            return false;
          };
          true;
        `}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1a1a" },
  webview: { flex: 1, backgroundColor: "#0a1a1a" },
});
