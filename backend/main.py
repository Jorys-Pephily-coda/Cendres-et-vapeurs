from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.database import init_db
from app.routers import (
    auth,
    users,
    products,
    orders,
    votes,
    contact,
    calendar,
    logs,
    chat_ws,
    toxicity,
    market,
    communications,
)

load_dotenv()

app = FastAPI(
    title="Cendres et Vapeur — API",
    description="API REST de la zone franche post-apocalyptique.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router,           prefix="/auth",           tags=["Auth"])
app.include_router(users.router,          prefix="/users",          tags=["Users"])
app.include_router(products.router,       prefix="/products",       tags=["Products"])
app.include_router(orders.router,         prefix="/orders",         tags=["Orders"])
app.include_router(votes.router,          prefix="/votes",          tags=["Votes"])
app.include_router(contact.router,        prefix="/contact",        tags=["Contact"])
app.include_router(calendar.router,       prefix="/calendar",       tags=["Calendar"])
app.include_router(logs.router,           prefix="/logs",           tags=["Logs"])
app.include_router(toxicity.router,       prefix="/toxicity",       tags=["Toxicity"])
app.include_router(market.router,         prefix="/market",         tags=["Market"])
app.include_router(communications.router, prefix="/communications", tags=["Communications"])
app.include_router(chat_ws.router, tags=["Chat"])

@app.get("/health", tags=["Health"])
def health():
    return {"status": "operational", "colony": "Cendres et Vapeur"}