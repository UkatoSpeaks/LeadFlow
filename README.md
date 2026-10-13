# LeadFlow

A single-screen lead management tool: track leads, log every discussion, and set follow-up reminders.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Database:** PostgreSQL

## Project structure

```
LeadFlow/
├── backend/    FastAPI application
└── frontend/   Next.js application
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ running locally

## Setup

### 1. Database

Create an empty database:

```sql
CREATE DATABASE leadflow_db;
```

### 2. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # macOS/Linux: cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials, then create the tables and start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000. Check http://localhost:8000/health to confirm the database connection; interactive docs are at http://localhost:8000/docs.

### 3. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000.

## Environment variables

| File | Variable | Description |
|---|---|---|
| `backend/.env` | `DB_HOST` | PostgreSQL host |
| `backend/.env` | `DB_PORT` | PostgreSQL port |
| `backend/.env` | `DB_USER` | PostgreSQL user |
| `backend/.env` | `DB_PASSWORD` | PostgreSQL password |
| `backend/.env` | `DB_NAME` | Database name |
| `backend/.env` | `CORS_ORIGINS` | Comma-separated origins allowed to call the API |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | Base URL of the API |
