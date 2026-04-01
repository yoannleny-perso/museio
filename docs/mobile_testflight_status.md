# Museio Mobile TestFlight Status

## Current Status

As of April 1, 2026, Museio's mobile preview build setup is mostly ready.

What is already done:

- the Expo project is linked to `@yoanns-org/museio`
- the Expo project id is configured in the mobile app config
- dynamic Expo config is in place in [app.config.ts](/Users/yoann/Museio/app_build/museio_app/apps/mobile/app.config.ts)
- EAS build profiles are configured in:
  - [app_build/museio_app/eas.json](/Users/yoann/Museio/app_build/museio_app/eas.json)
  - [app_build/museio_app/apps/mobile/eas.json](/Users/yoann/Museio/app_build/museio_app/apps/mobile/eas.json)
- the iOS preview/TestFlight build profile exists
- the app config already includes:
  - the Expo EAS project id
  - the EAS Update URL
  - `ITSAppUsesNonExemptEncryption: false`
- the mobile app is pointed at the hosted Museio API and hosted Supabase environment

## What Is Blocking TestFlight Right Now

The remaining blocker is Apple account readiness, not Museio configuration.

At the moment, your Apple Developer Program enrollment is still being processed. Because of that:

- Expo can authenticate you
- Expo can reach the project and credentials layer
- but Apple Developer Portal access still fails during the iOS build credential flow

This is why the TestFlight build cannot complete yet.

## What To Wait For

Wait until Apple fully activates your Developer Program membership.

You are ready to continue only when:

- you can access `https://developer.apple.com/account` without enrollment warnings
- you can access `https://appstoreconnect.apple.com`
- there are no pending agreements or setup blockers shown by Apple

## Where The Project Stands Technically

The current mobile preview distribution setup is based on:

- Expo account / owner: `yoanns-org`
- Expo project: `@yoanns-org/museio`
- Expo project id: `30e435b5-e5c5-4d04-9487-60f0ba8fe3d6`
- preview display name: `Museio Preview`
- iOS preview bundle id: `com.yoannleny.museio.preview`

The main runbook for the broader setup is:

- [mobile_preview_distribution_runbook.md](/Users/yoann/Museio/docs/mobile_preview_distribution_runbook.md)

## What To Do When Apple Is Ready

### 1. Confirm Apple access

Open both of these in your browser:

- `https://developer.apple.com/account`
- `https://appstoreconnect.apple.com`

Make sure:

- your membership is active
- there are no agreements to accept
- there are no incomplete setup warnings

### 2. Run the TestFlight build again

From the workspace root:

```bash
cd /Users/yoann/Museio/app_build/museio_app
env -u SSL_CERT_FILE \
EXPO_PUBLIC_API_URL=https://museio-production.up.railway.app/api \
EXPO_PUBLIC_SUPABASE_URL=https://nbecxliasodiooacaiyd.supabase.co \
EXPO_PUBLIC_ENABLE_DEMO_AUTH=false \
npm run mobile:eas:testflight
```

Notes:

- `SSL_CERT_FILE` is removed because your local custom certificate override breaks Expo/EAS HTTPS calls on this machine
- the mobile app should use the hosted API and hosted Supabase values for TestFlight, not `localhost`

### 3. If Expo asks Apple questions

Use these answers:

- account owner: `yoanns-org`
- log in to Apple: `yes`
- let Expo manage credentials: `yes`
- create missing items if prompted: `yes`

### 4. Wait for the build

If successful, Expo will:

- create the iOS build
- submit it to TestFlight automatically
- give you a build URL in the terminal

### 5. After build submission

Go to App Store Connect:

- open `TestFlight`
- wait for Apple processing
- add internal testers first
- then add client testers if appropriate

## Known Notes

- Expo may still show temporary service warnings if EAS Build has an outage; that is separate from the Apple membership blocker
- local Expo Go testing is unrelated to TestFlight readiness
- Android testing can proceed separately later even if iOS/TestFlight is temporarily blocked

## If It Fails Again After Apple Activation

If the build still fails after your Apple membership becomes active:

1. confirm again that there are no pending Apple agreements
2. rerun the build command above
3. if it still fails, resume from this point and inspect:
   - Apple credential access
   - Expo iOS credentials
   - App Store Connect submission setup

At that stage, Museio is likely blocked by Apple account setup details, not by mobile app code.
