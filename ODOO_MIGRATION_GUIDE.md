# 🚀 Guide de Migration : Odoo comme Back-Office ERP

## 📋 Contexte

**Objectif** : Migrer progressivement la logique métier de Django vers Odoo pour alléger l'application et profiter des fonctionnalités ERP complètes (facturation, comptabilité, CRM).

**Architecture cible** :
- **Odoo** = Source de vérité (projets, tâches, contacts, facturation, compta)
- **Django** = Interface utilisateur moderne + API mobile
- **Redis/Celery** = Anti-saturation (batch sync, rate limiting)

---

## ⚙️ Phase 1 : Configuration Odoo (2-3 jours)

### 1.1 Installation des modules Odoo

Connecte-toi à Odoo Studio : https://genius-harmony1.odoo.com

```
Apps → Rechercher et installer :
✅ Project (Gestion de projets)
✅ Accounting (Comptabilité)
✅ Invoicing (Facturation)
✅ CRM (Gestion clients)
✅ Contacts (normalement déjà installé)
```

### 1.2 Configuration Projet Odoo

**1.2.1 Activer les fonctionnalités avancées**

```
Settings → General Settings → Project
☑️ Sub-tasks
☑️ Task Dependencies
☑️ Time tracking
☑️ Recurring Tasks
```

**1.2.2 Créer les tags de projet**

```
Project → Configuration → Tags
- Film
- Court métrage
- Web série
- Event
- Atelier/Animation
- Musique
- Autre
```

**1.2.3 Créer les étapes de tâche**

```
Project → Configuration → Stages
- À faire (Séquence: 1)
- En cours (Séquence: 2)
- En révision (Séquence: 3)
- Terminé (Séquence: 4, Replier: ✓)
- Annulé (Séquence: 5, Replier: ✓)
```

---

### 1.3 Configuration des Automated Actions

**Accès** : Settings → Technical → Automation → Automated Actions

#### Action 1 : Deadline dans 3 jours

```yaml
Nom: Genius Harmony - Deadline 3 jours
Modèle: Tâche de projet (project.task)
Déclencheur: Basé sur le temps
Planification: Tous les jours à 09:00

Domaine (filtre):
[
  ('date_deadline', '!=', False),
  ('stage_id.name', 'not in', ['Terminé', 'Annulé'])
]

Condition Python:
# Filtrer les tâches dont la deadline est dans exactement 3 jours
from datetime import date, timedelta
target_date = date.today() + timedelta(days=3)
records = records.filtered(lambda t: t.date_deadline == target_date)

Action: Exécuter du code Python
Code Python:
import requests
import logging
_logger = logging.getLogger(__name__)

DJANGO_API = 'https://genius-harmony.onrender.com/api/odoo-webhooks/deadline-notification/'
WEBHOOK_TOKEN = 'VOTRE_TOKEN_SECRET_ICI'  # À générer et configurer

for task in records:
    try:
        # Récupérer les IDs des utilisateurs assignés
        user_ids = [u.partner_id.id for u in task.user_ids if u.partner_id]

        # Ajouter le chef de projet
        manager_id = None
        if task.project_id and task.project_id.user_id and task.project_id.user_id.partner_id:
            manager_id = task.project_id.user_id.partner_id.id

        payload = {
            'task_id': task.id,
            'type': 'deadline_3days',
            'users': user_ids,
            'project_manager': manager_id
        }

        response = requests.post(
            DJANGO_API,
            json=payload,
            headers={'Authorization': f'Bearer {WEBHOOK_TOKEN}'},
            timeout=10
        )

        if response.status_code == 200:
            _logger.info(f'✅ Notification sent for task {task.id}')
        else:
            _logger.error(f'❌ Failed to send notification: {response.text}')

    except Exception as e:
        _logger.error(f'❌ Error sending notification: {str(e)}')
```

#### Action 2 : Deadline demain

```yaml
Nom: Genius Harmony - Deadline demain
Modèle: Tâche de projet (project.task)
Déclencheur: Basé sur le temps
Planification: Tous les jours à 09:00

Condition Python:
from datetime import date, timedelta
target_date = date.today() + timedelta(days=1)
records = records.filtered(lambda t: t.date_deadline == target_date)

Action: Exécuter du code Python
Code Python: (même que ci-dessus, changer 'type': 'deadline_1day')
```

#### Action 3 : Deadline aujourd'hui

```yaml
Nom: Genius Harmony - Deadline aujourd'hui
Modèle: Tâche de projet (project.task)
Déclencheur: Basé sur le temps
Planification: Tous les jours à 09:00

Condition Python:
from datetime import date
records = records.filtered(lambda t: t.date_deadline == date.today())

Action: Exécuter du code Python
Code Python: (même que ci-dessus, changer 'type': 'deadline_today')
```

#### Action 4 : Tâches en retard

```yaml
Nom: Genius Harmony - Tâches en retard
Modèle: Tâche de projet (project.task)
Déclencheur: Basé sur le temps
Planification: Tous les jours à 09:00

Condition Python:
from datetime import date
records = records.filtered(lambda t: t.date_deadline and t.date_deadline < date.today())

Action: Exécuter du code Python
Code Python: (même que ci-dessus, changer 'type': 'deadline_overdue')
```

#### Action 5 : Assignation de tâche

```yaml
Nom: Genius Harmony - Assignation tâche
Modèle: Tâche de projet (project.task)
Déclencheur: À la création et mise à jour
Champ déclencheur: Assignés (user_ids)

Action: Exécuter du code Python
Code Python:
import requests
import logging
_logger = logging.getLogger(__name__)

DJANGO_API = 'https://genius-harmony.onrender.com/api/odoo-webhooks/task-assigned/'
WEBHOOK_TOKEN = 'VOTRE_TOKEN_SECRET_ICI'

for task in records:
    for user in task.user_ids:
        if user.partner_id:
            try:
                payload = {
                    'task_id': task.id,
                    'user_id': user.partner_id.id
                }

                response = requests.post(
                    DJANGO_API,
                    json=payload,
                    headers={'Authorization': f'Bearer {WEBHOOK_TOKEN}'},
                    timeout=10
                )

                if response.status_code == 200:
                    _logger.info(f'✅ Assignment notification sent')
                else:
                    _logger.error(f'❌ Failed: {response.text}')

            except Exception as e:
                _logger.error(f'❌ Error: {str(e)}')
```

---

## 🔐 Phase 2 : Sécurisation (30 min)

### 2.1 Générer le token secret

Sur ta machine locale ou dans Render Shell :

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Résultat** : `xK9mP2vQ7wR3sT8uY4zA1bC5dF6gH0jL`

### 2.2 Configurer Django (Render)

**Render Dashboard → genius-harmony → Environment**

Ajouter la variable :
```
ODOO_WEBHOOK_SECRET=xK9mP2vQ7wR3sT8uY4zA1bC5dF6gH0jL
```

### 2.3 Configurer Odoo

Dans **CHAQUE** Automated Action créée ci-dessus, remplacer :

```python
WEBHOOK_TOKEN = 'VOTRE_TOKEN_SECRET_ICI'
```

Par :

```python
WEBHOOK_TOKEN = 'xK9mP2vQ7wR3sT8uY4zA1bC5dF6gH0jL'
```

---

## 🧪 Phase 3 : Tests (1 jour)

### 3.1 Test des webhooks

**Test 1 : Deadline 3 jours**

1. Dans Odoo, crée une tâche avec deadline = aujourd'hui + 3 jours
2. Assigne un utilisateur à la tâche
3. Lance manuellement l'action : Settings → Technical → Automation → "Genius Harmony - Deadline 3 jours" → **Run**
4. Vérifie dans Django :
   - L'utilisateur assigné reçoit une notification
   - Le chef de projet (si défini) reçoit aussi une notification

**Test 2 : Assignation**

1. Dans Odoo, crée une nouvelle tâche
2. Assigne un utilisateur
3. Vérifie dans Django : l'utilisateur reçoit "Nouvelle tâche assignée"

**Test 3 : Logs**

Vérifie les logs Odoo :
```
Settings → Technical → Logging
Chercher "Genius Harmony"
```

Vérifie les logs Django (Render) :
```
Render Dashboard → genius-harmony → Logs
Chercher "📥 Received"
```

---

## 🔄 Phase 4 : Migration progressive (optionnel)

### 4.1 Désactiver les notifications Django

Une fois que tout fonctionne avec Odoo :

**Dans `core/tasks.py`**, commenter la tâche `check_deadline_notifications` :

```python
# @shared_task
# def check_deadline_notifications():
#     """
#     DÉSACTIVÉ - Les notifications sont maintenant gérées par Odoo
#     """
#     pass
```

**Dans Celery Beat**, supprimer la tâche planifiée :

```bash
# Via Django shell
python manage.py shell

from django_celery_beat.models import PeriodicTask
PeriodicTask.objects.filter(name='check-deadline-notifications').delete()
```

### 4.2 Activer la sync bidirectionnelle

Pour que Django lise depuis Odoo (au lieu de créer) :

```python
# Dans core/views/projets.py
def list_projets():
    # Au lieu de lire depuis Django DB
    projets = Projet.objects.all()

    # Lire depuis Odoo
    projets = odoo_gateway.get_projects()
    # Convertir en format Django pour l'API
```

---

## 📊 Architecture Finale

```
┌──────────────────────────────────────────┐
│           ODOO (ERP)                     │
│  • Projets, Tâches, Contacts             │
│  • Facturation, Comptabilité, CRM        │
│  • Automated Actions (deadlines)         │
│  • Webhooks → Django API                 │
└──────────────┬───────────────────────────┘
               │ HTTPS REST
               │ (webhook calls)
               ▼
┌──────────────────────────────────────────┐
│           DJANGO (API)                   │
│  • Interface React moderne               │
│  • API mobile                            │
│  • Notifications                         │
│  • Authentification JWT                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Redis + Celery                    │ │
│  │  • Batch sync (anti-saturation)    │ │
│  │  • Rate limiting                   │ │
│  │  • Cache                           │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## ✅ Checklist Finale

**Phase 1 : Configuration Odoo**
- [ ] Modules Odoo installés (Project, Accounting, CRM)
- [ ] Tags de projet créés
- [ ] Étapes de tâche configurées
- [ ] 5 Automated Actions créées

**Phase 2 : Sécurisation**
- [ ] Token secret généré
- [ ] `ODOO_WEBHOOK_SECRET` ajouté dans Render
- [ ] Token configuré dans les 5 Automated Actions

**Phase 3 : Tests**
- [ ] Test deadline 3 jours ✓
- [ ] Test assignation ✓
- [ ] Logs Odoo vérifiés ✓
- [ ] Logs Django vérifiés ✓

**Phase 4 : Migration (optionnel)**
- [ ] Tâche Django `check_deadline_notifications` désactivée
- [ ] Sync bidirectionnelle activée

---

## 🆘 Troubleshooting

### Problème : Pas de notification reçue

**Vérifier** :
1. Logs Odoo : l'action s'est-elle exécutée ?
2. Logs Django (Render) : webhook reçu ?
3. Token correct dans Odoo ET Django ?
4. URL correcte : `https://genius-harmony.onrender.com/api/odoo-webhooks/deadline-notification/`

### Problème : Erreur 401 Unauthorized

**Cause** : Token secret incorrect

**Solution** :
```bash
# Regénérer le token
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Mettre à jour dans Render ET dans les 5 Automated Actions Odoo
```

### Problème : Erreur 404 Task not found

**Cause** : La tâche existe dans Odoo mais pas dans Django

**Solution** : Lancer la sync manuelle
```bash
python manage.py shell
from core.tasks import batch_sync_odoo
batch_sync_odoo.delay()
```

---

## 📞 Support

**Questions sur Odoo** : Contacter le membre de l'équipe qui maîtrise Odoo Studio

**Questions sur Django** : Voir les logs Render et créer une issue GitHub

**Documentation Odoo** : https://www.odoo.com/documentation/17.0/

---

## 🎉 Avantages de cette architecture

✅ **Code Django plus léger** - La logique métier est dans Odoo
✅ **Fonctionnalités ERP complètes** - Facturation, compta, CRM intégrés
✅ **Scalable** - Redis/Celery évite la saturation
✅ **Maintenance simplifiée** - Un seul endroit pour la logique métier
✅ **Rapports avancés** - Odoo a des outils de reporting puissants

---

## 📅 Timeline Recommandée

| Phase | Durée | Description |
|-------|-------|-------------|
| Phase 1 | 2-3 jours | Configuration Odoo |
| Phase 2 | 30 min | Sécurisation |
| Phase 3 | 1 jour | Tests |
| **TOTAL** | **3-4 jours** | **Migration complète** |

Phase 4 (optionnel) peut être faite plus tard quand tout est stable.
