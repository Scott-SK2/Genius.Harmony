# 🎨 Guide Détaillé - Déploiement Frontend sur Vercel

## 📋 Prérequis

- ✅ Votre backend déployé sur Render (URL notée)
- ✅ Un compte GitHub avec votre code
- ✅ 10-15 minutes

---

## 🎬 PARTIE 1 : Créer un compte Vercel

### Étape 1 : Inscription sur Vercel

1. **Ouvrez votre navigateur** et allez sur [https://vercel.com](https://vercel.com)

2. **Cliquez sur "Start Deploying"** (bouton noir en haut à droite)

3. **Choisissez "Continue with GitHub"** (méthode recommandée)

4. **Autorisez Vercel** :
   - Une fenêtre GitHub s'ouvre
   - Cliquez sur **"Authorize Vercel"**
   - Confirmez votre mot de passe si demandé

5. **Vous êtes maintenant sur le Dashboard Vercel** ✅

---

## 📦 PARTIE 2 : Importer votre projet

### Étape 2.1 : Créer un nouveau projet

1. **Sur le Dashboard**, cliquez sur **"Add New..."** (en haut à droite)

2. **Sélectionnez "Project"** dans le menu déroulant

3. **Vous voyez la page "Import Git Repository"**

### Étape 2.2 : Connecter votre repository

**Si c'est la première fois** :

1. **Cliquez sur "Import Git Repository"**

2. **Choisissez "GitHub"**

3. **Autorisez Vercel à accéder à vos repos** :
   - Cliquez sur **"Install Vercel"**
   - Sélectionnez **"All repositories"** ou **"Only select repositories"**
   - Si vous choisissez "select", cochez **"Genius.Harmony"**
   - Cliquez sur **"Install"**

**Si déjà connecté** :

- Vous voyez directement la liste de vos repositories

### Étape 2.3 : Importer le repository

1. **Trouvez "Genius.Harmony"** dans la liste
   - Utilisez la barre de recherche si nécessaire

2. **Cliquez sur le bouton "Import"** à droite du nom

3. **Vous arrivez sur la page de configuration** 🎉

---

## ⚙️ PARTIE 3 : Configurer le projet

### Étape 3.1 : Paramètres de base

Sur la page "Configure Project", remplissez :

#### Section "Configure Project"

| Champ | Valeur exacte |
|-------|---------------|
| **Project Name** | `genius-harmony` (ou votre choix, Vercel propose un nom automatique) |
| **Framework Preset** | **Vite** (détecté automatiquement normalement) |
| **Root Directory** | Cliquez sur **"Edit"** → Sélectionnez `frontend/genius-harmony-frontend` |

💡 **Important** : Le Root Directory DOIT pointer vers le dossier frontend !

#### Section "Build and Output Settings"

Vercel détecte automatiquement :

| Paramètre | Valeur (détectée automatiquement) |
|-----------|-----------------------------------|
| **Build Command** | `npm run build` ou `vite build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

⚠️ **Ne les modifiez pas** sauf si Vercel vous le demande !

### Étape 3.2 : Variables d'environnement

C'est **LA PARTIE LA PLUS IMPORTANTE** ! ⚠️

1. **Descendez jusqu'à "Environment Variables"**

2. **Cliquez sur "Add"** ou le champ vide

3. **Ajoutez cette variable** :

   ```
   Name: VITE_API_URL
   Value: https://genius-harmony-backend.onrender.com
   ```

   ⚠️ **REMPLACEZ** `genius-harmony-backend` par le nom de VOTRE service Render !

   💡 **Astuce** : Retournez sur Render et copiez l'URL exacte de votre backend

4. **Sélectionnez l'environnement** :
   - Cochez **"Production"**
   - Cochez **"Preview"**
   - Cochez **"Development"**

   (Ainsi la variable est disponible partout !)

---

## 🚀 PARTIE 4 : Déployer !

### Étape 4.1 : Lancer le déploiement

1. **Vérifiez que tout est correct** :
   - Root Directory : `frontend/genius-harmony-frontend`
   - Framework : `Vite`
   - Variable d'environnement : `VITE_API_URL` définie

2. **Cliquez sur le gros bouton noir** : **"Deploy"** 🚀

3. **Vercel commence le build** !

### Étape 4.2 : Suivre le déploiement

Vous voyez une animation de fusée 🚀 et :

```
Building...
```

**Cliquez sur "Building"** pour voir les logs en détail :

```
[12:34:56] Cloning github.com/votre-user/Genius.Harmony (Branch: claude/analyze-code-uuhDt, Commit: 7662da7)
[12:35:02] Installing dependencies...
[12:35:45] Running "npm run build"...

VITE v5.x.x  building for production...
✓ 1234 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.js    245.67 kB │ gzip: 78.23 kB
✓ built in 12.34s

[12:36:12] Build Completed in 1m 16s
[12:36:15] Deploying...
[12:36:20] Deployment Ready!
```

**Après 1-3 minutes**, vous voyez :

```
🎉 Congratulations! Your project has been successfully deployed.
```

---

## 🌍 PARTIE 5 : Accéder à votre application

### Étape 5.1 : Obtenir l'URL

Sur la page de succès, vous voyez :

```
https://genius-harmony-xxxxx.vercel.app
```

Ou un nom personnalisé comme :
```
https://genius-harmony.vercel.app
```

**Cliquez sur "Visit"** ou copiez l'URL ! 📋

### Étape 5.2 : Tester votre application

1. **Ouvrez l'URL dans un navigateur**

2. **Vous devriez voir** :
   - Votre logo (ou les emojis 🎭)
   - La page de connexion Genius.Harmony
   - Design violet et orange

3. **Testez la connexion** :
   - Essayez de créer un compte
   - Ou connectez-vous avec le compte admin créé sur Render

### Étape 5.3 : Vérifier la connexion Backend

**Ouvrez les outils de développement** (F12 dans Chrome/Firefox)

1. **Allez dans l'onglet "Network"** (Réseau)

2. **Essayez de vous connecter**

3. **Vous devriez voir des requêtes vers** :
   ```
   https://genius-harmony-backend.onrender.com/api/auth/login/
   ```

Si vous voyez ça → **Tout fonctionne !** ✅

---

## 🔧 PARTIE 6 : Mettre à jour le CORS du backend

### Étape 6.1 : Retourner sur Render

1. **Allez sur** [https://dashboard.render.com](https://dashboard.render.com)

2. **Cliquez sur votre service backend** (`genius-harmony-backend`)

3. **Dans le menu de gauche**, cliquez sur **"Environment"**

### Étape 6.2 : Mettre à jour CORS_ALLOWED_ORIGINS

1. **Trouvez la variable** `CORS_ALLOWED_ORIGINS`

2. **Cliquez sur "Edit"** (icône crayon)

3. **Modifiez la valeur** pour inclure votre URL Vercel :
   ```
   https://genius-harmony-xxxxx.vercel.app,http://localhost:5173,http://127.0.0.1:5173
   ```

   ⚠️ **Remplacez** par VOTRE URL Vercel exacte !

   💡 **Format** : URLs séparées par des virgules, **PAS d'espaces**, **PAS de `/` à la fin**

4. **Cliquez sur "Save Changes"**

### Étape 6.3 : Mettre à jour ALLOWED_HOSTS

1. **Trouvez la variable** `ALLOWED_HOSTS`

2. **Cliquez sur "Edit"**

3. **Ajoutez votre domaine Vercel** :
   ```
   genius-harmony-backend.onrender.com,genius-harmony-xxxxx.vercel.app
   ```

4. **Cliquez sur "Save Changes"**

### Étape 6.4 : Redéployer

Render va automatiquement redéployer (ça prend 2-3 minutes).

Vous verrez :
```
🟡 Deploying...
```

Puis :
```
🟢 Live
```

---

## ✅ PARTIE 7 : Test final complet

### Checklist de test

Retournez sur votre frontend Vercel et testez :

- [ ] **Page de connexion** s'affiche correctement
- [ ] **Inscription** fonctionne (créer un nouveau compte)
- [ ] **Connexion** fonctionne (avec le compte créé)
- [ ] **Dashboard** s'affiche avec vos données
- [ ] **Créer un projet** fonctionne
- [ ] **Créer une tâche** fonctionne
- [ ] **Upload de documents** fonctionne
- [ ] **Logo personnalisé** s'affiche (si vous l'avez ajouté)

Si **tout fonctionne** → 🎉 **FÉLICITATIONS !**

---

## 🎨 PARTIE 8 : Personnaliser votre domaine (Optionnel)

### Option 1 : Utiliser un sous-domaine Vercel personnalisé

1. **Dans Vercel**, allez sur votre projet

2. **Cliquez sur "Settings"** → **"Domains"**

3. **Ajoutez un domaine personnalisé** :
   ```
   genius-harmony.vercel.app
   ```

4. **Vercel le vérifie et l'active** (gratuit !)

### Option 2 : Utiliser votre propre domaine

Si vous avez un domaine (ex: `monsite.com`) :

1. **Dans Vercel Settings** → **"Domains"**

2. **Ajoutez votre domaine** : `genius-harmony.monsite.com`

3. **Suivez les instructions** pour configurer vos DNS

4. **Vercel génère automatiquement un certificat SSL** ✅

---

## 🔄 PARTIE 9 : Mettre à jour votre application

### Déploiement automatique

**Bonne nouvelle** : Vercel redéploie automatiquement à chaque push sur GitHub ! 🎉

1. **Modifiez votre code localement**

2. **Commitez et poussez** :
   ```bash
   git add .
   git commit -m "Nouvelle fonctionnalité"
   git push
   ```

3. **Vercel détecte le push** et redéploie automatiquement !

4. **Suivez le déploiement** sur le Dashboard Vercel

### Preview Deployments

**Chaque branche** a son propre URL de prévisualisation :

- Branche `main` → URL de production
- Branche `develop` → URL de preview
- Pull Request → URL de preview unique

Parfait pour tester avant de déployer en production !

---

## 🐛 Dépannage

### Problème : Page blanche / "Vite Error"

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Assurez-vous que le **Root Directory** est correct : `frontend/genius-harmony-frontend`
3. Vérifiez que `package.json` existe dans ce dossier

### Problème : "Failed to load module"

**Dans la console (F12)** :
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"
```

**Solution** :
1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que `VITE_API_URL` est bien défini
3. Redéployez : **Deployments** → **...** → **"Redeploy"**

### Problème : Erreur CORS

**Dans la console (F12)** :
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solution** :
1. Vérifiez que vous avez bien mis à jour `CORS_ALLOWED_ORIGINS` sur Render
2. Vérifiez qu'il n'y a **PAS d'espace** entre les URLs
3. Vérifiez qu'il n'y a **PAS de `/`** à la fin des URLs

### Problème : "Module not found"

**Logs de build** :
```
Error: Cannot find module '@vitejs/plugin-react'
```

**Solution** :
1. Dans Vercel, allez dans **Settings** → **General**
2. Changez **Install Command** en : `npm ci` ou `npm install --force`
3. Redéployez

### Problème : Images/Logo ne s'affichent pas

**Solution** :
1. Vérifiez que `GH long.png` est bien dans `/src/assets/`
2. Vérifiez que vous importez avec le bon chemin :
   ```javascript
   import logo from "../assets/GH long.png";
   ```
3. Redéployez

### Problème : Variables d'environnement ne fonctionnent pas

**Solution** :
1. Les variables Vite DOIVENT commencer par `VITE_`
2. Après avoir modifié une variable, **vous DEVEZ redéployer**
3. Vérifiez que la variable est cochée pour **"Production"**

---

## 📊 Informations utiles

### Limites du plan gratuit Vercel

| Ressource | Limite |
|-----------|--------|
| Bande passante | 100 GB/mois |
| Déploiements | Illimités |
| Projets | Illimités |
| Domaines personnalisés | Illimités |
| Preview Deployments | Illimitées |
| Build Time | 6000 minutes/mois |

### Commandes Vercel CLI (Optionnel)

Vous pouvez aussi déployer depuis votre terminal :

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
cd frontend/genius-harmony-frontend
vercel

# Déployer en production
vercel --prod
```

---

## 🎉 Félicitations !

Votre application Genius.Harmony est maintenant **100% en ligne** !

### Vos URLs

**Frontend (React)** : `https://genius-harmony-xxxxx.vercel.app`
**Backend (Django API)** : `https://genius-harmony-backend.onrender.com/api`
**Admin Django** : `https://genius-harmony-backend.onrender.com/admin`

### Partagez votre application !

Envoyez ces URLs à vos testeurs :

```
🎨 Application : https://genius-harmony-xxxxx.vercel.app

Test Account:
- Créez un compte via "S'inscrire"
- Ou contactez-moi pour un compte admin
```

---

## 📞 Besoin d'aide ?

- Documentation Vercel : [https://vercel.com/docs](https://vercel.com/docs)
- Support Vercel : [https://vercel.com/support](https://vercel.com/support)
- Vite Documentation : [https://vitejs.dev/](https://vitejs.dev/)

---

## 🚀 Prochaines étapes

Maintenant que votre app est en ligne, vous pouvez :

1. **Ajouter un domaine personnalisé**
2. **Configurer Google Analytics**
3. **Ajouter des notifications par email**
4. **Optimiser les performances**
5. **Mettre en place un monitoring**

Bonne chance avec Genius.Harmony ! 🎬✨
