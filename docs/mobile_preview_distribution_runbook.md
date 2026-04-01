# Mobile Preview Distribution Runbook

## Goal

This runbook prepares Museio for client-friendly preview testing.

Recommended tester path:

- iPhone / iPad: TestFlight
- Android: Google Play internal testing
- Internal dev-only smoke builds: EAS internal distribution

Do not use Expo Go for client QA. Expo Go is for developer testing only.

## What This Repo Now Supports

- dynamic Expo app config in [apps/mobile/app.config.ts](/Users/yoann/Museio/app_build/museio_app/apps/mobile/app.config.ts)
- EAS profiles in [eas.json](/Users/yoann/Museio/app_build/museio_app/eas.json)
- helper scripts in [package.json](/Users/yoann/Museio/app_build/museio_app/package.json)

## Prerequisites

You need:

- an Expo account
- a paid Apple Developer account
- a Google Play Console account
- the mobile preview environment values ready

## Required Environment Values

Add these locally before building:

- `EXPO_OWNER`
- `EXPO_PROJECT_ID` after linking the Expo project
- `MUSEIO_IOS_BUNDLE_ID`
- `MUSEIO_ANDROID_PACKAGE`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

For client testing builds, these values must point to your hosted preview stack, not `localhost`.

Example:

- `EXPO_PUBLIC_API_URL=https://your-railway-preview-domain/api`
- `EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...`

If you keep `localhost` here, the build will install but it will not work for your client.

Recommended preview identifiers:

- iOS bundle id: `com.yoannleny.museio.preview`
- Android package: `com.yoannleny.museio.preview`

## One-Time Setup

From the workspace root:

```bash
cd /Users/yoann/Museio/app_build/museio_app
npm exec -- pnpm install
```

Log into Expo:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
npx eas-cli@latest login
```

Link the app to Expo if this is the first time:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
npx eas-cli@latest init
```

When Expo prints the project id, add it to your local env as `EXPO_PROJECT_ID`.

Then add the same environment values inside the Expo dashboard for the project:

1. open your Expo project
2. go to environment variables
3. create the preview variables used by the app
4. make sure the mobile preview build uses hosted URLs, not local ones

## Sanity Check

Check the resolved app config:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_OWNER=your-expo-owner \
MUSEIO_IOS_BUNDLE_ID=com.yoannleny.museio.preview \
MUSEIO_ANDROID_PACKAGE=com.yoannleny.museio.preview \
npx expo config --type public
```

## Fast Internal Team Testing

This is best for your own team, not clients.

Build an internal install:

```bash
cd /Users/yoann/Museio/app_build/museio_app
npm run mobile:eas:build:internal
```

Notes:

- Android gets an installable APK link
- iOS internal distribution requires registered devices
- this is why TestFlight is still the better client path

## Client-Friendly iPhone Testing With TestFlight

Use the dedicated preview TestFlight build profile:

```bash
cd /Users/yoann/Museio/app_build/museio_app
npm run mobile:eas:testflight
```

This flow handles:

- iOS preview build
- automatic submission to App Store Connect / TestFlight
- the `testflight` EAS profile instead of the generic production profile

After the upload:

1. open App Store Connect
2. go to TestFlight
3. wait for Apple processing
4. add internal testers first
5. later add external testers if needed

Important first-time note:

- if this is the first iOS submission for Museio, App Store Connect will create or require the app record during the guided flow
- Apple may ask for basic app metadata before external testing is available

## Client-Friendly Android Testing

Build the Android app:

```bash
cd /Users/yoann/Museio/app_build/museio_app
npm run mobile:eas:build:android-internal
```

Then submit it to Google Play internal testing:

```bash
cd /Users/yoann/Museio/app_build/museio_app
npm run mobile:eas:submit:android-internal
```

Important:

- Google usually requires the first app submission to be completed manually in Play Console before API-based submit flows are fully smooth
- after the first setup, internal testing becomes much easier

Recommended first Android rollout:

1. do the first store app setup in Play Console manually
2. use internal testing for client QA
3. after the first successful upload, keep using the scripted `submit` flow

## Suggested Tester Workflow

For each preview cycle, give testers:

- install link
- test account email
- password or magic-link instructions
- build number
- what changed in this build
- short bug-report form

## Recommended QA Structure

Ask testers to cover:

- sign-in
- home shell
- jobs
- portfolio
- finance
- messages
- clients
- calendar / availability

## EAS Update Later

Once the store-beta flow is working, the next nice improvement is EAS Update for preview JS/UI changes without a full rebuild every time.

That should be a follow-up step, not the first step.
