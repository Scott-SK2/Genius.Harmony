# 🚀 Guide Détaillé - Déploiement Backend sur Render

## 📋 Prérequis

- ✅ Un compte GitHub avec votre code Genius.Harmony
- ✅ Une adresse email valide
- ✅ 15-20 minutes devant vous

---

## 🎬 PARTIE 1 : Créer un compte Render

### Étape 1 : Inscription sur Render

1. **Ouvrez votre navigateur** et allez sur [https://render.com](https://render.com)

2. **Cliquez sur "Get Started for Free"** (bouton violet en haut à droite)

3. **Choisissez votre méthode d'inscription** :
   - Option recommandée : **"Sign up with GitHub"** (plus rapide)
   - Alternative : Email et mot de passe

4. **Si vous choisissez GitHub** :
   - Une fenêtre GitHub s'ouvre
   - Cliquez sur **"Authorize Render"**
   - Confirmez votre mot de passe GitHub si demandé

5. **Vous êtes maintenant sur le Dashboard Render** ✅

---

## 🗄️ PARTIE 2 : Créer la Base de Données PostgreSQL

### Étape 2.1 : Créer une nouvelle base de données

1. **Sur le Dashboard Render**, cliquez sur le bouton bleu **"New +"** (en haut à droite)

2. **Dans le menu déroulant**, sélectionnez **"PostgreSQL"**

3. **Remplissez le formulaire** :

   | Champ | Valeur à entrer |
   |-------|-----------------|
   | **Name** | `genius-harmony-db` |
   | **Database** | `genius_harmony` (sera rempli automatiquement) |
   | **User** | `genius_harmony_user` (sera rempli automatiquement) |
   | **Region** | Choisissez `Frankfurt (EU Central)` ou la région la plus proche |
   | **PostgreSQL Version** | Laissez la dernière version (par exemple 16) |
   | **Datadog API Key** | Laissez vide |
   | **Plan** | **FREE** (Important !) |

4. **Cliquez sur le bouton vert "Create Database"**

5. **Attendez 1-2 minutes** - Vous verrez "Creating..." puis "Available" ✅

6. **⚠️ IMPORTANT** : Une fois créée, cliquez sur votre base de données et **copiez ces informations** :
   - Gardez l'onglet ouvert, nous en aurons besoin !
   - Notez le **Internal Database URL** (commence par `postgresql://`)

---

## 🌐 PARTIE 3 : Créer le Web Service (Backend Django)

### Étape 3.1 : Créer un nouveau service

1. **Retournez au Dashboard** (cliquez sur "Dashboard" en haut à gauche)

2. **Cliquez sur "New +"** → **"Web Service"**

3. **Connecter votre repository GitHub** :

   **Si c'est la première fois** :
   - Cliquez sur **"Connect GitHub"**
   - Autorisez Render à accéder à vos repos
   - Vous verrez la liste de vos repositories

   **Si déjà connecté** :
   - Vous voyez directement vos repositories

4. **Trouvez votre repo "Genius.Harmony"**
   - Utilisez la barre de recherche si nécessaire
   - Cliquez sur le bouton **"Connect"** à droite du nom du repo

### Étape 3.2 : Configurer le service

Maintenant vous êtes sur la page de configuration. Remplissez EXACTEMENT comme suit :

#### Section "Settings"

| Champ | Valeur exacte |
|-------|---------------|
| **Name** | `genius-harmony-backend` (ou votre choix, sans espaces) |
| **Region** | `Frankfurt (EU Central)` (la même que votre base de données) |
| **Branch** | `claude/analyze-code-uuhDt` ⚠️ **Très important !** |
| **Root Directory** | Laissez **vide** (ne rien écrire) |
| **Runtime** | Sélectionnez **"Python 3"** dans le menu déroulant |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn genius_harmony.wsgi:application` |

#### Section "Plan"

- **Plan Type** : Sélectionnez **"Free"** ⚠️ **Important !**
  - 512 MB RAM
  - Partagé CPU
  - Parfait pour tester !

### Étape 3.3 : Configurer les variables d'environnement

Descendez jusqu'à la section **"Environment Variables"**

1. **Cliquez sur "Add Environment Variable"** (ou "Advanced" puis "Add Environment Variable")

2. **Ajoutez ces variables UNE PAR UNE** :

   **Variable 1 : SECRET_KEY**
   ```
   Key: SECRET_KEY
   Value: [Générez une clé aléatoire de 50 caractères]
   ```

   💡 **Astuce** : Utilisez ce site pour générer : [https://djecrety.ir/](https://djecrety.ir/)

   Exemple : `django-insecure-a8f$2m9k#x7n@p4q!r6s8t0u2v4w6x8y0z1a3b5c7d9e`

   **Variable 2 : DEBUG**
   ```
   Key: DEBUG
   Value: False
   ```

   **Variable 3 : ALLOWED_HOSTS**
   ```
   Key: ALLOWED_HOSTS
   Value: genius-harmony-backend.onrender.com
   ```
   ⚠️ **Remplacez** `genius-harmony-backend` par le nom que vous avez choisi à l'étape 3.2

   **Variable 4 : DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: [L'URL de votre base de données PostgreSQL]
   ```

   💡 **Où trouver cette URL ?** :
   - Ouvrez l'onglet de votre base de données
   - Copiez **"Internal Database URL"**
   - Collez-la ici

   Elle ressemble à : `postgresql://genius_harmony_user:XXXXXXX@dpg-XXXX.frankfurt-postgres.render.com/genius_harmony`

   **Variable 5 : CORS_ALLOWED_ORIGINS**
   ```
   Key: CORS_ALLOWED_ORIGINS
   Value: http://localhost:5173,http://127.0.0.1:5173
   ```

   💡 **Note** : On ajoutera l'URL du frontend Vercel plus tard

### Étape 3.4 : Ajouter le fichier de configuration Python (Optionnel mais recommandé)

Sous "Environment Variables", vous pouvez aussi ajouter :

```
Key: PYTHON_VERSION
Value: 3.11.0
```

### Étape 3.5 : Auto-Deploy depuis GitHub

Descendez jusqu'à **"Auto-Deploy"**

- **Activez** l'option **"Auto-Deploy"** (oui/Yes)

  💡 Cela signifie : chaque fois que vous pushez sur GitHub, Render redéploie automatiquement !

---

## 🚀 PARTIE 4 : Lancer le déploiement

### Étape 4.1 : Créer le service

1. **Vérifiez tout une dernière fois** (surtout le nom de la branche !)

2. **Cliquez sur le gros bouton vert** : **"Create Web Service"**

3. **Render commence le déploiement** 🎉

### Étape 4.2 : Suivre le déploiement

Vous êtes maintenant sur la page de votre service. En haut, vous voyez :

```
🟡 Building...
```

**Cliquez sur "Logs"** dans le menu de gauche pour voir ce qui se passe :

```
==> Cloning from https://github.com/votre-user/Genius.Harmony...
==> Checking out commit 7662da7...
==> Running build command './build.sh'...
    Collecting Django==5.2.9...
    Installing collected packages...
    ...
    Collecting static files...
    0 static files copied to '/opt/render/project/src/staticfiles'.
    Running migrations...
    Operations to perform:
      Apply all migrations: admin, auth, contenttypes, core, sessions
    Running migrations:
      Applying core.0001_initial... OK
      Applying core.0002_auto... OK
      ...
    No migrations to apply.
==> Build successful!
==> Starting service with 'gunicorn genius_harmony.wsgi:application'...
    [2024-XX-XX] [1] [INFO] Starting gunicorn 23.0.0
    [2024-XX-XX] [1] [INFO] Listening at: http://0.0.0.0:10000
    [2024-XX-XX] [1] [INFO] Using worker: sync
    [2024-XX-XX] [8] [INFO] Booting worker with pid: 8
```

**Après 3-5 minutes**, vous verrez :

```
🟢 Live
```

✅ **Votre backend est en ligne !**

---

## 🧪 PARTIE 5 : Tester votre backend

### Étape 5.1 : Obtenir l'URL

En haut de la page de votre service, vous voyez :

```
https://genius-harmony-backend.onrender.com
```

**Copiez cette URL !** 📋

### Étape 5.2 : Tester l'API

1. **Ouvrez un nouvel onglet** et collez :
   ```
   https://genius-harmony-backend.onrender.com/api/
   ```

2. **Vous devriez voir** :
   - Une page JSON ou
   - Une page d'erreur 404 (normal, il n'y a pas de route `/api/` directement)

3. **Testez l'admin Django** :
   ```
   https://genius-harmony-backend.onrender.com/admin/
   ```

   Vous devriez voir la page de connexion Django Admin ! ✅

---

## 👤 PARTIE 6 : Créer votre premier utilisateur admin

### Étape 6.1 : Accéder au Shell

1. **Dans Render**, allez sur votre service backend

2. **Dans le menu de gauche**, cliquez sur **"Shell"**

3. **Un terminal s'ouvre** dans votre navigateur

### Étape 6.2 : Créer le superuser

Dans le terminal, tapez :

```bash
python manage.py createsuperuser
```

**Suivez les instructions** :

```
Username (leave blank to use 'render'): admin
Email address: votre@email.com
Password: ********
Password (again): ********
Superuser created successfully.
```

💡 **Conseils** :
- Username : `admin` ou votre pseudo
- Email : votre vrai email
- Password : minimum 8 caractères, pas trop simple

### Étape 6.3 : Tester la connexion admin

1. **Retournez sur** :
   ```
   https://genius-harmony-backend.onrender.com/admin/
   ```

2. **Connectez-vous** avec votre username et password

3. **Vous voyez le panneau d'administration Django** ! 🎉

---

## ✅ PARTIE 7 : Vérifications finales

### Checklist

- [ ] Le statut du service est **🟢 Live**
- [ ] L'URL `/admin/` fonctionne
- [ ] Vous pouvez vous connecter à l'admin
- [ ] Vous voyez vos modèles (Users, Projets, Tâches, etc.)

---

## 🎨 PARTIE 8 : Prochaine étape - Frontend

Maintenant que votre backend fonctionne, notez bien :

```
URL Backend : https://genius-harmony-backend.onrender.com
```

**Cette URL sera nécessaire** pour configurer le frontend sur Vercel !

---

## 🐛 Dépannage

### Problème : "Build failed"

**Dans les logs, vous voyez** :
```
ERROR: Could not find a version that satisfies the requirement...
```

**Solution** :
- Vérifiez que vous êtes sur la bonne branche (`claude/analyze-code-uuhDt`)
- Vérifiez que `requirements.txt` existe à la racine

### Problème : "No such file or directory: './build.sh'"

**Solution** :
1. Allez dans **"Environment"** de votre service
2. Changez **Build Command** en :
   ```
   chmod +x build.sh && ./build.sh
   ```
3. Cliquez sur **"Manual Deploy"** → **"Clear build cache & deploy"**

### Problème : "relation does not exist"

**Dans les logs** :
```
django.db.utils.ProgrammingError: relation "core_user" does not exist
```

**Solution** :
- Allez dans **"Shell"**
- Tapez :
  ```bash
  python manage.py migrate
  ```

### Problème : Service se met en "Suspended"

**Solution** :
- C'est normal sur le plan gratuit après 15 minutes d'inactivité
- Visitez simplement l'URL, il redémarre en 30-60 secondes
- Pour éviter ça, passez au plan payant ($7/mois)

### Problème : "Internal Server Error (500)"

**Dans les logs** :
```
DisallowedHost at /
Invalid HTTP_HOST header: '...'
```

**Solution** :
1. Vérifiez la variable **ALLOWED_HOSTS**
2. Assurez-vous qu'elle contient votre URL Render exacte
3. Redéployez

---

## 📊 Informations utiles

### Limites du plan gratuit Render

| Ressource | Limite |
|-----------|--------|
| RAM | 512 MB |
| CPU | Partagé |
| Base de données | 1 GB PostgreSQL |
| Bande passante | Illimitée |
| Heures de fonctionnement | 750h/mois (suffisant pour 24/7) |
| Mise en veille | Après 15 min d'inactivité |

### Commandes utiles dans le Shell

```bash
# Voir les migrations
python manage.py showmigrations

# Créer des migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic --no-input

# Ouvrir le shell Django
python manage.py shell
```

---

## 🎉 Félicitations !

Votre backend Django est maintenant déployé et accessible sur Internet !

**URL de votre backend** : `https://genius-harmony-backend.onrender.com`

**Prochaine étape** : Déployer le frontend React sur Vercel !

---

## 📞 Besoin d'aide ?

- Documentation Render : [https://render.com/docs](https://render.com/docs)
- Support Render : [https://render.com/support](https://render.com/support)
- Django Deployment : [https://docs.djangoproject.com/en/5.0/howto/deployment/](https://docs.djangoproject.com/en/5.0/howto/deployment/)
