import { useState } from "react";
import { router } from "expo-router";
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
import { useAuth } from "../../src/auth/auth-context";
import { MuseioBrandLockup } from "../../src/brand/museio-brand-lockup";

const highlights = [
  "Edit your public portfolio without mixing creator controls into live mode.",
  "Review booking demand and creator workflow from one calmer shell.",
  "Keep quotes, invoices, deposits, and finance tied to real server-owned truth."
];

export default function SignInScreen() {
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(mode: "sign-in" | "sign-up") {
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      if (mode === "sign-in") {
        await signInWithPassword(email, password);
        router.replace("/app");
      } else {
        await signUpWithPassword(email, password);
        setMessage("Account created. Confirm the email first if Supabase requires it.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Auth failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <MuseioBrandLockup />

          <Text style={styles.badge}>Protected creator access</Text>
          <Text style={styles.title}>Step back into your brand, bookings, and business.</Text>
          <Text style={styles.body}>
            Museio keeps public portfolio and booking routes premium while the protected creator
            side brings editing, jobs, finance, and client coordination into one calmer surface.
          </Text>
        </View>

        <View style={styles.stack}>
          {highlights.map((item) => (
            <View key={item} style={styles.highlightCard}>
              <Text style={styles.highlightBody}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formBadge}>Supabase auth</Text>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formBody}>
            Sign in to continue editing your public presence and creator workspace.
          </Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="artist@example.com"
            placeholderTextColor={tokens.color.textMuted}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={tokens.color.textMuted}
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.primaryAction, isSubmitting && styles.disabledAction]}
              disabled={!email || !password || isSubmitting}
              onPress={() => void handleSubmit("sign-in")}
            >
              <Text style={styles.primaryActionText}>{isSubmitting ? "Working…" : "Sign in"}</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryAction, isSubmitting && styles.disabledAction]}
              disabled={!email || !password || isSubmitting}
              onPress={() => void handleSubmit("sign-up")}
            >
              <Text style={styles.secondaryActionText}>Create account</Text>
            </Pressable>
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
    gap: 16
  },
  hero: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: tokens.color.border,
    overflow: "hidden"
  },
  badge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "800",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textMuted
  },
  stack: {
    gap: 12
  },
  highlightCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: tokens.radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  highlightBody: {
    color: tokens.color.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  formCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  formBadge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700"
  },
  formTitle: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "800",
    color: tokens.color.text
  },
  formBody: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.color.textMuted
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.color.text,
    backgroundColor: "#FFFFFF"
  },
  actions: {
    gap: 10
  },
  primaryAction: {
    backgroundColor: tokens.color.accent,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: tokens.radius.pill,
    alignItems: "center"
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  disabledAction: {
    opacity: 0.55
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  secondaryActionText: {
    color: tokens.color.text,
    fontWeight: "700"
  },
  error: {
    color: tokens.color.danger,
    lineHeight: 22
  },
  success: {
    color: tokens.color.success,
    lineHeight: 22
  }
});
