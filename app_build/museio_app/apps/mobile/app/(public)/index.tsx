import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";

export default function MobileHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Public shell</Text>
        <Text style={styles.title}>Museio creator app</Text>
        <Text style={styles.body}>
          The mobile app keeps the authenticated creator workspace. Portfolio live
          mode stays web-first, while the workspace shell and portfolio entry point
          now follow real public versus protected routing boundaries.
        </Text>

        <Link href="/app" style={styles.primaryAction}>
          Enter workspace
        </Link>
        <Link href="/sign-in" style={styles.secondaryAction}>
          Open sign in shell
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: tokens.color.accent
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textMuted
  },
  primaryAction: {
    marginTop: 8,
    backgroundColor: tokens.color.accent,
    color: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    fontWeight: "700"
  },
  secondaryAction: {
    color: tokens.color.accent,
    paddingVertical: 8,
    fontWeight: "600"
  }
});
