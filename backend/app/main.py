from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.errors import register_error_handlers
from app.routers import discussions, leads

settings = get_settings()

app = FastAPI(title="LeadFlow API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(leads.router)
app.include_router(discussions.router)


@app.get("/health", tags=["health"])
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    # A failed connection raises OperationalError, which the error handlers turn into a 503.
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
