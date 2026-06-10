const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.post('/users', auth, role('ADMIN'), createUser);

router.get('/users', auth, role('ADMIN'), getAllUsers);

router.get('/users/:id', auth, role('ADMIN'), getUserById);

router.put('/users/:id', auth, role('ADMIN'), updateUser);

router.delete('/users/:id', auth, role('ADMIN'), deleteUser);

module.exports = router;