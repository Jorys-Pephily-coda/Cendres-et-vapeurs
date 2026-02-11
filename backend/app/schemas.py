from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ══════════════════════════════════════
# AUTH
# ══════════════════════════════════════

class RegisterRequest(BaseModel):
    email:    EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères.")
        return v


class LoginRequest(BaseModel):
    email:    str
    password: str


class VerifyOtpRequest(BaseModel):
    email: str
    code:  str


class ResendOtpRequest(BaseModel):
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         "UserPublic"


# ══════════════════════════════════════
# USERS
# ══════════════════════════════════════

class UserPublic(BaseModel):
    id:          int
    email:       str
    role:        str
    is_verified: bool
    created_at:  str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    role: Optional[str] = None

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        allowed = {"guest", "user", "editor", "admin"}
        if v not in allowed:
            raise ValueError(f"Rôle invalide. Valeurs acceptées : {allowed}")
        return v


# ══════════════════════════════════════
# PRODUCTS
# ══════════════════════════════════════

class ProductCreate(BaseModel):
    name:        str
    description: Optional[str] = None
    price:       float
    stock:       int
    image_url:   Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Le prix ne peut pas être négatif.")
        return v

    @field_validator("stock")
    @classmethod
    def stock_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Le stock ne peut pas être négatif.")
        return v


class ProductUpdate(BaseModel):
    name:        Optional[str]   = None
    description: Optional[str]   = None
    price:       Optional[float] = None
    stock:       Optional[int]   = None
    image_url:   Optional[str]   = None


class ProductOut(BaseModel):
    id:             int
    name:           str
    description:    Optional[str]
    price:          float
    stock:          int
    image_url:      Optional[str]
    likes:          int
    views:          int
    sales:          int
    price_modifier: float
    created_at:     str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# VOTES
# ══════════════════════════════════════

class VoteOut(BaseModel):
    id:         int
    user_id:    int
    product_id: int
    created_at: str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# DISCOUNT CODES
# ══════════════════════════════════════

class DiscountCheckRequest(BaseModel):
    code: str


class DiscountOut(BaseModel):
    code:    str
    percent: float


# ══════════════════════════════════════
# ORDERS
# ══════════════════════════════════════

class OrderItemIn(BaseModel):
    product_id: int
    qty:        int

    @field_validator("qty")
    @classmethod
    def qty_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("La quantité doit être supérieure à 0.")
        return v


class OrderCreate(BaseModel):
    items:         list[OrderItemIn]
    discount_code: Optional[str] = None


class OrderUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = {"pending", "confirmed", "shipped", "cancelled"}
        if v not in allowed:
            raise ValueError(f"Statut invalide. Valeurs acceptées : {allowed}")
        return v


class OrderItemOut(BaseModel):
    id:           int
    product_id:   Optional[int]
    product_name: Optional[str] = None
    qty:          int
    unit_price:   float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id:              int
    user_id:         Optional[int]
    user_email:      Optional[str] = None
    total:           float
    discount_amount: float
    discount_code:   Optional[str]
    status:          str
    created_at:      str
    items:           list[OrderItemOut] = []

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# CALENDRIER
# ══════════════════════════════════════

class EventCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    type:        str = "general"
    date:        str


class EventOut(BaseModel):
    id:          int
    title:       str
    description: Optional[str]
    type:        str
    date:        str
    created_at:  str

    model_config = {"from_attributes": True}


class ShiftNoteCreate(BaseModel):
    date:    str
    shift:   str
    content: str

    @field_validator("shift")
    @classmethod
    def valid_shift(cls, v: str) -> str:
        if v not in {"AM", "PM"}:
            raise ValueError("Le quart doit être 'AM' ou 'PM'.")
        return v


class ShiftNoteOut(BaseModel):
    id:         int
    user_id:    int
    date:       str
    shift:      str
    content:    str
    created_at: str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# LOGS
# ══════════════════════════════════════

class ActionLogOut(BaseModel):
    id:         int
    user_id:    Optional[int]
    user_email: Optional[str] = None
    action:     str
    entity:     Optional[str]
    created_at: str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# CONTACT
# ══════════════════════════════════════

class ContactRequest(BaseModel):
    name:    str
    email:   EmailStr
    subject: str
    message: str


# ══════════════════════════════════════
# CHAT
# ══════════════════════════════════════

class ChatMessageOut(BaseModel):
    id:           int
    sender_id:    int
    sender_email: Optional[str] = None
    content:      str
    created_at:   str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════
# TOXICITÉ & MARCHÉ
# ══════════════════════════════════════

class ToxicityOut(BaseModel):
    level:     float
    threshold: float = 70.0
    alert:     bool


class MarketProductOut(BaseModel):
    id:             int
    name:           str
    price:          float
    price_modifier: float
    views:          int
    sales:          int

    model_config = {"from_attributes": True}


# Résolution des forward references
TokenResponse.model_rebuild()