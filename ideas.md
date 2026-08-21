# Design Direction — Aramco Net Salary Calculator

## Three stylistic approaches

### Theme Name: Desert Ledger
Very Brief Intro: A calm, editorial finance tool with sand-toned surfaces, deep petrol ink, and amber highlights inspired by desert light and paper ledgers.
Probability: 0.07

### Theme Name: Signal Blue
Very Brief Intro: A crisp utility interface built around cool blue panels, precise data hierarchy, and a restrained technical feel for fast, no-friction calculations.
Probability: 0.03

### Theme Name: Night Shift
Very Brief Intro: A focused dark-mode calculator with warm lime accents and subtle glow, designed for late-night payroll checks.
Probability: 0.02

## Chosen Approach: Desert Ledger

### Design Movement
Contemporary editorialism with Swiss-influenced information hierarchy and tactile financial-paper cues.

### Core Principles
1. Make the calculation feel trustworthy before it feels decorative.
2. Use asymmetry and a strong left-to-right reading path instead of a generic centered card.
3. Pair warm, tactile surfaces with one unmistakable high-contrast accent.
4. Keep every interaction short, legible, and reversible.

### Color Philosophy
The background is a pale parchment-sand to make the tool feel approachable and grounded. Deep petrol ink gives the numbers and headings authority without the harshness of black. Burnt amber is reserved for the brand mark, active focus states, and the primary action so it reads as a signal of movement and progress rather than generic decoration.

### Layout Paradigm
A split editorial composition: the left rail establishes context and explains the rules; the right workbench contains inputs and results. On mobile, the rail becomes a compact intro band above the calculator. Results remain visible beside the form on larger screens and stack below on narrow screens.

### Signature Elements
- A vertical amber rule with a small circular marker used as a recurring visual anchor.
- Oversized condensed numerals for the net salary result.
- Fine ledger lines and dotted separators that echo payroll worksheets.

### Interaction Philosophy
Inputs should feel like instruments: clear labels, explicit monthly/yearly hints, visible focus, and immediate result feedback. The calculator updates on each valid change while the Calculate button gives the user a deliberate confirmation moment. Reset returns the workbench to a blank state without surprise.

### Animation
Use a 180–240ms ease-out for focus rings, button press, and result-card elevation. Stagger the initial appearance of the intro, form, and result by 60ms. The net salary value may gently rise into place on calculate using opacity and a 4px vertical translation only. Respect prefers-reduced-motion.

### Typography System
Use Fraunces for display headlines and result numerals, with DM Sans for labels, body copy, controls, and microcopy. Headlines use tight tracking and occasional italic emphasis; body copy stays at a relaxed 1.55 line height. Numeric values use tabular numerals.

### Brand Essence
An honest, fast salary companion for Aramco employees who want a clear monthly take-home estimate without spreadsheet friction.
Personality: grounded, precise, reassuring.

### Brand Voice
Headlines are confident and plainspoken. CTAs are verbs with a clear outcome. Microcopy explains assumptions without sounding legalistic.
Example lines: “See what lands in your month.” / “Housing and bonus are annual inputs — we’ll normalize them for you.”

### Wordmark & Logo
A compact geometric mark built from three stacked ledger bars, with the middle bar offset to create a subtle upward step. The symbol works alone as the app icon; the wordmark uses the brand name in a custom small-caps treatment rather than a default font lockup.

### Signature Brand Color
Burnt amber — #C96832 — used sparingly for the mark, primary action, and key emphasis.
