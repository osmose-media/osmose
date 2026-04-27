const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'osmose-super-secret-key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        avatarPath: user.avatarPath
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.patch('/profile', verifyToken, async (req, res) => {
  const { username, avatarBase64 } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    
    // Prevent changing the hardcoded 'admin' username for the main account
    if (user.username === 'admin' && username !== 'admin') {
      return res.status(403).json({ error: 'Impossible de renommer le compte système admin' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    
    // Simple placeholder for avatar: store base64 or path
    if (avatarBase64) updateData.avatarPath = avatarBase64;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: { id: true, username: true, isAdmin: true, avatarPath: true }
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
    res.status(500).json({ error: error.message });
  }
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, isAdmin: true, avatarPath: true }
    });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
