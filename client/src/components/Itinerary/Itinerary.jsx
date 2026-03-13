import { useState } from 'react';
import { useTrip, useTripDispatch } from '../../context/TripContext';
import DayCard from './DayCard';
import ItinerarySummary from './ItinerarySummary';
import TripMap from './TripMap';

export default function Itinerary() {
  const { itinerary, requirements } = useTrip();
  const dispatch = useTripDispatch();
  const [expandedDay, setExpandedDay] = useState(0);

  if (!itinerary) return null;

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Your Trip to {requirements.destinations.join(' & ')}
            </h2>
            <p className="text-gray-600 mt-1">{itinerary.summary}</p>
          </div>
          <button
            onClick={handleStartOver}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Start Over
          </button>
        </div>

        <ItinerarySummary itinerary={itinerary} />
      </div>

      {/* Trip map */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          Your trip map
        </h3>
        <TripMap
          startingLocation={requirements.startingLocation}
          destinations={requirements.destinations}
        />
      </div>

      {/* Day-by-day itinerary */}
      <div className="space-y-4">
        {itinerary.days?.map((day, index) => (
          <DayCard
            key={index}
            day={day}
            isExpanded={expandedDay === index}
            onToggle={() => setExpandedDay(expandedDay === index ? -1 : index)}
          />
        ))}
      </div>

      {/* Tips and Packing List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itinerary.tips && itinerary.tips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Travel Tips
            </h3>
            <ul className="space-y-2">
              {itinerary.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-indigo-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {itinerary.packingList && itinerary.packingList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🎒</span>
              Packing List
            </h3>
            <ul className="space-y-2">
              {itinerary.packingList.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
