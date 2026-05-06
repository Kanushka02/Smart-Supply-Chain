const express = require('express');
const cors = require('cors');

const app = express();
const testRoutes = require('./routes/testRoutes');

// Use test routes
app.use('/api', testRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Smart Supply Chain API');
});

module.exports = app;