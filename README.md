# Cendres et Vapeur - Frontend

Interface React pour le projet fullstack "Cendres et Vapeur".

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Build pour production
npm run build
```

## 📁 Structure du projet

```
src/
├── api/              # Configuration Axios
├── components/       # Composants réutilisables
│   └── layout/      # Navbar, Footer
├── context/         # Contextes React (Auth)
├── pages/           # Pages de l'application
│   ├── auth/        # Login, Register, 2FA, Profile
│   ├── products/    # Catalogue, détails
│   ├── ecommerce/   # Panier, Checkout, Commandes
│   ├── calendar/    # Planning et notes
│   ├── chat/        # Chat temps réel
│   ├── monitoring/  # Moniteur de toxicité
│   ├── contact/     # Formulaire de contact
│   ├── logs/        # Journal d'activités
│   └── admin/       # Dashboard admin
├── App.js           # Routes principales
├── index.js         # Point d'entrée
└── index.css        # Styles globaux
```

## 🎨 Fonctionnalités

### Authentification
- ✅ Inscription / Connexion
- ✅ 2FA par email
- ✅ Gestion du profil
- ✅ Système de rôles (Guest, User, Editor, Admin)

### E-commerce
- ✅ Catalogue de produits avec filtres
- ✅ Système de votes sur les produits
- ✅ Panier dynamique
- ✅ Codes promotionnels
- ✅ Commandes et factures PDF

### Modules spéciaux
- ✅ Planning avec événements et notes de quart
- ✅ Chat temps réel (WebSocket)
- ✅ Moniteur de toxicité (SSE temps réel)
- ✅ Bourse du cuivre (prix fluctuants)
- ✅ Formulaire de contact
- ✅ Journal des activités

### Administration
- ✅ Dashboard complet
- ✅ Gestion des utilisateurs
- ✅ Gestion des produits
- ✅ Gestion des codes promo

## 🎨 Design

Le design suit le thème post-apocalyptique "Cendres et Vapeur" avec :
- Palette de couleurs cuivre/rouille/acier
- Typographie style machine à écrire
- Animations steampunk
- Accessibilité A11Y respectée

## ⚙️ Configuration

Créez un fichier `.env` à la racine :

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

## 🔗 Connexion au backend

Le frontend communique avec l'API Django via :
- **HTTP** : Axios avec cookies JWT
- **WebSocket** : Chat temps réel
- **SSE** : Flux de données du moniteur

## 📦 Technologies utilisées

- React 18
- React Router 6
- Axios
- CSS3 (animations et effets)
- WebSocket API
- EventSource (SSE)

## 🧪 Comptes de test

- Admin : `admin` / `admin123`
- Éditeur : `editeur` / `editeur123`
- Utilisateur : `utilisateur` / `user123`
- Invité : `invite` / `invite123`

## 📝 Notes importantes

- Les tokens JWT sont stockés dans des cookies HTTP-only
- Toutes les requêtes incluent `withCredentials: true`
- Le chat nécessite le rôle Editor ou Admin
- Le moniteur affiche des données en temps réel via SSE

## 🎓 Projet étudiant

Ce projet a été développé dans le cadre du TP Fullstack "Cendres et Vapeur" (Février 2026).

**Secteur Cobalt** 🔵
- DAHRI Nawfel
- JAFFRY Maxime
- PARA Nathan
- PEPHILY Jorys
- PIED Gabriel
