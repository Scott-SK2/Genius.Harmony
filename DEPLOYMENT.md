# Guide de Déploiement - Genius Harmony

Ce guide explique comment déployer Genius Harmony avec l'intégration Odoo complète.

## 📋 Prérequis

- Compte Render.com (backend)
- Compte Vercel.com (frontend)
- Instance Odoo (si intégration activée)
- Redis (fourni par Render ou externe)

---

## 🚀 Déploiement Backend (Render)

### 1. Services à créer sur Render

Créez **3 services** pour le backend :

#### A. **Web Service** (Django API)
- Type: `Web Service`
- Build Command: `pip install -r requirements.txt && python manage.py migrate`
- Start Command: `gunicorn genius_harmony.wsgi:application`
- Environment: `Python 3`
- Instance Type: `Starter` ou supérieur

#### B. **Background Worker** (Celery Worker)
- Type: `Background Worker`
- Build Command: `pip install -r requirements.txt`
- Start Command: `celery -A genius_harmony worker --loglevel=info`
- Environment: `Python 3`
- Instance Type: `Starter` ou supérieur

#### C. **Background Worker** (Celery Beat - Scheduler)
- Type: `Background Worker`
- Build Command: `pip install -r requirements.txt`
- Start Command: `celery -A genius_harmony beat --loglevel=info`
- Environment: `Python 3`
- Instance Type: `Starter` ou supérieur

### 2. Services additionnels Render

#### D. **PostgreSQL Database**
- Type: `PostgreSQL`
- Plan: `Starter` ou supérieur
- Render créera automatiquement `DATABASE_URL`

#### E. **Redis Instance**
- Type: `Redis`
- Plan: `Starter` ou supérieur (25MB gratuit)
- Render créera automatiquement `REDIS_URL`

---

## ⚙️ Variables d'environnement

Configurez ces variables sur **tous les 3 services backend** (Web Service + 2 Workers) :

### Variables Django de base
```bash
SECRET_KEY=<générer-une-clé-secrète-django>
DEBUG=False
ALLOWED_HOSTS=<your-app>.onrender.com
DATABASE_URL=<auto-fourni-par-render>
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
```

### Variables Cloudinary (stockage fichiers)
```bash
CLOUDINARY_CLOUD_NAME=<votre-cloud-name>
CLOUDINARY_API_KEY=<votre-api-key>
CLOUDINARY_API_SECRET=<votre-api-secret>
```

### Variables Redis & Celery
```bash
REDIS_URL=<auto-fourni-par-render-redis>
```

### Variables Odoo (Optionnel - seulement si vous utilisez Odoo)
```bash
ODOO_ENABLED=True
ODOO_HOST=votre-instance.odoo.com
ODOO_PORT=443
ODOO_PROTOCOL=jsonrpc+ssl
ODOO_DB=production
ODOO_USERNAME=api@votre-entreprise.com
ODOO_PASSWORD=<mot-de-passe-odoo>
```

**Important** : Si vous n'utilisez pas Odoo, mettez `ODOO_ENABLED=False`

---

## 🌐 Déploiement Frontend (Vercel)

### 1. Configuration Vercel

Connectez votre repo GitHub à Vercel et configurez :

- **Root Directory**: `frontend/genius-harmony-frontend`
- **Framework**: `React` (détecté automatiquement)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. Variable d'environnement Frontend

Créez un fichier `.env.production` dans `frontend/genius-harmony-frontend/` :

```bash
VITE_API_URL=https://<your-backend>.onrender.com/api
```

Ou configurez directement dans Vercel :
- Key: `VITE_API_URL`
- Value: `https://<your-backend>.onrender.com/api`

---

## 📊 Vérification du Déploiement

### Backend (Render)

1. **Web Service**: Vérifiez que le serveur Django démarre
   ```
   Logs devrait montrer: "Listening at: http://0.0.0.0:10000"
   ```

2. **Celery Worker**: Vérifiez que le worker démarre
   ```
   Logs devrait montrer: "celery@<hostname> ready"
   ```

3. **Celery Beat**: Vérifiez que le scheduler démarre
   ```
   Logs devrait montrer: "Scheduler: Sending due task"
   ```

### Frontend (Vercel)

1. Build réussi
2. Accès à `https://<your-app>.vercel.app`
3. Connexion à l'API backend fonctionne

### Tests de l'intégration Odoo (si activée)

1. Éditez un profil utilisateur → Devrait sync vers Odoo
2. Créez un projet → Devrait apparaître dans Odoo
3. Créez une tâche → Devrait apparaître dans Odoo
4. Vérifiez les notifications de deadline

---

## 🔔 Système de Notifications

### Comment ça fonctionne

1. **Notifications automatiques** :
   - Deadline dans 3 jours
   - Deadline demain
   - Deadline aujourd'hui
   - Tâche en retard
   - Assignation à une tâche
   - Ajout à un projet

2. **Polling** : Frontend vérifie les nouvelles notifications toutes les 30 secondes

3. **API** :
   - `GET /api/notifications/` - Liste toutes les notifications
   - `GET /api/notifications/unread-count/` - Compte les non lues
   - `POST /api/notifications/<id>/mark-read/` - Marquer comme lue
   - `POST /api/notifications/mark-all-read/` - Tout marquer
   - `DELETE /api/notifications/<id>/` - Supprimer
   - `DELETE /api/notifications/delete-all-read/` - Supprimer toutes lues

4. **Icône dans la Navbar** :
   - Badge rouge avec le nombre de notifications non lues
   - Dropdown au clic avec toutes les notifications
   - Actions rapides : marquer lue, supprimer

---

## 🐛 Dépannage

### Problème : Build échoue sur Render

**Solution** :
1. Vérifiez que `requirements.txt` est à jour
2. Vérifiez les logs de build pour l'erreur exacte
3. Assurez-vous que `python-version` est 3.10+

### Problème : Celery worker ne démarre pas

**Solution** :
1. Vérifiez que `REDIS_URL` est défini
2. Vérifiez que Redis instance est active
3. Regardez les logs pour l'erreur

### Problème : Frontend ne peut pas se connecter au backend

**Solution** :
1. Vérifiez `VITE_API_URL` dans Vercel
2. Vérifiez `CORS_ALLOWED_ORIGINS` dans Render (doit inclure l'URL Vercel)
3. Testez l'API manuellement : `https://<backend>.onrender.com/api/auth/me/`

### Problème : Notifications ne s'affichent pas

**Solution** :
1. Vérifiez que Celery Beat est actif (scheduled tasks)
2. Vérifiez les logs Celery Beat pour les erreurs
3. Testez l'API : `GET /api/notifications/unread-count/`

### Problème : Odoo sync ne fonctionne pas

**Solution** :
1. Vérifiez `ODOO_ENABLED=True`
2. Vérifiez les credentials Odoo
3. Testez la connexion Odoo dans Django shell :
   ```python
   from core.odoo_gateway import odoo_gateway
   odoo_gateway._connect()
   ```
4. Vérifiez les logs Celery Worker

---

## 📈 Monitoring

### Logs Render

Accédez aux logs de chaque service :
- **Web Service** : Requêtes HTTP, erreurs Django
- **Celery Worker** : Tasks exécutées, sync Odoo, erreurs
- **Celery Beat** : Tasks scheduled, vérifications deadline

### Métriques à surveiller

- **Temps de réponse API** : < 500ms
- **Celery tasks failed** : doit être proche de 0
- **Redis memory usage** : surveiller la croissance
- **Notifications créées** : vérifier la cohérence

---

## 🔐 Sécurité en Production

### Checklist

- ✅ `DEBUG=False` sur tous les services
- ✅ `SECRET_KEY` unique et complexe (50+ caractères)
- ✅ `ALLOWED_HOSTS` configuré correctement
- ✅ `CORS_ALLOWED_ORIGINS` limité aux domaines autorisés
- ✅ Credentials Odoo sécurisés (2FA activé sur compte Odoo)
- ✅ Redis avec password si exposé
- ✅ PostgreSQL avec password fort
- ✅ HTTPS activé (automatique sur Render/Vercel)

---

## 📚 Documentation complète

- [ODOO_INTEGRATION.md](./ODOO_INTEGRATION.md) - Guide détaillé de l'intégration Odoo
- [README.md](./README.md) - Documentation générale du projet

---

## 🆘 Support

En cas de problème :
1. Consultez les logs Render/Vercel
2. Vérifiez [ODOO_INTEGRATION.md](./ODOO_INTEGRATION.md) pour troubleshooting Odoo
3. Testez l'API manuellement avec curl/Postman
4. Vérifiez que tous les services sont actifs (Web + 2 Workers + Redis + PostgreSQL)

---

**Dernière mise à jour** : 2025-01-24
**Version** : 1.0.0 (Odoo Integration)
