from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os, random, string, logging

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, log_action
from app.services.auth_service import hash_password, verify_password
from app.services.email_service import send_otp_email

load_dotenv()

logger = logging.getLogger(__name__)

SECRET_KEY           = os.getenv("SECRET_KEY", "changeme_super_secret")
ALGORITHM            = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE", 30))

router = APIRouter()


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def try_send_otp(email: str, code: str) -> None:
    try:
        await send_otp_email(email, code)
        logger.info(f"OTP envoyé à {email}")
    except Exception as e:
        logger.warning(
            f"[DEV] SMTP indisponible ({type(e).__name__}: {e}). "
            f"OTP pour {email} : {code}"
        )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé.")

    user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    code = generate_otp()
    otp  = models.OtpCode(user_id=user.id, code=code)
    db.add(otp)
    db.commit()

    await try_send_otp(payload.email, code)
    log_action(db, "register", user.id, payload.email)

    return {"message": "Compte créé. Vérifiez votre email pour le code OTP."}


@router.post("/verify-otp")
def verify_otp(payload: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    otp = (
        db.query(models.OtpCode)
        .filter(
            models.OtpCode.user_id == user.id,
            models.OtpCode.code    == payload.code,
            models.OtpCode.used    == False,
        )
        .order_by(models.OtpCode.id.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Code OTP invalide ou déjà utilisé.")

    created = datetime.fromisoformat(otp.created_at)
    # Rendre timezone-aware si nécessaire
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) - created > timedelta(minutes=10):
        raise HTTPException(status_code=400, detail="Code OTP expiré.")

    otp.used         = True
    user.is_verified = True
    db.commit()

    return {"message": "Compte vérifié avec succès. Vous pouvez vous connecter."}


@router.post("/resend-otp")
async def resend_otp(payload: schemas.ResendOtpRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Compte déjà vérifié.")

    code = generate_otp()
    otp  = models.OtpCode(user_id=user.id, code=code)
    db.add(otp)
    db.commit()

    await try_send_otp(payload.email, code)
    return {"message": "Nouveau code envoyé."}


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Identifiants incorrects.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Compte non vérifié.")

    token = create_access_token(user.id)
    log_action(db, "login", user.id, user.email)

    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserPublic.model_validate(user),
    )


@router.get("/me", response_model=schemas.UserPublic)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user