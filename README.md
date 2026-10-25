# NariCare — PCOS Health Companion

India’s PCOS companion built for **how women actually live** — family kitchen / hostel mess / tiffin / eating out — with a weekly **Progress Pulse** that proves the plan is working, an **Indian lab decoder**, and a **Doctor Visit Kit** for 15-minute gynae visits.

See [PRODUCT.md](./PRODUCT.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

## Run (demo mode)

No backend required for the local demo (Zustand + AsyncStorage).

```bash
cd NariCare
npm install
npx expo start
```

Flow: Welcome → Login (demo) → 5-step setup (includes phenotype + living context) → Paywall trial → Home.

> Node **≥ 22.13** recommended (Expo SDK 58). This machine may warn on Node 20; upgrade if Metro fails.

## Connect real backend

1. Create a Supabase project; run `supabase/migrations/001_init.sql`
2. Copy `.env.example` → `.env` and fill keys
3. Enable Google + Email OTP in Supabase Auth
4. Add Razorpay Edge Functions (create-subscription + webhook) per ARCHITECTURE.md

## Differentiator checklist

- [x] Phenotype engine → daily micro-habits
- [x] Living-context diet + swaps + canteen cards
- [x] Progress Pulse closed loop + weekly insulin check-in
- [x] Lab decoder (sample decode UI; OCR via edge next)
- [x] Doctor Visit Kit (share + 5 gynae questions)
- [x] Expert Council + Today board + bad-day mode + family scripts
- [x] Privacy-first community shell
- [x] Bleed pattern tags + post-meal crash signal
- [x] Move kindness-skip (pain/exhaustion)
- [ ] Razorpay live checkout
- [ ] Vision OCR edge function
- [ ] Full Hindi UI string pack
- [ ] FCM reminders (prefs UI exists; native schedule next)

## Demo tip

On Welcome or Login: **Skip signup — enter demo** jumps straight to Home with sample profile + 4 days of seed logs (Progress Pulse unlocked).

## Android preview build

```bash
npx eas-cli login
npx eas build --profile preview --platform android
```

Requires a real `extra.eas.projectId` in `app.json` (create via `eas init`).
