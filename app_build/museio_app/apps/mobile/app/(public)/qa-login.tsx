import { useEffect, useRef, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "../../src/auth/auth-context";
import { getMobileEnv } from "../../src/lib/env";

export default function QALoginScreen() {
  const params = useLocalSearchParams<{ email?: string; password?: string }>();
  const { signInWithPassword, isAuthenticated } = useAuth();
  const mobileEnv = getMobileEnv();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const attemptedRef = useRef(false);
  const email = params.email ?? mobileEnv.EXPO_PUBLIC_QA_EMAIL;
  const password = params.password ?? mobileEnv.EXPO_PUBLIC_QA_PASSWORD;

  useEffect(() => {
    if (!mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH) {
      return;
    }

    if (!email || !password) {
      setErrorMessage("Missing qa-login credentials.");
      return;
    }

    if (isAuthenticated || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    let active = true;

    signInWithPassword(email, password)
      .catch((error) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "QA sign in failed.");
        }
      });

    return () => {
      active = false;
    };
  }, [email, isAuthenticated, mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH, password, signInWithPassword]);

  if (!mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH) {
    return <Redirect href="/sign-in" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/app" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.badge}>Local QA</Text>
        <Text style={styles.title}>Signing into the seeded mobile test account…</Text>
        <Text style={styles.body}>
          This helper route is only available in local development when QA mode is enabled.
        </Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: tokens.color.background
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
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    color: tokens.color.text,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "800"
  },
  body: {
    color: tokens.color.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  error: {
    color: tokens.color.danger,
    fontSize: 14,
    lineHeight: 20
  }
});
