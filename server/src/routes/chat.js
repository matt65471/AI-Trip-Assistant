const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { message, tripContext, conversationHistory } = req.body;
    const response = await aiService.chat(message, tripContext, conversationHistory);
    res.json(response);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
