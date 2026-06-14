const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const {
  successResponse,
  errorResponse
} = require('../utils/apiResponse');

const ALLOWED_ROLES = new Set(['ADMIN', 'SUPPLIER']);

const normalizeRole = (role, fallback = 'SUPPLIER') => {
  const normalizedRole = String(role || fallback).toUpperCase();

  return ALLOWED_ROLES.has(normalizedRole) ? normalizedRole : fallback;
};

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizeRole(role)
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create user'
    });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch users'
    });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch user'
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { name, email, password, role } = req.body;

    const data = {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role: normalizeRole(role) } : {})
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update user'
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete user'
    });
  }
};