# Gestion de Tâche

Une application simple pour gérer vos tâches avec des fonctionnalités comme la création, la modification, la suppression, et le tri des tâches.

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [MongoDB](https://www.mongodb.com/) (en cours d'exécution sur `localhost:27017`)

## Installation

1. Clonez ce dépôt sur votre machine locale :

   ```bash
   git clone https://github.com/votre-utilisateur/gestion-de-tache.git
   ```

2. Accédez au dossier du projet :

   ```bash
   cd gestion-de-tache
   ```

3. Installez les dépendances nécessaires :

   ```bash
   npm install
   ```

## Configuration

Assurez-vous que votre instance MongoDB est en cours d'exécution sur `localhost:27017`. Par défaut, l'application se connecte à une base de données appelée `todoDB`.

Si vous souhaitez modifier la configuration de la base de données, mettez à jour la ligne suivante dans le fichier `server.js` :

```javascript
mongoose.connect('mongodb://localhost:27017/todoDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

## Lancer l'application

1. Démarrez le serveur Node.js :

   ```bash
   npm start
   ```

2. Ouvrez votre navigateur et accédez à l'URL suivante :

   ```
   http://localhost:3000
   ```

## Fonctionnalités

- **Créer une tâche** : Ajoutez un titre, une description, une échéance, une priorité, une catégorie, des étiquettes, et des sous-tâches.
- **Modifier une tâche** : Mettez à jour les informations d'une tâche existante.
- **Supprimer une tâche** : Supprimez une tâche de la liste.
- **Tri et filtres** : Triez les tâches par priorité, date de création ou échéance, et appliquez des filtres.
- **Commentaires** : Ajoutez des commentaires aux tâches et consultez l'historique des modifications.

## Structure du projet

```
.
├── app.js          # Code côté client pour gérer l'interface utilisateur
├── index.html      # Page HTML principale
├── package.json    # Fichier de configuration Node.js
├── readme.md       # Documentation du projet
├── server.js       # Code côté serveur pour gérer les API
├── style.css       # Styles CSS pour l'interface utilisateur
```

## Dépendances

- [Express](https://expressjs.com/) : Framework web pour Node.js
- [Mongoose](https://mongoosejs.com/) : ODM pour MongoDB
- [CORS](https://www.npmjs.com/package/cors) : Middleware pour gérer les requêtes cross-origin
