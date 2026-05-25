const prisma = require('../config/prisma');
const {
  successResponse,
  errorResponse
} = require('../utils/apiResponse');

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password,
        role
      }
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