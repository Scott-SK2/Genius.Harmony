# 🎬 Guide complet : Workflow médias pour Genius.Harmony

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Workflow recommandé](#workflow-recommandé)
4. [Utiliser YouTube/Vimeo](#utiliser-youtubevimeo)
5. [Utiliser Cloudinary](#utiliser-cloudinary)
6. [Scripts de compression](#scripts-de-compression)
7. [Exemples pratiques](#exemples-pratiques)

---

## 🎯 Vue d'ensemble

Ce guide t'accompagne pour gérer tous les médias de Genius.Harmony :
- 🎬 **Vidéos** : Courts-métrages, trailers, coulisses
- 🖼️ **Images** : Photos événements, backstage, team
- 🎵 **Audio** : Musiques, podcasts

**3 Options possibles :**

1. **YouTube/Vimeo** (Recommandé pour vidéos > 2 min) - ✅ GRATUIT
2. **Cloudinary** (Recommandé pour tout le reste) - ✅ 25 GB gratuits
3. **Fichiers locaux** (Développement uniquement) - ⚠️ Non recommandé en prod

---

## 📦 Installation

### 1. Installer les dépendances

```bash
# Installer FFmpeg (compression vidéo)
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Linux
choco install ffmpeg  # Windows

# Installer ImageMagick (optimisation images)
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux
choco install imagemagick  # Windows

# Installer Node.js packages pour Cloudinary
cd scripts
npm install
```

### 2. Configurer Cloudinary

```bash
# Copier le fichier d'exemple
cd scripts
cp .env.example .env

# Éditer avec tes credentials
nano .env  # ou code .env
```

Remplis avec tes vraies credentials Cloudinary :
```bash
CLOUDINARY_CLOUD_NAME=genius-harmony
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=ton_secret_ici
```

---

## 🔄 Workflow recommandé

### Pour les vidéos de courts-métrages

```
1. Raw footage (fichier brut)
   ↓
2. Montage final (export haute qualité)
   ↓
3. Créer un trailer de 60s
   ↓
4. Uploader le court-métrage complet sur YouTube
   ↓
5. Compresser le trailer avec notre script
   ↓
6. Uploader le trailer sur Cloudinary
   ↓
7. Ajouter dans UniversePage.jsx
```

**Résultat** :
- Trailer rapide dans UniversePage (autoplay)
- Clic → Redirection vers YouTube pour le film complet

---

### Pour les photos d'événements

```
1. Photos brutes (haute résolution)
   ↓
2. Sélectionner les meilleures (10-20 max par événement)
   ↓
3. Optimiser avec notre script
   ↓
4. Uploader sur Cloudinary
   ↓
5. Ajouter dans UniversePage.jsx
```

---

### Pour la musique

```
1. Fichier audio original (WAV/FLAC)
   ↓
2. Exporter en MP3 320kbps
   ↓
3. Créer une pochette (cover art) 1000x1000px
   ↓
4. Uploader sur Cloudinary
   ↓
5. Ajouter dans UniversePage.jsx
```

---

## 📺 Utiliser YouTube/Vimeo

### Avantages
- ✅ **Illimité** et gratuit
- ✅ **Lecteur** optimisé (qualité auto, subtitles)
- ✅ **SEO** et découvrabilité
- ✅ **Analytics** détaillées

### Configuration YouTube

1. **Uploader ta vidéo** sur YouTube
2. **Copier l'ID** de la vidéo :
   ```
   URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ID:  dQw4w9WgXcQ
   ```

3. **Ajouter dans UniversePage.jsx** :

```javascript
{
  id: 1,
  title: "Berceau des Anges",
  type: "youtube",
  youtubeId: "dQw4w9WgXcQ",  // ← L'ID de ta vidéo
  thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",  // ← Auto-généré
  description: "Court-métrage - Quartier Court",
}
```

### Configuration Vimeo

1. **Uploader ta vidéo** sur Vimeo
2. **Copier l'ID** :
   ```
   URL: https://vimeo.com/123456789
   ID:  123456789
   ```

3. **Ajouter dans UniversePage.jsx** :

```javascript
{
  id: 2,
  title: "Sauf à Gaza",
  type: "vimeo",
  vimeoId: "123456789",  // ← L'ID de ta vidéo
  thumbnail: "https://vumbnail.com/123456789.jpg",  // ← Thumbnail Vimeo
  description: "Court-métrage - Quartier Court",
}
```

---

## ☁️ Utiliser Cloudinary

### Étape 1 : Compresser tes médias

#### Vidéos

```bash
cd scripts

# Compresser toutes les vidéos d'un dossier
./compress-videos.sh ~/Downloads/raw-videos ./compressed-videos

# Résultat : Vidéos optimisées pour le web (720p, H.264, < 10 MB)
```

#### Images

```bash
cd scripts

# Optimiser toutes les images
./optimize-images.sh ~/Downloads/raw-images ./optimized-images

# Résultat :
#   - Images JPG/PNG optimisées
#   - Versions WebP modernes
```

### Étape 2 : Uploader vers Cloudinary

```bash
cd scripts

# Mode interactif (recommandé pour débuter)
npm run upload

# Mode CLI
node upload-to-cloudinary.js ./compressed-videos video
node upload-to-cloudinary.js ./optimized-images image
node upload-to-cloudinary.js ./audio-files raw
```

### Étape 3 : Récupérer les URLs

Une fois uploadé, tu recevras les URLs :

```
✅ Uploaded 3/3 files

📋 URLs des fichiers uploadés:
  genius-harmony/videos/trailers/berceau-des-anges: https://res.cloudinary.com/genius-harmony/video/upload/v1234567890/genius-harmony/videos/trailers/berceau-des-anges.mp4
  ...
```

### Étape 4 : Ajouter dans UniversePage.jsx

```javascript
{
  id: 1,
  title: "Berceau des Anges",
  type: "video",
  thumbnail: "https://res.cloudinary.com/genius-harmony/image/upload/w_640,h_360,c_fill,q_auto,f_auto/genius-harmony/thumbnails/berceau-des-anges.jpg",
  src: "https://res.cloudinary.com/genius-harmony/video/upload/w_1280,h_720,q_auto,f_auto/genius-harmony/videos/trailers/berceau-des-anges.mp4",
  description: "Court-métrage - Quartier Court",
}
```

---

## 🛠️ Scripts de compression

### compress-videos.sh

**Optimise automatiquement** selon la durée :
- **< 1 min** : Haute qualité (3000k bitrate)
- **1-3 min** : Qualité moyenne (2000k bitrate)
- **> 3 min** : Qualité optimisée (1500k bitrate)

**Paramètres :**
```bash
./compress-videos.sh <input_folder> [output_folder]

# Exemples
./compress-videos.sh ~/Downloads/videos
./compress-videos.sh ~/Downloads/videos ./compressed
```

**Sortie :**
- Format : MP4 (H.264)
- Résolution : Max 1280x720 (conserve ratio)
- Audio : AAC
- Métadonnées : Optimisé pour streaming

---

### optimize-images.sh

**Optimise les images** en deux formats :
- **JPG/PNG** : Pour compatibilité max
- **WebP** : Format moderne (30-40% plus léger)

**Paramètres :**
```bash
./optimize-images.sh <input_folder> [output_folder]

# Exemples
./optimize-images.sh ~/Downloads/images
./optimize-images.sh ~/Downloads/images ./optimized
```

**Sortie :**
- JPG/PNG optimisés (qualité 85%)
- WebP modernes
- Métadonnées supprimées
- Max 1920x1080

---

## 📝 Exemples pratiques

### Exemple 1 : Ajouter un nouveau court-métrage

```bash
# 1. Compresser le trailer
cd scripts
./compress-videos.sh ~/Desktop/berceau-trailer.mp4 ./compressed

# 2. Uploader sur Cloudinary
npm run upload
# Sélectionner le fichier compressé
# Type: video
# Folder: genius-harmony/videos/trailers

# 3. Uploader le film complet sur YouTube
# URL: https://youtu.be/ABC123XYZ

# 4. Ajouter dans UniversePage.jsx
```

```javascript
// Dans sections[0].items (Cinéma)
{
  id: 7,
  title: "Nouveau Court-Métrage",
  type: "video",  // Trailer Cloudinary
  thumbnail: "https://res.cloudinary.com/genius-harmony/image/upload/genius-harmony/thumbnails/nouveau-court-metrage.jpg",
  src: "https://res.cloudinary.com/genius-harmony/video/upload/genius-harmony/videos/trailers/nouveau-court-metrage.mp4",
  description: "Court-métrage drame - 2025",
  // Optionnel : Lien vers YouTube pour le film complet
  fullVideoUrl: "https://youtu.be/ABC123XYZ",
}
```

---

### Exemple 2 : Ajouter des photos d'événement

```bash
# 1. Optimiser les photos
cd scripts
./optimize-images.sh ~/Desktop/htg-2025-photos ./optimized

# 2. Uploader sur Cloudinary
npm run upload
# Type: image
# Folder: genius-harmony/images/events

# 3. Ajouter dans UniversePage.jsx
```

```javascript
// Dans sections[1].items (Événements)
{
  id: 7,
  title: "Hacking The Game 2025 - Highlights",
  type: "image",
  src: "https://res.cloudinary.com/genius-harmony/image/upload/w_1280,h_720,c_fill,q_auto,f_auto/genius-harmony/images/events/htg-2025-highlights.jpg",
  description: "Les meilleurs moments de HTG 2025",
}
```

---

### Exemple 3 : Ajouter un single Kaeloo

```bash
# 1. Compresser l'audio (si WAV/FLAC)
ffmpeg -i kaeloo-single.wav -codec:a libmp3lame -b:a 192k kaeloo-single.mp3

# 2. Optimiser la pochette
cd scripts
./optimize-images.sh ~/Desktop/kaeloo-cover.jpg ./optimized

# 3. Uploader sur Cloudinary
npm run upload
# Uploader l'audio (type: raw)
# Uploader la pochette (type: image)

# 4. Ajouter dans UniversePage.jsx
```

```javascript
// Dans sections[2].items (Musique)
{
  id: 5,
  title: "Kaeloo - Nouveau Single",
  type: "audio",
  thumbnail: "https://res.cloudinary.com/genius-harmony/image/upload/genius-harmony/thumbnails/kaeloo-single.jpg",
  src: "https://res.cloudinary.com/genius-harmony/raw/upload/genius-harmony/audio/kaeloo-single.mp3",
  artist: "Kaeloo",
  description: "Single 2025 - Prod. Genius.Harmony",
}
```

---

## 🆘 Troubleshooting

### FFmpeg not found
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Vérifier l'installation
ffmpeg -version
```

### ImageMagick not found
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt install imagemagick

# Vérifier
convert --version
```

### Cloudinary upload fails
```bash
# Vérifier les credentials
cat scripts/.env

# Tester la connexion
node -e "require('cloudinary').v2.config({cloud_name: 'genius-harmony', api_key: 'XXX', api_secret: 'YYY'}); console.log('OK')"
```

### Vidéo ne se charge pas dans UniversePage
1. Vérifier l'URL dans la console
2. Tester l'URL directement dans le navigateur
3. Vérifier le format (doit être MP4 H.264)
4. Vérifier CORS (Cloudinary doit autoriser ton domaine)

---

## ✅ Checklist finale

Avant de déployer :

- [ ] Toutes les vidéos sont compressées (< 20 MB)
- [ ] Toutes les images sont optimisées (< 1 MB)
- [ ] Les URLs Cloudinary/YouTube sont correctes
- [ ] Les thumbnails s'affichent
- [ ] La lecture vidéo fonctionne (hover)
- [ ] L'audio se charge
- [ ] Testé sur mobile et desktop
- [ ] Pas d'erreurs console

---

## 📞 Support

- **Documentation Cloudinary** : https://cloudinary.com/documentation
- **FFmpeg Guide** : https://ffmpeg.org/documentation.html
- **Contact** : contact@genius-harmony.com

---

**Créé avec ❤️ pour Genius.Harmony**
