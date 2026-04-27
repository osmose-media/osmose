const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MEDIA_PATH = process.env.MEDIA_PATH || '/media';

async function scanMedia() {
  console.log('Starting media scan...');
  const files = getAllFiles(MEDIA_PATH);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.mp4', '.mkv', '.avi', '.mov'].includes(ext)) {
      await processFile(file);
    }
  }
  console.log('Media scan complete.');
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function processFile(filePath) {
  const fileName = path.basename(filePath);
  const title = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
  
  // Heuristic for type
  let type = 'MOVIE';
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.includes('/tv/') || lowerPath.includes('/series/')) type = 'TV';
  if (lowerPath.includes('/anime/')) type = 'ANIME';

  const existing = await prisma.media.findFirst({
    where: { filePath: filePath }
  });

  if (!existing) {
    console.log(`[Scanner] Adding ${type}: ${title}`);
    await prisma.media.create({
      data: {
        title: title,
        filePath: filePath,
        type: type,
        tmdbId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'AVAILABLE'
      }
    });
  }
}

module.exports = { scanMedia };
