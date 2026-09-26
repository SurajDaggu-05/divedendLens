# DESIGN.md — DividendLens
## Product Design Specification

**Document version:** 1.0  
**Product:** DividendLens — Swarm-Inspired Dividend Income Tracker  
**Audience:** Product, UX/UI, frontend, and hackathon implementation team  
**Status:** MVP design direction

---

## 1. Design purpose

DividendLens helps new Indian stock investors understand dividend income without needing to interpret financial jargon or trust a single opaque number. The interface should make portfolio value, dividend events, estimates, payment status, and data quality easy to scan.

The visual design should communicate:

- **Clarity:** users can understand what a number means and how it was calculated.
- **Trust through transparency:** show sources, freshness, assumptions, and conflicts instead of hiding uncertainty.
- **Calm confidence:** use a restrained financial-product aesthetic, not a trading-terminal look.
- **Beginner friendliness:** explain terms in context and avoid unexplained abbreviations.
- **Honest swarm visualization:** show agents as cooperating software workers, while clearly labeling simulated or local behavior in the prototype.

This document describes the intended appearance and interaction design. It does not prescribe a specific frontend framework.

## 2. Product and design principles

1. **Income first, not trading first.** The primary dashboard emphasizes dividend income and upcoming events, not stock-price movement.
2. **One screen, one primary question.** Each page should have a clear purpose and a visually dominant primary action.
3. **Explain every important number.** Estimated amounts should have a nearby “How this is calculated” affordance.
4. **Never use color as the only signal.** Pair status colors with text and/or icons.
5. **Make uncertainty visible.** Distinguish confirmed, estimated, user-reported, stale, missing, and conflicting data.
6. **Progressive disclosure.** Keep the default view simple; reveal source details, formulas, and agent traces when requested.
7. **Responsive by default.** Core tasks must work on a narrow phone screen without horizontal scrolling.
8. **No false claims.** If agents are simulated or running in one process, the UI must say so.

## 3. Visual direction

### 3.1 Overall aesthetic

Use a clean, contemporary fintech dashboard with generous whitespace, subtle borders, rounded cards, and restrained accent color. It should feel more like a personal finance companion than a broker terminal.

**Keywords:** clear, calm, precise, welcoming, transparent, lightweight.

Avoid:
- Dense tables as the default landing experience.
- Neon colors, heavy gradients, glowing effects, or animated market tickers.
- Red/green-only financial encoding.
- Excessive shadows or decorative charts with no decision value.
- Language implying guaranteed returns.

### 3.2 Color system

Use a light theme as the MVP default. Keep colors as design tokens so dark mode can be added later without changing component semantics.

| Token | Suggested value | Use |
|---|---|---|
| `color-bg` | `#F6F8FB` | App background |
| `color-surface` | `#FFFFFF` | Cards, panels, menus |
| `color-surface-muted` | `#F0F3F7` | Subtle inset areas, table headers |
| `color-text` | `#17212F` | Primary text |
| `color-text-muted` | `#647184` | Supporting text, labels |
| `color-border` | `#E2E8F0` | Card and input borders |
| `color-primary` | `#2563EB` | Primary buttons, active navigation, links |
| `color-primary-hover` | `#1D4ED8` | Hover/pressed primary |
| `color-primary-soft` | `#EFF6FF` | Selected backgrounds, info callouts |
| `color-success` | `#15803D` | Received/verified/success states |
| `color-success-soft` | `#F0FDF4` | Success badges and callouts |
| `color-warning` | `#B45309` | Needs review, approaching dates |
| `color-warning-soft` | `#FFFBEB` | Warning backgrounds |
| `color-danger` | `#B91C1C` | Errors, failed agents, rejected input |
| `color-danger-soft` | `#FEF2F2` | Error backgrounds |
| `color-info` | `#0369A1` | Informational status |
| `color-info-soft` | `#F0F9FF` | Informational backgrounds |
| `color-agent` | `#6D5CE8` | Swarm/agent identity accents |
| `color-agent-soft` | `#F3F0FF` | Agent activity surface |

Color guidance:
- Primary blue is for actions and navigation, not for every decorative element.
- Success means a workflow or validation state, not a prediction that an investment will perform well.
- Warning means attention is useful; it should not imply that the user has done something wrong.
- Use neutral text and icons for financial amounts. Avoid coloring all positive dividend amounts green.
- For charts, use one primary series and muted supporting series. Provide labels and a legend.

### 3.3 Typography

Use **Inter** as the preferred UI font, with a system sans-serif fallback. If loading an external font is not practical, use the platform system font.

| Style | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Display | 32 px | 700 | 1.2 | Page headline / hero metric |
| H1 | 28 px | 700 | 1.25 | Page title |
| H2 | 22 px | 650 | 1.3 | Major section heading |
| H3 | 18 px | 600 | 1.35 | Card title |
| Body | 15–16 px | 400 | 1.5 | Main content |
| Body small | 13–14 px | 400 | 1.45 | Supporting copy |
| Label | 12 px | 600 | 1.3 | Form labels, table headers |
| Metric | 28–36 px | 700 | 1.15 | Income and portfolio summary values |
| Numeric detail | 14 px | 500 | 1.4 | Table amounts and dates |

Typography rules:
- Use tabular numerals for monetary values and dates where supported.
- Keep paragraphs short and use sentence case.
- Do not rely on all-caps labels except for tiny optional overlines.
- Use Indian number formatting and currency notation consistently, e.g. `₹12,450`.
- Use full labels such as “Dividend per share” before introducing abbreviations.

### 3.4 Shape, spacing, and elevation

- Base spacing unit: **4 px**.
- Typical page gutter: 24 px desktop, 16 px mobile.
- Card padding: 20–24 px desktop, 16 px mobile.
- Card radius: 12–16 px.
- Input/button radius: 8–10 px.
- Use a 1 px neutral border for most cards; reserve shadows for floating menus or dialogs.
- Keep a consistent vertical rhythm; avoid tightly packed sections.

Suggested spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px`.

## 4. Information architecture and navigation

### 4.1 Primary navigation

Desktop navigation should use a persistent left sidebar. Mobile navigation should use a compact bottom navigation bar for the four most-used destinations, with secondary destinations accessible from a “More” menu.

Primary destinations:
1. **Overview** — summary of expected and received dividend income.
2. **Portfolio** — holdings and share quantities.
3. **Dividend Calendar** — upcoming and historical dividend events.
4. **Activity** — agent status, data checks, and system events.

Secondary destinations:
- **Data Sources** — source provenance, freshness, and conflicts.
- **Settings** — profile, preferences, and demo-data reset.
- **Help / Glossary** — beginner explanations and product limitations.

### 4.2 Desktop shell

- Left sidebar width: approximately 240 px.
- Main content max width: 1200–1360 px, depending on screen.
- Top bar: page title or breadcrumb on the left; data freshness, help, and profile controls on the right.
- Main content: responsive grid with a 12-column mental model.
- Sidebar remains visually quiet; active destination uses a soft primary background and clear icon/text treatment.

### 4.3 Mobile shell

- Top bar contains product mark, page title, and a compact profile/menu action.
- Bottom navigation contains Overview, Portfolio, Calendar, and Activity.
- Keep the primary add action reachable without requiring a long scroll.
- Secondary navigation appears in a sheet or “More” screen.
- Respect safe-area insets on devices with gesture navigation.

## 5. Page-by-page design

### 5.1 Overview dashboard

**User question:** “What dividend income should I expect, what has arrived, and what needs my attention?”

Recommended layout, top to bottom:

1. **Header**
   - Greeting or neutral “Overview” title.
   - Small “Demo data” or “Sample portfolio” label when seeded data is active.
   - Last updated timestamp and refresh action.

2. **Income summary cards**
   - Expected this financial year.
   - Received this financial year.
   - Upcoming next 30 days.
   - These are summary metrics, not investment-performance scores.
   - Each card includes a short descriptor and a “View details” link where relevant.

3. **Income trend**
   - Simple monthly bar chart or compact sparkline with month labels.
   - Show received and estimated income distinctly.
   - Include an accessible text summary and a no-data state.
   - Do not imply that historical income guarantees future income.

4. **Upcoming dividends**
   - List the next few events with company name, ex-date, dividend per share, eligible quantity if known, and estimated gross amount.
   - Clearly label estimates and assumptions.
   - Use “View calendar” as the secondary action.

5. **Portfolio snapshot**
   - Holdings count, companies with upcoming events, and a link to portfolio.
   - Avoid displaying live stock prices in the MVP unless they are explicitly sourced and in scope.

6. **Data quality / agent health**
   - Compact card showing the latest data-check status and number of items needing review.
   - Link to Activity or Data Sources.
   - Label the swarm as “Prototype agents” or “Simulated agents” if applicable.

### 5.2 Portfolio

**User question:** “Which holdings are being used to calculate my dividend estimates?”

- Page title: “Portfolio”.
- Primary action: “Add holding”.
- Desktop: searchable table with company, symbol, quantity, average cost (optional only if implemented), and actions.
- Mobile: stacked holding cards with company and quantity visible first.
- Include empty state with a clear add-holding CTA.
- Editing quantity should explain that changing holdings may change estimates.
- Do not show buy/sell recommendations or trading controls.

Suggested table columns:
- Company
- Symbol
- Shares held
- Upcoming dividend
- Estimated gross income
- Updated / actions

For the MVP, only include columns backed by implemented data. Do not fabricate a market price or yield.

### 5.3 Add / edit holding

Use a focused form in a modal on desktop or a full-screen page/sheet on mobile.

Fields:
- Company or ticker (searchable if supported; otherwise select from demo catalog).
- Quantity / shares held.
- Optional acquisition date only if used by calculation logic.
- Optional notes only if the product supports them.

Interaction:
- Validate required fields inline.
- Show examples and units.
- Explain whether fractional shares are accepted; default to whole shares if the backend only supports integers.
- Submit button uses a specific label: “Save holding”.
- Cancel must preserve the current page without saving.

### 5.4 Dividend Calendar

**User question:** “When are dividend events expected?”

- Provide month and list views; list view is the default on mobile.
- Calendar items show company, event type, relevant date, and status.
- Provide filters for upcoming/past and status when implemented.
- Clearly distinguish announcement date, ex-dividend date, record date, and payment date.
- If a date is unknown, show “Not available” rather than inventing one.
- A selected event opens a detail panel or page with calculation and source details.

Event status examples:
- Announced
- Estimated
- Payment reported
- Needs review
- Data unavailable

Do not visually imply that an ex-date is a payment date.

### 5.5 Dividend event detail

Include:
- Company and event heading.
- Dividend per share and currency.
- Relevant dates with plain-language descriptions.
- Eligible share quantity used in the estimate.
- Estimated gross amount and formula.
- Source and last-checked timestamp.
- Confidence/data-quality status with a short explanation.
- A clear “Report payment received” action if manual reporting is supported.

Suggested formula presentation:

`Estimated gross dividend = eligible shares × dividend per share`

Below the formula, state that the displayed estimate may differ from the amount credited and does not necessarily include taxes, fees, or other adjustments.

### 5.6 Activity / swarm monitor

**User question:** “What is the system checking, and did anything fail?”

This page is a product transparency feature, not a decorative animation.

- Summary strip: agents active, latest cycle, warnings, and last successful update.
- Agent cards: name, role, status, last run, and concise result.
- Activity timeline: timestamp, agent, action, and outcome.
- Failure state: explain what failed, what data may be affected, and whether retry is pending or complete.
- Show message/task identifiers only if useful for debugging; avoid overwhelming beginner users.
- Provide a “How the agents work” explanation panel.

Suggested agent labels:
- Data Collection
- Date Tracking
- Data Validation
- Dividend Calculation
- Explanation (optional)
- Monitoring & Recovery (optional)

For a local single-process prototype, use copy such as “Cooperating prototype agents” and explain that this is a swarm-inspired simulation. Do not claim a truly decentralized deployment unless the architecture actually provides it.

### 5.7 Data Sources

- List each source with source name/type, last checked, freshness, and affected events.
- Show conflicts side by side with the values and sources involved.
- Explain whether the system selected a value, marked it for review, or left it unresolved.
- Provide a concise “Why this matters” explanation.
- Use warning styling for stale or conflicting data, but do not make the whole page look like an error state.

### 5.8 Settings and help

Settings should be short and task-oriented:
- Profile / account
- Currency and date preferences, if supported
- Notification preferences, if supported
- Demo data reset
- About this prototype and architecture limitations

The glossary should explain terms in plain language:
- Dividend
- Dividend per share
- Ex-dividend date
- Record date
- Payment date
- Estimated gross amount
- Data freshness
- Agent

## 6. Component library

### 6.1 Buttons

- **Primary:** filled primary blue; one per major content area where possible.
- **Secondary:** neutral outline or muted surface.
- **Tertiary:** text button for low-emphasis actions.
- **Destructive:** danger styling and confirmation for irreversible actions.
- Minimum touch target: 44 × 44 px.
- Include hover, focus-visible, pressed, disabled, and loading states.

Use action labels that describe outcomes: “Add holding”, “Save changes”, “View event”, “Report payment”.

### 6.2 Cards

Card types:
- Metric card
- Upcoming event card
- Holding card
- Agent status card
- Data quality card
- Empty-state card

Cards should have consistent padding, title placement, and border treatment. Avoid making every card a separate color.

### 6.3 Status badges

Use a short text label plus optional icon. Suggested semantic mapping:

| Status | Treatment | Example label |
|---|---|---|
| Confirmed / verified | Green | Verified |
| Estimated | Blue or neutral | Estimate |
| Needs review | Amber | Needs review |
| Stale | Amber | Stale data |
| Failed | Red | Failed |
| User reported | Neutral | User reported |
| Simulated | Purple | Simulated |

Never communicate status using color alone.

### 6.4 Forms and validation

- Labels remain visible when the field is populated.
- Placeholder text is an example, not a substitute for a label.
- Put validation messages next to the relevant field.
- Explain how to fix an error.
- Preserve entered values after recoverable errors.
- Use confirmation for destructive actions such as deleting a holding or resetting demo data.

### 6.5 Tables and lists

- Use tables on wide screens when comparison is important.
- On mobile, convert rows to cards or use a deliberately compact list.
- Keep key identifiers and values visible without horizontal scrolling.
- Right-align monetary amounts; use consistent decimal precision.
- Use sticky headers only for long tables and ensure they do not obscure content.

### 6.6 Charts

- Use charts only when they answer a user question.
- Label axes and series in plain language.
- Provide a text equivalent or data table for accessibility.
- Include empty, loading, and error states.
- Distinguish estimated from received amounts using labels, line styles, or patterns as well as color.

### 6.7 Dialogs, sheets, and toasts

- Use dialogs for confirmations and short focused tasks.
- Use bottom sheets or full-screen flows on mobile for complex forms.
- Toasts should confirm completed actions or report transient errors; persistent issues belong inline.
- Never use a toast as the only place where a critical warning appears.

### 6.8 Tooltips and explanations

- Use a small “?” or “How is this calculated?” affordance next to unfamiliar concepts.
- Tooltips must also be reachable by keyboard and have a mobile-friendly alternative.
- Prefer short inline explanations for critical distinctions, such as ex-date versus payment date.

## 7. Responsive and mobile rules

Breakpoints are implementation guidance; adapt to the chosen CSS framework.

| Range | Layout behavior |
|---|---|
| ≥ 1200 px | Sidebar + wide content grid; 3–4 metric cards per row |
| 768–1199 px | Collapsible sidebar or compact navigation; 2 metric cards per row |
| 480–767 px | Single-column content; bottom navigation; list-first calendar |
| < 480 px | Single-column compact layout; full-width primary actions; avoid dense tables |

Rules:
- No horizontal page scrolling at 320 px viewport width.
- Use a minimum 16 px body font for form inputs on mobile to avoid unwanted browser zoom where applicable.
- Keep tap targets at least 44 px in both dimensions.
- Stack metric cards on narrow screens; do not shrink values until unreadable.
- Place the most important amount and status at the top of a card.
- Convert tables to cards or a labeled list; never require sideways scrolling for core tasks.
- Keep primary actions visible near the relevant content.
- Use sticky bottom navigation only if it does not cover content; add sufficient bottom padding.
- Ensure dialogs fit within the viewport and scroll internally when necessary.
- Support portrait and landscape orientations.
- Respect reduced-motion preferences and avoid relying on animation to convey state.

## 8. Interaction and motion

Motion should be subtle and functional:
- 120–200 ms transitions for hover, focus, and panel changes.
- Use skeletons for short loading states where they improve perceived continuity.
- Agent activity may use a small status pulse, but the status text must remain clear without animation.
- Avoid continuous movement, flashing, or celebratory animations for financial events.
- Respect `prefers-reduced-motion`.

Interaction feedback:
- Every action should have a visible result or a clear error.
- Disable duplicate submissions while saving.
- Preserve user-entered values if an operation fails.
- Show data freshness after a successful refresh.
- If a data source or agent is unavailable, keep unaffected parts of the product usable.

## 9. Content and microcopy

Voice: plain, calm, direct, and non-promotional.

Prefer:
- “Estimated dividend”
- “Based on 25 eligible shares”
- “Last checked 10 minutes ago”
- “Payment reported by you”
- “This date is not available”
- “One source disagrees with another”
- “The estimate may change when data is updated”

Avoid:
- “Guaranteed income”
- “Risk-free”
- “You will earn”
- “Best dividend stock”
- “Buy now” / “Sell now”
- “AI knows the correct value” or other claims of certainty

Use “expected” only when the underlying event and estimate are clearly labeled. Use “received” only for a payment confirmed by an implemented source or explicitly reported by the user.

## 10. Accessibility

Target WCAG 2.2 AA where practical.

- Maintain sufficient text and control contrast.
- Provide visible keyboard focus.
- Ensure all controls have accessible names.
- Use semantic headings in order.
- Ensure keyboard access to navigation, dialogs, menus, filters, and charts.
- Pair color with text, shape, or icon for all statuses.
- Provide meaningful alt text for informative images; hide purely decorative visuals from assistive technology.
- Support zoom and text resizing without clipping.
- Use accessible error messaging and announce dynamic updates where appropriate.
- Do not make the agent swarm visualization the only way to understand system status.

## 11. Empty, loading, and error states

Every data-driven page should define these states.

### Empty
- Explain what is missing and why the page is empty.
- Provide one relevant next action.
- Example: “No holdings yet. Add a holding to see dividend estimates.”

### Loading
- Use lightweight skeletons or a short “Loading…” label.
- Avoid indefinite spinners without context.
- If the operation is long, show a meaningful progress or retry state.

### Error
- State what could not be completed.
- Explain whether existing data is still available.
- Offer a safe retry when appropriate.
- Do not erase existing content because one agent or source failed.

### Stale or partial data
- Keep the page usable.
- Label affected values and show the last successful update.
- Avoid silently replacing unknown values with zero.

## 12. Design references and inspiration

Use these as **visual references, not templates to copy**:

- **Stripe Dashboard** — restrained typography, clear hierarchy, and practical data presentation.
- **Linear** — compact navigation, consistent spacing, and focused interaction patterns.
- **Monzo** — approachable personal-finance language and readable money summaries.
- **Material Design 3** — accessible component states, responsive behavior, and interaction guidance.
- **WCAG 2.2** — accessibility requirements and testable success criteria.

Reference links:
- Stripe: https://stripe.com/
- Linear: https://linear.app/
- Monzo: https://monzo.com/
- Material Design 3: https://m3.material.io/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

Do not copy logos, proprietary illustrations, or distinctive branded layouts. The goal is to borrow general usability patterns while keeping DividendLens visually distinct.

## 13. Suggested screen inventory

MVP screens:
1. Overview dashboard
2. Portfolio list
3. Add holding
4. Edit holding
5. Dividend calendar
6. Dividend event detail
7. Activity / agent monitor
8. Data sources and conflicts
9. Settings / demo reset
10. Glossary / help

Responsive variants should be designed for at least:
- 1440 px desktop
- 1024 px tablet landscape
- 768 px tablet portrait
- 390 px mobile
- 320 px narrow mobile

## 14. Design acceptance criteria

The design is ready for implementation when:

- [ ] A new user can identify expected, received, and upcoming dividend amounts without interpreting a chart.
- [ ] Every estimate has a visible label and an accessible explanation of its inputs or formula.
- [ ] The interface distinguishes announcement, ex-dividend, record, and payment dates.
- [ ] Data freshness, stale data, and conflicting values are visible where relevant.
- [ ] Agent activity is understandable without requiring the user to know distributed-systems terminology.
- [ ] Any simulated/local agent architecture is explicitly labeled as a prototype.
- [ ] Primary navigation is consistent across desktop and mobile.
- [ ] Core tasks work at 320 px width without horizontal page scrolling.
- [ ] Forms have visible labels, field-level errors, and clear save/cancel behavior.
- [ ] Status is never conveyed by color alone.
- [ ] Keyboard focus and accessible names are present for interactive controls.
- [ ] Empty, loading, error, and partial-data states are designed for every data-driven screen.
- [ ] No screen contains trading recommendations or language that promises dividend income.

## 15. MVP implementation notes

- Build the light theme and reusable tokens first; treat dark mode as a later enhancement unless time permits.
- Implement shared components before polishing individual pages.
- Prefer a small set of consistent card patterns over one-off layouts.
- Use seeded hypothetical data to make the interface demonstrable, and visibly label it as sample/demo data.
- Keep design and domain semantics aligned: “estimated”, “received”, “reported”, “verified”, and “stale” must not be interchangeable.
- The UI should remain useful if the agent monitor is unavailable; portfolio and event information should not depend on an animation or live swarm view.

---

**End of DESIGN.md**
