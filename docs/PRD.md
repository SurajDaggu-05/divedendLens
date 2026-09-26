# Product Requirements Document (PRD)

## DividendLens --- Swarm-Inspired Dividend Income Tracker

**Document status:** Hackathon MVP specification\
**Version:** 1.0\
**Date:** 26 September 2026\
**Product type:** Responsive web application\
**Primary market:** Beginner investors tracking Indian listed equities\
**Audience:** Product, design, frontend, backend, QA, and hackathon
teams

------------------------------------------------------------------------

## 1. Product summary

DividendLens helps beginner investors record stock holdings, understand
dividend announcements, estimate expected dividend income, and track
payments actually received. It uses a swarm-inspired set of small
software agents to collect, normalize, validate, calculate, and explain
dividend data.

The MVP is a **single-computer prototype with independently runnable
agent processes**. Agents exchange structured messages through a
lightweight message broker or an in-process adapter. The design should
make agent responsibilities and failure/recovery behavior visible, but
the team must not describe a single-machine demo as a geographically
distributed system.

Dividend information may be incomplete, delayed, or inconsistent across
sources. The product must show source, last-updated time, and
verification state, and must distinguish estimates from confirmed
records. It is an educational tracking tool---not a broker, tax filing
system, investment adviser, or guarantee of future income.

### Product value

-   Give a beginner a clear view of estimated and received dividend
    income.
-   Explain dividend dates and calculations in plain language.
-   Surface missing, stale, duplicate, or conflicting data instead of
    silently hiding it.
-   Demonstrate how cooperating agents can validate information and
    recover from a simulated agent failure.

------------------------------------------------------------------------

## 2. Problem definition

### 2.1 Problem

New investors may hold dividend-paying shares but lack a simple way to
answer: - Which dividend events relate to the shares they recorded? -
How much income might they receive, and how was it calculated? - Which
events are only announced or estimated versus actually paid? - What do
ex-dividend, record, and payment dates mean? - Can they trust the data,
and what happens when sources disagree?

A basic calculator can multiply shares by dividend per share, but it
does not address event dates, portfolio history, source provenance,
conflicting information, or the reliability of the underlying data.

### 2.2 Product problem statement

Build a beginner-friendly dividend tracker that records user holdings
and dividend events, calculates transparent income estimates, and uses
cooperating software agents to collect and validate event data. The
system must communicate uncertainty clearly and remain useful when an
agent is unavailable.

### 2.3 Scope boundaries

**In scope** - Manual portfolio and dividend-event entry. - Clearly
labeled hypothetical/demo data. - Dividend calculations based on
recorded holdings and event data. - Dividend calendar and income
history. - Agent coordination, validation alerts, activity visibility,
and simulated recovery. - Responsive browser-based UI.

**Out of scope for the MVP** - Brokerage account linking, trading, or
order placement. - Automated portfolio imports from broker
credentials. - Personalized investment recommendations, stock rankings,
or buy/sell signals. - Guaranteed prediction of future dividends. - Tax
filing, tax advice, or authoritative net-of-tax calculations. -
Production-grade multi-region distributed infrastructure. - Unapproved
scraping or redistribution of exchange/vendor data.

------------------------------------------------------------------------

## 3. Users and user needs

### 3.1 Primary persona: beginner retail investor

**Description:** A person who owns or is learning to track Indian listed
shares and is unfamiliar with dividend terminology.

**Needs** - Add holdings without needing a brokerage integration. - See
expected income using understandable arithmetic. - Know which events are
unverified, upcoming, or received. - Understand dividend dates and
eligibility assumptions. - See why a figure changed and which source
supplied it.

### 3.2 Secondary persona: hackathon judge / evaluator

**Needs** - Understand the product's purpose quickly. - Observe agents
performing distinct tasks and exchanging messages. - Trigger a conflict
and see a validation alert. - take an agent offline and observe task
reassignment or graceful degradation. - Distinguish implemented behavior
from planned or simulated behavior.

### 3.3 Internal user: project administrator / demo operator

**Needs** - Load and reset deterministic demo data. - Inspect agent
status and processing logs. - Trigger failure, stale-data, duplicate,
and conflict scenarios. - Avoid exposing one user's portfolio data to
another.

------------------------------------------------------------------------

## 4. Goals, non-goals, and success measures

### 4.1 Product goals

1.  Make dividend income understandable to a first-time investor.
2.  Provide transparent, reproducible calculations.
3.  Preserve source provenance and data freshness.
4.  Detect and display data-quality problems.
5.  Demonstrate meaningful agent collaboration and graceful failure
    handling.
6.  Deliver a usable end-to-end MVP within a short student hackathon.

### 4.2 Non-goals

-   Maximize trading activity or encourage any investment decision.
-   Predict stock prices or future dividend declarations.
-   Claim that agent consensus proves a financial fact.
-   Replace official company or exchange disclosures.
-   Claim distributed resilience unless agents actually run across
    independent processes/hosts and the deployment is documented.

### 4.3 MVP success measures

These are **acceptance targets**, not claimed results: - A user can
create a portfolio and add, edit, and remove holdings. - A dividend
estimate can be traced to share quantity, dividend per share, event
status, and calculation timestamp. - Every displayed event has a status
and source/provenance fields, including demo records. - Conflicting
records generate a visible alert and are not silently merged into a
falsely certain value. - A simulated unavailable agent is detected, and
the system either reassigns its task or marks the result incomplete with
a clear status. - The core user flows work at desktop and mobile
viewport sizes. - The demo can be reset to a known state.

------------------------------------------------------------------------

## 5. Product principles

1.  **Clarity over financial jargon:** define terms in context.
2.  **No false certainty:** estimate, announced, confirmed, and received
    are distinct states.
3.  **Explain every number:** show inputs and formula.
4.  **Provenance by default:** retain source, observed time, and
    validation state.
5.  **Graceful degradation:** partial data is preferable to fabricated
    certainty.
6.  **Visible collaboration:** agent actions and messages are
    inspectable.
7.  **Privacy by design:** collect only what the MVP needs.
8.  **Honest architecture claims:** label local simulation versus real
    distributed deployment.

------------------------------------------------------------------------

## 6. Core concepts and terminology

  -----------------------------------------------------------------------
  Term                                Product meaning
  ----------------------------------- -----------------------------------
  Holding                             User-recorded quantity of a listed
                                      company's shares

  Dividend event                      A company's dividend
                                      announcement/payment event

  Dividend per share (DPS)            Amount declared for each eligible
                                      share, in INR

  Expected income                     Estimate based on recorded shares
                                      and event assumptions

  Received income                     Amount the user manually confirms
                                      was paid

  Ex-date                             Date from which a share purchase
                                      generally no longer carries
                                      entitlement to the declared
                                      dividend; eligibility rules must be
                                      explained carefully

  Record date                         Date the company uses to determine
                                      eligible holders

  Payment date                        Date payment is scheduled or
                                      reported

  Source                              Exchange, company disclosure,
                                      permitted provider, or demo fixture

  Validation state                    Unverified, valid, conflict, stale,
                                      duplicate, or failed

  Agent                               A small service/process responsible
                                      for one defined task

  Coordinator                         Routes work and aggregates agent
                                      results; it is not the source of
                                      truth for dividend facts
  -----------------------------------------------------------------------

The application should avoid presenting date-based eligibility as a
legal guarantee. For the MVP, show an explicit eligibility assumption
and link the user to the relevant event/source record when available.

------------------------------------------------------------------------

## 7. Functional requirements

Priority definitions: - **P0 --- Must have:** required for the MVP
demo. - **P1 --- Should have:** implement if core flows are stable. -
**P2 --- Future:** not required for the hackathon MVP.

### 7.1 Authentication and account

**FR-AUTH-01 (P0):** A user can register with a name, email, and
password.\
**FR-AUTH-02 (P0):** A registered user can log in and log out.\
**FR-AUTH-03 (P0):** Portfolio and holding data are scoped to the
authenticated user.\
**FR-AUTH-04 (P1):** A user can request a password reset through a safe,
documented flow.

**Inputs:** name, email, password.\
**Outputs:** authenticated session or a validation/error message.\
**Acceptance criteria** - Invalid email or missing required fields are
rejected with field-level feedback. - Passwords are never stored in
plaintext. - A user cannot read or modify another user's portfolio by
changing an ID in a request. - Logout invalidates the current
session/token according to the chosen auth design.

### 7.2 Portfolio management

**FR-PORT-01 (P0):** A user can create and name a portfolio.\
**FR-PORT-02 (P0):** A user can add a holding using company
identifier/name, quantity, and optional average purchase price.\
**FR-PORT-03 (P0):** A user can edit or remove a holding.\
**FR-PORT-04 (P1):** A user can maintain multiple portfolios.

**Inputs:** portfolio name; company symbol/identifier; share quantity;
optional purchase date and average cost.\
**Outputs:** saved portfolio/holding and updated portfolio summary.\
**Acceptance criteria** - Quantity must be a positive whole number for
ordinary equity shares. - A holding must belong to a portfolio owned by
the current user. - Editing a holding updates subsequent estimates. -
Removing a holding removes it from future portfolio calculations but
does not erase already recorded payment history without an explicit
confirmation. - Empty portfolios display a helpful onboarding state.

### 7.3 Company and dividend event data

**FR-DATA-01 (P0):** The app can load seeded hypothetical dividend
events.\
**FR-DATA-02 (P0):** A user can view dividend event details, including
company, DPS, currency, dates, status, and source.\
**FR-DATA-03 (P0):** The app records when a source record was observed
and when it was last validated.\
**FR-DATA-04 (P1):** An administrator can add or correct demo event
records.\
**FR-DATA-05 (P1):** Permitted external sources may be added only after
checking access terms, rate limits, and redistribution rights.

**Inputs:** company identifier, DPS, relevant dates, event status,
source metadata.\
**Outputs:** normalized event record with provenance and validation
state.\
**Acceptance criteria** - Demo data is visibly labeled "Hypothetical
demo data." - Missing dates remain null/unknown; the UI must not invent
them. - Each event shows its source and last-updated timestamp. -
External source failures do not cause demo or previously stored data to
be presented as freshly verified.

### 7.4 Dividend calculation

**FR-CALC-01 (P0):** Calculate gross event income as eligible share
quantity × DPS.\
**FR-CALC-02 (P0):** Calculate portfolio expected income by summing
applicable event estimates.\
**FR-CALC-03 (P0):** Display calculation inputs and assumptions.\
**FR-CALC-04 (P0):** Separate expected, received, and unverified
amounts.\
**FR-CALC-05 (P1):** Provide month/year summaries and optional
tax-estimate display, clearly marked as illustrative and configurable.

**Inputs:** holding quantity, event DPS, event status, eligibility
assumption, currency.\
**Outputs:** gross estimate, event-level breakdown, portfolio totals,
calculation timestamp.\
**Acceptance criteria** - For 25 eligible shares and DPS ₹8, gross event
income is ₹200. - A missing or conflicting DPS must not produce a normal
confirmed estimate; the result is marked unavailable or provisional. -
Received income is based on a user-confirmed payment record, not
inferred solely from a scheduled payment date. - Totals identify whether
they include unverified/provisional events. - Calculations use
decimal-safe arithmetic and round only for display.

### 7.5 Dividend calendar

**FR-CAL-01 (P0):** Display upcoming dividend events in date order.\
**FR-CAL-02 (P0):** Show event type/date labels and status.\
**FR-CAL-03 (P1):** Filter by portfolio, company, and event status.

**Inputs:** date range, portfolio, filters.\
**Outputs:** calendar/list of matching events.\
**Acceptance criteria** - Unknown dates are shown as "Not available,"
not assigned a placeholder date. - Events with conflicting dates are
visibly flagged. - The user can open an event to view source and
calculation details. - Date display uses a consistent, documented
timezone policy.

### 7.6 Dividend history and payment records

**FR-HIST-01 (P0):** Show historical and upcoming events relevant to the
user's holdings.\
**FR-HIST-02 (P0):** Allow the user to mark a payment as received and
enter the received amount/date.\
**FR-HIST-03 (P1):** Show differences between expected gross amount and
user-entered received amount.

**Acceptance criteria** - A payment record is clearly labeled
user-reported unless independently verified. - The app does not silently
overwrite a user-entered received amount. - The event history
distinguishes announcement, scheduled payment, and received payment
states.

### 7.7 Beginner-friendly explanations

**FR-EXPL-01 (P0):** Explain dividend terms in plain language.\
**FR-EXPL-02 (P0):** Provide a "How this was calculated" explanation for
every estimate.\
**FR-EXPL-03 (P1):** Provide contextual explanations for missing, stale,
or conflicting data.

**Acceptance criteria** - Explanations define unfamiliar terms on first
use. - The explanation includes the formula and the actual inputs
used. - The content avoids recommendations to buy, sell, or hold a
security. - If data is uncertain, the explanation states what is
uncertain and why.

### 7.8 Swarm-inspired agents and monitoring

**FR-AGENT-01 (P0):** Implement at least four independently identifiable
agents: 1. Data Collection Agent 2. Date Tracking Agent 3. Data
Validation Agent 4. Dividend Calculation Agent

**FR-AGENT-02 (P0):** Agents exchange structured messages containing
message ID, task ID, agent ID, event/company key, timestamp, status,
payload, and correlation ID.\
**FR-AGENT-03 (P0):** The UI shows agent status and recent activity.\
**FR-AGENT-04 (P0):** Validation detects duplicate records, missing
required fields, stale records, and conflicting values.\
**FR-AGENT-05 (P0):** A failed or offline agent is shown as unavailable;
pending work is retried or reassigned where safe.\
**FR-AGENT-06 (P1):** Add an Explanation Agent and a Monitoring/Recovery
Agent as separate processes.

**Acceptance criteria** - Agent roles have documented inputs, outputs,
and responsibilities. - At least one end-to-end workflow shows messages
between multiple agents. - A conflict is retained as a conflict and
produces an alert. - Duplicate detection is idempotent: reprocessing the
same source event does not create a second logical event. - When an
agent is stopped during the demo, the dashboard reflects the failure
within the configured heartbeat timeout. - The system does not claim a
task succeeded if no agent reports success. - A retry does not create
duplicate payments or announcements.

### 7.9 Alerts and notifications

**FR-ALERT-01 (P0):** Show in-app alerts for conflicting, stale,
incomplete, or unverified event data.\
**FR-ALERT-02 (P1):** Show upcoming-date reminders in the app.\
**FR-ALERT-03 (P2):** Email, push, or SMS notifications.

**Acceptance criteria** - Alerts identify the affected company/event and
explain the issue. - Alerts remain visible until resolved or dismissed
according to a documented rule. - The MVP does not send external
messages unless a real provider and consent flow are implemented.

### 7.10 Demo and administration

**FR-DEMO-01 (P0):** Provide deterministic sample data for at least
three hypothetical Indian companies.\
**FR-DEMO-02 (P0):** Provide a way to reset demo state.\
**FR-DEMO-03 (P0):** Provide controls or documented commands to simulate
an agent failure and a data conflict.

**Acceptance criteria** - All sample companies and dividend events are
labeled hypothetical. - Reset returns the app to a known state. - Demo
controls are unavailable to ordinary users or are clearly marked as
demo-only. - The presenter can demonstrate normal processing, conflict
detection, and agent failure recovery in under five minutes.

------------------------------------------------------------------------

## 8. User workflows

### Workflow A: First-time user setup

1.  User opens landing page.
2.  User registers or enters demo mode.
3.  User creates a portfolio.
4.  User adds one or more holdings.
5.  Dashboard displays holdings and available dividend events.
6.  Empty or unavailable data states explain the next action.

**Success:** user reaches a populated dashboard without needing a
brokerage connection.

### Workflow B: Understand expected dividend income

1.  User opens a portfolio.
2.  User selects an upcoming or historical dividend event.
3.  App checks event validation status and holding quantity.
4.  Calculation Agent calculates the gross estimate when inputs are
    valid.
5.  UI shows estimate, formula, eligibility assumption, source, and
    freshness.
6.  If data is missing/conflicting, UI shows a provisional/unavailable
    state and alert.

**Success:** user can explain where the displayed amount came from.

### Workflow C: Record a payment

1.  User opens a dividend event.
2.  User selects "Mark as received."
3.  User enters received amount and payment date.
4.  App saves a user-reported payment record.
5.  Dashboard updates received income and history.

**Success:** expected and received totals remain distinct.

### Workflow D: Resolve a data conflict

1.  Collection Agent receives two records for the same event.
2.  Validation Agent normalizes and compares fields.
3.  A material mismatch (for example, DPS or ex-date) is flagged.
4.  App retains both source observations and creates a conflict alert.
5.  UI displays both values, their sources, and timestamps.
6.  A reviewer/demo operator can mark a record as resolved, with an
    audit note; the MVP must not silently choose by majority vote.

**Success:** uncertainty is visible and traceable.

### Workflow E: Recover from agent failure

1.  A task is queued for an agent.
2.  Agent heartbeat stops or the process is intentionally terminated.
3.  Monitoring detects timeout and marks the agent unavailable.
4.  Coordinator retries or assigns the task to another eligible agent,
    if configured.
5.  If no agent can complete it, task status becomes pending/failed and
    UI shows partial service.
6.  On restart, agent registers and resumes eligible work without
    duplicating records.

**Success:** the app communicates failure honestly and avoids duplicate
side effects.

------------------------------------------------------------------------

## 9. Inputs and outputs

### 9.1 User inputs

  ------------------------------------------------------------------------
  Input                                     Required Validation
  --------------------- ---------------------------- ---------------------
  Name                                  Registration Non-empty,
                                                     length-limited

  Email                           Registration/login Valid format; unique
                                                     at registration

  Password                        Registration/login Enforce documented
                                                     minimum and secure
                                                     hashing

  Portfolio name                  Portfolio creation Non-empty,
                                                     length-limited

  Company                                    Holding Must map to a known
  symbol/identifier                                  company or be
                                                     explicitly
                                                     user-entered

  Share quantity                             Holding Positive integer

  Purchase date                             Optional Valid date, not
                                                     silently inferred

  Average purchase                          Optional Non-negative decimal
  price                                              INR

  Received amount                     Payment record Non-negative decimal
                                                     INR

  Received date                       Payment record Valid date
  ------------------------------------------------------------------------

### 9.2 System inputs

-   Dividend event observations from permitted sources or clearly
    labeled demo fixtures.
-   Agent heartbeat/status messages.
-   User portfolio and holding records.
-   Configuration for stale-data thresholds, retries, and demo
    scenarios.

### 9.3 System outputs

-   Portfolio and holding summaries.
-   Event-level and portfolio-level dividend estimates.
-   Received-payment history.
-   Calendar entries and date reminders.
-   Data-quality alerts with provenance.
-   Agent status, task status, and activity events.
-   Plain-language explanations and calculation breakdowns.

------------------------------------------------------------------------

## 10. Data and status requirements

### 10.1 Dividend event fields

Minimum event fields: - `event_id` - `company_id` / symbol -
`event_type` (interim, final, special, other, unknown) -
`dividend_per_share` - `currency` (INR for the Indian MVP) -
`announcement_date` - `ex_date` - `record_date` - `payment_date` -
`event_status` - `source_id` - `source_url` (when available and
permitted) - `observed_at` - `last_validated_at` - `validation_status` -
`is_demo_data`

### 10.2 Event status

Use separate business and validation states.

**Business status:** `announced`, `scheduled`, `paid`, `cancelled`,
`unknown`\
**Validation status:** `unverified`, `valid`, `conflict`, `stale`,
`incomplete`, `failed`

Do not collapse these into a single "confirmed" flag. A scheduled event
can still have unverified source data.

### 10.3 Calculation result status

`calculated`, `provisional`, `unavailable`, `received_user_reported`

A calculation is provisional when it depends on unverified data or an
explicit eligibility assumption. A result is unavailable when required
inputs are missing or materially conflicting.

------------------------------------------------------------------------

## 11. Business rules

1.  **Gross event estimate:** `eligible_shares × dividend_per_share`.
2.  **Portfolio estimate:** sum event estimates for the selected
    portfolio and period, avoiding duplicate event inclusion.
3.  **Received income:** sum payment records explicitly marked received;
    do not infer receipt from payment date.
4.  **Eligibility:** MVP calculations use user-recorded holdings and an
    explicit simplified eligibility assumption. Do not claim legal
    entitlement unless eligibility is verified using appropriate records
    and rules.
5.  **Tax:** show gross income by default. Any tax illustration must be
    optional, clearly qualified, and not represented as tax advice.
6.  **Currency:** MVP supports INR only. Do not combine currencies
    without a conversion source, timestamp, and explicit conversion
    policy.
7.  **Precision:** store monetary values as decimal/numeric, not binary
    floating-point.
8.  **Rounding:** preserve calculation precision internally; round only
    for display.
9.  **Duplicates:** use stable source/event identifiers where available;
    otherwise use a documented composite matching key and retain source
    observations.
10. **Conflicts:** conflicting material values are surfaced, not
    averaged.
11. **Freshness:** freshness is based on a configurable threshold and
    source observation time. A stale record may remain visible but
    cannot be presented as newly verified.
12. **Corrections:** retain an audit trail for edits to dividend events
    and payment records.

------------------------------------------------------------------------

## 12. Agent behavior requirements

### 12.1 Agent roles

  ---------------------------------------------------------------------------------------
  Agent                 Responsibility    Input                    Output
  --------------------- ----------------- ------------------------ ----------------------
  Data Collection       Read demo         Collection task,         Raw observation with
                        fixtures or       company/event key        source metadata
                        permitted source                           
                        adapters                                   

  Date Tracking         Normalize and     Event observation        Normalized date
                        check date fields                          record;
                                                                   missing/invalid-date
                                                                   flags

  Data Validation       Detect            One or more observations Validation report and
                        duplicates,                                event status
                        missing fields,                            
                        stale data, and                            
                        conflicts                                  

  Dividend Calculation  Calculate         Calculation task         Calculation result
                        estimates from                             with formula and
                        validated event +                          inputs
                        holding                                    

  Explanation (P1)      Turn structured   Calculation/validation   Explanation text
                        results into      result                   
                        plain-language                             
                        text                                       

  Monitoring/Recovery   Track heartbeats, Agent/task events        Status and recovery
  (P1)                  retries, and task                          actions
                        reassignment                               
  ---------------------------------------------------------------------------------------

### 12.2 Coordination

The MVP may use a lightweight coordinator to route tasks and persist
state. This is a practical orchestration component, not a central
financial-data authority. Agents should own their processing step and
return explicit results. For the hackathon, a Redis-backed queue or a
simple local queue adapter is acceptable; the chosen mode must be
documented.

### 12.3 Message contract

Each message must include: - `message_id`: unique identifier -
`correlation_id`: groups messages in one workflow - `task_id`:
idempotency/task identity - `sender_agent` - `recipient` or topic -
`message_type` - `created_at` - `payload` - `attempt` - `status`

Messages must be versioned or include a schema version before the system
evolves beyond the demo.

### 12.4 Failure behavior

-   Agents publish heartbeats at a configured interval.
-   A missed-heartbeat timeout marks an agent `unavailable`.
-   Retry only idempotent tasks automatically.
-   Use bounded retries and a visible terminal failure state.
-   Reassignment is allowed only to an agent capable of the same task.
-   A failed validation must not be treated as a successful validation.
-   Preserve task and agent activity history for the demo.

### 12.5 Conflict policy

Do not use blind majority voting. Multiple agents may copy the same
upstream source, and financial records can be correlated or stale.
Prefer: 1. compare normalized observations; 2. retain each observation's
source and timestamp; 3. apply documented source precedence only if the
project has justified and documented it; 4. flag material disagreement
for review; 5. display unresolved status until a traceable resolution is
recorded.

------------------------------------------------------------------------

## 13. User interface requirements

### 13.1 Global navigation

-   Dashboard
-   Portfolio
-   Dividend Calendar
-   History
-   Calculator
-   Agent Monitor
-   Alerts
-   Help / Glossary
-   Account

### 13.2 Dashboard

Must display: - Portfolio value only if the required price input/source
is available; otherwise omit it. - Expected dividend income for a
selected period. - Received dividend income for a selected period. -
Upcoming dividend events. - Data-quality alert count. - Agent health
summary. - Clear "demo data" indicator when using fixtures.

**Acceptance:** a user can distinguish expected from received income
without opening another page.

### 13.3 Portfolio page

-   Holdings table with company, symbol, quantity, and available
    dividend summary.
-   Add/edit/remove controls.
-   Empty state with a clear "Add holding" action.
-   Per-holding event list and estimate details.

### 13.4 Calculator page

-   Select portfolio/holding and dividend event.
-   Show eligible share quantity, DPS, formula, result, status, and
    timestamp.
-   Clearly label assumptions and unavailable inputs.

### 13.5 Calendar page

-   Calendar or chronological list.
-   Date type labels (ex-date, record date, payment date).
-   Event status and validation badge.
-   Event detail panel.

### 13.6 History page

-   Event timeline and user-reported payment records.
-   Filters by company, date, and status.
-   Expected versus received comparison where meaningful.

### 13.7 Agent monitor

-   Agent name, role, status, last heartbeat, current task, and recent
    activity.
-   Event stream showing messages/task transitions.
-   Demo controls for stopping/restarting an agent, restricted to
    demo/admin mode.
-   Clear distinction between "simulated failure" and an actual process
    outage.

### 13.8 Alerts page

-   Alert type, affected event, observed values, source/time, and
    resolution state.
-   Explain what the user can and cannot conclude from the alert.

### 13.9 Accessibility and responsiveness

-   Usable at common mobile, tablet, and desktop widths.
-   Do not rely on color alone to communicate status.
-   Keyboard-accessible controls and visible focus states.
-   Sufficient contrast and readable labels.
-   Tables should adapt via horizontal scrolling or card layouts.

------------------------------------------------------------------------

## 14. Non-functional requirements

  -----------------------------------------------------------------------
  Area                                Requirement
  ----------------------------------- -----------------------------------
  Usability                           Core flows should be understandable
                                      without financial expertise

  Performance                         Local MVP should render normal
                                      dashboard data without noticeable
                                      blocking; record measured latency
                                      during evaluation

  Reliability                         Failed agents or source adapters
                                      produce explicit partial/error
                                      states

  Data integrity                      Database constraints and
                                      transactions protect ownership and
                                      prevent duplicate side effects

  Security                            Password hashing, authenticated
                                      APIs, authorization checks, input
                                      validation, and secret management

  Privacy                             Store only data needed for
                                      accounts, portfolios, and demo
                                      operation

  Observability                       Structured logs include
                                      task/correlation IDs and agent
                                      identity

  Maintainability                     Separate API, domain calculations,
                                      persistence, and agent logic

  Portability                         Documented local setup using
                                      environment variables and
                                      reproducible seed data

  Compatibility                       Current evergreen desktop/mobile
                                      browsers targeted; exact browser
                                      matrix documented by team

  Explainability                      Every estimate exposes its inputs,
                                      status, and formula
  -----------------------------------------------------------------------

No performance or availability number should be claimed until measured
on the actual prototype.

------------------------------------------------------------------------

## 15. Suggested MVP technical boundaries

This PRD specifies **what** the product must do; implementation choices
belong in the technical design. A practical MVP may use: - React for the
browser UI. - FastAPI for the API. - SQLite for a single-machine demo,
with a migration path to PostgreSQL. - Python agent processes. - Redis
Pub/Sub or a lightweight queue if the team can operate it; otherwise a
local adapter with explicit simulation labeling. - Seeded hypothetical
records as the deterministic source of truth for the demo.

If agents run as separate processes on one laptop, describe them as
independently running local agents---not a fully decentralized or
geographically distributed system. A later deployment can place agents
on separate hosts and add durable queues, authentication, and
failure-domain testing.

------------------------------------------------------------------------

## 16. API-facing product behavior

The exact API schema belongs in the technical design, but the product
requires the following capabilities:

  ------------------------------------------------------------------------------------------
  Capability              Typical route                              Required behavior
  ----------------------- ------------------------------------------ -----------------------
  Register                `POST /api/auth/register`                  Validate fields; create
                                                                     account safely

  Login                   `POST /api/auth/login`                     Authenticate and issue
                                                                     session/token

  Logout                  `POST /api/auth/logout`                    End session where
                                                                     supported

  List portfolios         `GET /api/portfolios`                      Return only current
                                                                     user's portfolios

  Create portfolio        `POST /api/portfolios`                     Create user-owned
                                                                     portfolio

  Update/delete portfolio `PATCH/DELETE /api/portfolios/{id}`        Enforce ownership

  List/add holdings       `GET/POST /api/portfolios/{id}/holdings`   Validate quantity and
                                                                     ownership

  Update/delete holding   `PATCH/DELETE /api/holdings/{id}`          Enforce ownership and
                                                                     preserve relevant
                                                                     history

  List events             `GET /api/dividends`                       Filter by
                                                                     company/date/status

  Event detail            `GET /api/dividends/{id}`                  Include dates, source,
                                                                     and validation status

  Calculate income        `POST /api/calculations`                   Return formula, inputs,
                                                                     amount, and status

  Calendar                `GET /api/calendar`                        Return date-sorted
                                                                     events and date types

  Agent status            `GET /api/agents`                          Return health and
                                                                     heartbeat information

  Agent activity          `GET /api/agents/activity`                 Return recent
                                                                     correlated events

  Alerts                  `GET /api/alerts`                          Return user-visible
                                                                     data-quality alerts

  Resolve alert           `POST /api/alerts/{id}/resolve`            Record actor, note, and
                                                                     resolution time
  ------------------------------------------------------------------------------------------

All routes must return structured errors, validate request bodies, and
avoid leaking stack traces or other users' data.

------------------------------------------------------------------------

## 17. Acceptance criteria: end-to-end MVP

The MVP is accepted when all P0 items below pass in a live or recorded
test:

1.  A user can register, log in, and log out.
2.  A user can create a portfolio.
3.  A user can add, edit, and remove a holding.
4.  A user can view at least three hypothetical companies and dividend
    events.
5.  An event displays DPS, dates where available, status, source, and
    freshness.
6.  A valid holding/event pair produces the correct gross estimate.
7.  The calculation view exposes the formula and inputs.
8.  Expected and received amounts are displayed separately.
9.  A user can enter a received payment as user-reported.
10. The calendar shows upcoming dated events in order.
11. Unknown dates are not fabricated.
12. Duplicate source observations do not create duplicate logical
    events.
13. A material data conflict creates a visible alert.
14. The app displays both conflicting observations and their provenance.
15. At least four agents perform distinct steps in one workflow.
16. Agent messages share a correlation ID for the same workflow.
17. The agent monitor shows status and recent activity.
18. An agent can be deliberately stopped or marked unavailable in the
    demo.
19. The system retries/reassigns safely or reports an explicit
    incomplete state.
20. Restarting an agent does not duplicate the same logical event or
    payment.
21. A user cannot access another user's portfolio through direct API
    calls.
22. Demo data is clearly labeled as hypothetical.
23. Core pages remain usable on a mobile viewport.
24. The app can be reset to deterministic demo state.
25. The team can explain which components are truly separate processes
    and which are simulated.

------------------------------------------------------------------------

## 18. Error and empty states

The UI must provide actionable, plain-language states for: - No
portfolio exists. - No holdings exist. - No dividend events are
available. - Dividend DPS is missing. - Event dates are incomplete. -
Source is stale or unavailable. - Sources disagree. - Calculation cannot
be performed. - Agent is offline. - Task retry is in progress. - Task
failed after retries. - Payment has not been confirmed by the user. -
Network/API request failed.

Error messages should state what happened, what data may be affected,
and whether the user can retry. Avoid exposing internal exception text.

------------------------------------------------------------------------

## 19. Security, privacy, and compliance considerations

-   Hash passwords using a modern password-hashing algorithm; never log
    passwords or authentication tokens.
-   Enforce authorization on every portfolio, holding, and payment
    operation.
-   Use HTTPS in any deployed environment.
-   Keep API keys and secrets out of source control.
-   Validate and constrain user inputs.
-   Apply rate limiting to authentication and costly endpoints where
    feasible.
-   Use least-privilege access for agent processes and database
    credentials.
-   Avoid sending portfolio data to third-party AI services in the MVP.
-   Do not scrape exchanges or redistribute provider data without
    checking applicable terms.
-   Present educational information only; do not make personalized
    recommendations.
-   Display gross amounts by default. Tax treatment can depend on
    current rules and user circumstances; any tax feature requires
    separate legal/tax review and clear qualification.
-   Before public deployment, verify applicable Indian privacy,
    cybersecurity, financial-data, and exchange/vendor requirements with
    current authoritative sources.

------------------------------------------------------------------------

## 20. Analytics and evaluation

The MVP should log measurable events without collecting unnecessary
personal information: - portfolio created; - holding
added/updated/removed; - calculation requested/completed/blocked; -
validation conflict detected/resolved; - agent heartbeat
missed/recovered; - task retried/reassigned/failed.

Evaluate the swarm-inspired design against a simple centralized baseline
using the same input fixtures and workload. Record, do not assume: -
validation issue detection coverage; - successful task completion during
simulated agent failure; - recovery time; - processing latency; -
duplicate side-effect count; - percentage of results with complete
provenance; - user ability to identify estimate versus received income
in a short usability test.

Report test setup, number of runs, machine/environment, and limitations.
Do not claim the swarm approach is faster or more reliable without
measured evidence.

------------------------------------------------------------------------

## 21. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Inconsistent or         Incorrect estimates     Seed deterministic demo
  unavailable dividend                            data; preserve source
  data                                            and validation state

  "Swarm" is only a label Weak technical          Show separate agent
                          credibility             roles, messages, task
                                                  ownership, and failure
                                                  test

  Too much infrastructure MVP not completed       Start with local queue
  for hackathon                                   adapter; add broker
                                                  only after core flow
                                                  works

  False confidence from   Incorrect financial     Flag conflicts; require
  voting                  record                  traceable resolution

  Date/eligibility        Misleading estimates    State assumptions;
  complexity                                      avoid legal entitlement
                                                  claims

  Duplicate retries       Duplicate               Idempotency keys and
                          events/payments         database uniqueness
                                                  constraints

  Sensitive portfolio     Privacy breach          Authentication,
  exposure                                        ownership checks,
                                                  minimal data collection

  Scope creep             Incomplete product      Freeze P0 scope before
                                                  adding optional
                                                  features

  Unverified tax display  Misleading net amount   Gross-first display;
                                                  defer tax feature or
                                                  label illustrative

  Demo failure            Poor presentation       Rehearse deterministic
                                                  scenarios and keep
                                                  reset controls
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 22. Release plan

### MVP (hackathon)

-   Authentication or clearly isolated demo mode.
-   One portfolio (multiple portfolios optional).
-   Manual holdings.
-   Hypothetical seeded dividend events.
-   Gross expected-income calculation.
-   Received-payment entry.
-   Calendar and history.
-   Four cooperating agents.
-   Duplicate/conflict/stale validation.
-   Agent monitor and one failure/recovery demonstration.
-   Responsive UI and resettable demo.

### Post-MVP

-   More source adapters after terms and access are verified.
-   Multiple portfolios and CSV import.
-   Durable queue and agent deployment across separate hosts.
-   User-configurable reminders.
-   Regional-language explanations.
-   More advanced audit and data-quality tooling.

### Not planned without separate review

-   Broker credential collection.
-   Trade execution.
-   Personalized investment advice.
-   Unqualified tax computation.
-   Claims of guaranteed future dividend income.

------------------------------------------------------------------------

## 23. Definition of done

A feature is done when: - Its acceptance criteria are met. - Backend
validation and authorization are implemented where applicable. -
Loading, empty, success, and failure states are present. - The relevant
automated or manual tests are documented. - Demo data and expected
output are reproducible. - Logs are useful without exposing secrets or
unnecessary personal data. - Documentation accurately describes
implemented behavior and limitations.

------------------------------------------------------------------------

## 24. Final product statement

**DividendLens is a transparent dividend-income learning and tracking
application.** It combines a beginner-oriented portfolio experience with
a swarm-inspired pipeline of small agents that collect, normalize,
validate, calculate, and explain dividend events. The MVP succeeds when
users can understand their estimates, inspect the evidence behind them,
and see the system handle conflicting data and agent failure without
pretending uncertain information is guaranteed.
