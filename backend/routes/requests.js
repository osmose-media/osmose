const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { searchTMDB, getTrending, getPopular, getDetails } = require('../services/tmdbService');
const ArrService = require('../services/arrService');

const prisma = new PrismaClient();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'osmose-super-secret-key');
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

async function getArrInstance(type) {
  const urlSetting = await prisma.setting.findUnique({ where: { key: `${type}_url` } });
  const keySetting = await prisma.setting.findUnique({ where: { key: `${type}_api_key` } });
  if (urlSetting && keySetting) return new ArrService(type, urlSetting.value, keySetting.value);
  return null;
}

/**
 * Maps DB status to frontend status: 'PENDING', 'PROCESSING', 'AVAILABLE'
 */
async function getStatusForTMDBId(tmdbId) {
  const media = await prisma.media.findUnique({ where: { tmdbId: tmdbId.toString() } });
  if (media && media.status === 'AVAILABLE') return 'AVAILABLE';
  
  const request = await prisma.request.findFirst({ where: { tmdbId: tmdbId.toString() } });
  if (!request) return null;
  if (request.status === 'COMPLETED') return 'AVAILABLE';
  if (request.status === 'APPROVED') return 'PROCESSING';
  return 'PENDING';
}

// Search all content
router.get('/search', verifyToken, async (req, res) => {
  const { query, type } = req.query;
  try {
    const results = await searchTMDB(query, type || 'multi');
    const enriched = await Promise.all(results.map(async (item) => {
      const status = await getStatusForTMDBId(item.id);
      return { ...item, status };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trending content
router.get('/trending', verifyToken, async (req, res) => {
  const { page, type } = req.query;
  const osmosePage = parseInt(page || '1');
  try {
    if (type) {
        const tmdbStartPage = ((osmosePage - 1) * 3) + 1;
        const promises = [getTrending(type, tmdbStartPage), getTrending(type, tmdbStartPage + 1), getTrending(type, tmdbStartPage + 2)];
        const results = await Promise.all(promises);
        const aggregatedResults = results.flatMap(r => r.results);
        const enriched = await Promise.all(aggregatedResults.map(async (item) => {
          const status = await getStatusForTMDBId(item.id);
          return { ...item, status };
        }));
        return res.json({ page: osmosePage, results: enriched, total_pages: Math.floor(results[0].total_pages / 3) });
    }
    const movies = await getTrending('movie', 1);
    const tv = await getTrending('tv', 1);
    res.json({ movies: movies.results, tv: tv.results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get request summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const pending = await prisma.request.count({ where: { status: 'REQUESTED' } });
    const processing = await prisma.request.count({ where: { status: 'APPROVED' } });
    const completed = await prisma.request.count({ where: { status: 'COMPLETED' } });
    res.json({ pending, processing, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request details
router.get('/details/:type/:id', verifyToken, async (req, res) => {
  const { type, id } = req.params;
  try {
    const details = await getDetails(id, type);
    if (!details) return res.status(404).json({ error: 'Not found' });
    const status = await getStatusForTMDBId(id);
    res.json({ ...details, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post request
router.post('/', verifyToken, async (req, res) => {
  const { tmdbId, type, title, posterPath, seasonNumber, episodeNumber } = req.body;
  try {
    const request = await prisma.request.create({
      data: {
        tmdbId: tmdbId.toString(),
        type: type === 'tv' ? 'TV' : 'MOVIE',
        title,
        posterPath,
        userId: req.userId,
        status: 'REQUESTED',
        seasonNumber,
        episodeNumber
      }
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH, DELETE and GET (all)
router.get('/', verifyToken, async (req, res) => {
  try {
    const where = req.isAdmin ? {} : { userId: req.userId };
    const requests = await prisma.request.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' } });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const { status } = req.body;
    try {
      const request = await prisma.request.update({ where: { id: req.params.id }, data: { status } });
      if (status === 'APPROVED') {
        const arrType = request.type === 'MOVIE' ? 'radarr' : 'sonarr';
        const arr = await getArrInstance(arrType);
        if (arr) await arr.request({ tmdbId: request.tmdbId, title: request.title });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const request = await prisma.request.findUnique({ where: { id: req.params.id } });
      if (!request) return res.status(404).json({ error: 'Request not found' });
      if (request.userId !== req.userId && !req.isAdmin) return res.status(403).json({ error: 'Forbidden' });
      await prisma.request.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;
