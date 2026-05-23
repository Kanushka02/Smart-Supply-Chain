const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;