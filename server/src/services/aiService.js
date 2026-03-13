const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert travel assistant helping users plan their trips. You have extensive knowledge about:
- Flight routes, airlines, and typical pricing
- Hotels, hostels, Airbnbs, and other accommodation options
- Local attractions, restaurants, and activities
- Transportation options within destinations
- Travel tips, visa requirements, and safety information

When generating itineraries or suggestions:
1. Provide realistic price estimates based on the user's budget preference
2. Consider travel time between locations
3. Include a mix of popular attractions and local gems
4. Account for meal times and rest periods
5. Be specific with names of places, restaurants, and activities

Always be helpful, informative, and considerate of the user's preferences and constraints.`;

async function generateItinerary(tripRequirements) {
  const { startingLocation, destinations, startDate, endDate, budget, travelMethod, accommodation, travelers } = tripRequirements;
  
  const prompt = `Create a detailed day-by-day travel itinerary based on these requirements:

Starting location (departure city): ${startingLocation || 'Not specified'}
Destinations: ${Array.isArray(destinations) ? destinations.join(', ') : destinations}
Travel Dates: ${startDate} to ${endDate}
Budget Level: ${budget}
Travel Method: ${travelMethod}
Accommodation Preference: ${accommodation}
Number of Travelers: ${travelers?.count || 1}
${travelers?.notes ? `Special Notes: ${travelers.notes}` : ''}

Please provide the itinerary in the following JSON format:
{
  "summary": "Brief overview of the trip",
  "totalEstimatedCost": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "City Name",
      "accommodation": {
        "name": "Hotel/Place Name",
        "type": "hotel/hostel/airbnb",
        "estimatedCost": number,
        "notes": "optional notes"
      },
      "activities": [
        {
          "time": "09:00",
          "title": "Activity Name",
          "description": "What you'll do",
          "duration": "2 hours",
          "estimatedCost": number,
          "location": "Specific location",
          "tips": "optional tips"
        }
      ],
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "suggestion": "Restaurant or area name",
          "cuisine": "Type of food",
          "estimatedCost": number
        }
      ],
      "transportation": {
        "method": "walking/taxi/metro/etc",
        "notes": "any transportation notes for the day",
        "estimatedCost": number
      }
    }
  ],
  "tips": ["General tips for the trip"],
  "packingList": ["Suggested items to pack"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

async function refineItinerary(itinerary, feedback) {
  const prompt = `Here is the current travel itinerary:
${JSON.stringify(itinerary, null, 2)}

The user has requested the following changes:
${feedback}

Please update the itinerary based on this feedback and return the complete updated itinerary in the same JSON format.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

async function chat(message, tripContext, conversationHistory = []) {
  const contextPrompt = tripContext 
    ? `\n\nCurrent trip context:\n${JSON.stringify(tripContext, null, 2)}`
    : '';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: typeof (msg.content ?? msg.message) === 'string' ? (msg.content ?? msg.message) : ''
    })),
    { role: 'user', content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : 'I couldn\'t generate a response. Please try again.';

    return {
      message: content,
      role: 'assistant'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

module.exports = {
  generateItinerary,
  refineItinerary,
  chat
};
