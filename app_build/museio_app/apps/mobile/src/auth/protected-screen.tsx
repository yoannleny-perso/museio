import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useAuth } from "./auth-context";

export function ProtectedScreen({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View>
        <Text>Checking session…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return <>{children}</>;
}
