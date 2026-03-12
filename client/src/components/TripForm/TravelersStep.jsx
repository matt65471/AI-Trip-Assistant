import { useTrip, useTripDispatch } from '../../context/TripContext';

export default function TravelersStep() {
  const { requirements } = useTrip();
  const dispatch = useTripDispatch();

  const handleCountChange = (delta) => {
    const newCount = Math.max(1, Math.min(20, (requirements.travelers?.count || 1) + delta));
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: {
        travelers: {
          ...requirements.travelers,
          count: newCount
        }
      }
    });
  };

  const handleNotesChange = (notes) => {
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: {
        travelers: {
          ...requirements.travelers,
          notes
        }
      }
    });
  };

  const count = requirements.travelers?.count || 1;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Who's traveling?
      </h2>
      <p className="text-gray-600 mb-6">
        Tell us about your travel group
      </p>

      {/* Traveler count */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Number of travelers
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleCountChange(-1)}
            disabled={count <= 1}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-4xl font-bold text-gray-800">{count}</span>
            <p className="text-sm text-gray-500 mt-1">
              {count === 1 ? 'traveler' : 'travelers'}
            </p>
          </div>
          <button
            onClick={() => handleCountChange(1)}
            disabled={count >= 20}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Quick select */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Solo', count: 1, icon: '🧳' },
            { label: 'Couple', count: 2, icon: '💑' },
            { label: 'Family', count: 4, icon: '👨‍👩‍👧‍👦' },
            { label: 'Group', count: 6, icon: '👥' },
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => {
                dispatch({
                  type: 'SET_REQUIREMENTS',
                  payload: {
                    travelers: {
                      ...requirements.travelers,
                      count: option.count
                    }
                  }
                });
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                count === option.count
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span>{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special requirements or notes (optional)
        </label>
        <textarea
          value={requirements.travelers?.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="E.g., traveling with kids, accessibility needs, dietary restrictions, special occasions..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
        />
      </div>

      {/* Summary */}
      {requirements.destinations.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-2">Trip Summary</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              <span className="font-medium">Destinations:</span>{' '}
              {requirements.destinations.join(' → ')}
            </li>
            {requirements.startDate && requirements.endDate && (
              <li>
                <span className="font-medium">Dates:</span>{' '}
                {new Date(requirements.startDate).toLocaleDateString()} -{' '}
                {new Date(requirements.endDate).toLocaleDateString()}
              </li>
            )}
            <li>
              <span className="font-medium">Budget:</span>{' '}
              {requirements.budget.charAt(0).toUpperCase() + requirements.budget.slice(1)}
            </li>
            <li>
              <span className="font-medium">Travel:</span>{' '}
              {requirements.travelMethod.charAt(0).toUpperCase() + requirements.travelMethod.slice(1)}
            </li>
            <li>
              <span className="font-medium">Stay:</span>{' '}
              {requirements.accommodation.charAt(0).toUpperCase() + requirements.accommodation.slice(1)}
            </li>
            <li>
              <span className="font-medium">Travelers:</span> {count}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
