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
