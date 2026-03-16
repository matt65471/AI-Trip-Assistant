const express = require('express');
const router = express.Router();
const { searchFlights } = require('../services/flightService');

router.post('/search', async (req, res) => {
  try {
    const { originLocation, destinationLocation, departureDate, adults = 1, sortBy = 'price' } = req.body;
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
