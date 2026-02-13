# Cendres et Vapeur - Backend API

Backend Django pour le projet "Cendres et Vapeur" - TP Fullstack Février 2026

##  Description

API REST complète pour une plateforme e-commerce post-apocalyptique avec :
- **Authentification JWT en cookies HTTP Only** (protection XSS)
- Authentification 2FA par email
- Gestion des produits avec système de votes
- Panier et commandes avec codes promo
- Génération de factures PDF
- Calendrier d'événements et notes de quart
- Chat temps réel (WebSocket)
- Moniteur de toxicité en temps réel
- Journal d'activités public

##  Technologies

- **Framework** : Django 5.0 + Django REST Framework
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Authentification** : JWT en cookies HTTP Only + 2FA
- **WebSocket** : Django Channels + Redis
- **Email** : SMTP configurable (Console/Mailtrap/Gmail)
- **PDF** : ReportLab

##  Documentation Complète

- **[GUIDE_SMTP.md](GUIDE_SMTP.md)** - Configuration email étape par étape
- **[JWT_COOKIES.md](JWT_COOKIES.md)** - Authentification sécurisée par cookies
- **[QUICKSTART.md](QUICKSTART.md)** - Démarrage rapide en 5 minutes
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Liste complète des endpoints

##  Installation

### 1. Cloner le projet

```bash
cd /home/nawfel/Documents/back_fin
```

### 2. Créer un environnement virtuel

```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :
- SECRET_KEY
- EMAIL_HOST_USER et EMAIL_HOST_PASSWORD (Mailtrap)
- CORS_ALLOWED_ORIGINS (URL frontend)

### 5. Créer la base de données

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 7. Remplir la base de données avec des données de test (optionnel)

```bash
python manage.py seed_db
```

Cette commande va créer automatiquement :
- 3 utilisateurs (admin, editor, user)
- 10 produits avec votes
- 2 codes de réduction
- 5 événements calendrier
- 10 notes de quart
- 5 données de toxicité
- 10 logs d'activité

**Identifiants créés :**
- Admin : `admin@test.com` / `admin123`
- Editor : `editor@test.com` / `editor123`
- User : `user@test.com` / `user123`

### 8. Lancer le serveur

```bash
# Mode développement
python manage.py runserver

# Avec Channels (WebSocket)
daphne -b 0.0.0.0 -p 8000 cendres_vapeur.asgi:application
```

L'API sera disponible sur : `http://localhost:8000`

##  Système de rôles

4 niveaux d'accès :

| Rôle | Code | Permissions |
|------|------|-------------|
| Invité | `GUEST` | Lecture seule |
| Utilisateur | `USER` | Achat, votes |
| Éditeur | `EDITOR` | Gestion catalogue |
| Administrateur | `ADMIN` | Contrôle total |

##  Endpoints API

### Authentication (`/api/auth/`)

- `POST /register/` - Inscription
- `POST /login/` - Connexion (envoie code 2FA)
- `POST /verify-2fa/` - Vérification 2FA
- `POST /refresh/` - Refresh token JWT
- `GET /me/` - Profil utilisateur
- `PUT /me/update/` - Modifier profil
- `POST /change-password/` - Changer mot de passe
- `POST /logout/` - Déconnexion

### Users (`/api/users/`)

- `GET /` - Liste utilisateurs (admin)
- `GET /{id}/` - Détails utilisateur
- `PUT /{id}/` - Modifier utilisateur
- `DELETE /{id}/` - Supprimer utilisateur (admin)

### Products (`/api/products/`)

- `GET /` - Liste produits (tri par votes)
- `POST /` - Créer produit (éditeur+)
- `GET /{id}/` - Détail produit (déclenche fluctuation prix)
- `PUT /{id}/` - Modifier produit (éditeur+)
- `DELETE /{id}/` - Supprimer produit (admin)
- `POST /{id}/vote/` - Voter pour un produit
- `GET /{id}/price_history/` - Historique des prix
- `GET /top_voted/` - Produits les plus votés
- `GET /categories/` - Liste des catégories

### E-commerce

**Cart (`/api/cart/`)**
- `GET /` - Voir panier
- `POST /add/` - Ajouter au panier
- `PUT /{item_id}/` - Modifier quantité
- `DELETE /{item_id}/remove/` - Retirer article
- `DELETE /clear/` - Vider panier

**Discounts (`/api/discounts/`)**
- `POST /validate/` - Valider code promo
- `POST /` - Créer code promo (admin)
- `GET /` - Liste codes promo (admin)

**Orders (`/api/orders/`)**
- `POST /create/` - Créer commande depuis panier
- `GET /` - Liste commandes
- `GET /{id}/` - Détail commande
- `GET /{id}/invoice/` - Télécharger facture PDF

### Calendar (`/api/calendar/`)

**Events (`/events/`)**
- `GET /` - Liste événements
- `POST /` - Créer événement (éditeur+)
- `GET /{id}/` - Détail événement
- `PUT /{id}/` - Modifier événement (éditeur+)
- `DELETE /{id}/` - Supprimer événement (éditeur+)
- `GET /month_view/?year=2026&month=2` - Vue mensuelle
- `GET /priorities/` - Liste priorités

**Notes (`/notes/`)**
- `GET /` - Liste notes de quart
- `POST /` - Créer note
- `GET /{id}/` - Détail note
- `PUT /{id}/` - Modifier note
- `DELETE /{id}/` - Supprimer note
- `GET /my_notes/` - Mes notes
- `GET /date_notes/?date=2026-02-09` - Notes par date

### Chat (`/api/chat/`)

- `WS /ws/chat/` - WebSocket chat (admin/éditeur)
- `GET /messages/` - Historique messages (REST fallback)
- `GET /messages/recent/?limit=100` - Messages récents

### Monitoring (`/api/monitoring/`)

- `GET /toxicity/` - Liste données toxicité
- `GET /toxicity/current/` - Données actuelles
- `POST /toxicity/generate/` - Générer nouvelles données
- `GET /toxicity/stream/` - Stream SSE temps réel

### Contact (`/api/contact/`)

- `POST /send/` - Envoyer message contact

### Logs (`/api/logs/`)

- `GET /` - Journal d'activités (public)
- `GET /?action_type=order_created` - Filtrer par type
- `GET /?limit=50` - Limiter résultats

##  Configuration Email (Mailtrap)

1. Créer un compte sur [Mailtrap.io](https://mailtrap.io)
2. Copier les credentials SMTP
3. Configurer dans `.env` :

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_HOST_USER=votre_username
EMAIL_HOST_PASSWORD=votre_password
```

##  Tests

```bash
# Lancer les tests
python manage.py test

# Avec coverage
coverage run --source='.' manage.py test
coverage report
```

##  Admin Django

Accéder à l'interface admin : `http://localhost:8000/admin/`

Fonctionnalités :
- Gestion complète des utilisateurs
- Modération des produits et commandes
- Gestion des codes promo
- Visualisation des logs
- etc.

##  WebSocket (Chat)

Se connecter au chat WebSocket :

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

ws.send(JSON.stringify({
  message: 'Bonjour la Zone Franche!'
}));
```

##  Structure du projet

```
back_fin/
 cendres_vapeur/          # Configuration Django
    settings.py
    urls.py
    asgi.py
 apps/
    authentication/      # Auth + 2FA + Users
    products/            # Produits + Votes + Prix
    ecommerce/           # Panier + Commandes + Factures
    calendar_app/        # Événements + Notes de quart
    chat/                # Chat WebSocket
    monitoring/          # Toxicité temps réel
    contact/             # Formulaire contact
    logs/                # Journal activités
    utils/               # Utilitaires
 requirements.txt
 manage.py
 README.md
```

##  Exemple d'utilisation

### 1. Inscription

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "survivant",
    "email": "survivant@zone.fr",
    "password": "MotDePasse123!",
    "password2": "MotDePasse123!"
  }'
```

### 2. Connexion (2FA)

```bash
# Étape 1 : Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "survivant",
    "password": "MotDePasse123!"
  }'

# Réponse : code 2FA envoyé par email

# Étape 2 : Vérifier code 2FA
curl -X POST http://localhost:8000/api/auth/verify-2fa/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "survivant",
    "code": "123456"
  }'

# Réponse : tokens JWT
```

### 3. Accéder aux produits

```bash
curl -X GET http://localhost:8000/api/products/ \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

##  Dépannage

### Problème de migration

```bash
python manage.py makemigrations
python manage.py migrate --run-syncdb
```



### Problème CORS

Vérifier `CORS_ALLOWED_ORIGINS` dans `.env`

##  Auteur

**Secteur Cobalt (DAHRI Nawfel)** - TP Fullstack "Cendres et Vapeur" - Février 2026

##  Licence

Projet pédagogique - Tous droits réservés
