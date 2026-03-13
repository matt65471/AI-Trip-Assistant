import { useState } from 'react';
import { useTrip, useTripDispatch } from '../../context/TripContext';

const POPULAR_DESTINATIONS = [
  'Paris, France',
  'Tokyo, Japan',
  'New York, USA',
  'Barcelona, Spain',
  'Rome, Italy',
  'London, UK',
  'Bali, Indonesia',
  'Sydney, Australia',
];

export default function DestinationStep() {
  const { requirements } = useTrip();
  const dispatch = useTripDispatch();
  const [inputValue, setInputValue] = useState('');

  const addDestination = (destination) => {
    if (destination && !requirements.destinations.includes(destination)) {
      dispatch({
        type: 'SET_REQUIREMENTS',
        payload: {
          destinations: [...requirements.destinations, destination]
        }
      });
    }
    setInputValue('');
  };

  const removeDestination = (destination) => {
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: {
        destinations: requirements.destinations.filter(d => d !== destination)
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDestination(inputValue.trim());
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Where do you want to go?
      </h2>
      <p className="text-gray-600 mb-6">
        Add your starting location and one or more destinations
      </p>

      {/* Starting location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Starting location
        </label>
        <input
          type="text"
          value={requirements.startingLocation || ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_REQUIREMENTS',
              payload: { startingLocation: e.target.value }
            })
          }
          placeholder="City or airport (e.g. New York, USA)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Input field */}
      <div className="relative mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a city or country..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
        <button
          onClick={() => addDestination(inputValue.trim())}
          disabled={!inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Selected destinations */}
      {requirements.destinations.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Your destinations:</p>
          <div className="flex flex-wrap gap-2">
            {requirements.destinations.map((destination) => (
              <span
                key={destination}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
              >
                {destination}
                <button
                  onClick={() => removeDestination(destination)}
                  className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular destinations */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Popular destinations:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.filter(d => !requirements.destinations.includes(d)).map((destination) => (
            <button
              key={destination}
              onClick={() => addDestination(destination)}
              className="px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              + {destination}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
