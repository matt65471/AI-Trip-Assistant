const express = require('express');
const router = express.Router();

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

function getGeocodingKey() {
  const key = process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  return key ? key.trim() : null;
}

async function validateLocation(address) {
  const key = getGeocodingKey();
  if (!key) {
    throw new Error(
      'Geocoding API key is not configured. Add GOOGLE_GEOCODING_API_KEY (or GOOGLE_MAPS_API_KEY) to server/.env and restart the server.'
    );
  }

  const url = `${GEOCODE_URL}?address=${encodeURIComponent(address.trim())}&key=${key}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'ZERO_RESULTS') {
    return { valid: false, formattedAddress: null };
  }

  if (data.status !== 'OK') {
    const message =
      data.status === 'OVER_QUERY_LIMIT'
        ? 'Geocoding rate limit exceeded'
        : data.status === 'REQUEST_DENIED'
          ? 'Geocoding request denied (check API key)'
          : data.status === 'INVALID_REQUEST'
            ? 'Invalid address format'
            : `Geocoding failed: ${data.status}`;
    throw new Error(message);
  }

  const first = data.results[0];
  if (!first || !first.formatted_address) {
    return { valid: false, formattedAddress: null };
  }

  return { valid: true, formattedAddress: first.formatted_address };
}

router.post('/validate', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' });
    }
    const result = await validateLocation(address);
    res.json(result);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: error.message || 'Failed to validate location' });
  }
});

module.exports = router;
