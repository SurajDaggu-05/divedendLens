# TECH-STACK.md — DividendLens
## Technology Selection and Implementation Guide

**Product:** DividendLens — Swarm-Inspired Dividend Income Tracker  
**Document version:** 1.0  
**Purpose:** Define the technologies to use for the hackathon MVP, explain why they fit, and establish a practical implementation path.

---

## 1. Executive recommendation

Build DividendLens as a **TypeScript monorepo** with a responsive React frontend, a Python FastAPI backend, PostgreSQL for persistent data, and a lightweight asynchronous agent layer that demonstrates swarm-inspired cooperation.

The MVP should prioritize a working, explainable product over infrastructure complexity. Use a modular monolith for the web API and run the agents as separate logical workers/modules initially. If the hackathon environment supports it, run agent workers as separate processes or containers and communicate through a queue. Clearly label any single-process or simulated behavior in the UI and demo.

### Recommended stack at a glance

| Layer | Recommended technology | Role |
|---|---|---|
| Frontend | React + TypeScript + Vite | Responsive web application |
| UI styling | Tailwind CSS + shadcn/ui | Design system and reusable components |
| Charts | Recharts | Dividend income trends and summaries |
| Backend API | Python + FastAPI | REST API, validation, business logic |
| Data validation | Pydantic | Typed request/response schemas |
| ORM / migrations | SQLAlchemy 2.x + Alembic | Database access and schema migrations |
| Database | PostgreSQL | Users, holdings, dividend events, agent runs |
| Background work | Redis + RQ (or Celery if already familiar) | Queue and retry support for agent tasks |
| Agent orchestration | Python modules with explicit message contracts | Cooperative data collection, validation, calculation |
| AI / LLM | Optional OpenAI API integration behind an adapter | Plain-language explanations only |
| Authentication | JWT access tokens + Argon2 password hashing | MVP account authentication |
| Testing | Pytest + HTTPX; Vitest + React Testing Library | Backend and frontend tests |
| API documentation | FastAPI OpenAPI / Swagger UI | Interactive API reference |
| Version control | Git + GitHub | Source control, issues, pull requests |
| CI | GitHub Actions | Linting and automated tests |
| Deployment | Vercel (frontend) + Render or Railway (API, worker, PostgreSQL/Redis where available) | Public demo deployment |
| Local development | Docker Compose | Reproducible services |

**Keep the MVP small:** use one frontend, one API, one PostgreSQL database, and a small number of agent workers. Do not introduce Kubernetes, Kafka, a vector database, or a complex microservice mesh unless a specific requirement justifies it.

---

## 2. Architecture overview

```text
                  ┌────────────────────────────┐
                  │       React + Vite         │
                  │  TypeScript / Tailwind     │
                  └─────────────┬──────────────┘
                                │ HTTPS / JSON
                                ▼
                  ┌────────────────────────────┐
                  │       FastAPI API          │
                  │ Auth • Portfolio • Events  │
                  │ Calculations • Explanations│
                  └───────┬───────────┬────────┘
                          │           │
                          ▼           ▼
                ┌────────────────┐  ┌───────────────────┐
                │  PostgreSQL    │  │ Redis + RQ Queue  │
                │ Users / Events │  │ Agent task queue  │
                │ Holdings / Runs│  └─────────┬─────────┘
                └────────────────┘            │
                                              ▼
                                 ┌────────────────────────┐
                                 │   Agent workers        │
                                 │ Collect • Track dates  │
                                 │ Validate • Calculate   │
                                 │ Explain • Monitor      │
                                 └────────────┬───────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ Source adapters /      │
                                 │ deterministic rules    │
                                 └────────────────────────┘
```

### Architectural rules

- The API is the system of record for user-facing operations.
- PostgreSQL is the durable source of truth for portfolios, event records, and agent-run history.
- Redis is a transient queue/cache, not the permanent source of financial records.
- Agent tasks should be idempotent where possible so retries do not create duplicate events or payments.
- Each agent should have a narrow responsibility and exchange versioned, structured messages.
- The dividend calculation must be deterministic and testable without an LLM.
- LLM output must never silently overwrite source facts or calculation results.
- Keep external data access behind adapters so demo data and future data providers can be swapped without rewriting business logic.

---

## 3. Frontend

### 3.1 React + TypeScript + Vite

**Use:** React with TypeScript, bootstrapped using Vite.

Why:
- Fast local development and a simple build pipeline.
- TypeScript catches many data-shape errors before runtime.
- React has a broad ecosystem and is practical for a hackathon dashboard.
- The frontend can consume the FastAPI REST API without sharing runtime code with Python.

Use a feature-oriented structure rather than one large component tree.

Suggested structure:

```text
frontend/
  src/
    app/
      App.tsx
      routes.tsx
    components/
      layout/
      ui/
      charts/
      feedback/
    features/
      overview/
      portfolio/
      dividends/
      activity/
      sources/
      settings/
    lib/
      api.ts
      auth.ts
      format.ts
    types/
    styles/
```

### 3.2 Styling and UI components

**Use:** Tailwind CSS and shadcn/ui.

- Tailwind provides fast, consistent implementation of the `DESIGN.md` tokens and responsive layouts.
- shadcn/ui provides accessible, customizable building blocks without locking the product into a hosted component service.
- Use CSS variables for color tokens so the visual system can be adjusted centrally.

Recommended components:
- Button, Input, Select, Dialog, Sheet, Tabs, Tooltip, Badge, Card, Skeleton, Table, Toast.
- Build DividendLens-specific components such as `IncomeMetricCard`, `DividendEventCard`, `AgentStatusCard`, and `DataQualityBanner` on top of these primitives.

Avoid adding multiple competing UI libraries. Use one component system and a small number of custom components.

### 3.3 Routing and data fetching

Recommended:
- **React Router** for page navigation.
- **TanStack Query** for server-state fetching, caching, loading, and retry behavior.
- **React Hook Form + Zod** for forms and client-side validation, while keeping backend validation authoritative.

Keep authentication state and server data separate. Do not treat browser local storage as the source of truth for holdings or dividend records.

### 3.4 Charts and formatting

Use **Recharts** for the monthly dividend trend and other small, purposeful charts.

- Provide a text summary or table equivalent.
- Label estimated versus received income explicitly.
- Use `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })` for currency formatting.
- Use a consistent date format and explicitly identify the date type (ex-date, record date, payment date).

---

## 4. Backend

### 4.1 Python + FastAPI

**Use:** Python 3.12+ and FastAPI.

Why:
- FastAPI is well suited to typed REST APIs and produces OpenAPI documentation automatically.
- Python is a practical language for agent orchestration, data processing, and future AI integration.
- Pydantic models make API contracts explicit.

Backend responsibilities:
- Authentication and user identity.
- Portfolio and holding CRUD.
- Dividend event and payment records.
- Deterministic dividend calculations.
- Source provenance and data-quality status.
- Agent task creation, status, retries, and audit history.
- Optional LLM explanation endpoint.

Suggested structure:

```text
backend/
  app/
    main.py
    api/
      routes/
        auth.py
        portfolio.py
        dividends.py
        activity.py
        sources.py
    core/
      config.py
      security.py
    db/
      session.py
      models/
      migrations/
    schemas/
    services/
      dividend_calculator.py
      portfolio_service.py
      event_service.py
    agents/
      base.py
      collector.py
      date_tracker.py
      validator.py
      calculator.py
      explainer.py
      supervisor.py
      contracts.py
    adapters/
      demo_source.py
      provider_base.py
    tests/
```

### 4.2 API design

Use REST endpoints with JSON payloads and a `/api/v1` prefix.

Suggested MVP endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Authenticate |
| GET | `/api/v1/me` | Current user |
| GET | `/api/v1/portfolio` | List user holdings |
| POST | `/api/v1/portfolio/holdings` | Add holding |
| PATCH | `/api/v1/portfolio/holdings/{id}` | Update holding |
| DELETE | `/api/v1/portfolio/holdings/{id}` | Delete holding |
| GET | `/api/v1/dividends` | List dividend events |
| GET | `/api/v1/dividends/{id}` | Event detail and estimate |
| POST | `/api/v1/dividends/{id}/payment-reports` | Report a payment manually |
| GET | `/api/v1/activity/agents` | Agent status |
| GET | `/api/v1/activity/runs` | Agent run history |
| POST | `/api/v1/activity/run` | Start a demo or refresh cycle |
| GET | `/api/v1/sources` | Source status and provenance |

Use consistent response envelopes only if they simplify the frontend; avoid unnecessary abstraction. Return meaningful HTTP status codes and structured error details.

### 4.3 Validation and business logic

- Use Pydantic for incoming and outgoing API schemas.
- Validate quantity, dates, identifiers, and ownership on the backend.
- Put financial formulas in pure service functions, not route handlers.
- Keep API handlers thin: parse, authorize, call service, return response.
- Use `Decimal` for monetary arithmetic; avoid binary floating-point for financial calculations.
- Store currency explicitly, even if the MVP only supports INR.
- Make all user-owned records scoped by authenticated user ID.

---

## 5. Database

### 5.1 PostgreSQL

**Use:** PostgreSQL as the primary database.

Why:
- Relational data fits users, holdings, dividend events, source records, and agent runs.
- Constraints and transactions help preserve data integrity.
- It is widely supported by managed deployment platforms.
- It can support the project beyond the demo without changing the data model.

Use **SQLAlchemy 2.x** for ORM access and **Alembic** for migrations.

### 5.2 Core entities

Recommended MVP tables:

| Table | Key fields / purpose |
|---|---|
| `users` | `id`, email, password hash, created timestamp |
| `companies` | `id`, name, ticker, exchange |
| `holdings` | `id`, `user_id`, `company_id`, quantity, created/updated timestamps |
| `dividend_events` | `id`, `company_id`, dividend per share, currency, announcement/ex/record/payment dates, status |
| `event_sources` | `id`, `event_id`, source name, source URL/reference, observed value, checked timestamp |
| `payment_reports` | `id`, `user_id`, `event_id`, amount, reported date, notes, status |
| `agent_runs` | `id`, agent name, task ID, status, started/completed timestamps, summary |
| `agent_messages` | `id`, run ID, sender, recipient/topic, schema version, payload, created timestamp |
| `audit_events` | `id`, user ID, action, entity type/ID, timestamp, safe metadata |

Design notes:
- Use UUIDs for externally exposed record identifiers.
- Add foreign keys and indexes for common lookups.
- Store timestamps in UTC; render them in the user’s local timezone.
- Store event dates as dates when they are calendar dates, not timestamps.
- Use `NUMERIC`/`Decimal` for dividend-per-share and payment amounts.
- Keep raw source payloads only when necessary; avoid collecting unnecessary personal data.
- Consider a uniqueness constraint for one holding per user/company if the UX merges duplicate holdings.
- Keep user-reported payment records distinct from provider-confirmed payment records.

### 5.3 Data integrity

- Use database transactions for multi-record updates.
- Use unique task IDs or idempotency keys for retryable agent work.
- Do not delete event provenance when an event is recalculated.
- Avoid silently replacing a prior value; preserve source and update history when practical.
- Add a deterministic seed/reset mechanism for the hackathon demo.

---

## 6. AI and agent technology

### 6.1 Core recommendation: deterministic agents first

For the MVP, implement agents as ordinary Python classes or modules with explicit input/output contracts. This is more reliable and easier to demonstrate than making every step an LLM call.

Required agent roles:
1. **Data Collection Agent** — obtains event records from demo fixtures or a configured provider adapter.
2. **Date Tracking Agent** — normalizes and checks event date fields.
3. **Data Validation Agent** — checks duplicates, missing fields, stale data, and source conflicts.
4. **Dividend Calculation Agent** — computes eligible shares × dividend per share using deterministic rules.

Optional:
5. **Explanation Agent** — turns validated calculation facts into beginner-friendly wording.
6. **Monitoring & Recovery Agent** — detects failed/stalled tasks and schedules safe retries.

Each agent should:
- Have one documented responsibility.
- Accept a typed message and return a typed result.
- Record a run status and concise outcome.
- Include correlation/task IDs in messages.
- Be safe to retry or explicitly declare when it is not retry-safe.
- Never invent missing dividend data.

### 6.2 Swarm-inspired coordination

Use a small queue-based design for the demonstrable prototype:

- Redis + RQ is sufficient for a simple background queue.
- A supervisor creates a task/cycle and dispatches work.
- Agents publish structured results or update task state.
- Validation gates calculation: invalid or conflicting input should be marked for review rather than silently treated as authoritative.
- The API exposes activity and run history for the UI.
- For a minimal local demo, the same contracts may be invoked synchronously; label that mode as simulated/local.

Do not add a heavyweight multi-agent framework unless the project needs capabilities it demonstrably provides. The learning objective is the explicit cooperation, message passing, validation, fault handling, and observability—not the framework name.

### 6.3 LLM/API use

**Optional provider:** OpenAI API, accessed only through a backend adapter.

Appropriate MVP use:
- Explain a deterministic calculation in beginner-friendly language.
- Summarize why an event is marked stale or conflicting, using supplied facts.
- Answer glossary-style questions grounded in product data.

Do not use an LLM to:
- Calculate dividend amounts.
- Invent event dates or dividend values.
- Decide which source is correct without a documented validation rule.
- Give stock recommendations, price forecasts, or guaranteed-income claims.
- Handle secrets or user credentials.

Recommended pattern:
1. Backend computes and validates facts.
2. Backend builds a compact, structured explanation context.
3. Optional LLM produces a short explanation.
4. Validate the response and retain the deterministic facts alongside it.
5. If the API is unavailable, show a template-based explanation.

Keep the LLM behind an interface such as `ExplanationProvider`, with `TemplateExplanationProvider` as the default and `OpenAIExplanationProvider` as an optional implementation.

Environment variable:
- `OPENAI_API_KEY` — backend only; never expose it to the browser or commit it to Git.

Use a low-cost model appropriate to the task, set token limits, and avoid sending personally identifiable information. Confirm current model names, pricing, and API terms before enabling the integration; they can change.

### 6.4 External dividend data

For the hackathon MVP, use seeded hypothetical/sample data unless a permitted, reliable source is available and its terms are understood.

Create a provider interface such as:

```python
class DividendDataProvider:
    def fetch_events(self, symbols: list[str]) -> list[DividendEventInput]:
        ...
```

Implement:
- `DemoDividendDataProvider` — deterministic fixture data for demos and tests.
- `ExternalDividendDataProvider` — optional future adapter for a source with suitable access and usage rights.

The interface should preserve:
- Source name and reference.
- Retrieved timestamp.
- Source-reported value.
- Normalized value.
- Validation result.

Do not scrape a website or use an unofficial endpoint without checking its terms, reliability, and rate limits.

---

## 7. Authentication and security

### 7.1 MVP authentication

Use email and password authentication with:
- Argon2id password hashing via a maintained Python password-hashing library.
- Short-lived JWT access tokens.
- Server-side authorization on every user-owned resource.
- HTTPS in deployment.
- Rate limiting for login/register endpoints if supported by the deployment setup.

For a hackathon demo, a simple access-token flow is acceptable. If adding refresh tokens, store and rotate them securely; do not place long-lived secrets in local storage.

### 7.2 Security baseline

- Keep secrets in environment variables or the hosting provider’s secret manager.
- Commit `.env.example`, never `.env`.
- Configure CORS to the deployed frontend origin.
- Validate all user input on the server.
- Enforce ownership checks for holdings, reports, and user-specific data.
- Do not log passwords, access tokens, API keys, or unnecessary personal data.
- Use parameterized database operations through SQLAlchemy.
- Use dependency updates and basic static checks before the demo.
- Provide a clear logout action and handle expired sessions gracefully.

### 7.3 Scope boundaries

The MVP is a tracking and explanation tool. It should not:
- Connect to a brokerage account unless explicitly added and secured.
- Place trades.
- Ask users for broker passwords or OTPs.
- Present estimates as guaranteed payments.
- Claim tax advice or tax filing support.

---

## 8. Version control and collaboration

### 8.1 Git + GitHub

Use Git for version control and GitHub for the shared repository, issue tracking, pull requests, and CI.

Suggested repository layout:

```text
dividendlens/
  frontend/
  backend/
  docs/
    PRD.md
    DESIGN.md
    TECH-STACK.md
  infra/
    docker-compose.yml
  .github/
    workflows/
  .env.example
  README.md
  .gitignore
```

### 8.2 Branching and commit conventions

For a small team:
- `main` — always runnable/demo-ready.
- `feature/<short-name>` — focused work branches.
- Use pull requests for changes that affect shared contracts or database schema.
- Keep commits small and descriptive.

Suggested commit prefixes:
- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation
- `test:` tests
- `refactor:` code restructuring
- `chore:` tooling/configuration

### 8.3 Repository hygiene

- Add a README with setup, architecture, demo credentials policy, and limitations.
- Keep API contracts and agent message schemas versioned.
- Add `.gitignore` entries for virtual environments, `node_modules`, build output, caches, and secrets.
- Use GitHub Issues or a project board for task ownership.
- Tag a known-good demo commit before the presentation.

---

## 9. Testing and quality tools

| Area | Tool | Minimum use |
|---|---|---|
| Backend tests | Pytest | Unit tests for calculations, validation, and agents |
| API tests | HTTPX + FastAPI TestClient | Auth, CRUD, authorization, and error responses |
| Frontend tests | Vitest + React Testing Library | Forms, cards, loading/error states, navigation |
| Lint / format Python | Ruff | Linting and formatting |
| Type checks Python | mypy (optional) | Check critical service/agent modules |
| Lint frontend | ESLint | TypeScript/React checks |
| Format frontend | Prettier | Consistent formatting |
| Browser smoke tests | Playwright (optional) | One end-to-end happy path |
| API docs | FastAPI OpenAPI | Contract inspection |

Minimum tests before demo:
- Dividend estimate uses the expected eligible share quantity and per-share amount.
- Decimal arithmetic is used for monetary calculations.
- A user cannot read or modify another user’s holdings.
- Duplicate agent task retries do not duplicate persisted events.
- Conflicting or missing data is marked for review.
- The UI distinguishes estimates from reported/received payments.
- Core screens render at desktop and mobile widths.

---

## 10. Local development and deployment

### 10.1 Local setup

Use Docker Compose for PostgreSQL and Redis. Run frontend and backend locally during development, or containerize all services if the team prefers a single command.

Suggested local services:
- `frontend` — Vite development server.
- `api` — FastAPI with reload enabled.
- `worker` — RQ worker.
- `postgres` — database.
- `redis` — queue backend.

A local `.env.example` should document required variables without containing real secrets.

### 10.2 Deployment recommendation

For a hackathon, use managed hosting rather than maintaining servers.

| Component | Suggested host | Notes |
|---|---|---|
| React frontend | Vercel | Static build and HTTPS |
| FastAPI API | Render or Railway | Web service; configure health check |
| Agent worker | Same provider as API | Separate worker process if supported |
| PostgreSQL | Managed PostgreSQL from host | Persistent storage and backups where available |
| Redis | Managed Redis/compatible queue service | Confirm plan availability and persistence needs |
| CI | GitHub Actions | Run checks on pull requests |

Choose one backend host to reduce operational overhead. Confirm current free-tier limits, sleeping behavior, database persistence, worker support, and pricing before relying on a plan for the live demo.

### 10.3 Deployment checklist

- [ ] Frontend environment points to the deployed API URL.
- [ ] API CORS allows only the intended frontend origin.
- [ ] Database migrations run successfully.
- [ ] Seed/demo data can be loaded safely.
- [ ] API health endpoint is available.
- [ ] Worker is running and can consume a test task.
- [ ] Secrets are configured in the host dashboard.
- [ ] Logs do not expose secrets or personal data.
- [ ] A demo account or guest mode is prepared without sharing real credentials.
- [ ] The app has a graceful state if the worker or optional LLM is unavailable.
- [ ] The deployed demo has been tested on a phone and laptop.
- [ ] A backup local demo path is available in case hosted services fail.

---

## 11. Environment variables

Example names (actual values belong in local or hosting secrets):

```dotenv
# Backend
APP_ENV=development
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/dividendlens
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173

# Optional AI
OPENAI_API_KEY=
OPENAI_MODEL=

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Notes:
- Do not use the example JWT secret outside local development.
- `VITE_` variables are bundled into frontend code and must not contain secrets.
- Keep provider keys and database credentials on the backend only.
- Validate configuration at application startup and fail clearly when required settings are missing.

---

## 12. Implementation sequence

### Phase 1 — Foundation
1. Create the GitHub repository and monorepo structure.
2. Bootstrap React + TypeScript + Vite.
3. Bootstrap FastAPI and health endpoint.
4. Add Docker Compose for PostgreSQL and Redis.
5. Add environment configuration and CI checks.

### Phase 2 — Core product
1. Create database models and Alembic migrations.
2. Implement registration/login and authorization.
3. Implement portfolio CRUD.
4. Add demo company and dividend-event fixtures.
5. Implement deterministic dividend calculation service.
6. Expose overview, portfolio, calendar, and event APIs.

### Phase 3 — Swarm-inspired workflow
1. Define versioned agent message schemas.
2. Implement collection, date tracking, validation, and calculation agents.
3. Add task IDs, correlation IDs, run history, and idempotency.
4. Add queue worker and retry behavior.
5. Add activity and data-source endpoints.
6. Demonstrate a failed task and safe recovery.

### Phase 4 — UI and demo polish
1. Implement design tokens and shared components from `DESIGN.md`.
2. Build dashboard, portfolio, calendar, event detail, and activity screens.
3. Add loading, empty, error, stale, and conflict states.
4. Add optional template-based explanations; integrate an LLM only if time and budget allow.
5. Run tests, deploy, and rehearse the demo.

---

## 13. Alternatives considered

| Decision | Recommended | Alternative | Why keep the recommendation for this MVP |
|---|---|---|---|
| Frontend | React + Vite | Next.js | The app is a dashboard; Vite keeps setup and deployment simple unless server rendering is needed. |
| Backend | FastAPI | Node.js / Express | Python supports the agent/data-processing layer and gives typed API schemas quickly. |
| Database | PostgreSQL | MongoDB | Core records are relational and benefit from transactions and constraints. |
| Queue | Redis + RQ | Kafka | RQ is simpler to operate for a small number of background tasks. |
| Agent layer | Explicit Python agents | Full multi-agent framework | Direct contracts and deterministic behavior are easier to debug and explain. |
| AI | Optional OpenAI adapter | LLM in every agent | Keep core calculations reliable and control cost/latency. |
| Auth | JWT + Argon2id | Hosted auth provider | Self-contained MVP path; a hosted provider may be preferable if setup time is limited. |
| Deployment | Vercel + one API host | Kubernetes | Managed services reduce infrastructure work during the hackathon. |

These are project-fit decisions, not claims that the alternatives are unsuitable in general.

---

## 14. Final stack decision

For the hackathon MVP, implement:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Recharts.
- **Backend:** Python 3.12+, FastAPI, Pydantic, SQLAlchemy 2.x, Alembic.
- **Database:** PostgreSQL.
- **Agent work:** explicit Python agent modules, Redis + RQ for background tasks and retries.
- **AI/API:** optional OpenAI API only for grounded natural-language explanations; deterministic templates remain the fallback.
- **Authentication:** Argon2id password hashing and short-lived JWT access tokens.
- **Version control/CI:** Git, GitHub, GitHub Actions.
- **Deployment:** Vercel for frontend; Render or Railway for API and worker; managed PostgreSQL and Redis where available.
- **Development:** Docker Compose, Pytest, Vitest, Ruff, ESLint, Prettier.

The central engineering principle is to keep financial facts and calculations deterministic, keep agent responsibilities explicit, and use AI only where it adds understandable language—not authority over the data.

---

**End of TECH-STACK.md**
