# 📦 Ajout de contenus médias pour Welcome & Universe Pages

## 🎯 Objectif

Ce guide explique comment ajouter les **vrais fichiers médias** (vidéos, images, audio) pour remplir les pages Welcome et Universe de Genius Harmony.

---

## 📁 Structure des dossiers

```
frontend/genius-harmony-frontend/public/
├── videos/               # Vidéos (MP4)
│   ├── welcome-background.mp4
│   ├── berceau-des-anges-trailer.mp4
│   ├── sauf-a-gaza-trailer.mp4
│   ├── tomates-trailer.mp4
│   ├── maison-hantee-trailer.mp4
│   ├── exfiltration-trailer.mp4
│   ├── psychopathe-trailer.mp4
│   ├── htg-2025-recap.mp4
│   ├── kaeloo-album-teaser.mp4
│   ├── bts-htg.mp4
│   └── studio-session.mp4
│
├── images/               # Images (JPG/PNG)
│   ├── welcome-fallback.jpg
│   ├── wosmen-2025.jpg
│   ├── htg-2024.jpg
│   ├── htg-2023.jpg
│   ├── bifff-partnership.jpg
│   ├── lezarts-urbains.jpg
│   ├── music-production.jpg
│   ├── artist-management.jpg
│   ├── backstage-cinema.jpg
│   ├── team-gh.jpg
│   └── networking.jpg
│
├── audio/                # Fichiers audio (MP3)
│   └── kaeloo-single.mp3
│
└── thumbnails/           # Miniatures pour vidéos/audio (JPG)
    ├── berceau-des-anges.jpg
    ├── sauf-a-gaza.jpg
    ├── tomates.jpg
    ├── maison-hantee.jpg
    ├── exfiltration.jpg
    ├── psychopathe.jpg
    ├── htg-2025.jpg
    ├── kaeloo.jpg
    ├── kaeloo-album.jpg
    ├── bts-htg.jpg
    └── studio-session.jpg
```

---

## 🎬 Contenu à préparer

### PAGE 1 - WelcomePage

#### Vidéo de fond principale
- **Fichier** : `welcome-background.mp4`
- **Recommandation** : Montage d'extraits de vos courts-métrages ou événements
- **Durée** : 10-30 secondes (en boucle)
- **Format** : MP4 (H.264), 1920x1080, < 10 MB
- **Contenu suggéré** :
  - Extraits rapides de tournages
  - Ambiance événements HTG
  - Artistes en performance
  - Logo Genius.Harmony en fin

#### Image de fallback
- **Fichier** : `welcome-fallback.jpg`
- **Format** : JPG, 1920x1080, < 2 MB
- **Contenu suggéré** : Photo de l'équipe ou logo GH

---

### PAGE 2 - UniversePage

### 🎬 SECTION 1 - Cinéma / Tournages

| Court-métrage | Type | Fichiers nécessaires |
|---------------|------|---------------------|
| Berceau des Anges | Vidéo | `berceau-des-anges-trailer.mp4` (trailer)<br>`berceau-des-anges.jpg` (thumbnail) |
| Sauf à Gaza | Vidéo | `sauf-a-gaza-trailer.mp4`<br>`sauf-a-gaza.jpg` |
| Celui qui plantait des tomates | Vidéo | `tomates-trailer.mp4`<br>`tomates.jpg` |
| Une MAISON pas très HANTÉE | Vidéo | `maison-hantee-trailer.mp4`<br>`maison-hantee.jpg` |
| Exfiltration | Vidéo | `exfiltration-trailer.mp4`<br>`exfiltration.jpg` |
| Celui qui pensait comme un psychopathe | Vidéo | `psychopathe-trailer.mp4`<br>`psychopathe.jpg` |

**Specs vidéos** :
- Format : MP4 (H.264)
- Résolution : 1280x720 minimum
- Durée : 30-60 secondes max (trailer)
- Poids : < 20 MB par vidéo

**Specs thumbnails** :
- Format : JPG
- Résolution : 640x360 (16:9)
- Poids : < 500 KB

---

### 🎉 SECTION 2 - Événements

| Événement | Type | Fichiers nécessaires |
|-----------|------|---------------------|
| WoSmen 2025 | Image | `wosmen-2025.jpg` (affiche ou photo) |
| Hacking The Game 2025 | Vidéo | `htg-2025-recap.mp4`<br>`htg-2025.jpg` |
| Hacking The Game 2024 | Image | `htg-2024.jpg` |
| Hacking The Game 2023 | Image | `htg-2023.jpg` |
| Partenariat BIFFF | Image | `bifff-partnership.jpg` |
| Collaboration Lezarts-Urbains | Image | `lezarts-urbains.jpg` |

**Specs images** :
- Format : JPG/PNG
- Résolution : 1280x720
- Poids : < 1 MB

---

### 🎵 SECTION 3 - Musique

| Contenu | Type | Fichiers nécessaires |
|---------|------|---------------------|
| Kaeloo - Single | Audio | `kaeloo-single.mp3` (extrait 60s)<br>`kaeloo.jpg` (pochette) |
| Kaeloo - Album Teaser | Vidéo | `kaeloo-album-teaser.mp4`<br>`kaeloo-album.jpg` |
| Production musicale | Image | `music-production.jpg` |
| Management d'artistes | Image | `artist-management.jpg` |

**Specs audio** :
- Format : MP3
- Bitrate : 192-320 kbps
- Durée : 60 secondes max (extrait)
- Poids : < 5 MB

---

### 📸 SECTION 4 - Coulisses

| Contenu | Type | Fichiers nécessaires |
|---------|------|---------------------|
| Backstage tournage | Image | `backstage-cinema.jpg` |
| Behind The Scenes - HTG | Vidéo | `bts-htg.mp4`<br>`bts-htg.jpg` |
| L'équipe Genius.Harmony | Image | `team-gh.jpg` (photo de groupe) |
| Studio sessions | Vidéo | `studio-session.mp4`<br>`studio-session.jpg` |
| Networking Brussels | Image | `networking.jpg` |

---

## 🚀 Comment ajouter les fichiers

### Option 1 : En local (développement)

```bash
# Naviguer vers le dossier public
cd frontend/genius-harmony-frontend/public

# Copier vos fichiers
cp ~/Downloads/berceau-des-anges-trailer.mp4 videos/
cp ~/Downloads/berceau-des-anges.jpg thumbnails/
# ... etc pour tous les fichiers
```

### Option 2 : Pour la production (Vercel/Render)

1. **Commit les fichiers dans Git** :

```bash
git add frontend/genius-harmony-frontend/public/videos/
git add frontend/genius-harmony-frontend/public/images/
git add frontend/genius-harmony-frontend/public/thumbnails/
git add frontend/genius-harmony-frontend/public/audio/

git commit -m "Add media files for Welcome & Universe pages"
git push
```

2. **Ou utiliser un CDN externe** (recommandé pour gros fichiers) :

```javascript
// Modifier UniversePage.jsx pour pointer vers un CDN
{
  id: 1,
  title: "Berceau des Anges",
  type: "video",
  thumbnail: "https://cdn.geniusharmony.com/thumbnails/berceau-des-anges.jpg",
  src: "https://cdn.geniusharmony.com/videos/berceau-des-anges-trailer.mp4",
}
```

Services CDN recommandés :
- **Cloudinary** (gratuit jusqu'à 25 GB)
- **Bunny CDN** (très rapide, peu cher)
- **AWS S3 + CloudFront**
- **Vimeo** (pour les vidéos)
- **YouTube** (pour les vidéos publiques)

---

## 🎨 Images placeholder temporaires

En attendant les vrais fichiers, vous pouvez utiliser des placeholders :

### Générer des placeholders automatiquement

```bash
# Installer un outil de génération d'images
npm install -g placeholder-image-generator

# Générer des placeholders 1280x720
cd frontend/genius-harmony-frontend/public/images
placeholder-generate 1280x720 "Berceau des Anges" > berceau-des-anges-placeholder.jpg
```

### Ou utiliser un service en ligne

Modifier temporairement les URLs dans `UniversePage.jsx` :

```javascript
// Placeholder temporaire
src: "https://via.placeholder.com/1280x720/FF6B6B/ffffff?text=Berceau+des+Anges"
```

Services de placeholder :
- https://placeholder.com
- https://via.placeholder.com
- https://placehold.co

---

## 🔧 Optimisation des médias

### Compresser les vidéos

```bash
# Installer FFmpeg
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Linux

# Compresser une vidéo
ffmpeg -i input.mp4 -vcodec h264 -acodec mp3 -crf 28 output.mp4
```

### Compresser les images

```bash
# Installer ImageMagick
brew install imagemagick

# Compresser une image JPG
convert input.jpg -quality 85 -resize 1280x720 output.jpg
```

### Compresser l'audio

```bash
# Convertir en MP3 avec bitrate réduit
ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k output.mp3
```

---

## ✅ Checklist de déploiement

- [ ] Vidéo de fond `welcome-background.mp4` ajoutée
- [ ] Image fallback `welcome-fallback.jpg` ajoutée
- [ ] 6 trailers courts-métrages ajoutés
- [ ] 6 thumbnails courts-métrages ajoutés
- [ ] 6 images événements ajoutées
- [ ] 1 fichier audio Kaeloo ajouté
- [ ] 1 pochette Kaeloo ajoutée
- [ ] 5 images coulisses ajoutées
- [ ] Toutes les vidéos compressées (< 20 MB)
- [ ] Toutes les images compressées (< 1 MB)
- [ ] Testé en local
- [ ] Committé dans Git
- [ ] Déployé sur Vercel/Render

---

## 🆘 Besoin d'aide ?

Si vous n'avez pas certains fichiers, voici des alternatives :

1. **Pour les trailers** : Utilisez des extraits de 30-60s de vos courts-métrages
2. **Pour les thumbnails** : Capturez un screenshot d'une scène clé
3. **Pour les événements** : Photos de l'événement ou affiches promotionnelles
4. **Pour la musique** : Extraits de 60s des morceaux
5. **Pour les coulisses** : Photos prises pendant les tournages/événements

---

**Contact pour support** : contact@genius-harmony.com
