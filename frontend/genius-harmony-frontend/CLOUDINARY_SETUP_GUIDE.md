# 📦 Configuration Cloudinary pour Genius.Harmony

## 🎯 Pourquoi Cloudinary ?

- ✅ **25 GB gratuits** (largement suffisant pour commencer)
- ✅ **CDN mondial** (livraison rapide partout)
- ✅ **Optimisation automatique** (compression, formats modernes)
- ✅ **Transformations à la volée** (resize, crop, filters)
- ✅ **Support vidéo, image, audio**

---

## 📝 Étape 1 : Créer un compte Cloudinary

1. Va sur https://cloudinary.com/users/register/free
2. Inscris-toi avec l'email de Genius.Harmony
3. Confirme ton email
4. Note tes credentials (tu les trouveras dans le Dashboard)

**Informations importantes à noter :**
```
Cloud Name: genius-harmony
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

---

## 🔧 Étape 2 : Installer le SDK Cloudinary

```bash
# Dans le dossier frontend
cd frontend/genius-harmony-frontend
npm install cloudinary-react

# Pour uploader depuis le backend Django (optionnel)
pip install cloudinary
```

---

## 🔑 Étape 3 : Configurer les variables d'environnement

### Frontend (React)

Crée un fichier `.env.local` dans `frontend/genius-harmony-frontend/` :

```bash
# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=genius-harmony
REACT_APP_CLOUDINARY_UPLOAD_PRESET=genius_harmony_unsigned

# Note: Ne mets PAS l'API Secret ici (sécurité)
```

### Backend (Django) - Optionnel

Ajoute dans `.env` :

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=genius-harmony
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=ton_secret_ici
```

---

## 📤 Étape 4 : Créer un Upload Preset (important !)

Un Upload Preset permet d'uploader sans exposer ton API Secret.

**Dans Cloudinary Dashboard :**

1. Va dans **Settings** → **Upload**
2. Scroll jusqu'à **Upload presets**
3. Clique sur **Add upload preset**
4. Configure :

```
Preset name: genius_harmony_unsigned
Signing mode: Unsigned
Folder: genius-harmony/
Access mode: Public
Allowed formats: mp4, jpg, jpeg, png, mp3, ogg, webm
Max file size: 100 MB
```

5. Clique sur **Save**

---

## 📂 Étape 5 : Organiser tes dossiers Cloudinary

Structure recommandée :

```
genius-harmony/
├── videos/
│   ├── trailers/
│   │   ├── berceau-des-anges.mp4
│   │   ├── sauf-a-gaza.mp4
│   │   └── ...
│   ├── events/
│   │   └── htg-2025-recap.mp4
│   └── music/
│       └── kaeloo-album-teaser.mp4
│
├── images/
│   ├── events/
│   │   ├── wosmen-2025.jpg
│   │   └── htg-2024.jpg
│   ├── team/
│   │   └── team-gh.jpg
│   └── backstage/
│       └── backstage-cinema.jpg
│
├── thumbnails/
│   ├── berceau-des-anges.jpg
│   └── ...
│
└── audio/
    └── kaeloo-single.mp3
```

---

## 🚀 Étape 6 : Uploader tes médias

### Option A : Via l'interface web (le plus simple)

1. Va dans **Media Library** dans Cloudinary
2. Clique sur **Upload**
3. Drag & drop tes fichiers
4. Nomme-les correctement (ex: `berceau-des-anges`)
5. Organise-les dans les bons dossiers

### Option B : Via l'API (automatisé)

Utilise le script que je vais créer : `upload-to-cloudinary.js`

---

## 🔗 Étape 7 : Récupérer les URLs

Une fois uploadé, chaque fichier a une URL :

**Format des URLs Cloudinary :**

```
Images :
https://res.cloudinary.com/genius-harmony/image/upload/v1234567890/genius-harmony/thumbnails/berceau-des-anges.jpg

Vidéos :
https://res.cloudinary.com/genius-harmony/video/upload/v1234567890/genius-harmony/videos/trailers/berceau-des-anges.mp4

Audio :
https://res.cloudinary.com/genius-harmony/raw/upload/v1234567890/genius-harmony/audio/kaeloo-single.mp3
```

**URLs optimisées (avec transformations) :**

```
Thumbnail optimisé (640x360, qualité auto) :
https://res.cloudinary.com/genius-harmony/image/upload/w_640,h_360,c_fill,q_auto,f_auto/v1234567890/genius-harmony/thumbnails/berceau-des-anges.jpg

Vidéo optimisée (720p, qualité auto) :
https://res.cloudinary.com/genius-harmony/video/upload/w_1280,h_720,q_auto,f_auto/v1234567890/genius-harmony/videos/trailers/berceau-des-anges.mp4
```

---

## ⚙️ Étape 8 : Optimisations automatiques

Cloudinary optimise automatiquement avec ces paramètres :

```
q_auto     - Qualité automatique (balance qualité/poids)
f_auto     - Format automatique (WebP pour Chrome, JPEG pour Safari, etc.)
w_640      - Largeur max 640px
h_360      - Hauteur max 360px
c_fill     - Crop pour remplir les dimensions
e_blur:300 - Effet blur (pour backgrounds)
```

**Exemples d'utilisation :**

```javascript
// Thumbnail optimisé
const thumbnailUrl = `https://res.cloudinary.com/genius-harmony/image/upload/w_640,h_360,c_fill,q_auto,f_auto/genius-harmony/thumbnails/berceau-des-anges.jpg`;

// Vidéo optimisée 720p
const videoUrl = `https://res.cloudinary.com/genius-harmony/video/upload/w_1280,h_720,q_auto,f_auto/genius-harmony/videos/trailers/berceau-des-anges.mp4`;

// Background flou
const blurredBg = `https://res.cloudinary.com/genius-harmony/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto,e_blur:300/genius-harmony/images/welcome-background.jpg`;
```

---

## 📊 Étape 9 : Monitoring de l'usage

**Dashboard Cloudinary** → **Usage**

Tu peux voir :
- Stockage utilisé / 25 GB
- Bande passante utilisée / mois
- Nombre de transformations

**Conseils pour rester dans la limite gratuite :**
- Compresse tes vidéos avant upload
- Utilise YouTube/Vimeo pour les vidéos > 2 minutes
- Active le caching navigateur

---

## 🔒 Sécurité

**À NE JAMAIS faire :**
- ❌ Exposer ton API Secret dans le code frontend
- ❌ Committer `.env` dans Git
- ❌ Partager tes credentials

**Bonnes pratiques :**
- ✅ Utiliser un Upload Preset unsigned
- ✅ Mettre `.env` dans `.gitignore`
- ✅ Limiter les formats acceptés
- ✅ Définir une taille max de fichier

---

## 🆘 Dépannage

### Erreur "Upload preset not found"
→ Vérifie que tu as créé le preset et qu'il est "Unsigned"

### Erreur "Invalid cloud name"
→ Vérifie que `REACT_APP_CLOUDINARY_CLOUD_NAME` est correct

### Vidéo ne se charge pas
→ Vérifie le format (doit être MP4, H.264)

### Image floue
→ Retire le paramètre `e_blur` de l'URL

---

## 📞 Support Cloudinary

- Documentation : https://cloudinary.com/documentation
- Support : support@cloudinary.com
- Community : https://community.cloudinary.com

---

**Une fois configuré, passe à l'étape suivante : Uploader tes fichiers !**
