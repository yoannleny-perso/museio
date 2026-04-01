import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  GripVertical,
  Trash2,
  X
} from "lucide-react-native";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { tokens } from "@museio/ui";

type DraftLineItem = {
  id: string;
  name: string;
  unitCost: string;
  quantity: string;
  taxEnabled: boolean;
  expanded: boolean;
};

function createJobNumber() {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-3);
  return `MUS-${year}-${suffix}`;
}

export default function NewJobScreen() {
  const params = useLocalSearchParams<{ source?: string }>();
  const [title, setTitle] = useState("");
  const [jobNumber, setJobNumber] = useState(createJobNumber);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([
    {
      id: "line-1",
      name: "DJ Service",
      unitCost: "0",
      quantity: "1",
      taxEnabled: false,
      expanded: true
    }
  ]);

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const unitCost = Number(item.unitCost) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + unitCost * quantity;
    }, 0);
  }, [lineItems]);
  const showRequestCallout = params.source === "request";

  function updateLineItem(id: string, updates: Partial<DraftLineItem>) {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function addLineItem() {
    setLineItems((current) => {
      if (current.length >= 10) {
        return current;
      }

      return [
        ...current,
        {
          id: `line-${Date.now()}`,
          name: "",
          unitCost: "0",
          quantity: "1",
          taxEnabled: false,
          expanded: true
        }
      ];
    });
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F9FBFF", "#F4F0FF", "#EEF3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>New Job</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Upcoming</Text>
            </View>
          </View>

          <Pressable style={styles.closeButton} onPress={() => router.push("/app/jobs")}>
            <X color={tokens.color.textSubtle} size={20} strokeWidth={2.2} />
          </Pressable>
        </View>

        {showRequestCallout ? (
          <View style={styles.calloutCard}>
            <Text style={styles.calloutTitle}>Use booking requests for live job creation</Text>
            <Text style={styles.calloutBody}>
              Accepted booking requests still create the durable job draft. Review the request
              first, then use this screen to refine the commercial details.
            </Text>
            <Pressable style={styles.calloutButton} onPress={() => router.push("/app/jobs")}>
              <CirclePlus color={tokens.color.accent} size={16} strokeWidth={2.2} />
              <Text style={styles.calloutButtonText}>Review Requests</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Corporate Gala Night"
              placeholderTextColor="#A3A9B7"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Job Number</Text>
            <TextInput
              value={jobNumber}
              onChangeText={setJobNumber}
              placeholderTextColor="#A3A9B7"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowField}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-04-01"
                placeholderTextColor="#A3A9B7"
                style={styles.input}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="18:00"
                placeholderTextColor="#A3A9B7"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowField}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2026-04-01"
                placeholderTextColor="#A3A9B7"
                style={styles.input}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="23:00"
                placeholderTextColor="#A3A9B7"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.lineItemsHeader}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            <Text style={styles.lineItemsCount}>{lineItems.length}/10</Text>
          </View>

          <View style={styles.lineItemsList}>
            {lineItems.map((item, index) => (
              <View key={item.id} style={styles.lineItemCard}>
                <View style={styles.lineItemTopRow}>
                  <GripVertical color="#A4A9B6" size={18} strokeWidth={2} />
                  <Pressable
                    style={styles.lineItemTitleWrap}
                    onPress={() => updateLineItem(item.id, { expanded: !item.expanded })}
                  >
                    <Text style={styles.lineItemTitle}>
                      {item.name || `Line Item ${index + 1}`}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => updateLineItem(item.id, { expanded: !item.expanded })}
                  >
                    {item.expanded ? (
                      <ChevronUp color={tokens.color.textSubtle} size={18} strokeWidth={2.2} />
                    ) : (
                      <ChevronDown color={tokens.color.textSubtle} size={18} strokeWidth={2.2} />
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => removeLineItem(item.id)}
                  >
                    <Trash2 color={tokens.color.danger} size={18} strokeWidth={2.2} />
                  </Pressable>
                </View>

                {item.expanded ? (
                  <View style={styles.lineItemFields}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Item Name</Text>
                      <TextInput
                        value={item.name}
                        onChangeText={(value) => updateLineItem(item.id, { name: value })}
                        placeholder="DJ Service"
                        placeholderTextColor="#A3A9B7"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={styles.rowField}>
                        <Text style={styles.label}>Unit Cost</Text>
                        <TextInput
                          value={item.unitCost}
                          onChangeText={(value) => updateLineItem(item.id, { unitCost: value })}
                          placeholder="0"
                          placeholderTextColor="#A3A9B7"
                          keyboardType="numeric"
                          style={styles.input}
                        />
                      </View>
                      <View style={styles.rowField}>
                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                          value={item.quantity}
                          onChangeText={(value) => updateLineItem(item.id, { quantity: value })}
                          placeholder="1"
                          placeholderTextColor="#A3A9B7"
                          keyboardType="numeric"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.taxToggle,
                        item.taxEnabled && styles.taxToggleActive
                      ]}
                      onPress={() =>
                        updateLineItem(item.id, { taxEnabled: !item.taxEnabled })
                      }
                    >
                      <Text
                        style={[
                          styles.taxToggleText,
                          item.taxEnabled && styles.taxToggleTextActive
                        ]}
                      >
                        {item.taxEnabled ? "Tax Enabled" : "Tax Disabled"}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          <Pressable style={styles.addLineItemButton} onPress={addLineItem}>
            <CirclePlus color={tokens.color.accent} size={16} strokeWidth={2.2} />
            <Text style={styles.addLineItemText}>Add Line Item</Text>
          </Pressable>

          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>${subtotal.toFixed(0)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValueStrong}>${subtotal.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Client Information</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Client</Text>
            <TextInput
              value={selectedClient}
              onChangeText={setSelectedClient}
              placeholder="Search or add a client"
              placeholderTextColor="#A3A9B7"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add context, venue notes, or expectations"
              placeholderTextColor="#A3A9B7"
              style={[styles.input, styles.notesInput]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/app/jobs")}>
            <Text style={styles.secondaryButtonText}>Back to Jobs</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/app/jobs")}>
            <Text style={styles.primaryButtonText}>Use Booking Requests</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F6FF"
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
    gap: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  headerText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    color: tokens.color.text
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(75,124,249,0.12)"
  },
  statusPillText: {
    color: tokens.color.info,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    alignItems: "center",
    justifyContent: "center"
  },
  calloutCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    padding: 18,
    gap: 10
  },
  calloutTitle: {
    color: tokens.color.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800"
  },
  calloutBody: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  calloutButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: "rgba(244,238,253,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  calloutButtonText: {
    color: tokens.color.accent,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  sectionCard: {
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    padding: 18,
    gap: 16
  },
  sectionTitle: {
    color: tokens.color.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900"
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    color: tokens.color.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700"
  },
  input: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(216,220,231,0.88)",
    paddingHorizontal: 14,
    color: tokens.color.text,
    fontSize: 15
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  rowField: {
    flex: 1,
    gap: 8
  },
  lineItemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  lineItemsCount: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  lineItemsList: {
    gap: 10
  },
  lineItemCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    overflow: "hidden"
  },
  lineItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  lineItemTitleWrap: {
    flex: 1
  },
  lineItemTitle: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700"
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  lineItemFields: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(216,220,231,0.62)",
    padding: 14
  },
  taxToggle: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(243,245,250,0.9)"
  },
  taxToggleActive: {
    backgroundColor: "rgba(244,238,253,0.92)"
  },
  taxToggleText: {
    color: tokens.color.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  taxToggleTextActive: {
    color: tokens.color.accent
  },
  addLineItemButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    backgroundColor: "rgba(255,255,255,0.68)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  addLineItemText: {
    color: tokens.color.accent,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  },
  totalsCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(248,249,251,0.92)",
    gap: 10
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  totalsLabel: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 18
  },
  totalsValue: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700"
  },
  totalsValueStrong: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  notesInput: {
    minHeight: 110,
    paddingTop: 14,
    paddingBottom: 14
  },
  footerActions: {
    flexDirection: "row",
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(216,220,231,0.92)",
    backgroundColor: "rgba(255,255,255,0.76)",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonText: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800"
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: tokens.color.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800"
  }
});
