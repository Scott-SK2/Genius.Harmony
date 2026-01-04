# 🚀 Guide de Déploiement - Genius.Harmony

Ce guide vous explique comment déployer votre application **gratuitement** sur Internet.

## 📋 Vue d'ensemble

- **Backend (Django)** → Render.com (gratuit)
- **Frontend (React)** → Vercel.com (gratuit)
- **Base de données** → PostgreSQL sur Render (gratuit)

---

## 🔧 Partie 1 : Déployer le Backend sur Render

### Étape 1.1 : Créer un compte Render

1. Allez sur [https://render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Inscrivez-vous avec votre email ou GitHub

### Étape 1.2 : Connecter votre dépôt GitHub

1. Une fois connecté, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre compte GitHub si ce n'est pas déjà fait
4. Sélectionnez le repository **"Genius.Harmony"**

### Étape 1.3 : Configurer le service

Remplissez les informations suivantes :

| Champ | Valeur |
|-------|--------|
| **Name** | `genius-harmony-backend` (ou votre choix) |
| **Region** | Choisissez la région la plus proche |
| **Branch** | `claude/analyze-code-uuhDt` (ou votre branche principale) |
| **Root Directory** | Laissez vide |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn genius_harmony.wsgi:application` |

### Étape 1.4 : Créer une base de données PostgreSQL

1. Dans le même menu, descendez jusqu'à **"Environment"**
2. Cliquez sur **"Add Database"**
3. Sélectionnez **"PostgreSQL"**
4. Nommez-la `genius-harmony-db`
5. Cliquez sur **"Create Database"**

### Étape 1.5 : Configurer les variables d'environnement

Cliquez sur **"Advanced"** puis ajoutez ces variables :

```
SECRET_KEY=your-secret-key-generate-a-new-one-here
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**⚠️ Important** :
- Pour `SECRET_KEY`, générez une nouvelle clé sécurisée (50+ caractères aléatoires)
- Remplacez `your-app-name` par le nom que vous avez choisi
- Vous mettrez à jour `CORS_ALLOWED_ORIGINS` après avoir déployé le frontend

### Étape 1.6 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez quelques minutes pendant le déploiement
3. Une fois terminé, vous verrez **"Live"** en vert

🎉 **Votre backend est maintenant en ligne !**

Notez l'URL : `https://your-app-name.onrender.com`

---

## 🎨 Partie 2 : Déployer le Frontend sur Vercel

### Étape 2.1 : Créer un compte Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Start Deploying"**
3. Inscrivez-vous avec GitHub

### Étape 2.2 : Importer votre projet

1. Une fois connecté, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez le repository **"Genius.Harmony"**
3. Cliquez sur **"Import"**

### Étape 2.3 : Configurer le projet

Remplissez les informations :

| Champ | Valeur |
|-------|--------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend/genius-harmony-frontend` |
| **Build Command** | `npm run build` ou `vite build` |
| **Output Directory** | `dist` |

### Étape 2.4 : Ajouter la variable d'environnement

Dans la section **"Environment Variables"**, ajoutez :

```
Name: VITE_API_URL
Value: https://your-backend-name.onrender.com
```

**Remplacez** `your-backend-name` par l'URL de votre backend Render.

### Étape 2.5 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 1-2 minutes
3. Cliquez sur **"Visit"** pour voir votre application !

🎉 **Votre frontend est en ligne !**

Notez l'URL : `https://your-app.vercel.app`

---

## 🔄 Partie 3 : Finaliser la configuration

### Étape 3.1 : Mettre à jour le backend

1. Retournez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur votre service backend
3. Allez dans **"Environment"**
4. Mettez à jour ces variables :

```
ALLOWED_HOSTS=your-backend.onrender.com,your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

5. Cliquez sur **"Save Changes"**
6. Render va automatiquement redéployer

### Étape 3.2 : Initialiser la base de données

Votre backend va automatiquement exécuter les migrations au démarrage. Pour créer un super utilisateur :

1. Dans Render, allez sur votre service backend
2. Cliquez sur **"Shell"** dans le menu de gauche
3. Exécutez :
```bash
python manage.py createsuperuser
```
4. Suivez les instructions pour créer votre compte admin

---

## ✅ Vérification

Testez votre application :

1. **Accédez à votre frontend** : `https://your-app.vercel.app`
2. **Créez un compte** via la page d'inscription
3. **Connectez-vous**
4. **Testez les fonctionnalités** (projets, tâches, etc.)

---

## 🆓 Limites du plan gratuit

### Render (Backend)
- ✅ 750 heures/mois (suffisant pour 24/7)
- ✅ PostgreSQL 1GB de stockage
- ⚠️ Se met en veille après 15 min d'inactivité (redémarre en 30-60s)
- ✅ SSL/HTTPS automatique

### Vercel (Frontend)
- ✅ 100GB de bande passante/mois
- ✅ Déploiements illimités
- ✅ SSL/HTTPS automatique
- ✅ CDN mondial

---

## 🔧 Déploiements futurs

### Pour mettre à jour votre application :

1. **Pushez vos changements sur GitHub**
   ```bash
   git add .
   git commit -m "Description des changements"
   git push
   ```

2. **Render et Vercel redéploient automatiquement** ! 🎉

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez les logs dans Render → votre service → "Logs"
- Assurez-vous que `build.sh` a les bonnes permissions :
  ```bash
  chmod +x build.sh
  ```

### Erreurs CORS
- Vérifiez que `CORS_ALLOWED_ORIGINS` contient l'URL exacte de votre frontend
- Pas de `/` à la fin de l'URL

### Le frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` est bien configuré dans Vercel
- Vérifiez dans la console du navigateur (F12) l'URL appelée

### Le backend est lent au premier chargement
- Normal ! Le plan gratuit de Render met le serveur en veille après 15 min d'inactivité
- Le premier accès prend 30-60 secondes, puis c'est rapide

---

## 📚 Ressources utiles

- [Documentation Render](https://render.com/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Guide Django Deployment](https://docs.djangoproject.com/en/5.0/howto/deployment/)

---

## 🎉 Félicitations !

Votre application Genius.Harmony est maintenant déployée et accessible à tous sur Internet !

**URLs de votre application** :
- Frontend : `https://your-app.vercel.app`
- Backend API : `https://your-backend.onrender.com/api`
- Admin Django : `https://your-backend.onrender.com/admin`

Partagez ces URLs avec vos testeurs ! 🚀
