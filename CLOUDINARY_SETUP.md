# Configuration Cloudinary pour Render

## Problème
Les fichiers uploadés (images, documents) sont perdus à chaque redéploiement sur Render car le stockage est **éphémère** (temporaire).

## Solution
Utiliser **Cloudinary** pour le stockage persistant des fichiers.

## ✅ Étapes déjà complétées (dans le code)

Le code a déjà été configuré pour utiliser Cloudinary :

1. ✅ Packages installés dans `requirements.txt` :
   - `cloudinary==1.41.0`
   - `django-cloudinary-storage==0.3.0`

2. ✅ Configuration Django dans `genius_harmony/settings.py` :
   - Cloudinary ajouté à `INSTALLED_APPS`
   - Configuration `CLOUDINARY_STORAGE` avec variables d'environnement
   - `DEFAULT_FILE_STORAGE` configuré pour utiliser Cloudinary si disponible

3. ✅ Modèle `.env.example` mis à jour avec les variables Cloudinary

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
6. Render redéploiera automatiquement votre application

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
