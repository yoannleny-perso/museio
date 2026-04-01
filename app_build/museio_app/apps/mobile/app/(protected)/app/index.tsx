import { Link, type Href } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "../../../src/auth/auth-context";
import { MuseioBrandLockup } from "../../../src/brand/museio-brand-lockup";

const workspaceCards = [
  {
    title: "Portfolio",
    body: "Refine sections, live presentation, and public share-readiness.",
    href: "/app/portfolio" as Href,
    active: true
  },
  {
    title: "Bookings",
    body: "The data foundations already exist. Mobile focus is now catching up to the web shell.",
    active: false
  },
  {
    title: "Finance",
    body: "Finance truth is already server-owned. This mobile surface is being aligned with the premium shell.",
    active: false
  }
];

export default function ProtectedAppScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIdentity}>
              <MuseioBrandLockup compact subtitle="Creator mobile workspace" />
              <Text style={styles.heroBadge}>Creator mobile</Text>
              <Text style={styles.heroTitle}>Museio, designed for the way creators actually work on the go.</Text>
            </View>
            <Link href="/sign-in" onPress={() => void signOut()} style={styles.signOut}>
              Sign out
            </Link>
          </View>
          <Text style={styles.heroBody}>
            Keep public brand, booking momentum, and business context in one calmer mobile shell.
          </Text>
          <Text style={styles.heroMeta}>
            Signed in as {user?.profile.displayName ?? "Museio creator"}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Flagship</Text>
            <Text style={styles.metricValue}>Portfolio</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Flow</Text>
            <Text style={styles.metricValue}>Bookings to jobs</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Truth</Text>
            <Text style={styles.metricValue}>Finance</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workspace modules</Text>
          <Text style={styles.sectionBody}>
            The mobile shell is being aligned with the premium creator experience without changing
            the underlying data contracts.
          </Text>
          <View style={styles.actionList}>
            {workspaceCards.map((item) => (
              <View key={item.title} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                {item.active && item.href ? (
                  <Link href={item.href} style={styles.primaryAction}>
                    Open {item.title}
                  </Link>
                ) : (
                  <View style={styles.pendingPill}>
                    <Text style={styles.pendingPillText}>Mobile shell next</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    padding: 20,
    gap: 18
  },
  hero: {
    backgroundColor: tokens.color.surfaceDark,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 12
  },
  heroTop: {
    gap: 16
  },
  heroIdentity: {
    gap: 8
  },
  heroBadge: {
    color: "#D8CBFF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.76)"
  },
  heroMeta: {
    fontSize: 14,
    color: "rgba(255,255,255,0.64)"
  },
  signOut: {
    alignSelf: "flex-start",
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: "hidden",
    fontWeight: "700"
  },
  metricRow: {
    gap: 12
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: tokens.radius.md,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  metricLabel: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700"
  },
  metricValue: {
    color: tokens.color.text,
    fontSize: 18,
    fontWeight: "800"
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.color.text
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  actionList: {
    gap: 12
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: tokens.radius.lg,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.color.text
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  primaryAction: {
    marginTop: 8,
    backgroundColor: tokens.color.accent,
    color: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: tokens.radius.pill,
    overflow: "hidden",
    fontWeight: "800"
  },
  pendingPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.accentSoft
  },
  pendingPillText: {
    color: tokens.color.accent,
    fontWeight: "700"
  }
});
