import { Stack } from "expo-router";
import { ProtectedScreen } from "../../src/auth/protected-screen";

export default function ProtectedLayout() {
  return (
    <ProtectedScreen>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </ProtectedScreen>
  );
}
