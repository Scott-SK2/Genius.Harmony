#!/bin/bash

##############################################################################
# Script d'optimisation d'images pour Genius.Harmony
#
# Optimise les images pour le web avec ImageMagick :
# - Compression JPEG (qualité 85)
# - Conversion en formats modernes (WebP)
# - Resize si trop grandes
# - Suppression des métadonnées
#
# Usage:
#   ./optimize-images.sh <dossier_input> [dossier_output]
#
# Exemple:
#   ./optimize-images.sh ./raw-images ./optimized-images
##############################################################################

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier que ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick n'est pas installé${NC}"
    echo -e "${YELLOW}📦 Installation:${NC}"
    echo -e "  macOS:   ${BLUE}brew install imagemagick${NC}"
    echo -e "  Ubuntu:  ${BLUE}sudo apt install imagemagick${NC}"
    exit 1
fi

# Paramètres
INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./optimized}"
QUALITY=85
MAX_WIDTH=1920
MAX_HEIGHT=1080

# Créer le dossier de sortie
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/webp"

echo -e "${BLUE}🖼️  Genius.Harmony - Image Optimizer${NC}\n"
echo -e "${BLUE}📂 Input:  ${INPUT_DIR}${NC}"
echo -e "${BLUE}📂 Output: ${OUTPUT_DIR}${NC}"
echo -e "${BLUE}⚙️  Quality: ${QUALITY}% | Max size: ${MAX_WIDTH}x${MAX_HEIGHT}${NC}\n"

# Compter les images
IMAGE_COUNT=$(find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) | wc -l)

if [ "$IMAGE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Aucune image trouvée dans ${INPUT_DIR}${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Trouvé ${IMAGE_COUNT} image(s) à optimiser${NC}\n"

# Fonction d'optimisation
optimize_image() {
    local input="$1"
    local filename=$(basename "$input")
    local name="${filename%.*}"
    local ext="${filename##*.}"

    echo -e "${BLUE}🖼️  Optimisation: ${filename}${NC}"

    # Déterminer le format de sortie
    if [ "${ext,,}" = "png" ]; then
        local output="${OUTPUT_DIR}/${name}.png"
    else
        local output="${OUTPUT_DIR}/${name}.jpg"
    fi

    local webp_output="${OUTPUT_DIR}/webp/${name}.webp"

    # Optimiser l'image
    convert "$input" \
        -strip \
        -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
        -quality "$QUALITY" \
        "$output"

    # Créer version WebP
    convert "$input" \
        -strip \
        -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
        -quality "$QUALITY" \
        "$webp_output"

    if [ $? -eq 0 ]; then
        # Comparer les tailles
        input_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input" 2>/dev/null)
        output_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        webp_size=$(stat -f%z "$webp_output" 2>/dev/null || stat -c%s "$webp_output" 2>/dev/null)

        input_kb=$(echo "scale=0; $input_size / 1024" | bc)
        output_kb=$(echo "scale=0; $output_size / 1024" | bc)
        webp_kb=$(echo "scale=0; $webp_size / 1024" | bc)

        reduction=$(echo "scale=1; 100 - ($output_size * 100 / $input_size)" | bc)
        webp_reduction=$(echo "scale=1; 100 - ($webp_size * 100 / $input_size)" | bc)

        echo -e "  ${GREEN}✅ JPG:  ${input_kb} KB → ${output_kb} KB (-${reduction}%)${NC}"
        echo -e "  ${GREEN}✅ WebP: ${input_kb} KB → ${webp_kb} KB (-${webp_reduction}%)${NC}\n"
    else
        echo -e "  ${RED}❌ Échec d'optimisation${NC}\n"
    fi
}

# Optimiser toutes les images
find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) | while read image; do
    optimize_image "$image"
done

echo -e "${GREEN}🎉 Optimisation terminée !${NC}"
echo -e "${BLUE}📂 Images optimisées:${NC}"
echo -e "  JPG/PNG: ${OUTPUT_DIR}/"
echo -e "  WebP:    ${OUTPUT_DIR}/webp/"
