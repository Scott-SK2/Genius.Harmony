# Configuration Cloudinary pour Render

## ⚠️ Problème identifié et corrigé

**Vous aviez raison !** Le code Cloudinary était incomplet. Plusieurs bugs critiques empêchaient Cloudinary de fonctionner correctement :

1. ❌ **MEDIA_URL** était toujours défini sur `/media/` même avec Cloudinary actif
2. ❌ **urls.py** servait toujours les fichiers depuis le stockage local
3. ❌ **serializers.py** et **views.py** forçaient les URLs à pointer vers Render au lieu de Cloudinary

**✅ Tous ces problèmes ont été corrigés !**

---

## 📋 Problème original
Les fichiers uploadés (images, documents) sont perdus à chaque redéploiement sur Render car le stockage est **éphémère** (temporaire).

## 💡 Solution
Utiliser **Cloudinary** pour le stockage persistant des fichiers.

## ✅ Corrections appliquées (dans le code)

Le code a maintenant été **COMPLÈTEMENT** configuré pour utiliser Cloudinary :

### 1. ✅ Packages Cloudinary (`requirements.txt`)
- `cloudinary==1.41.0`
- `django-cloudinary-storage==0.3.0`

### 2. ✅ Configuration Django (`genius_harmony/settings.py`)
- Cloudinary ajouté à `INSTALLED_APPS` avant `django.contrib.staticfiles`
- Configuration `CLOUDINARY_STORAGE` avec variables d'environnement
- `DEFAULT_FILE_STORAGE` configuré conditionnellement :
  - **Si Cloudinary configuré** → `cloudinary_storage.storage.MediaCloudinaryStorage`
  - **Sinon** → stockage local avec `MEDIA_URL` et `MEDIA_ROOT`

### 3. ✅ URLs des fichiers corrigées (`genius_harmony/urls.py`)
- Les fichiers media ne sont **PAS** servis localement quand Cloudinary est actif
- Cloudinary génère ses propres URLs (`https://res.cloudinary.com/...`)

### 4. ✅ Serializers et Views corrigés (`core/serializers.py`, `core/views.py`)
- **PROBLÈME CORRIGÉ** : `build_absolute_uri()` ne force plus les URLs vers Render
- Détection automatique des URLs Cloudinary (qui commencent par `http://` ou `https://`)
- Les URLs Cloudinary sont retournées telles quelles, sans modification

### 5. ✅ Modèle `.env.example` mis à jour
- Template avec les 3 variables Cloudinary requises

## 🔧 Étapes à compléter sur Render

Pour activer Cloudinary en production, vous devez ajouter les **3 variables d'environnement** suivantes sur Render :

### Variables à ajouter sur Render.com

1. Connectez-vous à [Render.com](https://render.com/)
2. Allez dans votre service **Genius Harmony** (backend Django)
3. Cliquez sur **Environment** dans le menu de gauche
4. Ajoutez les 3 variables suivantes :

| Nom de la variable | Valeur |
|-------------------|--------|
| `CLOUDINARY_CLOUD_NAME` | `Root` |
| `CLOUDINARY_API_KEY` | `966754657846235` |
| `CLOUDINARY_API_SECRET` | `jwnvZAXBPKWoV8_R8uq8cyLCgsk` |

5. Cliquez sur **Save Changes**
6. **Render redéploiera automatiquement** votre application (attendez 2-3 minutes)

## 🔄 Après le redéploiement

Une fois Render redéployé avec les variables Cloudinary :

1. **Uploadez une nouvelle photo de profil** (les anciennes sont perdues)
2. Vérifiez l'URL de l'image dans l'API :
   - ✅ **Cloudinary actif** : `https://res.cloudinary.com/Root/image/upload/...`
   - ❌ **Problème** : `https://genius-harmony.onrender.com/media/...`

3. Si les URLs pointent encore vers `/media/` :
   - Vérifiez que les 3 variables sont bien ajoutées sur Render
   - Attendez que le redéploiement soit complètement terminé
   - Videz le cache du navigateur (Ctrl+Shift+R)

## ⚠️ Important

**Sans ces variables, Cloudinary ne sera PAS activé !**

Le code utilise un fallback automatique :
- ✅ **Si les variables sont présentes** → Cloudinary est utilisé (stockage persistant)
- ❌ **Si les variables sont absentes** → Stockage local est utilisé (fichiers perdus à chaque redéploiement)

## 🔍 Vérifier que Cloudinary fonctionne

Après avoir ajouté les variables sur Render :

1. Uploadez une image ou un document dans l'application
2. Notez l'URL de l'image uploadée
3. Redéployez l'application (ou attendez un redémarrage automatique)
4. Vérifiez que l'image est toujours accessible

**Si Cloudinary fonctionne correctement :**
- L'URL de l'image contiendra `cloudinary.com` ou `res.cloudinary.com`
- Les fichiers restent accessibles après redéploiement

**Si Cloudinary ne fonctionne pas :**
- L'URL de l'image contiendra votre domaine Render
- Les fichiers disparaissent après redéploiement

## 📚 Ressources

- [Documentation Cloudinary](https://cloudinary.com/documentation)
- [Documentation django-cloudinary-storage](https://github.com/klis87/django-cloudinary-storage)
- [Render Environment Variables](https://render.com/docs/environment-variables)

## 💡 Compte Cloudinary Gratuit

Le compte Cloudinary gratuit offre :
- ✅ 25 GB de stockage
- ✅ 25 GB de bande passante/mois
- ✅ Transformations d'images illimitées
- ✅ Parfait pour le développement et les petits projets

Pour créer un compte : [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
