const bcrypt =
require('bcryptjs');

const jwt =
require('jsonwebtoken');

const prisma =
require('../config/prisma');

exports.register =
async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;

    const existingUser =
    await prisma.user.findUnique({

      where: {
        email
      }
    });

    if (existingUser) {

      return res
      .status(400)
      .json({

        success: false,

        message:
        'User already exists'
      });
    }

    const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

    const user =
    await prisma.user.create({

      data: {
        name,
        email,

        password:
        hashedPassword,

        role
      }
    });

    res.status(201)
      .json({

        success: true,

        message:
        'User registered',

        data: {

          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

  } catch (error) {

    res.status(500)
    .json({
      message:
      error.message
    });
  }
};

exports.login =
async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user =
    await prisma.user.findUnique({

      where: {
        email
      }
    });

    if (!user) {

      return res
      .status(404)
      .json({

        success: false,

        message:
        'User not found'
      });
    }

    const isMatch =
    await bcrypt.compare(

      password,

      user.password
    );

    if (!isMatch) {

      return res
      .status(401)
      .json({

        success: false,

        message:
        'Invalid password'
      });
    }

    const accessToken =
    jwt.sign(

      {
        id: user.id,
        role: user.role
      },

      process.env
      .JWT_SECRET,

      {
        expiresIn: '15m'
      }
    );

    const refreshToken =
    jwt.sign(

      {
        id: user.id
      },

      process.env
      .JWT_REFRESH_SECRET,

      {
        expiresIn: '7d'
      }
    );

    res.json({

      success: true,

      accessToken,
      refreshToken,

      user: {

        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500)
    .json({
      message:
      error.message
    });
  }
};

exports.refreshToken =
async (req, res) => {

  try {

    const {
      refreshToken
    } = req.body;

    if (!refreshToken) {

      return res
      .status(401)
      .json({

        message:
        'No refresh token'
      });
    }

    const decoded =
    jwt.verify(

      refreshToken,

      process.env
      .JWT_REFRESH_SECRET
    );

    const user =
    await prisma.user.findUnique({

      where: {
        id: decoded.id
      }
    });

    if (!user) {

      return res
      .status(401)
      .json({

        message:
        'Invalid refresh token'
      });
    }

    const accessToken =
    jwt.sign(

      {
        id: user.id,
        role: user.role
      },

      process.env
      .JWT_SECRET,

      {
        expiresIn:
        '15m'
      }
    );

    res.json({

      accessToken
    });

  } catch {

    res.status(401)
    .json({

      message:
      'Invalid refresh token'
    });
  }
};