import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "./auth-context";

export function ProtectedScreen({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.badge}>Protected shell</Text>
          <Text style={styles.title}>Checking session…</Text>
          <Text style={styles.body}>
            Restoring the creator workspace before protected screens appear.
          </Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
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
