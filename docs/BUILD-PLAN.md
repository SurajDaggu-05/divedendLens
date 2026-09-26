# DividendLens — Implementation Build Plan & Development Roadmap

**Document Version:** 1.0  
**Target Environment:** Antigravity (Backend / DB / Swarm) + Cursor (Frontend SPA)  
**Status:** Frozen Implementation Roadmap  

---

## 1. Project Division & Tooling Boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ANTIGRAVITY (Backend Engine)                       │
│  - Python 3.12+ / FastAPI REST Service                                  │
│  - PostgreSQL Database & Alembic Migrations                             │
│  - SQLAlchemy 2.x ORM & Pydantic Schemas                                │
│  - Redis + RQ Background Swarm Workers                                  │
│  - Agent Pipeline Logic & Deterministic Dividend Calculator             │
│  - Pytest & HTTPX Test Suite                                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ OpenAPI Spec / Contract
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CURSOR (Frontend Web SPA)                       │
│  - React 18+ / TypeScript / Vite                                        │
│  - Tailwind CSS + shadcn/ui Component Library                           │
│  - React Router & TanStack Query (Server State)                         │
│  - Recharts (Income Trends)                                             │
│  - Vitest & React Testing Library                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Priority Definitions

* **P0 (Must Have):** Core functionality essential for the 5-minute hackathon demo.
* **P1 (Should Have):** High-value features implemented if P0 is stable.
* **P2 (Nice to Have):** Future enhancements deferred post-hackathon.

---

## 3. Sequential Build Phases

### Phase 0: Monorepo Foundation & Workspace Setup `[P0]`
* **Goal:** Initialize shared monorepo workspace, configuration files, and containerized local development services.
* **Dependencies:** None.
* **Antigravity Tasks (Backend):**
  1. Create project folder structure (`backend/app`, `infra/`, `docs/`).
  2. Create `backend/pyproject.toml` or `requirements.txt` (FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic, Psycopg3, Redis, RQ, Pytest, Argon2-cffi, PyJWT).
  3. Create `infra/docker-compose.yml` defining PostgreSQL 15 and Redis 7 containers.
  4. Create `backend/app/core/config.py` parsing `.env` settings.
  5. Implement `GET /api/v1/health` endpoint returning system status.
* **Cursor Tasks (Frontend):**
  1. Bootstrap React + TypeScript SPA using Vite inside `frontend/`.
  2. Configure Tailwind CSS and CSS variables for design tokens (`DESIGN.md`).
  3. Install core dependencies (React Router, TanStack Query, Lucide icons, Axios).
  4. Setup `frontend/src/lib/api.ts` Axios instance pointing to `VITE_API_BASE_URL`.
* **Integration Checkpoint:** `curl http://localhost:8000/api/v1/health` returns `200 OK` with DB/Redis status.
* **Tests:** Backend smoke test verifying FastAPI health endpoint returns valid JSON response.
* **Definition of Done:** `docker compose up` starts Postgres & Redis cleanly; backend health endpoint succeeds; frontend renders Vite landing template.

---

### Phase 1: Database Schema & Migration Baseline `[P0]`
* **Goal:** Establish PostgreSQL database ORM entities and execute initial Alembic migration.
* **Dependencies:** Phase 0.
* **Antigravity Tasks (Backend):**
  1. Initialize Alembic migration environment (`alembic init backend/app/db/migrations`).
  2. Implement SQLAlchemy 2.x ORM models in `backend/app/db/models/` for all 12 tables (`users`, `companies`, `portfolios`, `holdings`, `dividend_events`, `event_sources`, `payment_reports`, `data_alerts`, `agent_runs`, `agent_messages`, `agent_states`, `calculation_explanations`).
  3. Ensure monetary fields use fixed-point `NUMERIC(12, 2)` / `NUMERIC(10, 4)`.
  4. Generate and run initial Alembic migration (`001_initial_schema.py`).
  5. Create deterministic seed data script (`backend/app/db/seed.py`) populating 3 companies (TCS, INFY, RELIANCE) and sample dividend events.
* **Cursor Tasks (Frontend):**
  1. Create TypeScript interface definitions in `frontend/src/types/` matching `API-CONTRACT.md` data models.
* **Integration Checkpoint:** Alembic migration executes without errors; seed script populates Postgres tables reproducibly.
* **Tests:** Pytest database tests verifying entity creation, foreign key constraints, and numeric precision rules.
* **Definition of Done:** Database schema fully matches `DATABASE-SCHEMA.md`; seed command populates database cleanly.

---

### Phase 2: Authentication & User Scoping `[P0]`
* **Goal:** Implement secure user registration, password hashing, JWT login, and route authorization.
* **Dependencies:** Phase 1.
* **Antigravity Tasks (Backend):**
  1. Implement `backend/app/core/security.py` using Argon2id for password hashing and PyJWT for token generation.
  2. Create Pydantic schemas in `backend/app/schemas/auth.py`.
  3. Implement auth routes: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
  4. Create FastAPI `get_current_user` dependency enforcing row-level security.
* **Cursor Tasks (Frontend):**
  1. Build Auth state context/store (`AuthContext.tsx`) storing JWT token in memory.
  2. Implement Login page (`src/features/auth/LoginPage.tsx`) and Register page (`RegisterPage.tsx`) using shadcn/ui components.
  3. Add Axios request interceptor injecting `Authorization: Bearer <token>`.
  4. Implement `ProtectedRoute` component redirecting unauthenticated users to `/login`.
* **Integration Checkpoint:** Frontend user can register, log in, view profile, and retain auth session across page refreshes.
* **Tests:** Pytest HTTPX tests verifying valid/invalid registration, password hashing verification, JWT expiration, and 401 response handling.
* **Definition of Done:** Authentication end-to-end flow complete; protected routes block unauthorized access.

---

### Phase 3: Portfolio & Holdings Management `[P0]`
* **Goal:** Allow authenticated users to create portfolios, add whole-share holdings, edit quantities, and remove holdings.
* **Dependencies:** Phase 2.
* **Antigravity Tasks (Backend):**
  1. Implement `backend/app/services/portfolio_service.py` for portfolio/holding CRUD operations.
  2. Implement REST routes:
     * `GET/POST /api/v1/portfolios`
     * `GET/PATCH/DELETE /api/v1/portfolios/{id}`
     * `GET/POST /api/v1/portfolios/{id}/holdings`
     * `PATCH/DELETE /api/v1/holdings/{id}`
  3. Add backend validation: `quantity` MUST be an integer $> 0$.
* **Cursor Tasks (Frontend):**
  1. Build Portfolio view (`src/features/portfolio/PortfolioPage.tsx`).
  2. Build Holdings Table component with action menus (Edit / Delete).
  3. Build "Add Holding" dialog modal (`AddHoldingModal.tsx`) with ticker select and quantity inputs.
  4. Connect forms to API using TanStack Query mutations with cache invalidation.
* **Integration Checkpoint:** Adding a holding in the frontend saves it to PostgreSQL and updates the portfolio table immediately.
* **Tests:** Pytest route tests verifying user isolation (User A cannot access User B's portfolio) and quantity validation errors.
* **Definition of Done:** Users can manage portfolios and holdings securely without cross-user data exposure.

---

### Phase 4: Dividend Events & Calculation Engine `[P0]`
* **Goal:** Implement canonical dividend event retrieval and the deterministic calculation service.
* **Dependencies:** Phase 3.
* **Antigravity Tasks (Backend):**
  1. Implement `backend/app/services/dividend_calculator.py`:
     * Formula: $\text{Gross Amount} = \text{Eligible Shares} \times \text{DPS}$ using `Decimal` math.
     * Ex-dividend date eligibility rule: `holding.purchase_date < event.ex_date`.
     * Return calculation status (`calculated`, `provisional`, `unavailable`).
  2. Implement REST routes:
     * `GET /api/v1/dividends` (List events with ticker/status filters).
     * `GET /api/v1/dividends/{id}` (Event detail, calculation summary, and source list).
     * `GET /api/v1/portfolios/{id}/summary` (Portfolio totals).
* **Cursor Tasks (Frontend):**
  1. Build Event Detail Drawer/Modal showing calculation formula breakdown (`25 shares × ₹10.00 = ₹250.00`).
  2. Render calculation status badges (`Verified`, `Provisional`, `Needs Review`).
  3. Format currency values with `₹` symbol using Indian locale formatting.
* **Integration Checkpoint:** Selecting a dividend event displays the exact calculated gross estimate and formula breakdown.
* **Tests:** Pytest unit tests verifying `Decimal` arithmetic precision, eligibility logic edge cases, and calculation status tagging.
* **Definition of Done:** Gross estimates match manual calculations exactly; binary floating-point errors are absent.

---

### Phase 5: Dividend History & Calendar `[P0]`
* **Goal:** Provide a date-sorted dividend calendar view and manual received payment reporting.
* **Dependencies:** Phase 4.
* **Antigravity Tasks (Backend):**
  1. Implement `backend/app/services/payment_service.py` to record user-reported received payments.
  2. Implement REST routes:
     * `GET /api/v1/calendar` (Chronological timeline of ex-dates and payment dates).
     * `POST /api/v1/dividends/{id}/payment-reports` (Record manual payment).
* **Cursor Tasks (Frontend):**
  1. Build Dividend Calendar page (`src/features/calendar/CalendarPage.tsx`) supporting list view and date filtering.
  2. Build "Mark as Received" modal dialog allowing user to enter received amount and date.
  3. Build History timeline distinguishing Expected Income from User-Reported Received Income.
* **Integration Checkpoint:** User marks an event as received; dashboard updates Received Income total while preserving Expected Income.
* **Tests:** Pytest route tests verifying payment recording and expected vs. received total separation.
* **Definition of Done:** Calendar renders sorted events; user-reported payments remain strictly separated from system estimates.

---

### Phase 6: Swarm Agents & Async Queue Pipeline `[P0]`
* **Goal:** Implement the background worker processes and inter-agent message pipeline using Redis + RQ.
* **Dependencies:** Phase 5.
* **Antigravity Tasks (Backend):**
  1. Create `backend/app/agents/contracts.py` defining JSON message contract schemas.
  2. Implement 4 core agents:
     * `DataCollectionAgent` (`agents/collector.py`)
     * `DateTrackingAgent` (`agents/date_tracker.py`)
     * `DataValidationAgent` (`agents/validator.py`)
     * `DividendCalculationAgent` (`agents/calculator.py`)
  3. Implement RQ worker entrypoint (`backend/app/workers.py`) executing agents as asynchronous jobs.
  4. Implement `POST /api/v1/agents/trigger` to launch swarm refresh cycle with a unique `correlation_id`.
* **Cursor Tasks (Frontend):**
  1. Add "Refresh Swarm Data" action button in the top navigation header.
  2. Connect refresh trigger to TanStack Query mutation with loading feedback.
* **Integration Checkpoint:** Triggering a refresh cycle dispatches tasks to Redis worker; agents process events sequentially and log message activity in PostgreSQL.
* **Tests:** Pytest agent tests verifying message passing, task idempotency (`task_id` deduplication), and worker pipeline execution.
* **Definition of Done:** Multi-agent pipeline executes asynchronously via Redis RQ without blocking main API process.

---

### Phase 7: Data Quality & Conflict Detection Workflow `[P0]`
* **Goal:** Detect material source conflicts, create data alerts, and enable human conflict resolution.
* **Dependencies:** Phase 6.
* **Antigravity Tasks (Backend):**
  1. Enhance `DataValidationAgent` to detect material DPS mismatches between sources.
  2. Create `DataAlert` records when conflicts or stale data occur.
  3. Implement REST routes:
     * `GET /api/v1/alerts` (List active alerts).
     * `POST /api/v1/alerts/{id}/resolve` (Resolve conflict with audit note).
  4. Ensure conflict state sets event calculation status to `unavailable`.
* **Cursor Tasks (Frontend):**
  1. Build Data Quality Alert Banner on Dashboard showing unresolved alert count.
  2. Build Alerts Page (`src/features/alerts/AlertsPage.tsx`) rendering side-by-side observation comparison.
  3. Build Conflict Resolution Dialog allowing user/admin to select authoritative source and submit resolution notes.
* **Integration Checkpoint:** Conflicting source observation creates an alert, sets calculation status to `unavailable`, and resolves cleanly when user selects a source.
* **Tests:** Pytest conflict scenario tests verifying alert generation, calculation suspension, and traceable resolution.
* **Definition of Done:** Mismatched data is never silently merged; side-by-side resolution updates event status cleanly.

---

### Phase 8: Plain-Language Explanation Layer `[P1]`
* **Goal:** Provide plain-language explanations of calculations using templates with optional OpenAI API fallback.
* **Dependencies:** Phase 7.
* **Antigravity Tasks (Backend):**
  1. Implement `backend/app/services/explainer_service.py` with `TemplateExplanationProvider` and `OpenAIExplanationProvider` adapters.
  2. Implement `GET /api/v1/explanations/event/{id}`.
  3. Ensure LLM mode consumes pre-calculated facts only and falls back gracefully to templates on failure.
* **Cursor Tasks (Frontend):**
  1. Build Explanation Card inside Event Detail view rendering plain-language summary and provider badge ("Template" / "AI").
* **Integration Checkpoint:** Requesting explanation returns formatted plain-language text detailing shares, DPS, dates, and source provenance.
* **Tests:** Pytest tests verifying template formatting and fallback behavior when `OPENAI_API_KEY` is omitted.
* **Definition of Done:** Explanations render reliably; LLM failure does not break the calculation or UI.

---

### Phase 9: Overview Dashboard & UI Polish `[P0]`
* **Goal:** Build the primary Overview Dashboard integrating metrics, trend charts, upcoming events, and system status.
* **Dependencies:** Phase 8.
* **Antigravity Tasks (Backend):**
  1. Implement `GET /api/v1/dashboard/overview` aggregating metrics, upcoming events, alert count, and agent health summary into a single payload.
* **Cursor Tasks (Frontend):**
  1. Build Overview Dashboard (`src/features/dashboard/OverviewPage.tsx`) matching `DESIGN.md`.
  2. Build Summary Metric Cards (Expected FY, Received FY, Upcoming 30 Days).
  3. Build Monthly Income Trend chart using Recharts (distinguishing expected vs. received bars).
  4. Add "Demo Data" badge indicator when fixture data is active.
* **Integration Checkpoint:** Overview page loads summary cards, trend chart, and upcoming events in a responsive layout.
* **Tests:** Vitest frontend component tests verifying metric card rendering and accessibility attributes.
* **Definition of Done:** Overview Dashboard provides an income-first view compliant with `DESIGN.md` guidelines.

---

### Phase 10: Swarm Monitoring & Demo Controls `[P0]`
* **Goal:** Build the Agent Monitor view and demo controls for process failure and recovery simulation.
* **Dependencies:** Phase 9.
* **Antigravity Tasks (Backend):**
  1. Implement `MonitoringRecoveryAgent` checking worker heartbeats every 5s.
  2. Implement REST routes:
     * `GET /api/v1/agents` (List agent statuses & heartbeats).
     * `GET /api/v1/agents/runs` (Activity stream).
     * `POST /api/v1/agents/{id}/simulate-failure` (Set agent offline).
     * `POST /api/v1/agents/{id}/restart` (Restart agent).
     * `POST /api/v1/demo/reset` (Reset to deterministic seed data).
* **Cursor Tasks (Frontend):**
  1. Build Agent Monitor Page (`src/features/activity/AgentMonitorPage.tsx`).
  2. Render Agent Status Cards with heartbeat badges.
  3. Build Activity Timeline rendering agent event stream.
  4. Add Demo Control Panel ("Simulate Agent Failure", "Restart Agent", "Reset Demo Data").
* **Integration Checkpoint:** Presenter clicks "Simulate Failure", agent status updates to offline within 15s, and task reassignment activity is logged.
* **Tests:** Pytest monitoring tests verifying missed heartbeat detection and task reassignment logic.
* **Definition of Done:** Agent failure and self-healing can be demonstrated live in under 2 minutes.

---

### Phase 11: End-to-End Testing & Demo Rehearsal `[P0]`
* **Goal:** Validate complete user flows, test responsive viewports, and rehearse the 5-minute hackathon demo.
* **Dependencies:** Phase 10.
* **Antigravity Tasks (Backend):**
  1. Run full Pytest suite covering auth, portfolios, calculations, conflicts, and agent recovery.
  2. Verify zero unhandled exceptions or stack trace leaks in logs.
* **Cursor Tasks (Frontend):**
  1. Test responsive layouts at 320px, 390px, 768px, and 1440px viewports (no horizontal page scrolling).
  2. Verify keyboard navigation and WCAG AA contrast states.
* **Integration Checkpoint:** Rehearse 5-minute presentation script (`AGENT-CONTRACT.md` Section E) 3 times sequentially without errors.
* **Tests:** End-to-end integration checklist execution.
* **Definition of Done:** All P0 acceptance criteria pass; presentation script executes flawlessly.

---

### Phase 12: Production Build & Deployment `[P1]`
* **Goal:** Build production web assets and deploy services to hosted cloud platforms.
* **Dependencies:** Phase 11.
* **Antigravity Tasks (Backend):**
  1. Configure production Docker container / Gunicorn entrypoint for Render / Railway.
  2. Set production environment variables (PostgreSQL connection string, Redis URL, JWT secret).
* **Cursor Tasks (Frontend):**
  1. Build static frontend assets (`npm run build`).
  2. Deploy static bundle to Vercel pointing `VITE_API_BASE_URL` to deployed backend URL.
* **Integration Checkpoint:** Deployed Vercel URL communicates securely with deployed Render API over HTTPS.
* **Definition of Done:** Deployed application accessible publicly on laptop and mobile devices.

---

## 4. Phase Execution Summary & Deliverables Matrix

| Phase | Name | Scope | Key Deliverable | Owner |
|---|---|---|---|---|
| **Phase 0** | Monorepo Foundation | P0 | Docker Compose + Health Endpoint | Joint |
| **Phase 1** | Database Schema | P0 | SQLAlchemy Models & Alembic Migration | Antigravity |
| **Phase 2** | Authentication | P0 | Auth API & Protected Route Views | Joint |
| **Phase 3** | Portfolio & Holdings | P0 | Portfolio CRUD & Holdings Table | Joint |
| **Phase 4** | Dividend Engine | P0 | Deterministic Calculator Service | Antigravity |
| **Phase 5** | History & Calendar | P0 | Dividend Calendar & Payment Reporting | Joint |
| **Phase 6** | Swarm Agents | P0 | Redis RQ Workers & Task Pipeline | Antigravity |
| **Phase 7** | Quality & Conflicts | P0 | Conflict Alerting & Resolution View | Joint |
| **Phase 8** | Explanations | P1 | Plain-Language Template/LLM Adapter | Antigravity |
| **Phase 9** | Overview Dashboard | P0 | Summary Cards & Recharts Income Trend | Cursor |
| **Phase 10** | Swarm Monitoring | P0 | Agent Monitor & Demo Failure Controls | Joint |
| **Phase 11** | E2E Testing & Demo | P0 | 5-Minute Hackathon Demo Rehearsal | Joint |
| **Phase 12** | Production Deployment | P1 | Hosted Demo Deployment (Vercel/Render) | Joint |
