const path = require('path');
const express = require('express');
const cors = require('cors');

// Load .env from server directory so it works when run from project root or server/
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const tripRoutes = require('./routes/trip');
const chatRoutes = require('./routes/chat');
const geocodeRoutes = require('./routes/geocode');
const routeRoutes = require('./routes/route');
const flightsRoutes = require('./routes/flights');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trip', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/flights', flightsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
