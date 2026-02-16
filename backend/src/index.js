require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const app = express();
const { generateSQL } = require('./routes/sqlAssistant');

// Middleware for read request
app.use(express.json());                   
app.use(express.urlencoded({ extended: true }));
app.use(cors());                          // beacuse we have seprated frontend

const tripRoutes = require('./routes/trips');
const analyticsRoutes = require('./routes/analytics');
const sqlAssistantRoutes = require('./routes/sqlAssistant');

app.use('/api/sql-assistant', sqlAssistantRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
