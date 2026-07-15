module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/prisma.js',
    '!src/config/redis.js',
    '!src/config/cloudinary.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
