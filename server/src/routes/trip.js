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

router.post('/generate-slot', async (req, res) => {
  try {
    const { requirements, itinerary, dayIndex, slotType, slotIndex } = req.body;
    if (requirements == null || itinerary == null || dayIndex == null || slotType == null) {
      return res.status(400).json({ error: 'Missing requirements, itinerary, dayIndex, or slotType' });
    }
    const slot = await aiService.generateSlot(
      requirements,
      itinerary,
      dayIndex,
      slotType,
      slotIndex ?? 0
    );
    res.json(slot);
  } catch (error) {
    console.error('Error generating slot:', error);
    res.status(500).json({ error: 'Failed to generate slot' });
  }
});

module.exports = router;
