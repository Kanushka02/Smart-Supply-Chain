const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const {
  successResponse,
  errorResponse
} = require('../utils/apiResponse');

const ALLOWED_ROLES = new Set(['ADMIN', 'SUPPLIER']);

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  companyName: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

const normalizeRole = (role, fallback = 'SUPPLIER') => {
  const normalizedRole = String(role || fallback).toUpperCase();

  return ALLOWED_ROLES.has(normalizedRole) ? normalizedRole : fallback;
};

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizeRole(role),
        companyName: companyName || null,
        phone: phone || null
      },
      select: USER_SELECT
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
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' }
    });

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
    const id = parseInt(req.params.id, 10);

    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT
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
    const id = parseInt(req.params.id, 10);

    const { name, email, password, role, companyName, phone, isActive } = req.body;

    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(role !== undefined ? { role: normalizeRole(role) } : {}),
      ...(companyName !== undefined ? { companyName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT
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