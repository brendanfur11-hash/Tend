# Plan: Rebuild Tend to Spec — Design Parameters + Per-Screen Guidelines

## Context

The user has provided the canonical design system AND detailed per-screen briefs for all 8 screens. The current implementation has the right bones but several screens deviate from the per-screen specs in content, layout, or copy. This plan rebuilds each screen to match the brief exactly while locking in the design parameters as the standing rule set.

---

## Design Parameters (source of truth)

| Category | Spec |
|---|---|
| Base background | `#FAF6F1` warm cream |
| Primary accent | `#F3C9A8 → #E8967A` peach-to-coral gradient (sparingly, key moments only) |
| Secondary accent | `#B7C4B0` soft sage · `#C6BCD6` dusty lavender |
| Text | `#3A342F` warm charcoal — never pure black |
| Avoid | Diet greens, reds, bright success/fail, calorie counts, macros, weights |
| Fonts | Nunito (body/UI) · Plus Jakarta Sans (display headings) |
| Shapes | Large rounded corners, soft shadows, generous whitespace, big tap targets |
| Microcopy | Gentle, spoken, first-person-friendly, non-judgmental, never shaming |
| Streaks | Reframed as self-care — never pressure, never punitive |
| Skipped meals | Warmth only — no red X, no guilt, no lockout |

---

## Per-Screen Rebuild Plan

### Screen 1 — Onboarding (4 steps, one question per screen)

**Step 1 — Welcome**
- New: a warm welcome screen that explicitly reassures: "no nagging, no shame"
- Large friendly illustration or emoji, big heading, 2–3 lines of copy, single CTA "Let's get started"
- Currently missing — needs to be added as `onboarding-0`

**Step 2 — Day start (currently onboarding-1)**
- Keep existing time picker
- Refine copy: frame as inferring meal windows, not scheduling

**Step 3 — Timing style (currently onboarding-2)**
- Two soft cards: "Remind me around mealtimes" · "Nudge me if it's been a while since I ate"
- Copy tweak on second card to match brief exactly

**Step 4 — Safe foods (currently onboarding-3)**
- Reframe prompt: "What can you always manage on a rough day?"
- Starter list: banana, yogurt, toast, leftovers, nuts, a shake, eggs, fruit (8 items — simplify from 15)
- Keep "add your own" field

---

### Screen 2 — Home

**Centerpiece:** Soft status card — either next meal window ("Lunch, around 1pm") OR time-since-last ("It's been 4 hours since you ate") based on mode. Currently shows both; pick one based on mode.

**Primary action:** Keep the large "I ate" orb — make it spring-animate on load

**Streak/care-progress:** Replace the 7-day grid (currently feels dashboard-y) with a softer, more organic indicator — e.g. a gentle growing vine or dot trail with celebratory but non-numerical framing

**Remove:** The explicit "Easy option" suggestion card from home (belongs in the intercept screen). Keep the layout clean and spacious.

---

### Screen 3 — Intercept / Notification

**(a) Push notification** — Currently not shown. Add a notification preview card at top of intercept screen:
- Copy: "It's been a while — how about grabbing the [food]?" (specific, not generic "Time to eat!")

**(b) Full-screen intercept**
- Softer framing: "Making space to eat" not "Time's up"
- One food suggestion (from safe foods), prominent
- Big "Ate it" button
- Easy "Not now · I'll eat later" — must feel like a gentle override, not a defeat
- Tone: "on your side, never hostage"

---

### Screen 4 — Log Flow

**Core principle: one tap is always enough**

Current flow requires selecting a food before logging — this is wrong per spec. Redesign:
- Primary action logs instantly with warm confirmation, no selection required
- Below: optional "Which one did you have?" quick-select chips from safe foods
- Optional "Snap it? 📷" affordance — labeled as bonus, never required
- No text area on the main log screen (move to journal detail if needed)
- Confirmation copy: "Nice, that's you looked after." (not "Log it 🌿")

---

### Screen 5 — Celebration

- Soft animation / warm gradient bloom (keep confetti, refine colors to palette)
- Identity reinforcement: "You're someone who takes care of yourself."
- Show a soft growing care-trail — not "5-day streak" badge language
- No harsh numbers
- CTA: "Back home" — keep

---

### Screen 6 — Food Journal

- Scrapbook feel — keep card-per-entry layout
- Group by day — keep
- Add: optional photo thumbnail when `hasPhoto: true` (currently just shows a camera icon)
- Remove: "You logged 14 times" language from weekly summary — replace with softer: "A week of showing up for yourself"
- No totals, no macro-adjacent numbers

---

### Screen 7 — Safe Foods

- Reframe header: "The things you can always manage"
- Float most-used foods to top (sort selected first)
- Keep checkbox grid + add-your-own
- Simplify to match onboarding starter list as base

---

### Screen 8 — Settings

Add missing items from brief:
- **Calendar awareness** toggle: "Don't nudge me mid-meeting" 
- **Reminder gentleness/frequency** control (currently only mode toggle)
- **Soft social layer** — two opt-in options:
  - "Body-double feel" — see when others are having lunch (ambient, not surveillance)
  - "Accountability buddy" — a trusted person gets a supportive nudge if you haven't eaten (framed as support, never surveillance)
- Every option framed as "support and control, never pressure"

---

## Files to modify

- `src/app/App.tsx` — all screen components, state (add `onboarding-0` screen, redesign streak, log flow, settings)
- `src/styles/theme.css` — correct secondary accent to `#B7C4B0` / `#C6BCD6`
- Memory directory — save design parameters as standing `feedback` memory

---

## Implementation order

1. Fix theme tokens (theme.css)
2. Save memory
3. Add onboarding welcome screen (`onboarding-0`)
4. Rebuild log flow (one-tap principle)
5. Rebuild home streak indicator (softer, less dashboard)
6. Update intercept with notification preview + tone fix
7. Update celebration copy
8. Update journal weekly summary copy
9. Update safe foods header + sort order
10. Add settings: calendar awareness + social layer options

---

## Verification

Walk through each screen and confirm:
- Onboarding has 4 steps, welcome is step 1
- Log flow: primary button logs immediately, food selection is optional below
- Home: clean, spacious, not dashboard-heavy
- Streak: no punitive language, zero-streak met with warmth
- No diet colors, calorie counts, or guilt anywhere
- Settings includes calendar + social layer options
