const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to protect settings routes (Admin only)
const adminOnly = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'osmose-super-secret-key');
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, isAdmin: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/users', adminOnly, async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, isAdmin }
    });
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Existing settings routes
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  const { settings } = req.body;
  try {
    const promises = Object.entries(settings).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() }
      });
    });
    await Promise.all(promises);
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const ArrService = require('../services/arrService');

router.post('/test-connection', adminOnly, async (req, res) => {
  const { type, url, apiKey } = req.body;
  
  if (!url || !apiKey) {
    return res.status(400).json({ error: 'URL and API Key are required' });
  }

  try {
    const service = new ArrService(type.toLowerCase(), url, apiKey);
    const result = await service.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Connection failed', 
      message: error.response?.data?.message || error.message 
    });
  }
});

module.exports = router;
