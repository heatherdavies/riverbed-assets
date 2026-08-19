/**
 * Flow: A Water Sanctuary
 * Bare workflow — local HTTP server serves the web bundle from localhost.
 * WebGL works over http://localhost (blocked on file://).
 */

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  Platform,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";
import Server, { resolveAssetsPath } from "@dr.pogodin/react-native-static-server";

SplashScreen.preventAutoHideAsync();

export default function App() {
  useKeepAwake();
  const webViewRef = useRef<WebView>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const serverRef = useRef<Server | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-20), `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  };

  useEffect(() => {
    async function startServer() {
      try {
        addLog("Resolving assets path...");
        // resolveAssetsPath resolves the path to bundled assets in bare workflow
        const fileDir = resolveAssetsPath("assets/web");
        addLog(`Assets dir: ${fileDir}`);

        const server = new Server({ fileDir, port: 9080 });
        serverRef.current = server;

        addLog("Starting server on port 9080...");
        const url = await server.start();
        addLog(`Server started: ${url}`);
        setServerUrl(`${url}/index.html`);
      } catch (e: any) {
        addLog(`Error: ${e?.message ?? String(e)}`);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    startServer();
    return () => { serverRef.current?.stop(); };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      webViewRef.current?.goBack();
      return true;
    });
    return () => handler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Debug overlay */}
      {logs.length > 0 && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugTitle}>DEBUG LOG</Text>
          <ScrollView>
            {logs.map((log, i) => (
              <Text key={i} style={styles.debugText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      {serverUrl && (
        <WebView
          ref={webViewRef}
          source={{ uri: serverUrl }}
          style={styles.webview}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          onLoadStart={() => addLog("WebView: load started")}
          onLoadEnd={() => addLog("WebView: load ended")}
          onError={(e) => addLog(`WebView error: ${JSON.stringify(e.nativeEvent)}`)}
          onMessage={(e) => addLog(`JS: ${e.nativeEvent.data}`)}
          injectedJavaScript={`
            window.onerror = function(msg, src, line) {
              window.ReactNativeWebView.postMessage('JS error: ' + msg + ' at ' + src + ':' + line);
              return false;
            };
            setTimeout(function() {
              window.ReactNativeWebView.postMessage('Loaded: ' + document.title);
            }, 2000);
            true;
          `}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1a1a" },
  webview: { flex: 1, backgroundColor: "#0a1a1a" },
  debugOverlay: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    maxHeight: 300,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 8,
    padding: 10,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: "#0ea5c8",
  },
  debugTitle: { color: "#0ea5c8", fontWeight: "bold", fontSize: 12, marginBottom: 4 },
  debugText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 2,
  },
});
