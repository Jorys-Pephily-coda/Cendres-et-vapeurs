# API Routes Documentation - Cendres et Vapeurs

## Base URL
```
http://localhost:8000
```

---

## 🔐 Authentication (`/api/auth/`)

### POST `/api/auth/register/`
**Description:** Créer un nouveau compte
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string"
}
```

### POST `/api/auth/login/`
**Description:** Se connecter
```json
{
  "username": "string",
  "password": "string"
}
```
**Réponse:**
```json
{
  "requires_2fa": true,
  "username": "string"
}
```
ou
```json
{
  "message": "Authentification réussie",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "USER"
  }
}
```

### POST `/api/auth/verify-2fa/`
**Description:** Vérifier le code 2FA
```json
{
  "username": "string",
  "code": "123456"
}
```

### POST `/api/auth/logout/`
**Description:** Se déconnecter (aucun body requis)

### POST `/api/auth/refresh/`
**Description:** Rafraîchir le token JWT (aucun body requis)

### GET `/api/auth/me/`
**Description:** Obtenir l'utilisateur connecté
**Réponse:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "USER",
  "is_2fa_enabled": true
}
```

### PUT `/api/auth/me/update/`
**Description:** Mettre à jour le profil
```json
{
  "email": "string",
  "first_name": "string",
  "last_name": "string"
}
```

### POST `/api/auth/change-password/`
**Description:** Changer le mot de passe
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

---

## 👥 Users (`/api/users/`) - Admin uniquement

### GET `/api/users/`
**Description:** Liste de tous les utilisateurs
**Query params:** `?role=ADMIN|USER|EDITOR|GUEST`

### GET `/api/users/{id}/`
**Description:** Détails d'un utilisateur

### PUT/PATCH `/api/users/{id}/`
**Description:** Modifier un utilisateur (seul admin peut changer le rôle)
```json
{
  "role": "ADMIN|USER|EDITOR|GUEST",
  "email": "string",
  "username": "string"
}
```

### DELETE `/api/users/{id}/`
**Description:** Supprimer un utilisateur (ne peut pas se supprimer soi-même)

---

## 📦 Products (`/api/products/`)

### GET `/api/products/`
**Description:** Liste des produits actifs
**Query params:**
- `?category=string` - Filtrer par catégorie
- `?search=string` - Rechercher dans nom/description
- `?sort_by_votes=true` - Trier par votes
- `?ordering=created_at|-created_at|current_price|-current_price|name|-name`

### GET `/api/products/{id}/`
**Description:** Détails d'un produit (incrémente les vues et fait fluctuer le prix)

### POST `/api/products/` - Editor/Admin uniquement
**Description:** Créer un produit
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "base_price": "29.99",
  "current_price": "29.99",
  "stock": 100,
  "image": "file"
}
```

### PUT/PATCH `/api/products/{id}/` - Editor/Admin uniquement
**Description:** Modifier un produit (même structure que POST)

### DELETE `/api/products/{id}/` - Editor/Admin uniquement
**Description:** Supprimer un produit

### POST `/api/products/{id}/vote/` - User et plus
**Description:** Voter/retirer son vote pour un produit (aucun body)

### GET `/api/products/{id}/price_history/`
**Description:** Historique des prix d'un produit

### GET `/api/products/top_voted/`
**Description:** Top 10 des produits les plus votés

### GET `/api/products/categories/`
**Description:** Liste des catégories disponibles

---

## 🛒 Cart/Panier (`/api/cart/`)

### GET `/api/cart/`
**Description:** Récupérer son panier
**Réponse:**
```json
{
  "id": 1,
  "user": 5,
  "items": [
    {
      "id": 1,
      "product": { "id": 3, "name": "Produit", "current_price": "29.99" },
      "quantity": 2,
      "subtotal": "59.98"
    }
  ],
  "total": "59.98",
  "items_count": 2
}
```

### POST `/api/cart/add/`
**Description:** Ajouter un produit au panier
```json
{
  "product_id": 3,
  "quantity": 1
}
```

### PUT `/api/cart/{item_id}/`
**Description:** Modifier la quantité d'un article
```json
{
  "quantity": 5
}
```

### DELETE `/api/cart/{item_id}/remove/`
**Description:** Supprimer un article du panier

### DELETE `/api/cart/clear/`
**Description:** Vider le panier

---

## 💰 Discount Codes (`/api/discounts/`) - Admin uniquement

### GET `/api/discounts/`
**Description:** Liste des codes promo

### GET `/api/discounts/{id}/`
**Description:** Détails d'un code promo

### POST `/api/discounts/`
**Description:** Créer un code promo
```json
{
  "code": "PROMO10",
  "description": "10% de réduction",
  "discount_type": "percentage|fixed",
  "discount_value": "10.00",
  "min_purchase": "0.00",
  "max_uses": 100,
  "valid_from": "2026-01-01T00:00:00Z",
  "valid_until": "2026-12-31T23:59:59Z",
  "is_active": true
}
```

### PUT/PATCH `/api/discounts/{id}/`
**Description:** Modifier un code promo

### DELETE `/api/discounts/{id}/`
**Description:** Supprimer un code promo

### POST `/api/discounts/validate/`
**Description:** Valider un code promo
```json
{
  "code": "PROMO10",
  "total": 100.00
}
```
**Réponse:**
```json
{
  "valid": true,
  "discount_amount": "10.00",
  "new_total": "90.00"
}
```

---

## 📋 Orders/Commandes (`/api/orders/`)

### POST `/api/orders/create/`
**Description:** Créer une commande depuis le panier
```json
{
  "discount_code": "PROMO10",
  "notes": "Livraison le matin"
}
```
**Note:** Les deux champs sont optionnels

**Réponse:**
```json
{
  "message": "Commande créée avec succès",
  "order": {
    "id": 1,
    "order_number": "ORD-20260211-ABC123",
    "status": "pending",
    "subtotal": "100.00",
    "discount_amount": "10.00",
    "total": "90.00",
    "items": [
      {
        "product_name": "Produit",
        "product_price": "50.00",
        "quantity": 2,
        "subtotal": "100.00"
      }
    ]
  }
}
```

### GET `/api/orders/`
**Description:** Liste des commandes (admin voit tout, user voit ses commandes)

### GET `/api/orders/{id}/`
**Description:** Détails d'une commande

### GET `/api/orders/{id}/invoice/`
**Description:** Télécharger la facture PDF

---

## 📅 Calendar (`/api/calendar/`)

### GET `/api/calendar/events/`
**Description:** Liste des événements

### GET `/api/calendar/events/{id}/`
**Description:** Détails d'un événement

### POST `/api/calendar/events/` - Editor/Admin uniquement
**Description:** Créer un événement
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "start_date": "2026-02-11T10:00:00Z",
  "end_date": "2026-02-11T12:00:00Z",
  "is_all_day": false,
  "priority": "low|medium|high|urgent"
}
```

### PUT/PATCH `/api/calendar/events/{id}/` - Editor/Admin uniquement
**Description:** Modifier un événement

### DELETE `/api/calendar/events/{id}/` - Editor/Admin uniquement
**Description:** Supprimer un événement

### GET `/api/calendar/notes/`
**Description:** Liste des notes de shift

### POST `/api/calendar/notes/`
**Description:** Créer une note de shift
```json
{
  "date": "2026-02-11",
  "shift": "morning|afternoon|night",
  "content": "string",
  "is_important": false
}
```

---

## 💬 Chat (`/api/chat/`) - Editor/Admin uniquement

### GET `/api/chat/messages/`
**Description:** Liste des messages

### GET `/api/chat/messages/{id}/`
**Description:** Détails d'un message

### POST `/api/chat/messages/`
**Description:** Envoyer un message
```json
{
  "message": "string",
  "is_system": false
}
```

### DELETE `/api/chat/messages/{id}/`
**Description:** Supprimer un message

---

## ☣️ Monitoring/Toxicité (`/api/monitoring/`)

### GET `/api/monitoring/toxicity/`
**Description:** Liste de toutes les données de toxicité

### GET `/api/monitoring/toxicity/{id}/`
**Description:** Détails d'une donnée de toxicité

### GET `/api/monitoring/toxicity/current/`
**Description:** Générer de nouvelles données aléatoires
**Réponse:**
```json
{
  "id": 1,
  "sulfur_level": "45.32",
  "carbon_level": "25.67",
  "oxygen_level": "19.82",
  "temperature": "22.45",
  "pressure": "1.02",
  "alert_level": "normal",
  "timestamp": "2026-02-11T22:00:00Z"
}
```

### POST `/api/monitoring/toxicity/generate/`
**Description:** Générer de nouvelles données aléatoires (même résultat que current)

### GET `/api/monitoring/toxicity/stream/`
**Description:** Stream SSE - génère des données toutes les 5 secondes

---

## 📧 Contact (`/api/contact/`)

### POST `/api/contact/send/`
**Description:** Envoyer un message de contact
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

---

## 📊 Logs (`/api/logs/`)

### GET `/api/logs/`
**Description:** Liste des logs d'activité (lecture seule)

### GET `/api/logs/{id}/`
**Description:** Détails d'un log

---

## Authentification

La plupart des routes nécessitent une authentification. Les tokens JWT sont stockés dans les cookies HTTP-only :
- `access_token` - Token d'accès (60 min)
- `refresh_token` - Token de rafraîchissement (24h)

**Utiliser :** `credentials: 'include'` dans les requêtes fetch

---

## Permissions par rôle

| Rôle | Permissions |
|------|-------------|
| **GUEST** | Voir produits actifs uniquement |
| **USER** | GUEST + Panier, Commandes, Votes |
| **EDITOR** | USER + Gérer produits, Chat, Calendrier |
| **ADMIN** | EDITOR + Gérer utilisateurs, Codes promo, Toutes commandes |
