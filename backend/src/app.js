const express = require('express');
const cors = require('cors');

const app = express();
const testRoutes = require('./routes/testRoutes');
const dbTestRoutes = require('./routes/dbTestRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes =require('./routes/orderRoutes');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', dbTestRoutes);


// Use test routes
app.use('/api', testRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Smart Supply Chain API');
});
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

module.exports = app;