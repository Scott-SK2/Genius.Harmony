# 🎨 Pages d'accueil Welcome & Universe - Guide d'utilisation

## 📖 Vue d'ensemble

Deux nouvelles pages d'accueil ont été créées pour offrir une expérience utilisateur immersive :

1. **WelcomePage** (`/welcome`) - Page de bienvenue personnalisée
2. **UniversePage** (`/universe`) - Page d'exploration de l'univers Genius.Harmony

---

## 🟣 PAGE 1 - WelcomePage

### Description
Page de bienvenue chaleureuse avec **vidéo en arrière-plan** qui salue l'utilisateur par son prénom.

### Fonctionnalités
- ✅ Vidéo en arrière-plan avec effet blur
- ✅ Salutation personnalisée avec le prénom de l'utilisateur
- ✅ Animation de la main qui salue (👋)
- ✅ Bouton pour accéder à la page Universe
- ✅ Menu discret en bas (Profil, Projets, Notifications)
- ✅ Responsive mobile

### Ajouter une vidéo de fond

**Étape 1 : Préparer la vidéo**

1. Format recommandé : **MP4** (H.264)
2. Résolution : **1920x1080** minimum (Full HD)
3. Durée : **10-30 secondes** (en boucle)
4. Poids : **< 10 MB** (compression recommandée)

**Étape 2 : Ajouter la vidéo**

```bash
# Copier votre vidéo dans le dossier public
cp votre-video.mp4 frontend/genius-harmony-frontend/public/videos/welcome-background.mp4
```

**Étape 3 : Ajouter une image de fallback (optionnel)**

```bash
# Si la vidéo ne charge pas, cette image s'affichera
cp votre-image.jpg frontend/genius-harmony-frontend/public/images/welcome-fallback.jpg
```

### Désactiver la redirection automatique

Par défaut, la page redirige automatiquement vers `/universe` après 5 secondes. Pour désactiver :

```jsx
// Dans WelcomePage.jsx, ligne 21-27
useEffect(() => {
  // Commentez ces lignes pour désactiver la redirection automatique
  // const timer = setTimeout(() => {
  //   navigate("/universe");
  // }, 5000);
  // return () => clearTimeout(timer);
}, [navigate]);
```

---

## 🔵 PAGE 2 - UniversePage

### Description
Page immersive avec **sections horizontales scrollables** présentant les projets, événements, musique et coulisses du collectif.

### Fonctionnalités
- ✅ 4 sections thématiques avec scroll horizontal
- ✅ Support **vidéos, images et audio**
- ✅ Cartes interactives avec hover effects
- ✅ Lecture vidéo au survol
- ✅ Indicateurs de type de média (📹 🖼️ 🎵)
- ✅ Header fixe avec recherche
- ✅ Bouton pour accéder au dashboard
- ✅ Responsive mobile

### Structure des sections

```javascript
sections = [
  {
    id: 1,
    title: "Cinéma / Tournages",
    emoji: "🎬",
    color: "#FF6B6B",  // Rouge
    items: [...],
  },
  {
    id: 2,
    title: "Événements",
    emoji: "🎉",
    color: "#4ECDC4",  // Cyan
    items: [...],
  },
  {
    id: 3,
    title: "Musique",
    emoji: "🎵",
    color: "#FFD93D",  // Jaune
    items: [...],
  },
  {
    id: 4,
    title: "Coulisses / Vie du collectif",
    emoji: "📸",
    color: "#A8E6CF",  // Vert
    items: [...],
  },
];
```

### Ajouter du contenu

#### 📹 Ajouter une vidéo

```bash
# 1. Copier la vidéo
cp mon-court-metrage.mp4 frontend/genius-harmony-frontend/public/videos/

# 2. Copier le thumbnail (image de prévisualisation)
cp thumbnail.jpg frontend/genius-harmony-frontend/public/thumbnails/
```

```javascript
// 3. Ajouter dans UniversePage.jsx
{
  id: 6,
  title: "Mon nouveau court-métrage",
  type: "video",
  thumbnail: "/thumbnails/thumbnail.jpg",
  src: "/videos/mon-court-metrage.mp4",
}
```

#### 🖼️ Ajouter une image

```bash
# 1. Copier l'image
cp mon-image.jpg frontend/genius-harmony-frontend/public/images/
```

```javascript
// 2. Ajouter dans UniversePage.jsx
{
  id: 7,
  title: "Mon projet photo",
  type: "image",
  src: "/images/mon-image.jpg",
}
```

#### 🎵 Ajouter un fichier audio

```bash
# 1. Copier le fichier audio
cp ma-musique.mp3 frontend/genius-harmony-frontend/public/audio/

# 2. Copier la pochette
cp pochette.jpg frontend/genius-harmony-frontend/public/thumbnails/
```

```javascript
// 3. Ajouter dans UniversePage.jsx
{
  id: 8,
  title: "Nouveau single",
  type: "audio",
  thumbnail: "/thumbnails/pochette.jpg",
  src: "/audio/ma-musique.mp3",
  artist: "Nom de l'artiste",
}
```

### Formats de fichiers recommandés

| Type | Format | Poids max | Résolution |
|------|--------|-----------|------------|
| Vidéo | MP4 (H.264) | 50 MB | 1920x1080 |
| Image | JPG / PNG | 2 MB | 1920x1080 |
| Audio | MP3 / OGG | 10 MB | 320 kbps |
| Thumbnail | JPG | 500 KB | 640x360 |

---

## 🎨 Personnalisation des couleurs

### Modifier les couleurs des sections

Dans `UniversePage.jsx`, modifiez les couleurs de chaque section :

```javascript
const sections = [
  {
    id: 1,
    title: "Cinéma / Tournages",
    emoji: "🎬",
    color: "#FF6B6B",  // 👈 Changez ici
    items: [...],
  },
  // ...
];
```

### Modifier les couleurs générales

```javascript
// Couleurs de la marque
--primary: #8B5CF6        /* Violet principal */
--primary-dark: #6366F1   /* Bleu-violet */
--background: #0A0A0F     /* Noir profond */
--surface: #16213E        /* Bleu nuit */
```

---

## 🔧 Configuration avancée

### Changer le nombre de cartes affichées

Dans `UniversePage.jsx`, styles.card :

```javascript
card: {
  width: "280px",  // 👈 Largeur des cartes (desktop)
  height: "160px", // 👈 Hauteur des cartes
  // ...
},
cardMobile: {
  width: "220px",  // 👈 Largeur des cartes (mobile)
  height: "130px", // 👈 Hauteur des cartes (mobile)
},
```

### Activer la lecture vidéo automatique

```jsx
<video
  src={item.src}
  poster={item.thumbnail}
  style={styles.media}
  muted
  loop
  autoPlay  // 👈 Ajoutez cette prop
  onMouseEnter={(e) => e.target.play()}
  onMouseLeave={(e) => e.target.pause()}
/>
```

### Modifier la vitesse de scroll

Dans la fonction `scroll()` :

```javascript
const scroll = (direction) => {
  const container = scrollContainerRef.current;
  if (container) {
    const scrollAmount = direction === "left" ? -300 : 300;  // 👈 Changez cette valeur
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};
```

---

## 🚀 Flow utilisateur

```
[Login]
   ↓
[WelcomePage - /welcome]
"Heureux de te revoir, Scott 👋"
   ↓ (Clic bouton ou auto après 5s)
[UniversePage - /universe]
Scroll sections horizontales
   ↓ (Bouton "Accéder à mon espace")
[Dashboard - /dashboard]
```

---

## 📱 Responsive

### Mobile
- **WelcomePage** : Texte plus petit, bouton adapté
- **UniversePage** : Cards 220px, swipe pour scroller, header compact

### Desktop
- **WelcomePage** : Centré, max-width 600px
- **UniversePage** : Cards 280px, 4-5 visibles, boutons de scroll

---

## 🐛 Dépannage

### La vidéo de fond ne se charge pas

1. Vérifiez que le fichier existe : `frontend/genius-harmony-frontend/public/videos/welcome-background.mp4`
2. Vérifiez le format : doit être **MP4 (H.264)**
3. Vérifiez le poids : **< 10 MB** recommandé
4. Testez avec un autre navigateur

### Les médias ne s'affichent pas dans Universe

1. Vérifiez les chemins dans le code : `/videos/nom-fichier.mp4`
2. Vérifiez que les fichiers sont dans `public/` (pas `src/`)
3. Rechargez la page avec Ctrl+F5 (vider le cache)

### Le scroll horizontal ne fonctionne pas

1. Vérifiez que vous avez plusieurs items dans la section (> 4)
2. Sur mobile, utilisez le swipe (glissement)
3. Sur desktop, utilisez les boutons ← →

---

## 📦 Prochaines étapes

### Intégration avec l'API Django

Pour charger les données dynamiquement depuis Django :

```javascript
// Dans UniversePage.jsx
useEffect(() => {
  async function fetchSections() {
    const response = await axios.get('/api/universe/sections');
    setSections(response.data);
  }
  fetchSections();
}, []);
```

### Créer l'endpoint Django

```python
# core/views/universe.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def universe_sections(request):
    sections = [
        {
            "id": 1,
            "title": "Cinéma / Tournages",
            "emoji": "🎬",
            "color": "#FF6B6B",
            "items": [
                # Récupérer depuis la DB
            ]
        }
    ]
    return Response(sections)
```

---

## ✅ Checklist de déploiement

- [ ] Ajouter la vidéo de fond `welcome-background.mp4`
- [ ] Ajouter l'image de fallback `welcome-fallback.jpg`
- [ ] Remplir les sections avec du contenu réel
- [ ] Tester sur mobile et desktop
- [ ] Vérifier que tous les médias se chargent
- [ ] Optimiser les images/vidéos (compression)
- [ ] Tester la performance (temps de chargement)

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : contact@genius-harmony.com
- 📱 Telegram : @GeniusHarmony

---

**Créé avec ❤️ par Claude pour Genius.Harmony**
