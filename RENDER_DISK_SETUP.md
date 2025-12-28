# Configuration Render Disk pour le Stockage Persistant des Fichiers

## ✅ Solution simple et fiable pour stocker les fichiers

Render Disk est un volume persistant attaché directement à votre service Render. C'est la solution la plus simple pour éviter la perte de fichiers lors des redémarrages.

---

## Avantages de Render Disk

- ✅ **Très simple** - Pas de configuration externe (AWS, Cloudinary, etc.)
- ✅ **Persistant** - Les fichiers ne sont jamais supprimés lors des redémarrages
- ✅ **Fiable** - Intégré directement dans Render
- ✅ **Pas de credentials** - Fonctionne comme un disque local
- ✅ **Configuration en 2 minutes** - Juste créer le disk et c'est tout!

---

## Coût

- **1 GB**: ~$1/mois
- **10 GB**: ~$10/mois
- **100 GB**: ~$100/mois

**Largement suffisant pour commencer avec 1GB!**

---

## Configuration (DÉJÀ FAIT)

### Étape 1: Créer le Render Disk

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service "Genius Harmony"
3. Cliquez sur l'onglet "Disks"
4. Cliquez sur "Add Disk"
5. Configuration:
   - **Name**: `media-storage`
   - **Mount Path**: `/opt/render/project/src/media`
   - **Size**: 1 GB
6. Cliquez "Save"

⚠️ Render redémarre automatiquement le service (2-3 minutes)

### Étape 2: Code Django (DÉJÀ CONFIGURÉ)

Le code a été configuré pour détecter automatiquement le Render Disk:

```python
# settings.py
RENDER_DISK_PATH = '/opt/render/project/src/media'
if os.path.exists(RENDER_DISK_PATH):
    MEDIA_ROOT = RENDER_DISK_PATH
    print(f"✅ Using Render Disk for persistent media storage")
else:
    MEDIA_ROOT = BASE_DIR / 'media'  # Développement local
```

---

## Utilisation

### Upload de fichiers

Les fichiers (photos de profil, documents) sont automatiquement sauvegardés sur le Render Disk.

**URLs générées:**
```
https://genius-harmony.onrender.com/media/profile_photos/image.jpg
https://genius-harmony.onrender.com/media/documents/2025/12/27/document.pdf
```

### Persistance

✅ Les fichiers **persistent indéfiniment** même après:
- Redémarrage du service
- Redéploiement
- Clear build cache
- Mise à jour du code

### Accès aux fichiers

Les fichiers sont servis directement par Django via:
- `/media/profile_photos/` pour les photos de profil
- `/media/documents/YYYY/MM/DD/` pour les documents

---

## Vérification

Après le premier déploiement avec Render Disk:

1. **Regardez les logs Render** au démarrage
2. Cherchez cette ligne:
   ```
   ✅ [INFO] Using Render Disk for persistent media storage: /opt/render/project/src/media
   ```
3. Si vous voyez cette ligne ✅, tout fonctionne!

---

## Dépannage

### Le disk ne se monte pas
- Vérifiez que le Mount Path est exactement: `/opt/render/project/src/media`
- Attendez que le service redémarre complètement (peut prendre 3-5 minutes)

### Les fichiers ne persistent pas
- Vérifiez dans les logs que vous voyez: "Using Render Disk for persistent media storage"
- Si vous voyez "Using local media storage", le disk n'est pas monté correctement

### Erreur 404 sur les fichiers
- Vérifiez que `urls.py` sert bien les fichiers media en production
- Les URLs doivent être: `https://votre-app.onrender.com/media/...`

---

## Migration depuis S3/Cloudinary

Si vous aviez des fichiers sur S3 ou Cloudinary:

1. Les anciens URLs S3/Cloudinary continueront de retourner 403 ou 404
2. Tous les **nouveaux fichiers** uploadés seront sur Render Disk
3. Les fichiers sont accessibles immédiatement
4. **Pas besoin de migrer** les anciens fichiers (ils resteront sur S3)

---

## Augmenter l'espace disque

Si vous manquez d'espace:

1. Allez sur Render → Disks
2. Cliquez sur votre disk "media-storage"
3. Augmentez la taille (ex: 1 GB → 10 GB)
4. Cliquez "Save"
5. Aucun redémarrage nécessaire!

---

## Comparaison avec S3/Cloudinary

| Fonctionnalité | Render Disk | AWS S3 | Cloudinary |
|----------------|-------------|---------|------------|
| **Configuration** | ⭐⭐⭐⭐⭐ Très simple | ⭐⭐ Complexe | ⭐⭐⭐ Moyen |
| **Credentials** | ✅ Aucun | ❌ Access Keys | ❌ API Keys |
| **Coût 1GB** | $1/mois | ~$0.02/mois* | Gratuit** |
| **Setup time** | 2 minutes | 30+ minutes | 15 minutes |
| **Persistance** | ✅ Garantie | ✅ Garantie | ✅ Garantie |
| **CDN** | ❌ Non | ⭐ Oui (payant) | ⭐⭐ Oui (inclus) |

\* Après 12 mois gratuits
\** Limité à 25 crédits/mois

**Verdict:** Render Disk est parfait pour commencer - simple, fiable, et prévisible!

---

## Support

Si vous avez des problèmes:
1. Vérifiez les logs Render au démarrage
2. Cherchez "Using Render Disk" ou "Using local media storage"
3. Vérifiez que le disk est bien créé dans Render Dashboard → Disks

Bonne utilisation! 🚀
