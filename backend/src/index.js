const express = require('express');
const cors = require('cors');
const rideRoutes = require('./routes/rides');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rides', rideRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});