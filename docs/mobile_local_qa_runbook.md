# Mobile Local QA Runbook

## Scope

This runbook covers local QA for the existing Museio mobile app only.

It does not add or change features.

## Prerequisites

- install project dependencies:
  - `cd /Users/yoann/Museio/app_build/museio_app && npm exec -- pnpm install`
- make sure your Supabase and API environment values are present in:
  - [app_build/museio_app/apps/mobile/.env](/Users/yoann/Museio/app_build/museio_app/apps/mobile/.env)
  - [app_build/museio_app/.env.local](/Users/yoann/Museio/app_build/museio_app/.env.local) if you use it for shared local runs
- keep the local API running while testing mobile

## Important Networking Note

### iOS Simulator and Android Emulator

These can usually use:

- `EXPO_PUBLIC_API_URL=http://localhost:4000`

### Expo Go on a physical phone

Your phone cannot reach `localhost` on your computer.

For physical-device testing, set:

- `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000`

Example:

- `EXPO_PUBLIC_API_URL=http://192.168.1.25:4000`

You can get your LAN IP with:

```bash
ipconfig getifaddr en0
```

If `en0` is not your active interface, check:

```bash
ifconfig | grep "inet "
```

## Terminal 1: Run the API

From the repo root:

```bash
cd /Users/yoann/Museio/app_build/museio_app
PORT=4000 npm exec -- pnpm --filter @museio/api dev
```

If you want a production-like compiled API run instead:

```bash
cd /Users/yoann/Museio/app_build/museio_app
PORT=4000 npm exec -- pnpm --filter @museio/api build
PORT=4000 npm exec -- pnpm --filter @museio/api start:prod
```

## Terminal 2: Run Mobile For QA

### 1. Expo Go on a physical phone

First set the phone-reachable API URL:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
export EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000
```

Then start Expo in LAN mode:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_NO_TELEMETRY=1 EXPO_HOME=../../.expo npx expo start --lan --port 8081
```

Then:

- open Expo Go on your phone
- scan the QR code
- confirm the app connects to the running local API

### 2. iOS Simulator

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:4000 EXPO_NO_TELEMETRY=1 EXPO_HOME=../../.expo npx expo start --ios --port 8081
```

If the simulator is not already booted, open it first or let Expo open it.

### 3. Android Emulator

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000 EXPO_NO_TELEMETRY=1 EXPO_HOME=../../.expo npx expo start --android --port 8081
```

`10.0.2.2` is the Android emulator alias for your host machine.

If your emulator image/networking behaves differently, fall back to your LAN IP:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000 EXPO_NO_TELEMETRY=1 EXPO_HOME=../../.expo npx expo start --android --port 8081
```

## Recommended QA Flow

Use this order:

1. boot API
2. boot mobile target
3. sign in
4. verify protected shell
5. verify portfolio
6. verify booking/job/finance/messages entry points

## Short Mobile QA Checklist

### App shell

- app opens without a blank or broken shell
- protected vs public entry feels clear
- the mobile home shows the redesigned hierarchy and quick actions
- navigation feels legible and thumb-friendly

### Portfolio

- portfolio entry opens from the mobile shell
- portfolio screen loads without auth or loading regressions
- branding/theme/readability feel premium and intentional
- empty and loading states do not feel broken

### Bookings

- booking-related entry point is visible from the shell
- no broken route or auth bounce occurs
- booking workspace remains readable on a phone-sized viewport

### Jobs

- jobs surface is reachable from the creator workspace path
- job-related summaries or actions render cleanly
- layout does not feel cramped or clipped

### Finance

- finance screen loads successfully
- summary cards are understandable on mobile
- filters and ledger sections remain readable without awkward overflow

### Messages

- messages screen opens successfully
- thread list/detail entry feels understandable on a narrow screen
- no obvious spacing, clipping, or unread-state confusion appears

## Known Local QA Caveats

- physical phones must not use `localhost` for the API base URL
- Android emulators often need `10.0.2.2` instead of `localhost`
- if Metro cache gets weird, restart Expo with:

```bash
cd /Users/yoann/Museio/app_build/museio_app/apps/mobile
EXPO_NO_TELEMETRY=1 EXPO_HOME=../../.expo npx expo start --clear
```
