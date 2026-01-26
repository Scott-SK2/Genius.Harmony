#!/bin/bash

##############################################################################
# Script de compression vidéo pour Genius.Harmony
#
# Optimise les vidéos pour le web avec FFmpeg :
# - Compression H.264 (compatible tous navigateurs)
# - Résolution adaptée (720p ou 1080p)
# - Audio AAC compressé
# - Bitrate optimisé
#
# Usage:
#   ./compress-videos.sh <dossier_input> [dossier_output]
#
# Exemple:
#   ./compress-videos.sh ./raw-videos ./optimized-videos
##############################################################################

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que FFmpeg est installé
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg n'est pas installé${NC}"
    echo -e "${YELLOW}📦 Installation:${NC}"
    echo -e "  macOS:   ${BLUE}brew install ffmpeg${NC}"
    echo -e "  Ubuntu:  ${BLUE}sudo apt install ffmpeg${NC}"
    echo -e "  Windows: ${BLUE}choco install ffmpeg${NC}"
    exit 1
fi

# Paramètres
INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./compressed}"

# Créer le dossier de sortie
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}🎬 Genius.Harmony - Video Compressor${NC}\n"
echo -e "${BLUE}📂 Input:  ${INPUT_DIR}${NC}"
echo -e "${BLUE}📂 Output: ${OUTPUT_DIR}${NC}\n"

# Compter les vidéos
VIDEO_COUNT=$(find "$INPUT_DIR" -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" \) | wc -l)

if [ "$VIDEO_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Aucune vidéo trouvée dans ${INPUT_DIR}${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Trouvé ${VIDEO_COUNT} vidéo(s) à compresser${NC}\n"

# Fonction de compression
compress_video() {
    local input="$1"
    local filename=$(basename "$input")
    local name="${filename%.*}"
    local output="${OUTPUT_DIR}/${name}.mp4"

    echo -e "${BLUE}📹 Compression: ${filename}${NC}"

    # Obtenir la durée de la vidéo
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input")

    # Paramètres de compression adaptés
    if (( $(echo "$duration < 60" | bc -l) )); then
        # Vidéos courtes (< 1 min) : Haute qualité, bitrate plus élevé
        VIDEO_BITRATE="3000k"
        AUDIO_BITRATE="192k"
        PRESET="medium"
        echo -e "  ${YELLOW}⏱️  Vidéo courte détectée - Qualité haute${NC}"
    elif (( $(echo "$duration < 180" | bc -l) )); then
        # Vidéos moyennes (1-3 min) : Qualité moyenne
        VIDEO_BITRATE="2000k"
        AUDIO_BITRATE="128k"
        PRESET="medium"
        echo -e "  ${YELLOW}⏱️  Vidéo moyenne - Qualité moyenne${NC}"
    else
        # Vidéos longues (> 3 min) : Qualité optimisée
        VIDEO_BITRATE="1500k"
        AUDIO_BITRATE="128k"
        PRESET="fast"
        echo -e "  ${YELLOW}⏱️  Vidéo longue - Qualité optimisée${NC}"
    fi

    # Compression avec FFmpeg
    ffmpeg -i "$input" \
        -c:v libx264 \
        -preset "$PRESET" \
        -crf 23 \
        -b:v "$VIDEO_BITRATE" \
        -maxrate "$VIDEO_BITRATE" \
        -bufsize "$(echo "$VIDEO_BITRATE * 2" | bc)" \
        -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
        -c:a aac \
        -b:a "$AUDIO_BITRATE" \
        -movflags +faststart \
        -y \
        "$output" 2>&1 | grep -E "(frame=|time=|size=)" | tail -1

    if [ $? -eq 0 ]; then
        # Comparer les tailles
        input_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input" 2>/dev/null)
        output_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)

        input_mb=$(echo "scale=2; $input_size / 1048576" | bc)
        output_mb=$(echo "scale=2; $output_size / 1048576" | bc)
        reduction=$(echo "scale=1; 100 - ($output_size * 100 / $input_size)" | bc)

        echo -e "  ${GREEN}✅ Compressé: ${input_mb} MB → ${output_mb} MB (-${reduction}%)${NC}\n"
    else
        echo -e "  ${RED}❌ Échec de compression${NC}\n"
    fi
}

# Compresser toutes les vidéos
find "$INPUT_DIR" -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" \) | while read video; do
    compress_video "$video"
done

echo -e "${GREEN}🎉 Compression terminée !${NC}"
echo -e "${BLUE}📂 Vidéos compressées dans: ${OUTPUT_DIR}${NC}"
