# Tests API - Genius Harmony

## 🔑 Authentification

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"Scott","password":"Lelionvitdanslasavane"}'
```

Réponse:
```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

### Obtenir les infos de l'utilisateur connecté
```bash
TOKEN="<votre_access_token>"
curl -X GET http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 Projets

### Lister tous les projets (selon permissions)
```bash
curl -X GET http://127.0.0.1:8000/api/projets/ \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un nouveau projet
```bash
curl -X POST http://127.0.0.1:8000/api/projets/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Court métrage - La Savane",
    "description": "Un court métrage sur la vie dans la savane",
    "type": "court_metrage",
    "statut": "en_cours",
    "pole": 1,
    "date_debut": "2025-01-15",
    "date_fin_prevue": "2025-03-30"
  }'
```

### Obtenir les détails d'un projet
```bash
curl -X GET http://127.0.0.1:8000/api/projets/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier un projet
```bash
curl -X PATCH http://127.0.0.1:8000/api/projets/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "en_revision",
    "date_fin_reelle": "2025-03-25"
  }'
```

### Supprimer un projet
```bash
curl -X DELETE http://127.0.0.1:8000/api/projets/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Tâches

### Lister toutes les tâches
```bash
curl -X GET http://127.0.0.1:8000/api/taches/ \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les tâches d'un projet spécifique
```bash
curl -X GET "http://127.0.0.1:8000/api/taches/?projet=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les tâches assignées à un utilisateur
```bash
curl -X GET "http://127.0.0.1:8000/api/taches/?assigne_a=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Créer une nouvelle tâche
```bash
curl -X POST http://127.0.0.1:8000/api/taches/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projet": 1,
    "titre": "Écriture du scénario",
    "description": "Rédiger le scénario complet du court métrage",
    "statut": "a_faire",
    "priorite": "haute",
    "deadline": "2025-02-01"
  }'
```

### Modifier une tâche (changer le statut par exemple)
```bash
curl -X PATCH http://127.0.0.1:8000/api/taches/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "en_cours"
  }'
```

---

## 📄 Documents

### Lister tous les documents
```bash
curl -X GET http://127.0.0.1:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les documents d'un projet
```bash
curl -X GET "http://127.0.0.1:8000/api/documents/?projet=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Upload un document
```bash
curl -X POST http://127.0.0.1:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "projet=1" \
  -F "titre=Scénario v1" \
  -F "type=scenario" \
  -F "description=Première version du scénario" \
  -F "fichier=@/chemin/vers/scenario.pdf"
```

### Obtenir les détails d'un document
```bash
curl -X GET http://127.0.0.1:8000/api/documents/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏢 Pôles

### Lister tous les pôles (admin uniquement)
```bash
curl -X GET http://127.0.0.1:8000/api/poles/ \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un pôle (admin uniquement)
```bash
curl -X POST http://127.0.0.1:8000/api/poles/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cinéma",
    "description": "Pôle de production audiovisuelle"
  }'
```

---

## 👥 Utilisateurs

### Lister tous les utilisateurs (admin uniquement)
```bash
curl -X GET http://127.0.0.1:8000/api/users/ \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier le rôle d'un utilisateur (admin uniquement)
```bash
curl -X PATCH http://127.0.0.1:8000/api/users/2/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "chef_pole",
    "pole": 1
  }'
```

---

## 📊 Permissions par rôle

### Admin
- ✅ Voit tous les projets
- ✅ Crée, modifie, supprime tous les projets
- ✅ Gère les pôles et les utilisateurs

### Chef de pôle
- ✅ Voit les projets de son pôle
- ✅ Crée, modifie, supprime les projets de son pôle
- ❌ Ne peut pas gérer les projets d'autres pôles

### Membre / Stagiaire
- ✅ Voit les projets où il est membre ou chef de projet
- ❌ Ne peut pas créer/modifier/supprimer de projets

### Client / Partenaire
- ✅ Voit ses propres projets (où il est client)
- ❌ Ne peut pas créer/modifier/supprimer de projets

---

## 🧪 Exemple de workflow complet

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"Scott","password":"Lelionvitdanslasavane"}' | jq -r '.access')

# 2. Créer un pôle
POLE_ID=$(curl -s -X POST http://127.0.0.1:8000/api/poles/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cinéma","description":"Production audiovisuelle"}' | jq -r '.id')

# 3. Créer un projet
PROJET_ID=$(curl -s -X POST http://127.0.0.1:8000/api/projets/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"titre\":\"Mon premier film\",\"type\":\"court_metrage\",\"statut\":\"en_cours\",\"pole\":$POLE_ID}" | jq -r '.id')

# 4. Créer une tâche
curl -X POST http://127.0.0.1:8000/api/taches/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"projet\":$PROJET_ID,\"titre\":\"Écrire le scénario\",\"statut\":\"a_faire\",\"priorite\":\"haute\"}"

# 5. Lister les projets
curl -X GET http://127.0.0.1:8000/api/projets/ \
  -H "Authorization: Bearer $TOKEN"
```
