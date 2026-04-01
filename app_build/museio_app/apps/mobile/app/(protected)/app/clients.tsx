import { useCallback } from "react";
import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { fetchClientsState } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  EmptyPanel,
  MetricGrid,
  SectionCard,
  StateCard,
  formatMoney
} from "../../../src/ui/mobile-shell";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";

export default function ClientsScreen() {
  const loader = useCallback((accessToken: string) => fetchClientsState(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load clients."
  );

  if (isLoading) {
    return (
      <AppScaffold title="Clients" subtitle="Manage your client CRM" icon={Users} activeTab="more">
        <StateCard title="Loading clients" body="Pulling relationship summaries and outstanding balances." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="Clients" subtitle="Manage your client CRM" icon={Users} activeTab="more">
        <StateCard title="Clients unavailable" body={errorMessage ?? "Could not load clients."} />
      </AppScaffold>
    );
  }

  const totalOutstanding = state.clients.reduce(
    (sum, entry) => sum + entry.relationship.outstandingMinor,
    0
  );

  return (
    <AppScaffold title="Clients" subtitle="Manage your client CRM" icon={Users} activeTab="more">
      <MetricGrid
        items={[
          {
            label: "Clients",
            value: String(state.clients.length),
            subtitle: "Creator-scoped records",
            tone: "accent"
          },
          {
            label: "Outstanding",
            value: formatMoney(totalOutstanding),
            subtitle: "Open invoice exposure"
          }
        ]}
      />

      <SectionCard>
        <View style={styles.list}>
          {state.clients.length > 0 ? (
            state.clients.map(({ client, relationship }) => (
              <Pressable
                key={client.id}
                style={styles.clientCard}
                onPress={() => router.push(`/app/clients/${client.id}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{client.displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.clientText}>
                  <Text style={styles.clientTitle}>{client.displayName}</Text>
                  <Text style={styles.clientSubtitle}>{client.primaryEmail}</Text>
                  <Text style={styles.clientSubtitle}>
                    {formatMoney(relationship.outstandingMinor)} outstanding
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyPanel title="No clients yet" body="Clients are created from booking and job activity." />
          )}
        </View>
      </SectionCard>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14
  },
  clientCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: 16,
    alignItems: "center"
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.color.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: tokens.color.accent,
    fontWeight: "800"
  },
  clientText: {
    flex: 1,
    gap: 3
  },
  clientTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  clientSubtitle: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  }
});
