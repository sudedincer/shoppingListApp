const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');
const PORT = process.env.PORT || 3000;
const app = express();

// JSON parsing middleware
app.use(express.json());

// Routes
const todoRoutes = require('./routes/todo');
const userRoutes = require('./routes/user');
app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

// MongoDB bağlantısı (promise tabanlı)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('connected mongo db');
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
