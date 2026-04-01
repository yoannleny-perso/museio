import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "./auth-context";
import { getMobileEnv } from "../lib/env";

export function ProtectedScreen({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const mobileEnv = getMobileEnv();
  const allowDemoAccess =
    __DEV__ && mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH;
  const hasQACredentials = Boolean(
    mobileEnv.EXPO_PUBLIC_QA_EMAIL && mobileEnv.EXPO_PUBLIC_QA_PASSWORD
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.badge}>Museio</Text>
          <Text style={styles.title}>Loading your app…</Text>
          <Text style={styles.body}>Checking your session and loading your latest workspace.</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    if (allowDemoAccess && hasQACredentials) {
      return <Redirect href="/qa-login" />;
    }

    return <Redirect href="/sign-in" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.color.background,
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  badge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "800",
    color: tokens.color.text
  },
  body: {
    color: tokens.color.textMuted,
    fontSize: 16,
    lineHeight: 24
  }
});
