const express = require('express');
const router = express.Router();
const { searchFlights, getAirportsNearLocation } = require('../services/flightService');

router.get('/airports', async (req, res) => {
  try {
    const location = req.query.location;
    if (!location || !location.trim()) {
      return res.status(400).json({
        error: 'location query parameter is required',
      });
    }
    const airports = await getAirportsNearLocation(location.trim());
    res.json(airports);
  } catch (error) {
    console.error('Flights airports error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch destination airports',
    });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { originLocation, destinationLocation, departureDate, adults = 1, sortBy = 'price', destinationAirportCode } = req.body;
    if (!originLocation || !destinationLocation || !departureDate) {
      return res.status(400).json({
        error: 'originLocation, destinationLocation, and departureDate are required',
      });
    }
    const result = await searchFlights({
      originLocation,
      destinationLocation,
      departureDate,
      adults,
      sortBy,
      destinationAirportCode,
    });
    res.json(result);
  } catch (error) {
    console.error('Flights search error:', error);
    res.status(500).json({
      error: error.message || 'Failed to search flights',
    });
  }
});

module.exports = router;
