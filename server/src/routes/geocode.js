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

async function getCoordinates(address) {
  const key = getGeocodingKey();
  if (!key) return null;
  if (!address || typeof address !== 'string' || !address.trim()) return null;
  const url = `${GEOCODE_URL}?address=${encodeURIComponent(address.trim())}&key=${key}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) return null;
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

router.post('/coordinates', async (req, res) => {
  try {
    const { places } = req.body;
    if (!Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: 'places array is required' });
    }
    const results = [];
    for (const place of places) {
      if (!place || typeof place !== 'string' || !place.trim()) continue;
      const coords = await getCoordinates(place);
      results.push({ place: place.trim(), lat: coords?.lat, lng: coords?.lng });
    }
    res.json(results);
  } catch (error) {
    console.error('Geocode coordinates error:', error);
    res.status(500).json({ error: error.message || 'Failed to get coordinates' });
  }
});

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
