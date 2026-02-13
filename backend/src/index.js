require('dotenv').config({ path: '../.env' });
const express = require('express');
const tripRoutes = require('./routes/trips');

const app = express();
app.use(express.json()); 

// Mount trip routes under /api/trips
app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});