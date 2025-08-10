# 🚀 Guide de Démarrage - Projet Ontologie Burkina Faso

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.8+** : [Télécharger Python](https://www.python.org/downloads/)
- **Node.js 16+** : [Télécharger Node.js](https://nodejs.org/)
- **Git** : [Télécharger Git](https://git-scm.com/)

## 🔧 Installation et Démarrage

### Étape 1 : Cloner le projet
```bash
git clone [URL_DU_REPO]
cd ontologie-web
```

### Étape 2 : Démarrer le Backend (Base de données + API)

1. **Installer les dépendances Python :**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Sur macOS/Linux
# ou
venv\Scripts\activate     # Sur Windows

pip install -r requirements.txt
```

2. **Démarrer Neo4j :**
```bash
# Sur macOS/Linux
brew install neo4j
neo4j start

# Sur Windows
# Télécharger Neo4j Desktop depuis https://neo4j.com/download/
```

3. **Lancer l'API :**
```bash
python main.py
```

### Étape 3 : Démarrer le Frontend (Interface utilisateur)

```bash
cd dashboard
npm install
npm run dev
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000
- **Neo4j Browser** : http://localhost:7474

## 📱 Utilisation de l'application

### Dashboard Principal
- **Vue d'ensemble** des statistiques (Ethnies, Langues, Régions, etc.)
- **Navigation** via la sidebar gauche

### Gestion des Données
- **Ethnies** : Ajouter, modifier, supprimer des ethnies
- **Langues** : Gérer les langues du Burkina Faso
- **Régions** : Administrer les régions/localités
- **Patronymes** : Gérer les noms de famille
- **Dialectes** : Administrer les variantes linguistiques

### Fonctionnalités CRUD
- **Créer** : Bouton "+" pour ajouter de nouveaux éléments
- **Lire** : Affichage des données dans des tableaux/cartes
- **Modifier** : Clic sur l'icône ✏️ pour éditer
- **Supprimer** : Clic sur l'icône 🗑️ pour supprimer



##  Structure du projet

```
ontologie-web/
├── backend/           # API Python + Base de données Neo4j
│   ├── main.py       # Point d'entrée de l'API
│   ├── services/     # Logique métier
│   └── routes/       # Endpoints de l'API
├── dashboard/         # Interface React
│   ├── src/          # Code source
│   └── package.json  # Dépendances Node.js
└── README.md         # Documentation technique
```

##  Commandes utiles

```bash
# Démarrer le backend
cd backend
python main.py

# Démarrer le frontend
cd dashboard
npm run dev

# Vérifier le statut de Neo4j
neo4j status

# Arrêter Neo4j
neo4j stop

# Redémarrer Neo4j
neo4j restart
```

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez la console** du navigateur (F12)
2. **Vérifiez les logs** du terminal
3. **Assurez-vous que tous les services** sont démarrés
4. **Vérifiez les ports** (8000 et 5173)

## 🎉 Félicitations !

Vous avez maintenant un projet d'ontologie complet avec :
- ✅ Base de données graphique Neo4j
- ✅ API REST complète
- ✅ Interface utilisateur moderne
- ✅ Opérations CRUD complètes
- ✅ Gestion des ethnies, langues, régions, etc.

**Bon développement ! 🚀** 