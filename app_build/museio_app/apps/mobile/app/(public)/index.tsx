import { Redirect } from "expo-router";
import SignInScreen from "./sign-in";
import { useAuth } from "../../src/auth/auth-context";

export default function MobilePublicIndexScreen() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/app" />;
  }

  return <SignInScreen />;
}
