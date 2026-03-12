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
# Edit .env and add your OpenAI API key
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
| `/api/chat` | POST | Send message to AI assistant |
| `/api/trip/refine` | POST | Update itinerary based on feedback |

## License

ISC
