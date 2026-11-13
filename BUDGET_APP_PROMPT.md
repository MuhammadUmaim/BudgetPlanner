# ROLE
You are a world-class product designer + senior front-end engineer who ships app-store-quality, Awwwards-level experiences. You are building "Smart Budget & Financial Planner" as a MOBILE-FIRST, installable web app that feels native: fluid, tactile, delightful. Every screen must feel like a premium fintech app (think Revolut, Cash App, Linear, Arc) in the hand, while scaling gracefully to tablet and desktop. Taste, polish, and flawless interaction matter more than raw feature count. Ship production code, not a demo.

# PRODUCT VISION
A person enters their monthly income, picks their household situation, and instantly gets a smart recommended budget. They refine it by touch, watch an animated donut react in real time, get personalised financial coaching, track actual spending against the plan, run what-if scenarios, and export or share a beautiful summary. The experience should feel effortless, thumb-friendly, and satisfying.

# TECH STACK (non-negotiable; install all dependencies, no CDN hacks)
Core
- Vite + React 18 + TypeScript (strict), Tailwind CSS v4 with design tokens as CSS variables
- Motion (package "motion", import from "motion/react") for all UI animation, gestures, shared layout
- Lenis ("lenis/react") for buttery smooth scrolling (desktop/tablet; use native momentum scroll on touch devices)
- React Bits (reactbits.dev, TS + Tailwind variants copied into /components/reactbits). Install peer deps (gsap, ogl, etc.). If a component can't be fetched, build a faithful equivalent. Never skip the effect.

Mobile-native feel
- Vaul: native-style draggable bottom sheets (category editor, add category, settings, export)
- @use-gesture/react: swipe, drag, long-press, pull interactions
- Sonner: elegant toasts with undo actions
- cmdk: command palette (Cmd/Ctrl+K on desktop, search icon on mobile)
- web-haptics or navigator.vibrate wrapper: subtle haptic ticks on slider steps, snaps, success, and errors (feature-detected, gracefully ignored)

UI foundation
- Radix UI primitives (via shadcn/ui, restyled to our tokens) for Tabs, Dialog, Switch, Tooltip, Select, Slider, Popover. Fully accessible by default.
- Lucide React icons (consistent 1.75 stroke)

Data & charts
- Recharts for the donut, plus a compact area/bar chart for history and projections
- Zustand + persist middleware (localStorage), Zod for validation
- Intl.NumberFormat everywhere for currency

Delight & output
- canvas-confetti (tasteful burst when the budget hits exactly 100% or a goal completes)
- html-to-image for "Share as image" cards; native Web Share API with fallback to download
- vite-plugin-pwa: installable PWA, offline-capable, proper manifest, maskable icons, theme-color
- i18next + react-i18next: English and Urdu (full RTL layout support, Noto Nastaliq Urdu for Urdu text)
- Vitest + Testing Library for the allocation engine and key components

# DESIGN SYSTEM: crisp, high-contrast LIGHT theme (hero experience)
- Tokens: background #FAFAFB, surface #FFFFFF, border #E5E7EB, text #111827, muted #6B7280, success #10B981, danger #EF4444, warning #F59E0B, brand accent a confident indigo #4F46E5.
- Optional dark theme via toggle (same tokens inverted, never the default). System preference respected on first load.
- Cards: white, 1px #E5E7EB border, 20-24px radius, soft layered shadows. Glassmorphism ONLY on the sticky header and bottom nav (backdrop-blur, 1px hairline border).
- Typography: Plus Jakarta Sans (headings), Inter (body), tabular-nums for ALL money and percentages. Fluid type scale with clamp(). Large, confident numbers.
- Category palette (editable): Housing #4F46E5, Groceries #84CC16, Education #F59E0B, Health #F43F5E, Fitness #06B6D4, Emergency #F97316, Sadqa #8B5CF6, Investments #14B8A6, Entertainment #EC4899.
- 8px grid. Generous whitespace. Consistent 2px focus rings. Respect safe-area insets (env(safe-area-inset-*)) for notched phones.
- Ambient background: a very low-opacity React Bits background (Aurora / Dot Grid / Squares), lazy-loaded, paused on low-power or reduced-motion, never hurting contrast.

# MOBILE-FIRST EXPERIENCE (design for a 390px phone FIRST, then scale up)
- Thumb-zone ergonomics: primary actions live in the bottom 40% of the screen. Min touch target 44x44px. No hover-only interactions.
- Bottom navigation bar (glass, 5 tabs): Plan - Insights - Track - Goals - More. Animated active indicator using Motion layoutId. Hides on scroll down, returns on scroll up.
- Sticky compact header that collapses on scroll: shows income, currency, and the total % badge in one slim row.
- "Hero card" at the top: big animated income figure, the donut, and the total status badge. The donut is tappable: tap a slice to focus that category and scroll to its card.
- Category cards: tap to expand inline for the slider; long-press to open a Vaul bottom sheet with full editing (name, color, icon, % input, amount input, lock, notes, delete). Swipe left on a card for Lock / Delete actions (with Undo toast); swipe right to Pin.
- Large custom slider with spring-physics thumb, magnetic snapping to nice values (every 5%) with haptic tick, a live floating tooltip bubble showing % and amount while dragging, and +/- stepper buttons for precision.
- Pull-to-refresh style "Reset to preset" gesture, and shake-free, jank-free drags at 60fps.
- Floating action button (FAB) to add a custom category, opening a Vaul bottom sheet.
- Page transitions between tabs: shared-element and slide transitions with Motion AnimatePresence.
- Skeleton loaders, optimistic UI, and instant feedback on every tap (scale 0.97 press state).
- Desktop/tablet: bottom nav becomes a slim left rail; the layout becomes a 12-col dashboard (plan on the left, sticky donut and advice on the right).

# FEATURES

## 1. Onboarding (first launch only, skippable, 3 swipeable steps)
Welcome -> income and currency -> household profile. Animated with Motion, ends with the first budget "building itself" using staggered slider animations and a confetti pop.

## 2. Income and currency
Large numeric keypad-friendly input (inputMode="decimal"), animated CountUp on change. Currencies: PKR (default), USD, EUR, GBP, AED, SAR, INR, with correct symbols and grouping (lakh/crore grouping for PKR/INR). Quick-income chips: 50k / 100k / 200k / 500k. Optional second income and "after-tax" toggle with a simple tax-rate field.

## 3. Household profiles (animated, swipeable card carousel; selecting one springs all sliders to the preset)
Order: Housing | Groceries | Education | Health | Fitness | Emergency | Sadqa | Investments | Entertainment (each row sums to exactly 100)
- Unmarried / Single:        28 | 12 |  8 |  5 | 5 | 15 | 5 | 14 | 8
- Married, no children:      32 | 16 |  4 |  6 | 4 | 14 | 5 | 11 | 8
- Married, 1 child:          30 | 17 |  8 |  9 | 3 | 14 | 5 |  9 | 5
- Married, 2 children:       28 | 19 | 13 | 10 | 3 | 12 | 5 |  6 | 4
- Married, 3+ children:      26 | 21 | 16 | 11 | 2 | 10 | 6 |  5 | 3
Each card: illustration/icon, one-line rationale, and a mini preview bar of its split.

## 4. Allocation engine (get this exactly right; pure functions in /lib/allocation.ts)
- Step 0.5%. Amounts use largest-remainder rounding so they always sum EXACTLY to income.
- Auto-balance ON (default): moving one slider redistributes the difference proportionally across other UNLOCKED categories, never below 0; locked categories never change.
- Manual mode: free sliders, total may drift.
- Total badge: GREEN "100% allocated" / RED "Over by X%" or "X% unallocated", animated color morph, plus a one-tap "Normalize to 100%".
- Custom categories: name, color, emoji/icon, starting %. They take their % proportionally from unlocked categories. Editable, deletable (freed % returns proportionally). Default names and colors are editable too. Drag-to-reorder via Motion Reorder.
- Edge cases handled silently: income 0/empty/negative/huge, all locked, deleting last category, rapid drags. No NaN, no flicker, no layout shift.

## 5. Insights tab
- Budget Health Score (0-100) shown as an animated radial ring with a plain-language verdict ("Strong", "Balanced", "Needs attention") and the 3 biggest levers to improve it.
- Rule comparison: compare the user's split against the 50/30/20 rule (Needs/Wants/Savings), animated stacked bar with deltas.
- Smart coaching feed (React Bits AnimatedList): profile-based tips + live checks (Housing > 35% warning, Sadqa < 2.5% gentle nudge, Emergency Fund months-to-goal vs a 6-month target, Investments < 5% low, Entertainment > 15% high, total != 100%). Each tip has a severity icon (info / good / warning), a short "why", and a one-tap "Apply suggestion" button that animates the sliders.
- Footnote: "Educational guidance, not professional financial advice."

## 6. What-if simulator
Sheet with a "+/- income" slider (-50% to +100%) and quick scenarios ("Salary raise 10%", "Lose 20% income", "New baby", "Move to cheaper rent"). Shows before/after amounts per category with animated diffs and a one-tap "Adopt this scenario".

## 7. Track (actual vs planned)
Quick-add expense bottom sheet: amount keypad, category chips, optional note, date. Each category card shows a progress ring/bar of spent vs budget (green -> amber at 80% -> red at 100%). Swipe to edit or delete an expense (Undo toast). Month-at-a-glance summary and "days left in month" daily-safe-to-spend figure.

## 8. Goals
Savings goals (Emergency Fund, Hajj/Umrah, Wedding, Car, Custom): target, deadline, monthly contribution pulled from the Emergency/Investments categories. Animated progress ring, projected completion date, confetti on completion. A compound-growth projection chart for Investments (adjustable annual return and years).

## 9. Zakat and Sadqa helper (culturally aware)
Simple Zakat calculator (savings, gold/silver, investments, debts -> 2.5% of eligible wealth, with an editable nisab value) and a "pay Sadqa first on payday" reminder toggle. Clearly labeled as an estimate.

## 10. History and monthly snapshots
Save the current month as a snapshot; compare months with a small area/bar chart and "spent less than last month" wins.

## 11. Export, print and share
- Share as image: a beautiful branded card (donut + top categories + totals) via html-to-image and Web Share API.
- Print / Save as PDF: dedicated print stylesheet, a clean one-page report (date, income, currency, profile, category table with % and amount, total row, donut, advice). No sliders, buttons, or backgrounds.
- Download CSV, Copy summary (toast), and Export/Import JSON backup of all data.

## 12. Command palette and settings
cmdk palette: "Set income", "Switch profile", "Add category", "Toggle language", "Reset", "Export". Settings sheet: language (EN/UR with RTL), theme, haptics on/off, sound on/off, reduce motion override, rounding mode, reset all data.

# MOTION DIRECTION (premium, purposeful, never gimmicky)
- Lenis smooth scroll on desktop/tablet with data-lenis-prevent on sliders, sheets, and inner scrollers so drags never fight the scroll. Off for prefers-reduced-motion and print.
- Motion: staggered entrances, shared-layout transitions (tab indicator, card expand, reorder), AnimatePresence for add/remove, spring-physics thumbs and sheets, press/hover micro-interactions (scale 0.97 / lift 2px), number tweening between values.
- React Bits: SplitText (hero title), CountUp (all money and % figures, animating from the previous value), SpotlightCard (category cards, touch-friendly), Magnet / StarBorder (primary CTA), AnimatedList (advice), FadeContent / AnimatedContent (section reveals), plus one tasteful showcase piece such as a TextPressure/BlurText onboarding headline.
- Donut: animated slice transitions, tap/hover highlights slice and legend together, center label shows the focused category's name, % and amount, subtle idle "breathing" glow on the active slice.
- Haptics + micro-sounds (optional, off by default) on slider ticks, success, and error.
- Respect prefers-reduced-motion everywhere (opacity-only fallbacks). Animate only transform and opacity; target 60fps on mid-range Android phones.

# QUALITY BAR
- Accessibility: WCAG AA contrast, full keyboard and screen-reader support, ARIA on sliders (aria-valuetext "Housing 28 percent, 56,000 PKR"), visible focus, live region announcing total status, RTL-correct layouts.
- Performance: Lighthouse 95+ on mobile; route-level code splitting; lazy-load heavy React Bits backgrounds, confetti, and html-to-image; memoized chart data; no re-render storms while dragging (use selectors, transient updates).
- PWA: installable, works offline, instant repeat loads, correct splash/theme-color.
- Code: strict TypeScript, small focused components, pure logic in /lib with Vitest tests (rebalancing, locks, rounding, scenarios, zakat math, edge cases). No dead code, no console errors or warnings. Zero lorem ipsum; all copy real, warm, concise.

# SUGGESTED STRUCTURE
src/lib/{allocation, presets, advice, scenarios, zakat, healthScore, format, export, haptics}.ts
src/store/{budget, expenses, goals, settings}.ts
src/components/{layout/BottomNav, layout/Header, plan/*, insights/*, track/*, goals/*, sheets/*, charts/*, reactbits/*, ui/*}
src/i18n/{en.json, ur.json}, src/print.css

# PROCESS
1. State your plan briefly: chosen libraries, which React Bits components go where, and the screen map.
2. Scaffold, install dependencies, then build and test the allocation engine first.
3. Build the mobile layout and core flow (Plan tab) to a polished state, then add remaining tabs, then motion and haptics, then PWA and i18n.
4. Self-review against the checklist, fix failures, and finish with run instructions (npm install, npm run dev, npm run build, npm test) and a short list of what to try first.

# DEFINITION OF DONE
[ ] Feels native on a 360-430px phone: bottom nav, bottom sheets, swipe actions, haptics, safe-area aware
[ ] Income 200,000 PKR shows correct % and exact amounts everywhere, updating live
[ ] All 5 profiles load and sum to exactly 100
[ ] Auto-balance, locks, normalize, manual mode, custom categories behave per spec
[ ] Green/red total indicator accurate in every state, confetti at 100%
[ ] Insights, What-if, Track, Goals, Zakat helper, History all functional
[ ] English and Urdu (RTL) both fully working
[ ] Share image, print-to-PDF, CSV, and JSON backup all work
[ ] Installable PWA that works offline
[ ] Smooth Lenis scrolling with no slider/sheet conflicts, reduced-motion fallback
[ ] Lighthouse mobile 95+, keyboard accessible, zero console errors