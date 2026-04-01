import { Redirect } from "expo-router";
import SignInScreen from "./sign-in";
import { useAuth } from "../../src/auth/auth-context";
import { getMobileEnv } from "../../src/lib/env";

export default function MobilePublicIndexScreen() {
  const { isAuthenticated } = useAuth();
  const mobileEnv = getMobileEnv();

  if (isAuthenticated) {
    return <Redirect href="/app" />;
  }

  if (
    mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH &&
    mobileEnv.EXPO_PUBLIC_QA_EMAIL &&
    mobileEnv.EXPO_PUBLIC_QA_PASSWORD
  ) {
    return <Redirect href="/qa-login" />;
  }

  return <SignInScreen />;
}
