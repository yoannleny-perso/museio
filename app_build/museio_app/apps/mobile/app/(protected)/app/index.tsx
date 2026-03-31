import { Link, type Href } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";

const quickActions = [
  {
    title: "Portfolio",
    body: "Refine sections, theme, and public presentation.",
    href: "/app/portfolio" as Href
  },
  {
    title: "Bookings",
    body: "Stay close to incoming demand and creator availability.",
    href: "/app" as Href
  },
  {
    title: "Finance",
    body: "Keep invoices, deposits, and balances top of mind.",
    href: "/app" as Href
  }
];

export default function ProtectedAppScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Creator mobile</Text>
          <Text style={styles.title}>Museio, designed for the way creators actually work on the go.</Text>
          <Text style={styles.body}>
            Review public brand, booking momentum, and business health from a calmer mobile shell
            that prioritizes clarity over admin clutter.
          </Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Flagship</Text>
            <Text style={styles.kpiValue}>Portfolio</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Focus</Text>
            <Text style={styles.kpiValue}>Bookings</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Health</Text>
            <Text style={styles.kpiValue}>Finance</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionList}>
            {quickActions.map((item) => (
              <View key={item.title} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                <Link href={item.href} style={styles.primaryAction}>
                  Open {item.title}
                </Link>
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
  badge: {
    color: "#D8CBFF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.74)"
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: tokens.radius.md,
    padding: 16,
    gap: 6
  },
  kpiLabel: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700"
  },
  kpiValue: {
    color: tokens.color.text,
    fontSize: 17,
    fontWeight: "700"
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: tokens.color.text
  },
  actionList: {
    gap: 12
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: tokens.radius.lg,
    padding: 20,
    gap: 10
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
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
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    fontWeight: "700"
  }
});
