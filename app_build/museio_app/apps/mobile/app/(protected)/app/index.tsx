import { Link, type Href } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";

export default function ProtectedAppScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Authenticated shell</Text>
          <Text style={styles.title}>Museio Workspace</Text>
          <Text style={styles.body}>
            Portfolio is the first production slice. Finance, booking, CRM, and
            messaging remain intentionally out of scope for this phase.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio</Text>
          <Text style={styles.cardBody}>
            Open the Portfolio slice to review public visibility, theme selection,
            and section structure from the shared API contract.
          </Text>
          <Link href={"/app/portfolio" as Href} style={styles.primaryAction}>
            Open Portfolio
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.background
  },
  container: {
    padding: 24,
    gap: 18
  },
  hero: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 12
  },
  badge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textMuted
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 10
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: tokens.color.text
  },
  cardBody: {
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
  }
});
