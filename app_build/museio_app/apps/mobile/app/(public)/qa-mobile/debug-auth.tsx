import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "../../../src/auth/auth-context";
import { getMobileEnv } from "../../../src/lib/env";

export default function DebugAuthScreen() {
  const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();
  const mobileEnv = getMobileEnv();
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAccessToken().then((token) => {
      if (active) {
        setResolvedToken(token);
      }
    });

    return () => {
      active = false;
    };
  }, [getAccessToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.title}>Mobile QA auth debug</Text>
        <Text style={styles.line}>isLoading: {String(isLoading)}</Text>
        <Text style={styles.line}>isAuthenticated: {String(isAuthenticated)}</Text>
        <Text style={styles.line}>
          demoAuth: {String(mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH)}
        </Text>
        <Text style={styles.line}>qaEmail: {mobileEnv.EXPO_PUBLIC_QA_EMAIL ?? "missing"}</Text>
        <Text style={styles.line}>
          envToken: {mobileEnv.EXPO_PUBLIC_QA_ACCESS_TOKEN ? "present" : "missing"}
        </Text>
        <Text style={styles.line}>resolvedToken: {resolvedToken ? "present" : "missing"}</Text>
        <Text style={styles.line}>user: {user?.email ?? "none"}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.background,
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: tokens.color.text
  },
  line: {
    color: tokens.color.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});
