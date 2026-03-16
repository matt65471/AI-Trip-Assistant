const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function generateItinerary(requirements) {
  if (!requirements.startingLocation || !requirements.startingLocation.trim()) {
    throw new Error('Please enter your starting location');
  }
  if (!requirements.destinations || requirements.destinations.length === 0) {
    throw new Error('Please add at least one destination');
  }
  if (!requirements.startDate || !requirements.endDate) {
    throw new Error('Please select travel dates');
  }

  const response = await fetch(`${API_BASE}/trip/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requirements),
  });

  return handleResponse(response);
}

export async function generateSlot(requirements, itinerary, dayIndex, slotType, slotIndex = 0) {
  const response = await fetch(`${API_BASE}/trip/generate-slot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requirements,
      itinerary,
      dayIndex,
      slotType,
      slotIndex,
    }),
  });

  return handleResponse(response);
}

export async function refineItinerary(itinerary, feedback) {
  if (!feedback.trim()) {
    throw new Error('Please provide feedback for the changes you want');
  }

  const response = await fetch(`${API_BASE}/trip/refine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ itinerary, feedback }),
  });

  return handleResponse(response);
}

export async function getPlaceCoordinates(places) {
  if (!Array.isArray(places) || places.length === 0) return [];
  const response = await fetch(`${API_BASE}/geocode/coordinates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ places }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get coordinates');
  }
  return response.json();
}

export async function searchFlights({ originLocation, destinationLocation, departureDate, adults = 1, sortBy = 'price' }) {
  const response = await fetch(`${API_BASE}/flights/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originLocation,
      destinationLocation,
      departureDate,
      adults,
      sortBy,
    }),
  });
  return handleResponse(response);
}

export async function getRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;
  const response = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function validateLocation(address) {
  if (!address || !address.trim()) {
    throw new Error('Address is required');
  }
  const response = await fetch(`${API_BASE}/geocode/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: address.trim() }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to validate location');
  }
  return data;
}

export async function sendChatMessage(message, tripContext, conversationHistory) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, tripContext, conversationHistory }),
  });

  return handleResponse(response);
}
