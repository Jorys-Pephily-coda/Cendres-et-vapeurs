# 📊 Installation et Configuration du Système de Bourse

## 🚀 Installation des dépendances

Dans le terminal, navigue vers le dossier front et installe les packages nécessaires :

```bash
cd front_fin/front
npm install recharts axios
```

### Packages installés :
- **recharts** : Bibliothèque de graphiques pour React (basée sur D3.js)
- **axios** : Client HTTP pour les appels API (déjà peut-être installé)

## ✅ Vérification de l'installation

Après l'installation, ton `package.json` devrait inclure :
```json
{
  "dependencies": {
    "recharts": "^2.x.x",
    "axios": "^1.x.x"
  }
}
```

## 🎯 Fonctionnalités implémentées

### Page Bourse (`/bourse`)
- **Vue d'ensemble** : Liste de tous les produits avec prix actuel et tendance
- **Contrôles de simulation** (admin uniquement) :
  - Démarrer/arrêter la simulation
  - Configurer l'intervalle (secondes entre chaque tick)
  - Configurer la volatilité (multiplicateur de fluctuation)
- **Statut en temps réel** : Indicateur visuel de la simulation

### Page Produit (`/bourse/:id`)
- **Graphique interactif** : 
  - Courbe d'évolution du prix
  - Ligne de référence du prix de base
  - Tooltip au survol avec détails
  - Zoom et navigation
- **Statistiques** :
  - Prix actuel avec tendance
  - Variation % par rapport au prix de base
  - Plus bas/plus haut
  - Prix moyen
- **Informations marché** :
  - Stock disponible
  - Nombre de vues
  - Nombre d'achats
  - Nombre de votes
- **Historique détaillé** :
  - Tableau avec date, prix, action, variation
  - Badges colorés par type d'action
  - Indicateurs de hausse/baisse
- **Auto-refresh** : Option pour actualiser automatiquement (toutes les 5s)

## 🎨 Design

- **Gradient violet/bleu** pour le fond
- **Cartes blanches** pour le contenu
- **Animations fluides** sur les interactions
- **Responsive** : Adapté mobile et desktop
- **Émojis** : 📈 (hausse), 📉 (baisse), ➡️ (stable)

## 🔧 Utilisation

### 1. Démarrer le backend
```bash
cd back_fin
python manage.py runserver
```

### 2. (Optionnel) Démarrer la simulation en ligne de commande
```bash
python manage.py simulate_market
```

### 3. Démarrer le frontend
```bash
cd front_fin/front
npm run dev
```

### 4. Naviguer
- Aller sur `http://localhost:5173/bourse`
- Cliquer sur un produit pour voir le graphique
- Si admin : utiliser les contrôles de simulation

## 🎮 Contrôles Admin

Les utilisateurs avec le rôle `admin` ou `editor` peuvent :
1. **Démarrer la simulation** depuis l'interface
2. **Arrêter la simulation** à tout moment
3. **Configurer l'intervalle** (1-60 secondes)
4. **Configurer la volatilité** (0.1-5.0)

## 📱 Fonctionnalités Bonus

### Auto-refresh
- Cocher "Auto-refresh" pour actualiser automatiquement les données
- Utile quand la simulation est active
- Refresh toutes les 5 secondes

### Navigation rapide
- Bouton "Retour" pour revenir à la liste
- Clic sur un produit dans la liste pour voir ses détails

## 🐛 Troubleshooting

### Erreur "recharts is not defined"
```bash
npm install recharts
npm run dev
```

### Erreur CORS
Vérifie que dans `back_fin/cendres_vapeur/settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### La simulation ne démarre pas
- Vérifie que tu es connecté en tant qu'admin
- Vérifie que le backend tourne
- Regarde les logs du backend pour les erreurs

### Le graphique ne s'affiche pas
- Vérifie qu'il y a des données dans l'historique
- Essaie de visiter le produit depuis la page Commerce pour générer des données
- Ou lance la simulation pour créer de l'historique

## 🎯 Prochaines étapes suggérées

1. **WebSocket** : Updates en temps réel sans refresh
2. **Comparaison** : Comparer plusieurs produits sur le même graphique
3. **Alertes** : Notifications quand un prix atteint un seuil
4. **Export** : Télécharger les données en CSV
5. **Prédictions** : Tendances futures basées sur l'IA

## 📸 Screenshots des fonctionnalités

### Vue principale (`/bourse`)
- Grille de tous les produits
- Contrôles de simulation (admin)
- Statut de la simulation

### Vue produit (`/bourse/1`)
- Graphique interactif pleine largeur
- 3 cartes de statistiques
- Tableau d'historique scrollable

Enjoy! 🚀
