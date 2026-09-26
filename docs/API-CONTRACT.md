# DividendLens — API Contract Specification

**Document Version:** 1.0  
**Target Audience:** Frontend (Cursor / React + TypeScript) & Backend (Antigravity / FastAPI)  
**Status:** Frozen API Specification  

---

## 1. General API Conventions

- All requests and responses use **JSON** format with `Content-Type: application/json` (except form-encoded auth if OAuth2 password flow is used).
- JSON field names use **`snake_case`** consistently across all models and payloads.
- All monetary amounts use string representations of fixed-point decimals (`"200.00"`) or native numbers formatted to 2 decimal places to prevent floating-point precision loss.
- Resource identifiers are UUID v4 strings (e.g. `"123e4567-e89b-12d3-a456-426614174000"`).
- All endpoints are stateless. User context is extracted exclusively from the validated JWT bearer token.

---

## 2. Base URL

```text
Development Base URL: http://localhost:8000/api/v1
Production Base URL:  https://<configured-api-domain>/api/v1
```

---

## 3. API Versioning

API versioning is embedded directly in the URL path prefix: `/api/v1`.  
Breaking schema changes will require incrementing the version prefix (e.g., `/api/v2`).

---

## 4. Authentication Convention

Authenticated endpoints require an HTTP `Authorization` header carrying a JSON Web Token (JWT) in the `Bearer` scheme:

```http
Authorization: Bearer <jwt_access_token>
```

- Tokens are short-lived (default 30 minutes expiration).
- Unauthenticated or invalid token requests to protected endpoints return `401 Unauthorized`.
- Forbidden attempts to access resources owned by another user return `403 Forbidden`.

---

## 5. Standard Response Structure

### 5.1 Success Response Envelope (Single Entity)

```json
{
  "success": true,
  "data": { ... }
}
```

### 5.2 Success Response Envelope (Paginated Collection)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

## 6. Standard Error Structure

All error responses return standard HTTP status codes ($4xx$ / $5xx$) and a structured JSON body following RFC 7807 problem details semantics:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid holding quantity provided.",
    "details": [
      {
        "field": "quantity",
        "issue": "Quantity must be a positive whole integer greater than zero."
      }
    ]
  },
  "timestamp": "2026-09-26T15:30:00Z"
}
```

### Standard Error Codes
* `UNAUTHORIZED` (401): Missing, expired, or invalid token.
* `FORBIDDEN` (403): User lacks permission to access target resource.
* `NOT_FOUND` (404): Requested entity does not exist.
* `VALIDATION_ERROR` (422): Unprocessable request payload fields.
* `CONFLICT` (409): Entity already exists or conflicting state (e.g. duplicate email).
* `AGENT_UNAVAILABLE` (503): Agent pipeline offline or task timed out.
* `INTERNAL_ERROR` (500): Unexpected server failure.

---

## 7. Pagination Convention

Endpoints returning collections support standard query parameters:

* `page` (integer, default `1`): 1-based page index.
* `limit` (integer, default `20`, max `100`): Items per page.

---

## 8. Date and Time Format

* **Calendar Dates** (announcement, ex-date, record, payment dates): ISO-8601 extended calendar date string: `YYYY-MM-DD` (e.g., `"2026-10-15"`).
* **Timestamps** (observed_at, created_at, heartbeats): ISO-8601 UTC timestamp format: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `"2026-09-26T15:30:00Z"`).

---

## 9. Currency Representation

* Primary currency is Indian Rupee (`INR`).
* Currency is specified using 3-letter ISO 4217 code strings (`"INR"`).

---

## 10. Numeric / Decimal Representation

* Monetary values (`dividend_per_share`, `estimated_gross_amount`, `amount_received`, `average_price`) are returned as fixed decimal string representations with 2 decimal places (e.g., `"12.50"` or `12.50`).
* Share quantities (`quantity`) are returned as positive whole integers (`25`).

---

## 11. Health & System Endpoints

### `GET /api/v1/health`
* **Purpose:** System health check verifying API, database, and Redis connectivity.
* **Authentication:** Public (None).
* **Request Parameters:** None.
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "version": "1.0.0",
      "services": {
        "database": "connected",
        "redis": "connected"
      },
      "timestamp": "2026-09-26T15:30:00Z"
    }
  }
  ```
* **Error Cases:** 
  * `500 Internal Server Error` if DB or Redis connection fails.

---

## 12. Authentication Endpoints

### `POST /api/v1/auth/register`
* **Purpose:** Register a new user account.
* **Authentication:** Public (None).
* **Request Body:**
  ```json
  {
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Arjun Sharma",
        "email": "arjun@example.com",
        "created_at": "2026-09-26T15:30:00Z"
      },
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "token_type": "bearer",
      "expires_in_seconds": 1800
    }
  }
  ```
* **Error Cases:**
  * `422 Validation Error`: Missing required fields or invalid email format.
  * `409 Conflict`: Email address is already registered.

---

### `POST /api/v1/auth/login`
* **Purpose:** Authenticate user credentials and issue JWT token.
* **Authentication:** Public (None).
* **Request Body:**
  ```json
  {
    "email": "arjun@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Arjun Sharma",
        "email": "arjun@example.com",
        "created_at": "2026-09-26T15:30:00Z"
      },
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "token_type": "bearer",
      "expires_in_seconds": 1800
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Invalid email or password.

---

### `POST /api/v1/auth/logout`
* **Purpose:** Client session termination notification.
* **Authentication:** Required (Bearer Token).
* **Request Parameters:** None.
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Successfully logged out."
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Invalid or expired JWT token.

---

### `GET /api/v1/auth/me`
* **Purpose:** Retrieve current authenticated user profile.
* **Authentication:** Required (Bearer Token).
* **Request Parameters:** None.
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "created_at": "2026-09-26T15:30:00Z"
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Invalid or expired token.

---

## 13. Portfolio Endpoints

### `GET /api/v1/portfolios`
* **Purpose:** List all portfolios owned by the current authenticated user.
* **Authentication:** Required (Bearer Token).
* **Request Parameters:** None.
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        "name": "My Core Equities",
        "holdings_count": 3,
        "created_at": "2026-09-26T15:30:00Z"
      }
    ]
  }
  ```

---

### `POST /api/v1/portfolios`
* **Purpose:** Create a new user portfolio.
* **Authentication:** Required (Bearer Token).
* **Request Body:**
  ```json
  {
    "name": "Growth Stocks"
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
      "name": "Growth Stocks",
      "holdings_count": 0,
      "created_at": "2026-09-26T15:30:00Z"
    }
  }
  ```
* **Error Cases:**
  * `422 Validation Error`: Blank or missing portfolio name.

---

### `GET /api/v1/portfolios/{portfolio_id}`
* **Purpose:** Retrieve specific portfolio metadata and holdings summary.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "name": "My Core Equities",
      "holdings_count": 2,
      "created_at": "2026-09-26T15:30:00Z"
    }
  }
  ```
* **Error Cases:**
  * `404 Not Found`: Portfolio does not exist or belongs to another user.

---

### `PATCH /api/v1/portfolios/{portfolio_id}`
* **Purpose:** Update portfolio name.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Request Body:**
  ```json
  {
    "name": "Updated Portfolio Name"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "name": "Updated Portfolio Name",
      "holdings_count": 2,
      "created_at": "2026-09-26T15:30:00Z"
    }
  }
  ```
* **Error Cases:**
  * `403 Forbidden`: User does not own portfolio.
  * `404 Not Found`: Portfolio ID invalid.

---

### `DELETE /api/v1/portfolios/{portfolio_id}`
* **Purpose:** Delete a portfolio and its associated holdings.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Portfolio deleted successfully."
    }
  }
  ```

---

### `GET /api/v1/portfolios/{portfolio_id}/summary`
* **Purpose:** Retrieve calculated dividend income totals for a specific portfolio.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "portfolio_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "currency": "INR",
      "expected_income_fy": "1450.00",
      "received_income_fy": "800.00",
      "upcoming_30_days": "400.00",
      "unverified_amount": "250.00",
      "last_calculated_at": "2026-09-26T15:30:00Z"
    }
  }
  ```

---

## 14. Holding Endpoints

### `GET /api/v1/portfolios/{portfolio_id}/holdings`
* **Purpose:** List all share holdings inside a portfolio.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "d4e5f6a7-b890-1234-def0-456789012345",
        "portfolio_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        "company": {
          "id": "e5f6a7b8-9012-3456-ef01-567890123456",
          "ticker": "TCS",
          "name": "Tata Consultancy Services Ltd",
          "exchange": "NSE"
        },
        "quantity": 25,
        "average_price": "3850.00",
        "purchase_date": "2026-01-15",
        "upcoming_event": {
          "event_id": "f6a7b890-1234-5678-f012-678901234567",
          "ex_date": "2026-10-10",
          "dividend_per_share": "10.00",
          "estimated_gross_amount": "250.00",
          "status": "announced"
        }
      }
    ]
  }
  ```

---

### `POST /api/v1/portfolios/{portfolio_id}/holdings`
* **Purpose:** Add a share holding to a portfolio.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `portfolio_id` (UUID).
* **Request Body:**
  ```json
  {
    "ticker": "INFY",
    "quantity": 50,
    "average_price": "1520.50",
    "purchase_date": "2026-03-10"
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e5f6a7b8-9012-3456-ef01-567890123457",
      "portfolio_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "company": {
        "id": "f6a7b890-1234-5678-f012-678901234568",
        "ticker": "INFY",
        "name": "Infosys Limited",
        "exchange": "NSE"
      },
      "quantity": 50,
      "average_price": "1520.50",
      "purchase_date": "2026-03-10"
    }
  }
  ```
* **Error Cases:**
  * `422 Validation Error`: Quantity is non-positive or ticker is unknown.

---

### `PATCH /api/v1/holdings/{holding_id}`
* **Purpose:** Update holding share quantity or purchase details.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `holding_id` (UUID).
* **Request Body:**
  ```json
  {
    "quantity": 60,
    "average_price": "1510.00"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e5f6a7b8-9012-3456-ef01-567890123457",
      "portfolio_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "company": {
        "ticker": "INFY",
        "name": "Infosys Limited"
      },
      "quantity": 60,
      "average_price": "1510.00",
      "purchase_date": "2026-03-10"
    }
  }
  ```

---

### `DELETE /api/v1/holdings/{holding_id}`
* **Purpose:** Remove a holding from a portfolio.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `holding_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Holding deleted successfully."
    }
  }
  ```

---

## 15. Dividend Event & Payment Endpoints

### `GET /api/v1/dividends`
* **Purpose:** Search and list dividend events.
* **Authentication:** Required (Bearer Token).
* **Query Parameters:**
  * `company_ticker` (string, optional): Filter by ticker (e.g. `"TCS"`).
  * `status` (string, optional): `announced`, `scheduled`, `paid`, `cancelled`.
  * `validation_status` (string, optional): `valid`, `conflict`, `stale`, `unverified`.
  * `page` (int), `limit` (int).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "f6a7b890-1234-5678-f012-678901234567",
        "company": {
          "ticker": "TCS",
          "name": "Tata Consultancy Services Ltd"
        },
        "event_type": "interim",
        "dividend_per_share": "10.00",
        "currency": "INR",
        "announcement_date": "2026-09-15",
        "ex_date": "2026-10-10",
        "record_date": "2026-10-11",
        "payment_date": "2026-10-25",
        "business_status": "announced",
        "validation_status": "valid",
        "is_demo_data": true,
        "last_validated_at": "2026-09-26T14:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
  ```

---

### `GET /api/v1/dividends/{event_id}`
* **Purpose:** Detailed event view including source provenance, calculation formula, and validation status.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `event_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "f6a7b890-1234-5678-f012-678901234567",
      "company": {
        "ticker": "TCS",
        "name": "Tata Consultancy Services Ltd"
      },
      "event_type": "interim",
      "dividend_per_share": "10.00",
      "currency": "INR",
      "dates": {
        "announcement_date": "2026-09-15",
        "ex_date": "2026-10-10",
        "record_date": "2026-10-11",
        "payment_date": "2026-10-25"
      },
      "business_status": "announced",
      "validation_status": "valid",
      "is_demo_data": true,
      "calculation": {
        "eligible_shares": 25,
        "dividend_per_share": "10.00",
        "estimated_gross_amount": "250.00",
        "formula": "25 eligible shares × ₹10.00 DPS",
        "calculation_status": "calculated",
        "calculated_at": "2026-09-26T15:30:00Z"
      },
      "sources": [
        {
          "id": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
          "source_name": "BSE Official Disclosure",
          "source_url": "https://www.bseindia.com/demo",
          "observed_dps": "10.00",
          "observed_at": "2026-09-26T10:00:00Z"
        }
      ]
    }
  }
  ```

---

### `POST /api/v1/dividends/{event_id}/payment-reports`
* **Purpose:** User records an actual received payment for a dividend event.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `event_id` (UUID).
* **Request Body:**
  ```json
  {
    "amount_received": "250.00",
    "received_date": "2026-10-26",
    "notes": "Credited directly to bank account."
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "77777777-8888-9999-0000-111122223333",
      "event_id": "f6a7b890-1234-5678-f012-678901234567",
      "amount_received": "250.00",
      "received_date": "2026-10-26",
      "status": "received_user_reported",
      "notes": "Credited directly to bank account.",
      "created_at": "2026-10-26T16:00:00Z"
    }
  }
  ```

---

## 16. Dashboard & Overview Endpoints

### `GET /api/v1/dashboard/overview`
* **Purpose:** Ingest complete overview statistics, upcoming dividend events, data health badge count, and agent pipeline summary in a single call.
* **Authentication:** Required (Bearer Token).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "is_demo_data": true,
      "metrics": {
        "expected_income_fy": "1450.00",
        "received_income_fy": "800.00",
        "upcoming_30_days": "400.00",
        "currency": "INR"
      },
      "upcoming_events": [
        {
          "event_id": "f6a7b890-1234-5678-f012-678901234567",
          "company_ticker": "TCS",
          "company_name": "Tata Consultancy Services Ltd",
          "ex_date": "2026-10-10",
          "dividend_per_share": "10.00",
          "eligible_shares": 25,
          "estimated_gross_amount": "250.00",
          "status": "announced"
        }
      ],
      "alerts_count": 1,
      "agent_system_health": "healthy",
      "last_updated_at": "2026-09-26T15:30:00Z"
    }
  }
  ```

---

## 17. Calendar Endpoints

### `GET /api/v1/calendar`
* **Purpose:** Date-ordered timeline of dividend events relevant to user holdings.
* **Authentication:** Required (Bearer Token).
* **Query Parameters:**
  * `start_date` (ISO date, optional): e.g. `"2026-09-01"`.
  * `end_date` (ISO date, optional): e.g. `"2026-12-31"`.
  * `portfolio_id` (UUID, optional).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "event_id": "f6a7b890-1234-5678-f012-678901234567",
        "company_ticker": "TCS",
        "date": "2026-10-10",
        "date_type": "ex_date",
        "dividend_per_share": "10.00",
        "estimated_gross_amount": "250.00",
        "validation_status": "valid",
        "business_status": "announced"
      },
      {
        "event_id": "f6a7b890-1234-5678-f012-678901234567",
        "company_ticker": "TCS",
        "date": "2026-10-25",
        "date_type": "payment_date",
        "dividend_per_share": "10.00",
        "estimated_gross_amount": "250.00",
        "validation_status": "valid",
        "business_status": "scheduled"
      }
    ]
  }
  ```

---

## 18. Agent Monitoring & Alert Endpoints

### `GET /api/v1/agents`
* **Purpose:** Monitor active swarm processes, heartbeats, and current tasks.
* **Authentication:** Required (Bearer Token).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "agent_id": "collector-agent-1",
        "name": "Data Collection Agent",
        "role": "Ingest source observations",
        "status": "online",
        "last_heartbeat": "2026-09-26T15:29:55Z",
        "current_task": "Idle",
        "is_simulated": true
      },
      {
        "agent_id": "validator-agent-1",
        "name": "Data Validation Agent",
        "role": "Detect conflicts and duplicates",
        "status": "online",
        "last_heartbeat": "2026-09-26T15:29:58Z",
        "current_task": "Validating INFY event observation",
        "is_simulated": true
      }
    ]
  }
  ```

---

### `GET /api/v1/agents/runs`
* **Purpose:** Activity stream of agent workflow processing runs.
* **Authentication:** Required (Bearer Token).
* **Query Parameters:** `limit` (int, default 20).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "run_id": "r111-222-333",
        "task_id": "task-validate-tcs-001",
        "correlation_id": "corr-wf-999",
        "agent_name": "Data Validation Agent",
        "status": "completed",
        "summary": "Validated TCS dividend observation with 0 conflicts.",
        "started_at": "2026-09-26T15:25:00Z",
        "completed_at": "2026-09-26T15:25:02Z"
      }
    ]
  }
  ```

---

### `POST /api/v1/agents/trigger`
* **Purpose:** Trigger a fresh data collection/validation cycle.
* **Authentication:** Required (Bearer Token).
* **Response Body (202 Accepted):**
  ```json
  {
    "success": true,
    "data": {
      "correlation_id": "corr-wf-1000",
      "message": "Swarm data refresh cycle dispatched."
    }
  }
  ```

---

### `POST /api/v1/agents/{agent_id}/simulate-failure`
* **Purpose:** Demo control: Force an agent offline to test monitoring and task reassignment.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `agent_id` (string).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "agent_id": "collector-agent-1",
      "status": "offline",
      "message": "Agent marked offline for demo simulation."
    }
  }
  ```

---

### `POST /api/v1/agents/{agent_id}/restart`
* **Purpose:** Demo control: Restart a stopped agent worker.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `agent_id` (string).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "agent_id": "collector-agent-1",
      "status": "online",
      "message": "Agent restarted successfully."
    }
  }
  ```

---

### `GET /api/v1/alerts`
* **Purpose:** Retrieve active data quality alerts (conflicts, stale data, missing attributes).
* **Authentication:** Required (Bearer Token).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "alert-111-222",
        "event_id": "f6a7b890-1234-5678-f012-678901234567",
        "company_ticker": "INFY",
        "alert_type": "conflict",
        "description": "BSE reports ₹18.00 DPS while NSE reports ₹20.00 DPS.",
        "is_resolved": false,
        "observations": [
          {
            "source_name": "BSE Disclosure",
            "observed_dps": "18.00",
            "observed_at": "2026-09-25T12:00:00Z"
          },
          {
            "source_name": "NSE Disclosure",
            "observed_dps": "20.00",
            "observed_at": "2026-09-25T12:05:00Z"
          }
        ],
        "created_at": "2026-09-25T12:10:00Z"
      }
    ]
  }
  ```

---

### `POST /api/v1/alerts/{alert_id}/resolve`
* **Purpose:** Resolve a data quality alert with an explicit resolution choice and audit note.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `alert_id` (UUID).
* **Request Body:**
  ```json
  {
    "selected_source_id": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
    "resolution_notes": "Verified against official company PDF filing."
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "alert_id": "alert-111-222",
      "is_resolved": true,
      "resolution_notes": "Verified against official company PDF filing.",
      "resolved_at": "2026-09-26T15:35:00Z"
    }
  }
  ```

---

### `POST /api/v1/demo/reset`
* **Purpose:** Reset application data and agent runs to the initial deterministic demo state.
* **Authentication:** Required (Bearer Token).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Demo data state successfully reset."
    }
  }
  ```

---

## 19. Explanation Endpoints

### `GET /api/v1/explanations/event/{event_id}`
* **Purpose:** Retrieve plain-language explanation for a dividend calculation and event status.
* **Authentication:** Required (Bearer Token).
* **Request Path Parameters:** `event_id` (UUID).
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "event_id": "f6a7b890-1234-5678-f012-678901234567",
      "company_ticker": "TCS",
      "explanation_text": "Based on your 25 shares of TCS, your estimated interim dividend is ₹250.00. This is calculated as 25 shares × ₹10.00 per share announced on 15 Sep 2026. The ex-dividend date is 10 Oct 2026. Data verified from BSE Official Disclosure.",
      "provider_used": "template",
      "generated_at": "2026-09-26T15:30:00Z"
    }
  }
  ```

---

## Frontend Integration Checklist

To ensure seamless frontend integration in Cursor without backend code inspection:

- [ ] **Base URL Setup:** Configure Axios/Fetch instance to target `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).
- [ ] **Auth Interceptor:** Attach `Authorization: Bearer <access_token>` to every request when logged in.
- [ ] **Token Expiry Handler:** Automatically redirect to `/login` if API returns HTTP `401 Unauthorized`.
- [ ] **Envelope Unwrapping:** Always read payload from `response.data.data` (and collection pagination from `response.data.meta`).
- [ ] **Error Toast Binding:** Parse error text from `response.data.error.message` for user-facing toasts/alerts.
- [ ] **Date Parsing:** Use ISO date string formatters for `YYYY-MM-DD` calendar dates; avoid timezone-offset shifting.
- [ ] **Currency Rendering:** Format numeric string fields (`"250.00"`) using `₹` prefix and Indian locale number formatting (`₹250.00`).
- [ ] **Demo Mode Banner:** Display "Hypothetical Demo Data" badge when `is_demo_data === true` on Overview or Event responses.
