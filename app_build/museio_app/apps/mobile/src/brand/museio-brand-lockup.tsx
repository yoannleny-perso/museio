import { Image, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import museioGradientLogo from "../../assets/brand/museio-gradient-logo.png";

export function MuseioBrandLockup({
  subtitle = "Creator workspace",
  compact = false
}: {
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Image
        source={museioGradientLogo}
        style={compact ? styles.logoCompact : styles.logo}
        resizeMode="contain"
      />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  logo: {
    width: 152,
    height: 44
  },
  logoCompact: {
    width: 132,
    height: 38
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: tokens.color.textMuted
  }
});
