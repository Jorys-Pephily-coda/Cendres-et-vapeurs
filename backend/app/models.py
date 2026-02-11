from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


# ── Utilisateurs ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(String, nullable=False, default="user")
    is_verified   = Column(Boolean, nullable=False, default=False)
    created_at    = Column(String, nullable=False, default=func.datetime("now"))

    otp_codes     = relationship("OtpCode",     back_populates="user", cascade="all, delete")
    sessions      = relationship("Session",     back_populates="user", cascade="all, delete")
    orders        = relationship("Order",       back_populates="user")
    votes         = relationship("Vote",        back_populates="user", cascade="all, delete")
    shift_notes   = relationship("ShiftNote",   back_populates="user", cascade="all, delete")
    action_logs   = relationship("ActionLog",   back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="sender", cascade="all, delete")


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code       = Column(String, nullable=False)
    created_at = Column(String, nullable=False, default=func.datetime("now"))
    used       = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="otp_codes")


class Session(Base):
    __tablename__ = "sessions"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token      = Column(String, unique=True, nullable=False)
    expires_at = Column(String, nullable=False)
    created_at = Column(String, nullable=False, default=func.datetime("now"))

    user = relationship("User", back_populates="sessions")


# ── Catalogue ─────────────────────────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    description    = Column(Text)
    price          = Column(Float, nullable=False)
    stock          = Column(Integer, nullable=False, default=0)
    image_url      = Column(String)
    likes          = Column(Integer, nullable=False, default=0)
    views          = Column(Integer, nullable=False, default=0)
    sales          = Column(Integer, nullable=False, default=0)
    price_modifier = Column(Float, nullable=False, default=0)
    created_at     = Column(String, nullable=False, default=func.datetime("now"))

    votes       = relationship("Vote",      back_populates="product", cascade="all, delete")
    order_items = relationship("OrderItem", back_populates="product")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "product_id"),)

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(String, nullable=False, default=func.datetime("now"))

    user    = relationship("User",    back_populates="votes")
    product = relationship("Product", back_populates="votes")


# ── Commandes ────────────────────────────────────────────────────────────────

class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id       = Column(Integer, primary_key=True, index=True)
    code     = Column(String, unique=True, nullable=False)
    percent  = Column(Float, nullable=False)
    max_uses = Column(Integer, nullable=False, default=1)
    uses     = Column(Integer, nullable=False, default=0)


class Order(Base):
    __tablename__ = "orders"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    total           = Column(Float, nullable=False)
    discount_amount = Column(Float, nullable=False, default=0)
    discount_code   = Column(String)
    status          = Column(String, nullable=False, default="pending")
    created_at      = Column(String, nullable=False, default=func.datetime("now"))

    user  = relationship("User",      back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id",   ondelete="CASCADE"),  nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    qty        = Column(Integer, nullable=False)
    unit_price = Column(Float,   nullable=False)

    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ── Calendrier ───────────────────────────────────────────────────────────────

class Event(Base):
    __tablename__ = "events"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text)
    type        = Column(String, nullable=False, default="general")
    date        = Column(String, nullable=False, index=True)
    created_at  = Column(String, nullable=False, default=func.datetime("now"))


class ShiftNote(Base):
    __tablename__ = "shift_notes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date       = Column(String, nullable=False, index=True)
    shift      = Column(String, nullable=False)   # 'AM' | 'PM'
    content    = Column(Text,   nullable=False)
    created_at = Column(String, nullable=False, default=func.datetime("now"))

    user = relationship("User", back_populates="shift_notes")


# ── Logs ─────────────────────────────────────────────────────────────────────

class ActionLog(Base):
    __tablename__ = "action_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action     = Column(String, nullable=False)
    entity     = Column(String)
    created_at = Column(String, nullable=False, default=func.datetime("now"))

    user = relationship("User", back_populates="action_logs")


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True, index=True)
    sender_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content    = Column(Text,   nullable=False)
    created_at = Column(String, nullable=False, default=func.datetime("now"))

    sender = relationship("User", back_populates="chat_messages")


# ── Conversations Contact ────────────────────────────────────────────────────

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id          = Column(Integer, primary_key=True, index=True)
    thread_id   = Column(String, nullable=False, index=True)  # identifiant de conversation
    sender_type = Column(String, nullable=False)  # 'user' ou 'editor'
    sender_email = Column(String, nullable=False)
    subject     = Column(String)
    content     = Column(Text, nullable=False)
    created_at  = Column(String, nullable=False, default=func.datetime("now"))