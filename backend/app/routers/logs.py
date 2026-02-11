from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter()


# ── GET /logs ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.ActionLogOut])
def list_logs(
    page:  int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db:    Session = Depends(get_db),
):
    offset = (page - 1) * limit

    logs = (
        db.query(models.ActionLog)
        .order_by(models.ActionLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for log in logs:
        user_email = log.user.email if log.user else None
        result.append(schemas.ActionLogOut(
            id=log.id,
            user_id=log.user_id,
            user_email=user_email,
            action=log.action,
            entity=log.entity,
            created_at=log.created_at,
        ))

    return result