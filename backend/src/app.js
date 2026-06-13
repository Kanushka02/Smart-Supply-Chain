const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const authRoutes =require('./routes/authRoutes');
const errorHandler =require('./middleware/errorHandler');
const testRoutes = require('./routes/testRoutes');
const dbTestRoutes = require('./routes/dbTestRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes =require('./routes/orderRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
}));


app.use('/api', dbTestRoutes);


// Use test routes
app.use('/api', testRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Smart Supply Chain API');
});
app.use('/api/auth',authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

app.use(errorHandler);

module.exports = app;