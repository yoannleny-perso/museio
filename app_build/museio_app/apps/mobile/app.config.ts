import type { ExpoConfig } from "expo/config";

const appVariant = process.env.MUSEIO_APP_VARIANT ?? "preview";
const displayName =
  process.env.MUSEIO_DISPLAY_NAME ?? (appVariant === "production" ? "Museio" : "Museio Preview");
const projectId =
  process.env.EXPO_PROJECT_ID ?? "30e435b5-e5c5-4d04-9487-60f0ba8fe3d6";
const owner = process.env.EXPO_OWNER ?? "yoanns-org";

const config: ExpoConfig = {
  name: displayName,
  slug: "museio",
  scheme: "museio",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/brand/app-icon.png",
  platforms: ["ios", "android", "web"],
  userInterfaceStyle: "light",
  runtimeVersion: {
    policy: "appVersion",
  },
  splash: {
    image: "./assets/brand/splash.png",
    resizeMode: "cover",
    backgroundColor: "#140f1d",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.MUSEIO_IOS_BUNDLE_ID ?? "com.yoannleny.museio.preview",
    buildNumber: process.env.MUSEIO_IOS_BUILD_NUMBER ?? "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "Museio needs access to your photo library so you can upload portfolio images.",
      NSPhotoLibraryAddUsageDescription:
        "Museio saves portfolio images to your library when you choose to export them.",
      NSCameraUsageDescription:
        "Museio uses your camera so you can capture a profile or portfolio image.",
    },
  },
  android: {
    package: process.env.MUSEIO_ANDROID_PACKAGE ?? "com.yoannleny.museio.preview",
    versionCode: Number.parseInt(process.env.MUSEIO_ANDROID_VERSION_CODE ?? "1", 10),
    adaptiveIcon: {
      foregroundImage: "./assets/brand/app-icon.png",
      backgroundColor: "#140f1d",
    },
    permissions: ["android.permission.CAMERA", "android.permission.READ_MEDIA_IMAGES"],
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Museio needs access to your photo library so you can upload portfolio images.",
        cameraPermission:
          "Museio uses your camera so you can capture a profile or portfolio image.",
      },
    ],
  ],
  updates: {
    url: `https://u.expo.dev/${projectId}`,
  },
  extra: {
    appVariant,
    eas: {
      projectId,
    },
  },
};

if (owner) {
  config.owner = owner;
}

export default config;
