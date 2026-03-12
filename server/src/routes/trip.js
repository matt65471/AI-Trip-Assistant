const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.post('/plan', async (req, res) => {
  try {
    const tripRequirements = req.body;
    const itinerary = await aiService.generateItinerary(tripRequirements);
    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

router.post('/refine', async (req, res) => {
  try {
    const { itinerary, feedback } = req.body;
    const refinedItinerary = await aiService.refineItinerary(itinerary, feedback);
    res.json(refinedItinerary);
  } catch (error) {
    console.error('Error refining itinerary:', error);
    res.status(500).json({ error: 'Failed to refine itinerary' });
  }
});

module.exports = router;
