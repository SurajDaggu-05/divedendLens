# DividendLens — Database Schema Specification

**Document Version:** 1.0  
**Target Database:** PostgreSQL 15+  
**Status:** Frozen Database Design & Schema Specification  

---

## 1. Data Design Principles & Conventions

1. **Exact Numeric Representation:** All monetary amounts (`dividend_per_share`, `estimated_gross_amount`, `amount_received`, `average_price`) use PostgreSQL `NUMERIC` types (`NUMERIC(12, 2)` or `NUMERIC(10, 4)` for per-share amounts). **Binary floating-point types (`FLOAT`, `REAL`, `DOUBLE PRECISION`) are strictly prohibited.**
2. **Identifier Strategy:** Primary keys use `UUID` (v4) generated via `gen_random_uuid()` to prevent predictable resource enumeration.
3. **Timezones:** All timestamp columns use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) stored in UTC. Calendar-only dates (e.g. `ex_date`, `payment_date`) use the `DATE` type.
4. **Data Distinction:**
   * **Declared Dividend:** Raw DPS declared by company/source (`EventSource.observed_dps`, `DividendEvent.dividend_per_share`).
   * **Expected Dividend:** Calculated gross income ($\text{Eligible Shares} \times \text{DPS}$).
   * **Received Dividend:** Confirmed user-reported income stored in `payment_reports`.
   * **Validated vs. Conflicting Data:** Tracked via `DividendEvent.validation_status` (`'valid'` vs `'conflict'`) and linked to `data_alerts`.

---

## 2. Table Specifications

### 2.1 `users`
* **Purpose:** Stores user account identities and authentication credentials.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique user identifier |
  | `name` | `VARCHAR(100)` | No | | User's full name |
  | `email` | `VARCHAR(255)` | No | `UNIQUE` | User email address |
  | `password_hash` | `VARCHAR(255)` | No | | Argon2id password hash |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
  | `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Profile update timestamp |
* **Indexes:** `idx_users_email` (`email`).
* **Validation Rules:** `email` must be lowercased and valid email format.

---

### 2.2 `companies`
* **Purpose:** Catalog of supported Indian listed equities (NSE/BSE).
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique company identifier |
  | `ticker` | `VARCHAR(20)` | No | `UNIQUE` | Ticker symbol (e.g. `"TCS"`, `"INFY"`) |
  | `name` | `VARCHAR(150)` | No | | Company legal name |
  | `exchange` | `VARCHAR(10)` | No | `DEFAULT 'NSE'` | Exchange (`"NSE"`, `"BSE"`) |
  | `isin` | `VARCHAR(12)` | Yes | `UNIQUE` | ISIN identifier (optional) |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
* **Indexes:** `idx_companies_ticker` (`ticker`).

---

### 2.3 `portfolios`
* **Purpose:** Represents user-created share portfolios.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Portfolio identifier |
  | `user_id` | `UUID` | No | `FOREIGN KEY -> users(id) ON DELETE CASCADE` | Owner user ID |
  | `name` | `VARCHAR(100)` | No | | Portfolio display name |
  | `description` | `TEXT` | Yes | | Optional notes |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Portfolio creation timestamp |
  | `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |
* **Indexes:** `idx_portfolios_user_id` (`user_id`).
* **Unique Constraints:** `uq_user_portfolio_name` (`user_id`, `name`).

---

### 2.4 `holdings`
* **Purpose:** Represents a user's share position in a specific company inside a portfolio.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Holding identifier |
  | `portfolio_id` | `UUID` | No | `FOREIGN KEY -> portfolios(id) ON DELETE CASCADE` | Target portfolio ID |
  | `company_id` | `UUID` | No | `FOREIGN KEY -> companies(id)` | Linked company ID |
  | `quantity` | `INTEGER` | No | `CHECK (quantity > 0)` | Whole share quantity held |
  | `average_price` | `NUMERIC(12, 2)` | Yes | `CHECK (average_price >= 0)` | Optional purchase price |
  | `purchase_date` | `DATE` | Yes | | Optional share purchase date |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Holding creation timestamp |
  | `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Holding modification timestamp |
* **Indexes:** `idx_holdings_portfolio_id` (`portfolio_id`), `idx_holdings_company_id` (`company_id`).
* **Unique Constraints:** `uq_portfolio_company` (`portfolio_id`, `company_id`).
* **Validation Rules:** `quantity` MUST be an integer $> 0$.

---

### 2.5 `dividend_events`
* **Purpose:** Canonical record of corporate dividend announcements.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Event identifier |
  | `company_id` | `UUID` | No | `FOREIGN KEY -> companies(id)` | Linked company ID |
  | `event_type` | `VARCHAR(20)` | No | `DEFAULT 'interim'` | `interim`, `final`, `special`, `other` |
  | `dividend_per_share` | `NUMERIC(10, 4)` | No | `CHECK (dividend_per_share >= 0)` | Declared DPS in INR |
  | `currency` | `VARCHAR(3)` | No | `DEFAULT 'INR'` | ISO currency code |
  | `announcement_date` | `DATE` | Yes | | Announcement date |
  | `ex_date` | `DATE` | Yes | | Ex-dividend date |
  | `record_date` | `DATE` | Yes | | Record date |
  | `payment_date` | `DATE` | Yes | | Scheduled payment date |
  | `business_status` | `VARCHAR(20)` | No | `DEFAULT 'announced'` | `announced`, `scheduled`, `paid`, `cancelled` |
  | `validation_status` | `VARCHAR(20)` | No | `DEFAULT 'unverified'` | `unverified`, `valid`, `conflict`, `stale`, `failed` |
  | `is_demo_data` | `BOOLEAN` | No | `DEFAULT true` | Flag for hypothetical demo data |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
  | `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |
* **Indexes:** `idx_dividend_events_company_id` (`company_id`), `idx_dividend_events_ex_date` (`ex_date`), `idx_dividend_events_status` (`validation_status`).
* **Validation Rules:** `ex_date <= record_date` when both are non-null.

---

### 2.6 `event_sources`
* **Purpose:** Provenance store keeping raw, unmerged corporate action observations from external data sources or demo fixtures.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Observation identifier |
  | `event_id` | `UUID` | No | `FOREIGN KEY -> dividend_events(id) ON DELETE CASCADE` | Linked dividend event |
  | `source_name` | `VARCHAR(100)` | No | | Source name (e.g. `"BSE Disclosure"`, `"NSE Disclosure"`) |
  | `source_url` | `TEXT` | Yes | | Reference URL |
  | `observed_dps` | `NUMERIC(10, 4)` | No | | Observed DPS value |
  | `observed_dates` | `JSONB` | No | | Raw dates JSON (`{ex_date, record_date, payment_date}`) |
  | `observed_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Observation timestamp |
* **Indexes:** `idx_event_sources_event_id` (`event_id`).

---

### 2.7 `payment_reports`
* **Purpose:** Stores user-reported actual dividend payments received in their bank accounts.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Payment report ID |
  | `user_id` | `UUID` | No | `FOREIGN KEY -> users(id) ON DELETE CASCADE` | User ID |
  | `event_id` | `UUID` | No | `FOREIGN KEY -> dividend_events(id)` | Linked dividend event |
  | `amount_received` | `NUMERIC(12, 2)` | No | `CHECK (amount_received >= 0)` | Confirmed amount in INR |
  | `received_date` | `DATE` | No | | Confirmed receipt date |
  | `notes` | `TEXT` | Yes | | User notes |
  | `status` | `VARCHAR(30)` | No | `DEFAULT 'received_user_reported'` | Status label |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Report timestamp |
* **Indexes:** `idx_payment_reports_user_event` (`user_id`, `event_id`).

---

### 2.8 `data_alerts`
* **Purpose:** Data quality alerts created by the Data Validation Agent when conflicts, stale data, or missing attributes occur.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Alert identifier |
  | `event_id` | `UUID` | No | `FOREIGN KEY -> dividend_events(id) ON DELETE CASCADE` | Target dividend event |
  | `alert_type` | `VARCHAR(30)` | No | | `conflict`, `stale`, `missing_fields`, `duplicate` |
  | `description` | `TEXT` | No | | Plain-language description |
  | `is_resolved` | `BOOLEAN` | No | `DEFAULT false` | Resolution state |
  | `resolved_by` | `UUID` | Yes | `FOREIGN KEY -> users(id)` | User who resolved alert |
  | `resolution_notes` | `TEXT` | Yes | | Resolution audit note |
  | `resolved_at` | `TIMESTAMPTZ` | Yes | | Resolution timestamp |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Alert creation timestamp |
* **Indexes:** `idx_data_alerts_event_id` (`event_id`), `idx_data_alerts_unresolved` (`is_resolved`) WHERE `is_resolved = false`.

---

### 2.9 `agent_runs`
* **Purpose:** Audit log of agent execution runs and workflows.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Run identifier |
  | `task_id` | `VARCHAR(100)` | No | | Task identifier for idempotency |
  | `correlation_id` | `VARCHAR(100)` | No | | Workflow correlation ID |
  | `agent_name` | `VARCHAR(100)` | No | | Executing agent name |
  | `status` | `VARCHAR(20)` | No | `DEFAULT 'pending'` | `pending`, `running`, `completed`, `failed`, `retrying` |
  | `started_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Execution start timestamp |
  | `completed_at` | `TIMESTAMPTZ` | Yes | | Execution end timestamp |
  | `summary` | `TEXT` | Yes | | Summary of result |
* **Indexes:** `idx_agent_runs_task_id` (`task_id`), `idx_agent_runs_correlation` (`correlation_id`).

---

### 2.10 `agent_messages`
* **Purpose:** Event stream storing JSON inter-agent message contracts for system observability.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Message identifier |
  | `run_id` | `UUID` | Yes | `FOREIGN KEY -> agent_runs(id) ON DELETE SET NULL` | Linked run ID |
  | `correlation_id` | `VARCHAR(100)` | No | | Workflow correlation ID |
  | `sender` | `VARCHAR(100)` | No | | Emitting agent |
  | `recipient` | `VARCHAR(100)` | No | | Destination agent / topic |
  | `message_type` | `VARCHAR(50)` | No | | Message event type |
  | `schema_version` | `VARCHAR(10)` | No | `DEFAULT '1.0'` | Contract version |
  | `payload` | `JSONB` | No | | Message payload |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Message timestamp |
* **Indexes:** `idx_agent_messages_correlation` (`correlation_id`), `idx_agent_messages_created` (`created_at`).

---

### 2.11 `agent_states`
* **Purpose:** Health and heartbeat status tracking for swarm agent processes.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `agent_id` | `VARCHAR(100)` | No | `PRIMARY KEY` | Unique worker instance ID |
  | `name` | `VARCHAR(100)` | No | | Human readable agent name |
  | `role` | `VARCHAR(255)` | No | | Agent responsibility description |
  | `status` | `VARCHAR(20)` | No | `DEFAULT 'online'` | `online`, `degraded`, `offline` |
  | `last_heartbeat` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Last heartbeat timestamp |
  | `current_task` | `VARCHAR(255)` | Yes | | Active task description |
  | `is_simulated` | `BOOLEAN` | No | `DEFAULT true` | Flag for prototype simulation |
* **Indexes:** `idx_agent_states_heartbeat` (`last_heartbeat`).

---

### 2.12 `calculation_explanations`
* **Purpose:** Cache plain-language calculation explanations generated by the Explanation Agent.
* **Columns:**
  | Column Name | PostgreSQL Data Type | Nullable | Constraints & Default | Description |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Explanation identifier |
  | `event_id` | `UUID` | No | `FOREIGN KEY -> dividend_events(id) ON DELETE CASCADE` | Linked event ID |
  | `explanation_text` | `TEXT` | No | | Generated plain-language text |
  | `provider_used` | `VARCHAR(20)` | No | `DEFAULT 'template'` | `template` or `openai` |
  | `created_at` | `TIMESTAMPTZ` | No | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
* **Indexes:** `idx_explanations_event_id` (`event_id`).

---

## 3. Entity Relationship Summary

```
   [users] 1 ──── N [portfolios] 1 ──── N [holdings] N ──── 1 [companies]
      │                                                           │
      │ 1                                                         │ 1
      └──── N [payment_reports] N ──── 1 [dividend_events] 1 ──────┴──── N [event_sources]
                                             │ 1
                         ┌───────────────────┼───────────────────┐
                         │ 1                 │ 1                 │ 1
                         ▼                   ▼                   ▼
                  [data_alerts]   [agent_runs]          [calculation_explanations]
                                     │ 1
                                     ▼ N
                              [agent_messages]
```

---

## 4. Required Indexes

```sql
-- Authentication & Users
CREATE INDEX idx_users_email ON users(email);

-- Holdings & Portfolio Lookups
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_company_id ON holdings(company_id);

-- Dividend Events & Sources
CREATE INDEX idx_dividend_events_company_id ON dividend_events(company_id);
CREATE INDEX idx_dividend_events_ex_date ON dividend_events(ex_date);
CREATE INDEX idx_dividend_events_status ON dividend_events(validation_status);
CREATE INDEX idx_event_sources_event_id ON event_sources(event_id);

-- Payment History
CREATE INDEX idx_payment_reports_user_event ON payment_reports(user_id, event_id);

-- Quality Alerts
CREATE INDEX idx_data_alerts_unresolved ON data_alerts(is_resolved) WHERE is_resolved = false;

-- Agent Monitoring & Traceability
CREATE INDEX idx_agent_runs_task_id ON agent_runs(task_id);
CREATE INDEX idx_agent_runs_correlation ON agent_runs(correlation_id);
CREATE INDEX idx_agent_messages_correlation ON agent_messages(correlation_id);
CREATE INDEX idx_agent_states_heartbeat ON agent_states(last_heartbeat);
```

---

## 5. Data Integrity & Validation Rules

1. **Monetary Non-Negativity:** All monetary columns (`dividend_per_share`, `amount_received`, `average_price`, `observed_dps`) MUST have explicit `CHECK (val >= 0)` constraints.
2. **Whole Share Constraint:** Holding quantities MUST be positive whole integers (`CHECK (quantity > 0)`).
3. **User Isolation:** `portfolios` and `payment_reports` tables belong directly to a `user_id`. Queries must enforce `WHERE user_id = :current_user_id`.
4. **Idempotency Protection:** `agent_runs` indexes `task_id` so duplicate task attempts update existing task logs rather than creating duplicate side effects.
5. **No Silent Data Overwriting:** Multiple observations for the same event create separate `event_sources` rows, preserving complete provenance.

---

## 6. Table Classification

### MVP Tables (Required for Prototype Demo)
1. `users`
2. `companies`
3. `portfolios`
4. `holdings`
5. `dividend_events`
6. `event_sources`
7. `payment_reports`
8. `data_alerts`
9. `agent_runs`
10. `agent_messages`
11. `agent_states`
12. `calculation_explanations`

### Optional Future Tables (Post-MVP)
1. `broker_connections` (Broker API credentials & sync logs — excluded from MVP).
2. `tax_preferences` (User tax bracket rules & exemptions — excluded from MVP).
3. `notification_subscriptions` (Email/Push notification rules — excluded from MVP).
