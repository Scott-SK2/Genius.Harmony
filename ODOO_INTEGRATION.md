# Intégration Odoo - Guide de Configuration

Ce document explique comment configurer et utiliser l'intégration Odoo avec Genius Harmony.

## 📋 Vue d'ensemble

L'intégration Odoo permet de synchroniser automatiquement :
- **Utilisateurs** → Contacts Odoo (res.partner)
- **Projets** → Projets Odoo (project.project)
- **Tâches** → Tâches Odoo (project.task)
- **Notifications** → Alertes de deadline pour les utilisateurs

### Architecture

- **Gateway centralisé** : `core/odoo_gateway.py` - gère toutes les interactions avec Odoo
- **Rate limiting** : Max 10 requêtes/seconde vers Odoo (configurable)
- **Cache Redis** : 5 minutes de TTL pour les lectures fréquentes
- **Tasks Celery** : Synchronisation asynchrone pour éviter de bloquer l'application
- **Retry automatique** : 3 tentatives avec backoff exponentiel (1s, 2s, 4s)

---

## 🔧 Configuration

### 1. Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```bash
# ========================================
# ODOO CONFIGURATION
# ========================================
ODOO_ENABLED=True
ODOO_HOST=your-odoo-instance.odoo.com
ODOO_PORT=443
ODOO_PROTOCOL=jsonrpc+ssl
ODOO_DB=your-database-name
ODOO_USERNAME=your-odoo-username
ODOO_PASSWORD=your-odoo-password

# ========================================
# REDIS CONFIGURATION (Cache + Celery)
# ========================================
REDIS_URL=redis://localhost:6379/0
# Production (Render, Heroku, etc.) :
# REDIS_URL=redis://:password@redis-host:6379/0
```

### 2. Paramètres Odoo

| Variable | Description | Exemple |
|----------|-------------|---------|
| `ODOO_ENABLED` | Active/désactive l'intégration Odoo | `True` ou `False` |
| `ODOO_HOST` | URL de votre instance Odoo | `mycompany.odoo.com` |
| `ODOO_PORT` | Port Odoo (443 pour HTTPS, 8069 pour HTTP) | `443` |
| `ODOO_PROTOCOL` | Protocole de connexion | `jsonrpc+ssl` (HTTPS) ou `jsonrpc` (HTTP) |
| `ODOO_DB` | Nom de la base de données Odoo | `production` |
| `ODOO_USERNAME` | Email/login Odoo de l'utilisateur API | `api@mycompany.com` |
| `ODOO_PASSWORD` | Mot de passe ou clé API | `your-secure-password` |

### 3. Installation des dépendances

Les dépendances suivantes ont été ajoutées à `requirements.txt` :

```bash
# Odoo Integration
odoorpc==0.10.1

# Celery + Redis (Async tasks + Cache)
redis==5.0.1
celery==5.3.6
django-redis==5.4.0
django-celery-beat==2.5.0
django-celery-results==2.5.1
flower==2.0.1  # Interface web pour monitorer Celery
```

Installez-les avec :

```bash
pip install -r requirements.txt
```

### 4. Migration de la base de données

Appliquez les migrations pour créer les tables nécessaires :

```bash
python manage.py migrate
```

Cela va créer :
- Champ `odoo_task_id` dans le modèle `Tache`
- Table `Notification` pour les notifications utilisateurs
- Tables Celery pour le suivi des tâches async

---

## 🚀 Démarrage des services

### 1. Redis (local)

**Linux/Mac** :
```bash
redis-server
```

**Windows** :
```bash
# Installer Redis via WSL ou Docker
docker run -d -p 6379:6379 redis
```

**Production (Render, Heroku, etc.)** :
- Utilisez un service Redis managé (Render Redis, Heroku Redis, etc.)
- Mettez à jour `REDIS_URL` dans `.env`

### 2. Celery Worker

Le worker Celery exécute les tâches asynchrones (sync Odoo, notifications) :

```bash
celery -A genius_harmony worker --loglevel=info
```

### 3. Celery Beat (Scheduler)

Celery Beat exécute les tâches périodiques (vérification deadlines, batch sync) :

```bash
celery -A genius_harmony beat --loglevel=info
```

### 4. Flower (Monitoring - Optionnel)

Interface web pour monitorer Celery en temps réel :

```bash
celery -A genius_harmony flower
```

Accessible sur `http://localhost:5555`

### 5. Django (Application web)

```bash
python manage.py runserver
```

---

## 📊 Tâches Celery configurées

### Tâches périodiques (Celery Beat)

| Tâche | Fréquence | Description |
|-------|-----------|-------------|
| `check_deadline_notifications` | Toutes les heures | Vérifie les deadlines et crée des notifications (3 jours, 1 jour, aujourd'hui, retard) |
| `batch_sync_odoo_pending` | Toutes les 30 secondes | Synchronise en batch les entités non encore synchronisées avec Odoo |

### Tâches asynchrones (déclenchées par événements)

| Tâche | Déclenchement | Description |
|-------|---------------|-------------|
| `sync_user_to_odoo` | Modification du profil utilisateur | Synchronise l'utilisateur vers Odoo (contact partner) |
| `sync_projet_to_odoo` | Création/modification d'un projet | Synchronise le projet vers Odoo |
| `sync_tache_to_odoo` | Création d'une tâche | Synchronise la tâche vers Odoo |
| `create_task_assigned_notification` | Assignation à une tâche | Crée une notification pour l'utilisateur assigné |
| `create_project_assigned_notification` | Ajout à un projet | Crée une notification pour le membre ajouté |

---

## 🔔 API Notifications

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/notifications/` | Liste toutes les notifications de l'utilisateur |
| `GET` | `/api/notifications/?is_read=false` | Liste uniquement les notifications non lues |
| `GET` | `/api/notifications/unread-count/` | Compte le nombre de notifications non lues |
| `GET` | `/api/notifications/<id>/` | Récupère une notification spécifique |
| `POST` | `/api/notifications/<id>/mark-read/` | Marque une notification comme lue |
| `POST` | `/api/notifications/mark-all-read/` | Marque toutes les notifications comme lues |
| `DELETE` | `/api/notifications/<id>/` | Supprime une notification |
| `DELETE` | `/api/notifications/delete-all-read/` | Supprime toutes les notifications lues |

### Exemples de requêtes

**Récupérer les notifications non lues** :
```javascript
fetch('/api/notifications/?is_read=false', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

**Compter les notifications non lues** :
```javascript
fetch('/api/notifications/unread-count/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
// Réponse : { "count": 5 }
```

**Marquer une notification comme lue** :
```javascript
fetch(`/api/notifications/${notificationId}/mark-read/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

**Marquer toutes les notifications comme lues** :
```javascript
fetch('/api/notifications/mark-all-read/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

---

## 🎯 Types de notifications

| Type | Emoji | Description | Déclenchement |
|------|-------|-------------|---------------|
| `deadline_3days` | 📅 | Deadline dans 3 jours | Tâche avec deadline = aujourd'hui + 3 jours |
| `deadline_1day` | ⚠️ | Deadline demain | Tâche avec deadline = demain |
| `deadline_today` | 🔴 | Deadline aujourd'hui | Tâche avec deadline = aujourd'hui |
| `deadline_overdue` | ❌ | Tâche en retard | Tâche avec deadline < aujourd'hui |
| `task_assigned` | 📋 | Nouvelle tâche assignée | Utilisateur assigné à une tâche |
| `project_assigned` | 🎯 | Nouveau projet assigné | Utilisateur ajouté à un projet |

---

## ⚙️ Configuration avancée

### Rate Limiting personnalisé

Dans `core/odoo_gateway.py`, ligne 53 :

```python
_min_call_interval = 0.1  # 100ms entre chaque appel = max 10 req/sec
```

Modifiez cette valeur selon les limites de votre instance Odoo.

### TTL du cache Redis

Dans `genius_harmony/settings.py`, ligne 210 :

```python
'TIMEOUT': 300,  # 5 minutes par défaut
```

Augmentez pour réduire la charge sur Odoo, diminuez pour des données plus fraîches.

### Gestion des utilisateurs sans first_name/last_name

Les utilisateurs existants sans prénom/nom utilisent automatiquement leur `username` comme nom dans Odoo (voir `core/odoo_gateway.py:186-189`).

---

## 🐛 Dépannage

### Problème : "Odoo not configured"

**Cause** : `ODOO_ENABLED=False` ou variables manquantes

**Solution** :
1. Vérifiez que `ODOO_ENABLED=True` dans `.env`
2. Vérifiez que toutes les variables `ODOO_*` sont définies
3. Redémarrez le serveur Django et les workers Celery

### Problème : "429 Too Many Requests"

**Cause** : Rate limit Odoo dépassé

**Solution** :
- Le gateway retry automatiquement avec backoff (1min, 2min, 4min)
- Augmentez `_min_call_interval` dans `odoo_gateway.py`
- Vérifiez les limites de votre plan Odoo

### Problème : "Connection failed"

**Cause** : Impossible de se connecter à Odoo

**Solution** :
1. Vérifiez `ODOO_HOST`, `ODOO_PORT`, `ODOO_PROTOCOL`
2. Testez la connexion manuellement :
   ```python
   python manage.py shell
   >>> from core.odoo_gateway import odoo_gateway
   >>> odoo_gateway._connect()
   ```
3. Vérifiez que l'utilisateur Odoo a les droits API

### Problème : Notifications non créées

**Cause** : Celery Beat non démarré

**Solution** :
```bash
celery -A genius_harmony beat --loglevel=info
```

### Problème : Redis connection error

**Cause** : Redis non démarré ou `REDIS_URL` incorrect

**Solution** :
1. Démarrez Redis : `redis-server`
2. Testez la connexion :
   ```bash
   redis-cli ping
   # Réponse attendue : PONG
   ```

---

## 📈 Monitoring

### Logs Celery

Les logs Celery affichent les événements de synchronisation :

- ✅ `Created Odoo partner X for user Y`
- ✅ `Updated Odoo project X`
- 📦 `Batch syncing 10 users to Odoo...`
- 🔔 `Created 3-day notification for user X`

### Flower Dashboard

Accédez à `http://localhost:5555` pour voir :
- Tâches en cours
- Tâches terminées/échouées
- Workers actifs
- Statistiques de performance

### Django Admin

Le modèle `Notification` est accessible dans l'admin Django pour visualiser toutes les notifications.

---

## 🔐 Sécurité

### Credentials Odoo

- ⚠️ **NE JAMAIS** committer le fichier `.env` dans Git
- Utilisez un utilisateur Odoo dédié avec droits minimums (lecture/écriture sur partners, projects, tasks)
- Activez l'authentification 2FA sur le compte Odoo

### Redis

En production :
- Utilisez un mot de passe Redis : `REDIS_URL=redis://:password@host:6379/0`
- Activez SSL/TLS si possible

---

## 📚 Ressources

- [Documentation OdooRPC](https://github.com/OCA/odoorpc)
- [Documentation Celery](https://docs.celeryproject.org/)
- [Documentation Django-Redis](https://github.com/jazzband/django-redis)
- [Odoo External API](https://www.odoo.com/documentation/17.0/developer/reference/external_api.html)

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Variables `ODOO_*` configurées dans `.env` de production
- [ ] Service Redis provisionné et `REDIS_URL` configuré
- [ ] Migrations appliquées (`python manage.py migrate`)
- [ ] Celery Worker démarré en background
- [ ] Celery Beat démarré en background
- [ ] Logs Celery configurés pour monitoring
- [ ] Credentials Odoo sécurisés (2FA activé)
- [ ] Rate limiting testé et ajusté selon le plan Odoo
- [ ] Tests de synchronisation effectués sur environnement de staging

---

**Dernière mise à jour** : 2025-01-24
**Auteur** : Claude (Assistant IA)
