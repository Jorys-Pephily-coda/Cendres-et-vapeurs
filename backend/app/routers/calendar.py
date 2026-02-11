from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_verified_user, require_role, log_action

router = APIRouter()


# ══════════════════════════════════════
# ÉVÉNEMENTS
# ══════════════════════════════════════

# ── GET /calendar/events ──────────────────────────────────────────────────────

@router.get("/events", response_model=list[schemas.EventOut])
def list_events(
    year:  int = Query(...),
    month: int = Query(...),
    db:    Session = Depends(get_db),
):
    # Filtrer par année et mois via le champ date (format YYYY-MM-DD)
    prefix = f"{year}-{str(month).zfill(2)}"
    events = (
        db.query(models.Event)
        .filter(models.Event.date.like(f"{prefix}%"))
        .order_by(models.Event.date)
        .all()
    )
    return events


# ── POST /calendar/events ─────────────────────────────────────────────────────

@router.post(
    "/events",
    response_model=schemas.EventOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("editor", "admin"))],
)
def create_event(
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("editor", "admin")),
):
    event = models.Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    log_action(db, "event_created", current_user.id, event.title)
    return event


# ── DELETE /calendar/events/{event_id} ───────────────────────────────────────

@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("editor", "admin"))],
)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement introuvable.")
    db.delete(event)
    db.commit()


# ══════════════════════════════════════
# NOTES DE QUART
# ══════════════════════════════════════

# ── GET /calendar/notes ───────────────────────────────────────────────────────

@router.get("/notes", response_model=list[schemas.ShiftNoteOut])
def list_notes(
    date: str = Query(..., description="Format YYYY-MM-DD"),
    db:   Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    notes = (
        db.query(models.ShiftNote)
        .filter(
            models.ShiftNote.user_id == current_user.id,
            models.ShiftNote.date    == date,
        )
        .order_by(models.ShiftNote.shift)
        .all()
    )
    return notes


# ── POST /calendar/notes ──────────────────────────────────────────────────────

@router.post(
    "/notes",
    response_model=schemas.ShiftNoteOut,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    payload: schemas.ShiftNoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    note = models.ShiftNote(
        user_id=current_user.id,
        date=payload.date,
        shift=payload.shift,
        content=payload.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    log_action(db, "note_added", current_user.id, f"{payload.date} {payload.shift}")
    return note


# ── DELETE /calendar/notes/{note_id} ─────────────────────────────────────────

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    note = db.query(models.ShiftNote).filter(models.ShiftNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note introuvable.")
    if note.user_id != current_user.id and current_user.role not in ("admin", "editor"):
        raise HTTPException(status_code=403, detail="Accès refusé.")
    db.delete(note)
    db.commit()