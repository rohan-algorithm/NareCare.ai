# NariCare — Architecture

## System

```
Expo SDK 58 + Expo Router (Node ≥22 recommended for local tooling)
        │
        ├─ Auth (Google + Email OTP) ──► Supabase Auth
        ├─ Data / Realtime ────────────► Postgres + RLS
        ├─ Images (meals/yoga) ────────► Cloudflare R2 (CDN)
        ├─ Payments ───────────────────► Razorpay via Edge Functions
        ├─ Lab OCR + tips ─────────────► Edge Functions → Vision / GPT-4o-mini
        ├─ Push ───────────────────────► FCM (expo-notifications)
        └─ Analytics ──────────────────► PostHog
```

## Route map (Expo Router groups)

```
app/
  index.tsx                 → splash / redirect
  (auth)/                   → onboarding slides, login
  (setup)/                  → 4-step profile + phenotype + living context
  (paywall)/                → hard gate
  (tabs)/
    home/                   → Progress Pulse + Today’s 2 actions
    diet/                   → day plan + swaps by living context
    move/                   → cycle-synced yoga/exercise
    track/                  → calendar + log + trends
    profile/                → settings, labs, doctor kit, community entry
  community/                → forum (stack)
  labs/                     → decoder + history
  council/                  → expert council (doctors, peers, yoga, dietitian) + today board
```

**Guards:** `(tabs)` layout requires auth + completed profile + active/trial subscription.

## Domain modules (`src/features/`)

| Module | Responsibility |
|--------|----------------|
| `phenotype` | Score metabolic / androgenic / inflammatory from onboarding + labs; expose daily focus |
| `cycle` | Derive cycle day + phase from period logs; period prediction (avg last 3) |
| `diet` | Resolve meal plan by cuisine × living context × day; swaps; grocery list |
| `move` | Pick routine by phase + phenotype; timer; `exercise_logs` |
| `symptoms` | Daily log, calendar dots, trend insights, Progress Pulse inputs |
| `labs` | Upload → edge parse → markers + bilingual copy → timeline |
| `subscription` | `useSubscription`; webhook is source of truth |
| `community` | Posts/comments/upvotes + realtime |
| `doctorKit` | Assemble PDF export payload |

## Data principles

1. **Static content in-repo** (`src/content/*.json`) for meals, yoga, lab reference, notification copy — offline-first, no CMS for MVP.
2. **User health data in Supabase** with RLS; never trust client for subscription writes.
3. **Derived state** (phase, phenotype blend, Progress Pulse) computed in hooks — not duplicated in DB until we need historical snapshots.
4. **Edge Functions** own secrets: Razorpay, Vision, OpenAI.

## Schema (core tables)

`user_profiles` · `subscriptions` · `symptom_logs` · `exercise_logs` · `lab_reports` · `community_posts` · `community_comments` · `post_upvotes` · `habit_logs` (2 micro-habits/day) · `meal_adherence` (ate / swapped / skipped)

See `supabase/migrations/001_init.sql`.

## Build order

1. Design system + router shells + auth/setup/paywall gates  
2. Home Progress Pulse + Track + Diet (North Indian week 1) + Move  
3. Labs edge + Doctor Kit  
4. Community + FCM + Hindi strings  
5. EAS + Play listing  

## Stack notes vs original spec

- **Expo SDK 57** (not 51) — Expo Go on device; upgrade to 58 when Go catches up.
- Living context + phenotype + Progress Pulse + Doctor Kit are **first-class** product modules, not later add-ons.
