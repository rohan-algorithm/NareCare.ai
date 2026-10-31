# Council review, 31 Oct 2026

Simulated expert review of the whole app: gynaecologist/endocrinologist, clinical dietitian, yoga therapist, patient panel (lean and higher-weight PCOS, student, working, trying to conceive), AI safety reviewer. A real clinician should still sign off before launch.

## Findings and what changed

| Reviewer | Finding | Change |
|---|---|---|
| Gynaecologist | Home said "Day 4 · Follicular, energy rising" for everyone. PCOS cycles are often anovulatory, so a fixed day-14 ovulation is wrong more often than right. | Phases are shown only when her last cycles are regular (21–35 days, within 7 days of each other), using her own average. Otherwise: "Cycle day N". `src/features/cycle.ts` |
| Gynaecologist | Logging "flowing" on day 3 restarted the cycle at day 1. Cycle day stopped counting after 45 days, so long PCOS cycles disappeared. | Period starts are detected from the first bleed day. Cycle day counts up to 400 days. |
| Gynaecologist | No warning for 90+ days without a period (guideline: assess and protect the endometrium) or for heavy bleeding. | Home safety banner: 90+ days → see a gynaecologist; later than usual → consider a pregnancy test; heavy bleeding or clots → see a doctor today. `src/ui/SafetyBanner.tsx` |
| Gynaecologist | Next-period prediction gave a precise date even when cycles swung by weeks. | Shows a date window when cycles vary by more than 7 days, and "later than usual" once the date passes. |
| Gynaecologist | Doctor kit lacked the self-screening result and cycle regularity. | PDF includes the PCOS check score and criteria, usual cycle length, and regular/irregular status. |
| Dietitian / doctor | Meds screen came pre-filled with inositol, vitamin D, omega-3, implying they were prescribed. It also wiped her own medicines every day. | Starts empty ("add only what your doctor advised"). Her list is kept daily and only the ticks reset. |
| Dietitian | Weight-centred language ("Fat-burn cardio", "Fat-Loss Kickstart", "start your 5% goal") alienates lean PCOS and risks disordered eating. | Renamed to "Heart-pumping cardio" and "Metabolic Kickstart". The 5% goal is shown only above BMI 23 (Asian cut-off). Lean users see a strength-and-cycles card instead. |
| Dietitian | Pseudo-science copy: "Androgen-friendly ritual", "Hormones love sleep". | Replaced with plain, sourced wording. |
| Dietitian / AI | Coach had no eating-disorder or crash-diet guardrails. | Coach system prompt: no under-1200 kcal advice, crash diets or long fasts; care pathway for disordered eating; pregnancy-test and 90-day rules. |
| Yoga therapist | Period-day sessions could include inversions (legs up, down dog), bow pose and intense core. | Period-safe flag removes these on gentle days, end to end. |
| Yoga therapist | Holds had no breathing guidance. | Voice cue "breathe in / breathe out" every 5 seconds through yoga holds (Hindi too). |
| Patient panel | Lock-screen notifications like "Your period may start tomorrow" are a problem on shared or family-checked phones. | "Discreet notifications" switch in Reminders: lock screen shows only "NariCare: meal time" and similar. |
| AI safety | Autopilot and coach changed her plan with no way back. | Every meal swap and workout change made by AI has an Undo in the autopilot feed. |

## Deferred

- App lock with fingerprint (needs `expo-local-authentication` and a native rebuild).
- Real clinician sign-off on all Academy lessons and PCOS check wording.
- Human-recorded Hindi voice for the trainer.

# Second review, same day: is it worth paying for, and can it be trusted?

Full walk-through of every screen as a new user and as the demo user, plus Play Store competitors (Veera Health, PCOS Pal, PCOS Tracker, PCOS Polly).

| Reviewer | Finding | Change |
|---|---|---|
| Growth | First screen: slide title hidden behind 4 stacked bilingual buttons; a plain logo filled half the screen. | One-screen welcome: animated trainer, single promise, feature grid, one main button, EN/हिं toggle. |
| Growth | Fake "Continue with Google" and "Send OTP" (both only set a flag) before any value. | No signup wall: anonymous account in the background, purchases tied to Google Play. Login screen made honest. |
| Growth | Quiz jumped straight to prices. | "Building your plan" → "Your plan is ready" (Day-1 meals, first workout, honest week 1/4/8–12 expectations) → paywall. |
| Growth | Paywall was a feature list. | Free vs Pro table, ₹83 vs ₹2,000+ dietitian anchor, Today / Day 5 / Day 7 trial timeline. |
| Growth | Pro unlocked almost nothing: 7-day meals, swaps, plate scans, all lessons and the doctor PDF were already free, contradicting the table. | Enforced exactly what the table promises; locked lessons show a preview first. |
| Patient / ethics | Community was phone-only and pre-filled with 3 posts written by the app, with fake upvote counts, shown as real members. | Removed (and purged from existing installs). Community now reads and writes the real Supabase tables; offline it says posts stay on this phone. Comments get the same phone/link filter as posts. |
| Doctor / Play policy | "Expert Council" showed invented doctors with fake degrees, hospitals, years of practice and first-person quotes. | Replaced by topic cards ("Metabolic health", "Cycles & gynaecology", …) labelled as written by the NariCare team from the 2023 guideline. Persona names removed everywhere. |
| Doctor | Lab screen named SRL, Thyrocare, Dr Lal, Metropolis, implying partnerships. | "Reports from any Indian lab." |
| Dietitian | Flare care used a fixed 8-glass goal; grocery list had vegetables under Pantry and duplicates. | Weight-based goal; better produce detection and de-duplication. |
| Patient | Track showed "Mood" twice; Hindi "ब्लोटरिंग" typo. | "Mood swings", "पेट फूलना", mood faces 😣→😄. |
| Brand | Thin outline lotus lost detail at icon size, looked like spa clipart. | New filled lotus-woman icon with gold bindi and heart, adaptive + monochrome icons, Play icon and feature graphic. |

Still open: Play in-app review prompt after a win (needs `expo-store-review` and a native build), referral offer, human dietitian consult add-on.
