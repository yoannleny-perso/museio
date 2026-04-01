import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { tokens } from "@museio/ui";
import { MuseioBrandLockup } from "../../src/brand/museio-brand-lockup";
import { useAuth } from "../../src/auth/auth-context";

export default function SignInScreen() {
  const { isAuthenticated, signInWithGoogle, signInWithPassword, signUpWithPassword } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated]);

  async function handleSubmit(mode: "sign-in" | "sign-up") {
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      if (mode === "sign-in") {
        await signInWithPassword(email, password);
        router.replace("/app");
        return;
      }

      await signUpWithPassword(email, password);
      setMessage("Account created. Check your inbox to confirm your email, then sign in.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn't sign you in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't start Google sign-in."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <MuseioBrandLockup subtitle="" />
        </View>

        <View style={styles.headlineBlock}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="yoyo@museioapp.com"
              placeholderTextColor="#A9AFBE"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#A9AFBE"
                style={styles.passwordInput}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setIsPasswordVisible((value) => !value)}
              >
                {isPasswordVisible ? (
                  <EyeOff color="#9AA0AF" size={18} strokeWidth={2.2} />
                ) : (
                  <Eye color="#9AA0AF" size={18} strokeWidth={2.2} />
                )}
              </Pressable>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            disabled={!email || !password || isSubmitting}
            onPress={() => void handleSubmit("sign-in")}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={[styles.googleButton, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleGoogleSignIn()}
            disabled={isSubmitting}
          >
            <View style={styles.googleGlyphWrap}>
              <Text style={styles.googleGlyph}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            style={[styles.linkButton, styles.linkSpacing]}
            onPress={() => void handleSubmit("sign-up")}
            disabled={isSubmitting || !email || !password}
          >
            <Text style={styles.linkText}>Need an account? Sign up</Text>
          </Pressable>

          <Pressable style={styles.linkButton} disabled>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        </View>

        <Text style={styles.footerCopy}>
          By signing in, you agree to our <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(143,110,230,0.12)"
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -120,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(122,66,232,0.08)"
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 28,
    justifyContent: "center",
    gap: 28
  },
  logoWrap: {
    alignItems: "center"
  },
  headlineBlock: {
    gap: 10,
    alignItems: "center"
  },
  title: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800"
  },
  subtitle: {
    color: tokens.color.textMuted,
    fontSize: 16,
    lineHeight: 22
  },
  form: {
    gap: 16
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    color: tokens.color.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center"
  },
  input: {
    minHeight: 44,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: tokens.color.text,
    fontSize: 16
  },
  passwordWrap: {
    minHeight: 44,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  passwordInput: {
    flex: 1,
    color: tokens.color.text,
    fontSize: 16
  },
  passwordToggle: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: "#8B6AE6",
    alignItems: "center",
    justifyContent: "center"
  },
  buttonDisabled: {
    opacity: 0.62
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(139,106,230,0.16)"
  },
  dividerText: {
    color: "#9B92B7",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600"
  },
  googleButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(139,106,230,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  googleGlyphWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  googleGlyph: {
    color: "#4285F4",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "800"
  },
  googleButtonText: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700"
  },
  linkButton: {
    alignItems: "center"
  },
  linkSpacing: {
    marginTop: 6
  },
  linkText: {
    color: "#8B6AE6",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600"
  },
  errorText: {
    color: tokens.color.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  },
  successText: {
    color: tokens.color.success,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  },
  footerCopy: {
    color: "#81889A",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
  },
  footerLink: {
    color: "#8B6AE6"
  }
});
