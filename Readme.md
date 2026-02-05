# TP Fullstack — Cendres et Vapeur

## Objectif du projet
Créer une application web fullstack en groupe en un temps limité (6–7 jours) afin de démontrer :
- la capacité à travailler en équipe
- la maîtrise d’un backend + frontend
- la compréhension de la sécurité, des API et des bases de données
- la capacité à expliquer son travail à l’oral

> Le thème “Cendres et Vapeur” est uniquement esthétique.

---

## Vision globale de l’application
Application web de type **e-commerce** avec :
- gestion des utilisateurs et des rôles
- catalogue de produits
- panier et commandes
- interface d’administration
- fonctionnalités temps réel
- sécurité (authentification + 2FA)

---

## Organisation du groupe
Le projet est divisé en secteurs, mais chaque membre doit comprendre l’ensemble du système.

### Secteurs
- **🟡 Frontend** : UI, UX, accessibilité, styles
- **🔵 API / Backend** : routes, logique métier, échanges
- **🔴 Base de données** : schéma SQL, relations, persistance
- **🟣 Sécurité / Temps réel** : auth, mails, WebSockets

---

## Backend

### Base de données (SQL)
Tables principales attendues :
- `users`
- `roles`
- `products`
- `orders`
- `likes`
- `logs`
- `sessions_2fa`
- `events`
- `messages`

Contraintes :
- clés primaires
- clés étrangères
- intégrité référentielle

---

### API REST
Principes :
- API JSON uniquement
- routes claires et cohérentes
- séparation des responsabilités

Exemples de routes :
```http
GET    /products
POST   /login
POST   /orders
GET    /admin/users
````

Codes HTTP :

* `200` succès
* `401` non autorisé
* `404` non trouvé
* `500` erreur serveur

---

### Authentification & Sécurité

* Connexion par email + mot de passe
* Double authentification (2FA)
* Code envoyé par email
* Accès au dashboard protégé par rôle

Outils autorisés :

* Mailtrap
* SendGrid

---

## Frontend

### Design

* thème post-apocalyptique
* animations et feedback utilisateur
* chargements visibles

> L’effort et la cohérence priment sur l’esthétique pure.

---

### Accessibilité (A11Y)

Obligatoire :

* contrastes lisibles
* navigation clavier
* `aria-label` sur les éléments interactifs

---

### Pages principales

* boutique produits
* panier
* validation de commande
* dashboard administrateur

---

### Boutique & interactions

* produits chargés depuis l’API
* tri par likes
* prix dynamiques
* votes utilisateurs stockés en base

---

### Panier & Commandes

* ajout / suppression de produits
* validation de commande
* simulation de paiement
* génération de facture (HTML ou PDF)

---

### Réductions

* codes promotionnels
* remise appliquée au total

---

## ⚙️ Fonctionnalités avancées

### Moniteur de toxicité

* données simulées côté backend
* affichage en temps réel
* alerte visuelle si seuil dépassé

---

### Bourse du cuivre

* prix variables selon consultation / achat
* indicateurs de hausse / baisse

---

### Planning / Calendrier

* événements
* notes matin / soir
* persistance en base
* vue claire des journées chargées

---

### Chat interne

* réservé admin / éditeur
* communication temps réel
* WebSockets (ou fallback)

---

### Contact & Journal

* formulaire de contact par email
* journal public des actions récentes

---

## Contraintes & Bonnes pratiques

* maquette avant développement
* Git avec commits clairs
* Kanban à jour
* chaque membre doit pouvoir expliquer son code

---

## 📅 Planning conseillé

* **J1** : maquettes + schéma DB + init projet
* **J2–J3** : auth, rôles, API
* **J4–J5** : e-commerce, chat, planning
* **J6** : bonus + finitions
* **J7** : soutenance