const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.post('/users', auth, createUser);

router.get('/users', auth, getAllUsers);

router.get('/users/:id', auth, getUserById);

router.put('/users/:id', auth, updateUser);

router.delete('/users/:id', auth, deleteUser);

module.exports = router;