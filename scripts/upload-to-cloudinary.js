#!/usr/bin/env node

/**
 * Script d'upload automatique vers Cloudinary
 *
 * Usage:
 *   node upload-to-cloudinary.js <dossier> <type>
 *
 * Exemples:
 *   node upload-to-cloudinary.js ./videos/trailers video
 *   node upload-to-cloudinary.js ./images/events image
 *   node upload-to-cloudinary.js ./audio audio
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration Cloudinary
// Remplace par tes vraies credentials ou utilise des variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'genius-harmony',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
});

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Upload un fichier vers Cloudinary
 */
async function uploadFile(filePath, resourceType, folder) {
  const fileName = path.basename(filePath, path.extname(filePath));

  console.log(`${colors.blue}📤 Uploading: ${fileName}${colors.reset}`);

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: folder,
      public_id: fileName,
      overwrite: true,
      // Optimisations
      quality: 'auto',
      fetch_format: 'auto',
    });

    console.log(`${colors.green}✅ Success: ${result.secure_url}${colors.reset}`);
    return result;
  } catch (error) {
    console.error(`${colors.red}❌ Error uploading ${fileName}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Upload tous les fichiers d'un dossier
 */
async function uploadFolder(folderPath, resourceType, cloudinaryFolder) {
  if (!fs.existsSync(folderPath)) {
    console.error(`${colors.red}❌ Folder not found: ${folderPath}${colors.reset}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath);

  // Filtrer les fichiers selon le type
  const validExtensions = {
    video: ['.mp4', '.mov', '.avi', '.webm'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    raw: ['.mp3', '.ogg', '.wav', '.m4a'], // raw pour audio
  };

  const filteredFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return validExtensions[resourceType].includes(ext);
  });

  if (filteredFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No ${resourceType} files found in ${folderPath}${colors.reset}`);
    return;
  }

  console.log(`\n${colors.blue}📁 Found ${filteredFiles.length} files to upload${colors.reset}\n`);

  const results = [];
  for (const file of filteredFiles) {
    const filePath = path.join(folderPath, file);
    const result = await uploadFile(filePath, resourceType, cloudinaryFolder);
    if (result) {
      results.push(result);
    }
  }

  console.log(`\n${colors.green}✅ Uploaded ${results.length}/${filteredFiles.length} files${colors.reset}\n`);

  // Afficher les URLs
  console.log(`${colors.blue}📋 URLs des fichiers uploadés:${colors.reset}`);
  results.forEach(result => {
    console.log(`  ${result.public_id}: ${result.secure_url}`);
  });
}

/**
 * Mode interactif
 */
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log(`\n${colors.blue}🎬 Genius.Harmony - Cloudinary Uploader${colors.reset}\n`);

  const folderPath = await question('Chemin du dossier à uploader: ');

  console.log('\nType de fichiers:');
  console.log('  1. Vidéo (mp4, mov, avi, webm)');
  console.log('  2. Image (jpg, png, gif, webp)');
  console.log('  3. Audio (mp3, ogg, wav)');

  const typeChoice = await question('\nChoix (1-3): ');

  const typeMap = {
    '1': 'video',
    '2': 'image',
    '3': 'raw',
  };

  const resourceType = typeMap[typeChoice] || 'image';

  const cloudinaryFolder = await question('Dossier Cloudinary (ex: genius-harmony/videos/trailers): ');

  rl.close();

  await uploadFolder(folderPath, resourceType, cloudinaryFolder);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Mode interactif
    await interactiveMode();
  } else if (args.length === 2) {
    // Mode CLI
    const [folderPath, resourceType] = args;

    // Déduire le dossier Cloudinary du chemin local
    const baseName = path.basename(folderPath);
    const cloudinaryFolder = `genius-harmony/${resourceType}s/${baseName}`;

    await uploadFolder(folderPath, resourceType, cloudinaryFolder);
  } else {
    console.log(`
${colors.blue}Usage:${colors.reset}
  ${colors.yellow}Mode interactif:${colors.reset}
    node upload-to-cloudinary.js

  ${colors.yellow}Mode CLI:${colors.reset}
    node upload-to-cloudinary.js <dossier> <type>

${colors.blue}Exemples:${colors.reset}
    node upload-to-cloudinary.js ./videos/trailers video
    node upload-to-cloudinary.js ./images/events image
    node upload-to-cloudinary.js ./audio raw

${colors.blue}Types supportés:${colors.reset}
    video - Vidéos (mp4, mov, avi, webm)
    image - Images (jpg, png, gif, webp)
    raw   - Audio (mp3, ogg, wav)
    `);
  }
}

main().catch(console.error);
