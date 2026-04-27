const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check if setup is needed (no admin exists)
router.get('/status', async (req, res) => {
  try {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    const settingsCount = await prisma.setting.count();
    
    res.json({
      setupRequired: adminCount === 0,
      configRequired: settingsCount === 0,
      isInitialized: adminCount > 0 && settingsCount > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const bcrypt = require('bcryptjs');

// Initial Setup
router.post('/initialize', async (req, res) => {
  const { username, password, mediaPaths, arrConfig } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // 1. Create Admin
    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin: true
      }
    });

    // 2. Save Settings
    const settings = [
      { key: 'media_path', value: mediaPaths.root || '/media' },
      { key: 'radarr_url', value: arrConfig.radarrUrl || '' },
      { key: 'radarr_api_key', value: arrConfig.radarrKey || '' },
      { key: 'sonarr_url', value: arrConfig.sonarrUrl || '' },
      { key: 'sonarr_api_key', value: arrConfig.sonarrKey || '' },
    ];

    const promises = settings.map(s => 
      prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s
      })
    );

    await Promise.all(promises);
    res.json({ success: true, admin: admin.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
