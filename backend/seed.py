"""
seed.py — Données de démonstration pour Cendres et Vapeur
Lancer depuis le dossier backend/ : python seed.py
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import SessionLocal, init_db
from app import models
from app.services.auth_service import hash_password
from datetime import datetime, timedelta
import random

db = SessionLocal()
init_db()


# ══════════════════════════════════════
# UTILITAIRES
# ══════════════════════════════════════

def now_minus(days=0, hours=0):
    return (datetime.utcnow() - timedelta(days=days, hours=hours)).isoformat()

def date_offset(days=0):
    return (datetime.utcnow() + timedelta(days=days)).strftime("%Y-%m-%d")


# ══════════════════════════════════════
# NETTOYAGE
# ══════════════════════════════════════

print("🗑  Nettoyage des tables...")
db.query(models.ChatMessage).delete()
db.query(models.ActionLog).delete()
db.query(models.ShiftNote).delete()
db.query(models.Event).delete()
db.query(models.OrderItem).delete()
db.query(models.Order).delete()
db.query(models.Vote).delete()
db.query(models.DiscountCode).delete()
db.query(models.Product).delete()
db.query(models.OtpCode).delete()
db.query(models.Session).delete()
db.query(models.User).delete()
db.commit()
print("✓  Tables nettoyées.\n")


# ══════════════════════════════════════
# UTILISATEURS
# ══════════════════════════════════════

print("👤 Création des utilisateurs...")

users_data = [
    {"email": "admin@colony.local",   "password": "Admin1234!",   "role": "admin"},
    {"email": "editor@colony.local",  "password": "Editor1234!",  "role": "editor"},
    {"email": "johann@colony.local",  "password": "Johann1234!",  "role": "user"},
    {"email": "mira@colony.local",    "password": "Mira1234!",    "role": "user"},
    {"email": "rex@colony.local",     "password": "Rex1234!",     "role": "user"},
    {"email": "voss@colony.local",    "password": "Voss1234!",    "role": "user"},
    {"email": "lyra@colony.local",    "password": "Lyra1234!",    "role": "user"},
    {"email": "guest@colony.local",   "password": "Guest1234!",   "role": "guest"},
]

users = []
for u in users_data:
    user = models.User(
        email=u["email"],
        password_hash=hash_password(u["password"]),
        role=u["role"],
        is_verified=True,
        created_at=now_minus(days=random.randint(1, 30)),
    )
    db.add(user)
    users.append(user)

db.commit()
for u in users:
    db.refresh(u)

admin  = users[0]
editor = users[1]
members = users[2:7]

print(f"✓  {len(users)} utilisateurs créés.")
print("   Comptes disponibles :")
for u in users_data:
    print(f"   → {u['email']} / {u['password']}  [{u['role']}]")
print()


# ══════════════════════════════════════
# PRODUITS
# ══════════════════════════════════════

print("📦 Création des produits...")

products_data = [
    {
        "name": "Filtre à air renforcé",
        "description": "Filtre triple couche résistant au soufre et aux particules fines. Durée de vie : 30 cycles.",
        "price": 49.99, "stock": 28, "likes": 42, "views": 187, "sales": 35,
    },
    {
        "name": "Ration de survie x7",
        "description": "Kit complet pour 7 jours. Enrichi en nutriments essentiels, compact et résistant à l'humidité.",
        "price": 29.99, "stock": 54, "likes": 38, "views": 220, "sales": 61,
    },
    {
        "name": "Lampe à vapeur portative",
        "description": "Éclairage autonome 12h grâce à son cœur de cuivre pressurisé. Résiste aux chocs et à la corrosion.",
        "price": 89.99, "stock": 12, "likes": 71, "views": 304, "sales": 19,
    },
    {
        "name": "Masque à gaz type IV",
        "description": "Protection niveau 4 contre les toxines atmosphériques. Joint silicone, compatible filtres standards.",
        "price": 74.99, "stock": 18, "likes": 55, "views": 261, "sales": 27,
    },
    {
        "name": "Kit de soudure cuivre",
        "description": "Alliage haute résistance pour réparations de canalisation et de chaudière. Inclut 3 buses interchangeables.",
        "price": 39.99, "stock": 33, "likes": 29, "views": 143, "sales": 44,
    },
    {
        "name": "Manuel de réparation",
        "description": "Guide complet d'entretien des chaudières à vapeur. 480 pages, illustrations techniques détaillées.",
        "price": 14.99, "stock": 97, "likes": 18, "views": 98, "sales": 52,
    },
    {
        "name": "Combinaison de protection",
        "description": "Tenue intégrale résistante aux acides et à la chaleur. Taille ajustable, joints renforcés aux articulations.",
        "price": 124.99, "stock": 7, "likes": 83, "views": 412, "sales": 11,
    },
    {
        "name": "Chargeur à manivelle",
        "description": "Générateur d'urgence 5W. Charge appareils USB et lampes basse consommation. Aucun carburant requis.",
        "price": 34.99, "stock": 41, "likes": 46, "views": 195, "sales": 38,
    },
    {
        "name": "Purificateur d'eau compact",
        "description": "Filtre céramique multi-stades. Traite jusqu'à 500L avant remplacement. Certifié zone toxique niveau 2.",
        "price": 59.99, "stock": 22, "likes": 64, "views": 289, "sales": 23,
    },
    {
        "name": "Câble d'acier tressé 10m",
        "description": "Résistance à la traction : 800kg. Gaines anti-corrosion, embouts en laiton coulé.",
        "price": 22.50, "stock": 65, "likes": 11, "views": 76, "sales": 29,
    },
    {
        "name": "Trousse médicale de campagne",
        "description": "Kit complet : antiseptiques, bandages, atelles, antidouleurs et guide de premiers secours.",
        "price": 44.99, "stock": 16, "likes": 57, "views": 233, "sales": 18,
    },
    {
        "name": "Carte topographique Zone Franche",
        "description": "Impression haute résistance, plastifiée. Échelle 1:50 000. Inclut les tunnels et accès souterrains.",
        "price": 9.99, "stock": 120, "likes": 22, "views": 167, "sales": 74,
    },
]

products = []
for p in products_data:
    product = models.Product(
        name=p["name"],
        description=p["description"],
        price=p["price"],
        stock=p["stock"],
        likes=p["likes"],
        views=p["views"],
        sales=p["sales"],
        price_modifier=round(random.uniform(-3, 3), 2),
        created_at=now_minus(days=random.randint(5, 60)),
    )
    db.add(product)
    products.append(product)

db.commit()
for p in products:
    db.refresh(p)

print(f"✓  {len(products)} produits créés.\n")


# ══════════════════════════════════════
# VOTES
# ══════════════════════════════════════

print("⭐ Création des votes...")

vote_count = 0
for user in members:
    voted_products = random.sample(products, k=random.randint(2, 6))
    for product in voted_products:
        existing = db.query(models.Vote).filter(
            models.Vote.user_id    == user.id,
            models.Vote.product_id == product.id,
        ).first()
        if not existing:
            vote = models.Vote(
                user_id=user.id,
                product_id=product.id,
                created_at=now_minus(days=random.randint(0, 15)),
            )
            db.add(vote)
            vote_count += 1

db.commit()
print(f"✓  {vote_count} votes créés.\n")


# ══════════════════════════════════════
# CODES DE RÉDUCTION
# ══════════════════════════════════════

print("🎟  Création des codes de réduction...")

discount_data = [
    {"code": "VAPEUR10",   "percent": 10,  "max_uses": 100},
    {"code": "COLONIE25",  "percent": 25,  "max_uses": 50},
    {"code": "SURVIE50",   "percent": 50,  "max_uses": 10},
    {"code": "GUILDE15",   "percent": 15,  "max_uses": 75},
    {"code": "BIENVENUE5", "percent": 5,   "max_uses": 200},
]

for d in discount_data:
    dc = models.DiscountCode(**d, uses=random.randint(0, d["max_uses"] // 3))
    db.add(dc)

db.commit()
print(f"✓  {len(discount_data)} codes créés : {', '.join(d['code'] for d in discount_data)}\n")


# ══════════════════════════════════════
# COMMANDES
# ══════════════════════════════════════

print("🛒 Création des commandes...")

statuses = ["confirmed", "confirmed", "confirmed", "shipped", "shipped", "pending", "cancelled"]
order_count = 0

for user in members:
    for _ in range(random.randint(1, 4)):
        nb_items    = random.randint(1, 3)
        order_prods = random.sample(products, k=nb_items)
        subtotal    = 0.0
        items_to_add = []

        for product in order_prods:
            qty        = random.randint(1, 3)
            unit_price = product.price
            subtotal  += unit_price * qty
            items_to_add.append((product, qty, unit_price))

        order = models.Order(
            user_id=user.id,
            total=round(subtotal, 2),
            discount_amount=0.0,
            status=random.choice(statuses),
            created_at=now_minus(days=random.randint(0, 20)),
        )
        db.add(order)
        db.flush()

        for product, qty, unit_price in items_to_add:
            item = models.OrderItem(
                order_id=order.id,
                product_id=product.id,
                qty=qty,
                unit_price=unit_price,
            )
            db.add(item)

        order_count += 1

db.commit()
print(f"✓  {order_count} commandes créées.\n")


# ══════════════════════════════════════
# ÉVÉNEMENTS CALENDRIER
# ══════════════════════════════════════

print("📅 Création des événements...")

events_data = [
    {"title": "Ravitaillement Secteur Nord",    "type": "supply",      "days": 2,   "description": "Livraison filtres, rations et matériel médical."},
    {"title": "Maintenance Chaudière C-7",      "type": "maintenance", "days": 4,   "description": "Arrêt programmé 6h-14h. Secteur C hors service."},
    {"title": "Couvre-feu Niveau 2",            "type": "curfew",      "days": 6,   "description": "Circulation interdite 22h-5h. Patrouilles actives."},
    {"title": "Ravitaillement Médical",         "type": "supply",      "days": 9,   "description": "Trousses, antidotes et équipements chirurgicaux."},
    {"title": "Inspection des filtres",         "type": "maintenance", "days": 11,  "description": "Remplacement obligatoire des filtres de ventilation."},
    {"title": "Couvre-feu Niveau 1",            "type": "curfew",      "days": 14,  "description": "Circulation restreinte 23h-4h."},
    {"title": "Ravitaillement Carburant",       "type": "supply",      "days": 16,  "description": "Distribution de combustible pour générateurs."},
    {"title": "Maintenance Réseau Vapeur",      "type": "maintenance", "days": 19,  "description": "Inspection générale des canalisations haute pression."},
    {"title": "Assemblée de la Guilde",         "type": "general",     "days": 21,  "description": "Réunion mensuelle obligatoire — Salle centrale, 18h."},
    {"title": "Ravitaillement Alimentaire",     "type": "supply",      "days": 23,  "description": "Distribution de rations pour les 15 prochains cycles."},
    # Événements passés
    {"title": "Alerte Toxique Zone Est",        "type": "curfew",      "days": -3,  "description": "Pic de soufre — évacuation secteurs E4 à E7."},
    {"title": "Maintenance Pompes Sud",         "type": "maintenance", "days": -7,  "description": "Remplacement joints haute pression, pompes S1-S4."},
    {"title": "Ravitaillement Eau Purifiée",    "type": "supply",      "days": -10, "description": "Distribution bonbonnes 20L, quota 2 par foyer."},
]

for e in events_data:
    event = models.Event(
        title=e["title"],
        type=e["type"],
        date=date_offset(e["days"]),
        description=e["description"],
        created_at=now_minus(days=abs(e["days"]) + 1),
    )
    db.add(event)

db.commit()
print(f"✓  {len(events_data)} événements créés.\n")


# ══════════════════════════════════════
# NOTES DE QUART
# ══════════════════════════════════════

print("📝 Création des notes de quart...")

notes_data = [
    {"shift": "AM", "content": "Pression chaudière C-7 stable à 4.2 bar. RAS côté filtration."},
    {"shift": "PM", "content": "Pic de toxicité détecté vers 19h — taux soufre 78%. Alerte déclenchée, filtres activés niveau 2."},
    {"shift": "AM", "content": "Livraison rations reçue. 240 unités stockées en chambre froide B. Inventaire validé."},
    {"shift": "PM", "content": "Tentative d'accès non autorisé porte Nord. Repoussée. Rapport transmis à la guilde."},
    {"shift": "AM", "content": "Remplacement filtre ventilation V-12. Ancien filtre saturé à 94%. Nouveau posé."},
    {"shift": "PM", "content": "Réunion quart — 3 absents non justifiés. À signaler au conseil."},
    {"shift": "AM", "content": "Générateur de secours testé. Autonomie estimée à 18h. Carburant à renouveler."},
    {"shift": "PM", "content": "Niveau eau purifiée : 340L restants. Ravitaillement prévu dans 3 cycles."},
    {"shift": "AM", "content": "Fissure détectée sur canalisation vapeur secteur B. Soudure temporaire effectuée."},
    {"shift": "PM", "content": "Couvre-feu respecté. 2 avertissements distribués. Nuit calme."},
    {"shift": "AM", "content": "Formation premiers secours — 8 techniciens certifiés aujourd'hui."},
    {"shift": "PM", "content": "Anomalie capteur toxicité zone E. Remplacement prévu demain matin."},
]

note_count = 0
for i, note in enumerate(notes_data):
    user = random.choice(members)
    days_ago = random.randint(0, 14)
    shift_note = models.ShiftNote(
        user_id=user.id,
        date=date_offset(-days_ago),
        shift=note["shift"],
        content=note["content"],
        created_at=now_minus(days=days_ago),
    )
    db.add(shift_note)
    note_count += 1

db.commit()
print(f"✓  {note_count} notes de quart créées.\n")


# ══════════════════════════════════════
# LOGS
# ══════════════════════════════════════

print("📋 Création des logs d'action...")

log_actions = [
    ("login",          "email"),
    ("logout",         None),
    ("purchase",       "Order"),
    ("vote",           "Product"),
    ("register",       "email"),
    ("note_added",     "date shift"),
    ("product_viewed", "Product"),
    ("contact_sent",   "email"),
]

log_count = 0
for _ in range(60):
    user   = random.choice(users)
    action, entity_type = random.choice(log_actions)
    entity = None
    if entity_type == "email":
        entity = user.email
    elif entity_type == "Order":
        entity = f"Order#{random.randint(1, order_count)}"
    elif entity_type == "Product":
        entity = f"Product#{random.randint(1, len(products))}"
    elif entity_type == "date shift":
        entity = f"{date_offset(-random.randint(0,7))} {'AM' if random.random() > 0.5 else 'PM'}"

    log = models.ActionLog(
        user_id=user.id,
        action=action,
        entity=entity,
        created_at=now_minus(hours=random.randint(0, 72)),
    )
    db.add(log)
    log_count += 1

db.commit()
print(f"✓  {log_count} logs créés.\n")


# ══════════════════════════════════════
# MESSAGES CHAT
# ══════════════════════════════════════

print("💬 Création des messages de chat...")

chat_messages = [
    (admin,  "Attention — pic de toxicité prévu cette nuit. Tous les éditeurs en alerte."),
    (editor, "Reçu. Je surveille les capteurs de la zone E depuis 20h."),
    (admin,  "Parfait. Le filtre V-12 a été changé ce matin, on devrait tenir."),
    (editor, "La livraison de filtres du secteur Nord est confirmée pour demain."),
    (admin,  "Bien. Préparez les bons de réquisition pour les rations également."),
    (editor, "Déjà fait. 240 unités enregistrées en chambre froide B."),
    (admin,  "La chaudière C-7 sera en maintenance jeudi. Prévenez les équipes."),
    (editor, "Notification envoyée à tous les chefs de quart."),
    (admin,  "Un accès non autorisé a été signalé porte Nord hier soir."),
    (editor, "Oui, j'ai vu le rapport. Caméra vérifiée, aucune intrusion confirmée."),
    (admin,  "Gardez l'œil ouvert quand même. On approche d'un ravitaillement."),
    (editor, "Compris. Je double les rondes ce soir."),
    (admin,  "Réunion de guilde lundi 18h — présence obligatoire pour les éditeurs."),
    (editor, "Noté. Je transmets aux absents potentiels."),
    (admin,  "Le générateur de secours est à vérifier avant la fin du cycle."),
    (editor, "Autonomie testée ce matin : 18h. Carburant à renouveler dans 4 jours."),
]

chat_count = 0
for i, (user, content) in enumerate(chat_messages):
    msg = models.ChatMessage(
        sender_id=user.id,
        content=content,
        created_at=now_minus(hours=len(chat_messages) - i),
    )
    db.add(msg)
    chat_count += 1

db.commit()
print(f"✓  {chat_count} messages de chat créés.\n")


# ══════════════════════════════════════
# RÉSUMÉ
# ══════════════════════════════════════

db.close()

print("═" * 50)
print("✅ SEED TERMINÉ — Base de données peuplée")
print("═" * 50)
print(f"  👤 {len(users)} utilisateurs")
print(f"  📦 {len(products)} produits")
print(f"  ⭐ {vote_count} votes")
print(f"  🎟  {len(discount_data)} codes de réduction")
print(f"  🛒 {order_count} commandes")
print(f"  📅 {len(events_data)} événements")
print(f"  📝 {note_count} notes de quart")
print(f"  📋 {log_count} logs")
print(f"  💬 {chat_count} messages chat")
print()
print("  Comptes de connexion :")
print("  → admin@colony.local  / Admin1234!  [admin]")
print("  → editor@colony.local / Editor1234! [editor]")
print("  → johann@colony.local / Johann1234! [user]")
print("═" * 50)