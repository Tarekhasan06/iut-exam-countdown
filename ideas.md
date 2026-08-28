# IUT Exam Countdown — Design Brainstorm

## Approach 1
**Theme Name:** Quiet Editorial Campus

**Very Brief Intro:** A calm, paper-textured study dashboard that turns the routine into a reassuring daily ritual. Warm ivory, ink navy, and saffron bring the authority of an academic notice into a more personal preparation space.

**Probability:** 0.06

## Approach 2
**Theme Name:** Field Notes / Utility Grid

**Very Brief Intro:** A compact, utilitarian planner with data-first rows, annotated timestamps, and subtle graph-paper structure. It would feel like a well-made engineering lab notebook translated into a responsive web app.

**Probability:** 0.03

## Approach 3
**Theme Name:** Midnight Focus Mode

**Very Brief Intro:** A dark, high-contrast focus board that uses luminous countdown numerals and restrained amber indicators for late-night revision sessions. It would emphasize urgency and concentration over warmth.

**Probability:** 0.08

# Chosen Direction: Quiet Editorial Campus

## Design Movement
Contemporary editorial design with cues from Swiss information design and tactile university stationery: strong typographic hierarchy, disciplined alignment, asymmetry, and material contrast rather than decorative excess.

## Core Principles
1. **Make time tangible:** The next exam is the visual anchor, with the countdown treated as a physical object rather than a generic statistic.
2. **Use calm authority:** Deep ink navy and warm ivory make the routine feel official, while saffron and forest green add human warmth without visual noise.
3. **Let information breathe:** Schedule items have generous spacing, clear grouping, and small supportive labels so the page remains useful under exam stress.
4. **Build trust through specificity:** Dates, weekday names, course codes, time window, and room details are always visible and never hidden behind ambiguous controls.

## Color Philosophy
The palette pairs **ink navy** with **warm ivory** to turn a formal notice into a focused study surface. **Forest green** communicates progress and readiness, while **saffron gold** is reserved for the moment that matters most: the active countdown and next action. Color should clarify priority, not decorate every surface.

## Layout Paradigm
A split editorial composition: a wide countdown stage on the left and a narrow exam schedule rail on the right on desktop; a stacked sequence on mobile. The hero uses a left-aligned text block over a quiet visual field, with the countdown digits offset into a structured card. The schedule is a vertical timeline rather than a centered card grid.

## Signature Elements
- A saffron **date tab** with a clipped corner, echoing the corner of a paper calendar.
- Fine **registration marks and hairline rules** used sparingly around countdown units and timeline transitions.
- A small **“next up” eyebrow** paired with a forest-green dot that acts as the app’s visual pulse.

## Interaction Philosophy
Every interaction should reduce uncertainty. Hover and focus states reveal more context without changing the layout. Clicking a schedule entry promotes it to the active countdown. The page never requires a sign-in, data entry, or setup step for the provided routine; the user can arrive and immediately know what to study next.

## Animation
Entrance motion is a short, staggered editorial reveal: text and cards rise 12px while fading in, then settle under 260ms with a strong ease-out. The countdown updates once per second without any layout shift. The active schedule marker uses a quiet opacity pulse; no element should flash or bounce. Buttons compress to 97% on press. All non-essential animation is disabled under `prefers-reduced-motion`.

## Typography System
Use **DM Serif Display** for the main countdown numerals and select editorial headings, paired with **Manrope** for navigation, labels, schedule rows, and body copy. Headings use tight tracking and sentence case; utility labels are uppercase with generous letter spacing. Countdown numerals should be large, tabular, and high-contrast. Body copy remains at comfortable reading sizes with a line height between 1.45 and 1.65.

## Brand Essence
**“A quiet command center for the days before the exam.”** Built for IUT students who want one confident glance at what is next, why it matters, and how much time remains.

**Personality:** Grounded, focused, encouraging.

## Brand Voice
Headlines are direct, warm, and specific. CTAs sound like useful prompts, never marketing slogans. Microcopy reassures through clarity and small practical nudges.

Example headline: **“The next paper is already on the horizon.”**

Example microcopy: **“Use the space before Monday well.”**

## Wordmark & Logo
Use a custom symbol rather than a default text logo: a compact geometric mark that fuses a clock hand, a calendar corner, and a saffron sun notch. The wordmark is set in a high-contrast editorial serif with a small uppercase “IUT” label above it, but the header should rely primarily on the symbol for recognition at small sizes.

## Signature Brand Color
**Saffron Signal — `#E7A83B`**. It appears only where the interface asks the student to look now: the live countdown, active timeline marker, and primary action.

## Style Decisions
- Use the generated hero, study, calendar, and transparent mark assets from `/manus-storage/` as the app’s visual layer; do not replace them with generic placeholders.
- Never use purple gradients, dense dashboard chrome, or uniform rounded cards.
- Preserve the asymmetrical editorial layout on desktop and collapse it into a clear vertical reading order on mobile.
