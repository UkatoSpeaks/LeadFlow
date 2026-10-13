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

Optionally load sample data (8 leads with discussions, including follow-ups that are due today, overdue and upcoming):

```powershell
python seed.py
```

`python seed.py --reset` deletes all existing leads and discussions first.

The API runs at http://localhost:8000. Check http://localhost:8000/health to confirm the database connection; interactive docs are at http://localhost:8000/docs.

### 3. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000.

## API

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/health` | API and database check | 200 | 503 |
| GET | `/leads` | List leads; optional `status` and `search` query parameters | 200 | 422 |
| POST | `/leads` | Create a lead | 201 | 422 |
| GET | `/leads/{id}` | Get one lead | 200 | 404, 422 |
| PATCH | `/leads/{id}` | Update a lead's status | 200 | 404, 422 |
| GET | `/leads/{id}/discussions` | List a lead's discussions, newest first | 200 | 404, 422 |
| POST | `/leads/{id}/discussions` | Add a discussion, optionally with a follow-up date | 201 | 404, 422 |

Status values are `new`, `contacted`, `qualified`, `proposal_sent`, `won` and `lost`.

Every lead in a response carries `last_note` and `last_discussion_at`, taken from its most recent discussion. Follow-up dates must include a timezone offset, for example `2026-10-14T10:30:00+05:30`.

A lead's `next_follow_up_at` always mirrors its latest discussion: saving a discussion with a follow-up date sets it, and saving one without a date clears it, which is how a follow-up is marked as done.

Every error uses the same shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "fields": [{ "field": "name", "message": "String should have at least 1 character" }]
  }
}
```

`fields` is only present on validation errors.

## Tests

```powershell
cd backend
venv\Scripts\activate
pytest
```

The tests run against the database configured in `backend/.env`. Each test runs inside a transaction that is rolled back, so no test data is left behind.

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
