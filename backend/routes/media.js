const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { scanMedia } = require('../services/mediaScanner');
const { transcodeToHLS } = require('../services/transcoder');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await prisma.media.findMany();
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger scan
router.post('/scan', async (req, res) => {
  try {
    await scanMedia();
    res.json({ message: 'Scan started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get HLS stream
router.get('/:id/stream', async (req, res) => {
  const { id } = req.params;
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media || !media.filePath) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const hlsPath = await transcodeToHLS(id, media.filePath);
    res.json({ streamUrl: `/api/media/${id}/hls/playlist.m3u8` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve HLS files
router.use('/:id/hls', (req, res, next) => {
  const { id } = req.params;
  const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || '/tmp/osmose-hls';
  const filePath = path.join(HLS_OUTPUT_DIR, id, req.path);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

module.exports = router;
