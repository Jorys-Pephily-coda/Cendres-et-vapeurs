from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_verified_user, require_role, log_action

router = APIRouter()


# ── POST /orders/check-discount ───────────────────────────────────────────────

@router.post("/check-discount", response_model=schemas.DiscountOut)
def check_discount(
    payload: schemas.DiscountCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    dc = (
        db.query(models.DiscountCode)
        .filter(models.DiscountCode.code == payload.code)
        .first()
    )
    if not dc:
        raise HTTPException(status_code=404, detail="Code de réduction invalide.")
    if dc.uses >= dc.max_uses:
        raise HTTPException(status_code=400, detail="Code de réduction épuisé.")

    return schemas.DiscountOut(code=dc.code, percent=dc.percent)


# ── POST /orders ──────────────────────────────────────────────────────────────

@router.post("/", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Le panier est vide.")

    # Résoudre les produits et calculer le sous-total
    subtotal = 0.0
    order_items = []

    for item_in in payload.items:
        product = db.query(models.Product).filter(
            models.Product.id == item_in.product_id
        ).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Produit #{item_in.product_id} introuvable.",
            )
        if product.stock < item_in.qty:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour '{product.name}' (dispo : {product.stock}).",
            )

        subtotal += product.price * item_in.qty
        order_items.append((product, item_in.qty, product.price))

    # Appliquer le code de réduction
    discount_amount = 0.0
    discount_code_str = None

    if payload.discount_code:
        dc = db.query(models.DiscountCode).filter(
            models.DiscountCode.code == payload.discount_code
        ).first()
        if dc and dc.uses < dc.max_uses:
            discount_amount = round(subtotal * (dc.percent / 100), 2)
            dc.uses += 1
            discount_code_str = dc.code

    total = round(subtotal - discount_amount, 2)

    # Créer la commande
    order = models.Order(
        user_id=current_user.id,
        total=total,
        discount_amount=discount_amount,
        discount_code=discount_code_str,
        status="confirmed",
    )
    db.add(order)
    db.flush()  # obtenir order.id sans commit

    # Créer les lignes de commande + décrémenter le stock
    for product, qty, unit_price in order_items:
        item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            qty=qty,
            unit_price=unit_price,
        )
        db.add(item)
        product.stock -= qty
        product.sales += qty

    db.commit()
    db.refresh(order)

    log_action(db, "purchase", current_user.id, f"Order#{order.id}")

    # Construire la réponse enrichie
    return _build_order_out(order, db)


# ── GET /orders ───────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=list[schemas.OrderOut],
    dependencies=[Depends(require_role("admin"))],
)
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).all()
    return [_build_order_out(o, db) for o in orders]


# ── GET /orders/mine ──────────────────────────────────────────────────────────

@router.get("/mine", response_model=list[schemas.OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.id.desc())
        .all()
    )
    return [_build_order_out(o, db) for o in orders]


# ── PATCH /orders/{order_id} ──────────────────────────────────────────────────

@router.patch(
    "/{order_id}",
    response_model=schemas.OrderOut,
    dependencies=[Depends(require_role("admin"))],
)
def update_order(
    order_id: int,
    payload: schemas.OrderUpdate,
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _build_order_out(order, db)


# ── Utilitaire ────────────────────────────────────────────────────────────────

def _build_order_out(order: models.Order, db: Session) -> schemas.OrderOut:
    """Construit un OrderOut avec user_email et product_name enrichis."""
    user_email = order.user.email if order.user else None

    items_out = []
    for item in order.items:
        product_name = None
        if item.product_id:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            product_name = product.name if product else None

        items_out.append(schemas.OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=product_name,
            qty=item.qty,
            unit_price=item.unit_price,
        ))

    return schemas.OrderOut(
        id=order.id,
        user_id=order.user_id,
        user_email=user_email,
        total=order.total,
        discount_amount=order.discount_amount,
        discount_code=order.discount_code,
        status=order.status,
        created_at=order.created_at,
        items=items_out,
    )