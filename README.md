# AI Trip Assistant

An AI-powered trip planning assistant that helps you create personalized travel itineraries.

## Features

- **Smart Trip Planning**: Fill out your trip requirements and get AI-generated itineraries
- **AI Chat Assistant**: Ask questions and refine your trip through conversation
- **Day-by-Day Itineraries**: Detailed schedules with activities, meals, and accommodations
- **Budget Estimates**: Get realistic cost estimates based on your preferences

## Tech Stack

- **Frontend**: React 18 + Vite, TailwindCSS
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key
- Google Geocoding API key (for starting location and destination validation). Enable the Geocoding API in [Google Cloud Console](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com).

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI-Trip-Assistant
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env and add:
# - OPENAI_API_KEY=your-openai-key
# - GOOGLE_GEOCODING_API_KEY=your-google-geocoding-key  (for location validation)
```

4. Start the development servers:

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm run dev
```

5. Open http://localhost:5173 in your browser

## Project Structure

```
AI-Trip-Assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React Context for state
│   │   ├── services/       # API calls
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI service
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trip/plan` | POST | Generate itinerary from requirements |
| `/api/trip/generate-slot` | POST | Generate a single itinerary slot (activity, meal, etc.) |
| `/api/geocode/validate` | POST | Validate a location via Google Geocoding (body: `{ address }`) |
| `/api/geocode/coordinates` | POST | Get lat/lng for multiple places for map (body: `{ places: string[] }`) |
| `/api/chat` | POST | Send message to AI assistant |
| `/api/trip/refine` | POST | Update itinerary based on feedback |

## License

ISC



# TO DO:
Is it worth to have seperate APIs for things like Airbnb or a web scalper?
- See if LLM can actually generate correct, up to date information
Currently it's not interactive. Make it interactive