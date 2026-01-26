# Configuration AWS S3 pour le Stockage Persistant des Photos

## ✅ Solution simple et fiable

AWS S3 est plus simple que Cloudinary et fonctionne parfaitement avec Django.

---

## Étape 1: Créer un bucket S3 (GRATUIT jusqu'à 5GB)

1. **Créez un compte AWS** (gratuit 12 mois): https://aws.amazon.com/free/
2. **Connectez-vous** à la console AWS: https://console.aws.amazon.com
3. **Cherchez "S3"** dans la barre de recherche en haut
4. **Cliquez sur "Create bucket"**

### Configuration du bucket:

- **Bucket name:** `genius-harmony-media` (doit être unique globalement)
- **AWS Region:** `Europe (Paris) eu-west-3`
- **Block Public Access:** ❌ **DÉCOCHEZ "Block all public access"**
- **Confirmez** en cochant "I acknowledge..."
- **Cliquez sur "Create bucket"**

### Configurer les permissions:

1. **Cliquez** sur votre bucket `genius-harmony-media`
2. **Allez dans** l'onglet **"Permissions"**
3. **Descendez** jusqu'à **"Bucket policy"**
4. **Cliquez** sur **"Edit"**
5. **Collez** cette policy (remplacez `genius-harmony-media` par votre nom de bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::genius-harmony-media/*"
    }
  ]
}
```

6. **Cliquez** sur **"Save changes"**

---

## Étape 2: Créer un utilisateur IAM et obtenir les clés

1. **Cherchez "IAM"** dans la barre de recherche
2. **Cliquez** sur **"Users"** dans le menu de gauche
3. **Cliquez** sur **"Create user"**

### Configuration de l'utilisateur:

- **User name:** `genius-harmony-s3-user`
- **Cliquez** sur **"Next"**

### Permissions:

- **Sélectionnez** "Attach policies directly"
- **Cherchez** et sélectionnez **"AmazonS3FullAccess"**
- **Cliquez** sur **"Next"**
- **Cliquez** sur **"Create user"**

### Créer les clés d'accès:

1. **Cliquez** sur l'utilisateur que vous venez de créer
2. **Allez dans** l'onglet **"Security credentials"**
3. **Descendez** jusqu'à **"Access keys"**
4. **Cliquez** sur **"Create access key"**
5. **Sélectionnez** "Application running outside AWS"
6. **Cliquez** sur **"Next"**
7. **Cliquez** sur **"Create access key"**

### ⚠️ IMPORTANT: Notez vos clés!

Vous verrez:
- **Access key ID**: `AKIAxxxxxxxxxx`
- **Secret access key**: `xxxxxxxxxxxxxxxxxxxxxxxx`

**COPIEZ-LES MAINTENANT!** Vous ne pourrez plus voir le Secret après cette page.

---

## Étape 3: Configurer les variables d'environnement sur Render

1. **Allez sur** https://dashboard.render.com
2. **Sélectionnez** votre service **"Genius Harmony"**
3. **Cliquez** sur **"Environment"** (menu de gauche)
4. **Supprimez** les anciennes variables Cloudinary (si présentes):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

5. **Ajoutez** ces 4 nouvelles variables:

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `AWS_ACCESS_KEY_ID` | Votre Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Votre Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_STORAGE_BUCKET_NAME` | Nom de votre bucket | `genius-harmony-media` |
| `AWS_S3_REGION_NAME` | Région du bucket | `eu-west-3` |

6. **Cliquez** sur **"Save Changes"**
7. **Render redéploiera automatiquement** (attendez 2-3 minutes)

---

## Étape 4: Vérification

Une fois le redéploiement terminé:

1. **Connectez-vous** à votre application
2. **Uploadez une nouvelle photo de profil**
3. **L'URL devrait maintenant être:**
   ```
   https://genius-harmony-media.s3.eu-west-3.amazonaws.com/profile_photos/xxx.jpg
   ```

4. **Vérifiez sur AWS:**
   - Allez dans votre bucket S3
   - Vous devriez voir un dossier `profile_photos/`
   - Avec votre image dedans!

5. **La photo restera permanente** même après les redémarrages! ✅

---

## Limites du plan gratuit AWS

- **Stockage:** 5 GB pendant 12 mois
- **Requêtes GET:** 20,000/mois
- **Requêtes PUT:** 2,000/mois

**Largement suffisant pour votre projet!**

Après 12 mois, coût très faible: ~$0.023 par GB/mois

---

## ⚠️ Problème résolu: ACLs désactivés sur les buckets S3 modernes

**Symptôme:** Les URLs S3 sont générées correctement mais les fichiers n'apparaissent pas dans le bucket S3 (bucket reste vide à 0 objets).

**Cause:** Les nouveaux buckets S3 ont les ACLs désactivés par défaut ("Object Ownership" = "Bucket owner enforced"). La configuration `AWS_DEFAULT_ACL = 'public-read'` causait l'échec silencieux des uploads.

**✅ Solution appliquée:** Le code a été mis à jour pour utiliser `AWS_DEFAULT_ACL = None` et s'appuyer uniquement sur la Bucket Policy pour l'accès public. C'est la méthode moderne recommandée par AWS.

---

## Dépannage

### Les fichiers ne s'uploadent pas (bucket S3 reste vide):
- ✅ **CORRIGÉ:** Le problème d'ACL a été résolu dans le code
- Redéployez l'application sur Render après ce fix
- Vérifiez les logs Render pour confirmer que les credentials AWS sont chargés

### L'URL pointe toujours vers Render (`/media/...`):
- Vérifiez que les 4 variables sont bien définies sur Render
- Vérifiez qu'il n'y a pas de fautes de frappe
- Redéployez manuellement avec "Clear build cache & deploy"

### Erreur 403 Forbidden:
- Vérifiez la Bucket Policy dans S3
- Assurez-vous que "Block Public Access" est désactivé
- La Bucket Policy suffit pour l'accès public (pas besoin d'ACLs)

### Erreur de connexion AWS:
- Vérifiez que l'Access Key ID et Secret sont corrects
- Vérifiez que l'utilisateur IAM a la permission "AmazonS3FullAccess"
- Vérifiez les logs Render pour voir les erreurs boto3

---

## Pourquoi S3 plutôt que Cloudinary?

- ✅ **Plus simple** à configurer
- ✅ **Plus fiable** (99.99% uptime garanti)
- ✅ **Moins cher** sur le long terme
- ✅ **Pas de configuration SDK compliquée**
- ✅ **Fonctionne immédiatement** avec django-storages

