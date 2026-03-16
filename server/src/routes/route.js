const express = require('express');
const router = express.Router();

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Get route geometry and leg durations from OSRM (driving).
 * waypoints: [{ lat, lng }, ...] in order (start, dest1, dest2, ...)
 * Returns: { coordinates: [[lat, lng], ...], legs: [{ durationSeconds, fromPlace, toPlace }], totalDurationSeconds }
 */
async function getRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;
  const valid = waypoints.filter((w) => w?.lat != null && w?.lng != null);
  if (valid.length < 2) return null;

  // OSRM expects lon,lat;lon,lat;...
  const coordsStr = valid.map((w) => `${w.lng},${w.lat}`).join(';');
  const url = `${OSRM_BASE}/${encodeURIComponent(coordsStr)}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes?.[0]) return null;

  const route = data.routes[0];
  // GeoJSON is [lng, lat]; convert to [lat, lng] for Leaflet
  const coordinates = (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
  const legs = (route.legs || []).map((leg, i) => ({
    durationSeconds: Math.round(leg.duration ?? 0),
    fromPlace: valid[i]?.place ?? '',
    toPlace: valid[i + 1]?.place ?? '',
  }));

  // If waypoints had place names, attach to valid for legs
  const totalDurationSeconds = legs.reduce((sum, leg) => sum + leg.durationSeconds, 0);

  return {
    coordinates,
    legs,
    totalDurationSeconds,
  };
}

router.post('/', async (req, res) => {
  try {
    const { waypoints } = req.body;
    if (!Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(400).json({ error: 'At least 2 waypoints required' });
    }
    const result = await getRoute(waypoints);
    if (!result) {
      return res.status(404).json({ error: 'Could not find route' });
    }
    res.json(result);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message || 'Failed to get route' });
  }
});

module.exports = router;
