const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { searchTMDB, getDetails } = require('./tmdbService');
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
  let cleanTitle = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
  
  // Basic cleanup (remove year in brackets, dots, etc.)
  cleanTitle = cleanTitle.replace(/\(\d{4}\)/g, "").replace(/\./g, " ").trim();

  const existing = await prisma.media.findFirst({
    where: { filePath: filePath }
  });

  if (!existing) {
    console.log(`[Scanner] New file found: ${cleanTitle}`);
    
    // Heuristic for type
    let type = 'MOVIE';
    let tmdbType = 'movie';
    const lowerPath = filePath.toLowerCase();
    if (lowerPath.includes('/tv/') || lowerPath.includes('/series/')) {
      type = 'TV';
      tmdbType = 'tv';
    }
    if (lowerPath.includes('/anime/')) {
      type = 'ANIME';
      tmdbType = 'tv'; // TMDB uses 'tv' for anime series
    }

    let metadata = {
      tmdbId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      posterPath: null,
      backdropPath: null,
      overview: null,
      releaseDate: null
    };

    try {
      console.log(`[Scanner] Searching TMDB for: ${cleanTitle}`);
      const results = await searchTMDB(cleanTitle, tmdbType);
      
      if (results && results.length > 0) {
        const bestMatch = results[0];
        console.log(`[Scanner] Found match: ${bestMatch.title || bestMatch.name} (ID: ${bestMatch.id})`);
        
        // Fetch full details
        const details = await getDetails(bestMatch.id, tmdbType);
        metadata = {
          tmdbId: details.tmdbId.toString(),
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          overview: details.overview,
          releaseDate: details.releaseDate ? new Date(details.releaseDate) : null
        };
      }
    } catch (err) {
      console.error(`[Scanner] TMDB Lookup failed for ${cleanTitle}:`, err.message);
    }

    await prisma.media.create({
      data: {
        title: cleanTitle,
        filePath: filePath,
        type: type,
        status: 'AVAILABLE',
        ...metadata
      }
    });
  }
}

module.exports = { scanMedia };
