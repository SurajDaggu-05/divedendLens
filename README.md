# DividendLens 💎

> Swarm-Inspired Dividend Income Tracker for Indian Stock Investors.

DividendLens is a full-stack, fintech-grade SaaS application designed to calculate, track, and verify dividend income streams across Indian equities (NSE/BSE) using a distributed agent swarm architecture.

---

## 🚀 Live Public Deployment Setup

### 1. Backend Deployment (Render)
The backend is packaged for deployment on [Render](https://render.com) using the included `render.yaml` Blueprint or manual web service setup.

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Endpoint**: `https://<your-backend-app>.onrender.com/health`
- **Environment Variables**:
  - `APP_ENV`: `production`
  - `DATABASE_URL`: `postgresql://<user>:<password>@<host>/<database>` (automatically provided by Render PostgreSQL)
  - `SECRET_KEY`: `<secure-random-string>`
  - `JWT_SECRET_KEY`: `<secure-random-string>`
  - `FRONTEND_URL`: `https://<your-frontend-app>.vercel.app`

### 2. Frontend Deployment (Vercel)
The React SPA is configured for [Vercel](https://vercel.com) deployment with `frontend/vercel.json` rewrite rules.

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://<your-backend-app>.onrender.com/api/v1`

---

## 🔐 Demo Authenticated Accounts

The database automatically seeds five pre-configured authenticated accounts upon initial startup. Each account has its own password and personalized portfolio state.

| User Name | Email Address | Password |
| :--- | :--- | :--- |
| **Suraj** | `surajdaggu40@gmail.com` | `suraj40` |
| **Parvath** | `parvath06@gmail.com` | `parvath06` |
| **Sushanth** | `sushanth05@gmail.com` | `sushanth05` |
| **Kiran** | `kiran23@gmail.com` | `kiran23` |
| **Arjun Sharma** | `arjun@example.com` | `SecurePassword123!` |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas-Confetti, Axios.
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0, Pydantic v2, Argon2id Password Hashing (`argon2-cffi`), PyJWT.
- **Database**: PostgreSQL (Production) / SQLite (Development).
- **Swarm Agents**: Multi-agent consensus engine tracking dividend events, conflict resolution, date validation, and yield metrics.

---

## 💻 Local Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`. API Documentation is available at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend app will be running at `http://localhost:5173`.

---

## 🧪 Verification & Testing

- **Backend Pytest Suite**:
  ```bash
  cd backend
  pytest
  ```
- **Frontend Linting & Build**:
  ```bash
  cd frontend
  npm run lint
  npm run build
  ```
