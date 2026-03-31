import { useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { tokens } from "@museio/ui";
import { useAuth } from "../../src/auth/auth-context";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Supabase auth</Text>
        <Text style={styles.title}>Sign in to edit Portfolio</Text>
        <Text style={styles.body}>
          Public live mode stays public. Editing remains protected and session-backed.
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
            <Text style={styles.primaryActionText}>
              {isSubmitting ? "Working…" : "Sign in"}
            </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: tokens.color.background
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 14
  },
  badge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
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
    borderRadius: tokens.radius.md,
    alignItems: "center"
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: tokens.radius.md,
    alignItems: "center"
  },
  disabledAction: {
    opacity: 0.55
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  secondaryActionText: {
    color: tokens.color.text,
    fontWeight: "700"
  },
  error: {
    color: "#A53B3B",
    lineHeight: 22
  },
  success: {
    color: "#2F6B4F",
    lineHeight: 22
  }
});
