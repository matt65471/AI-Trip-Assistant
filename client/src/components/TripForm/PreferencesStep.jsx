import { useTrip, useTripDispatch } from '../../context/TripContext';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', description: 'Hostels, street food, public transport', icon: '💰' },
  { value: 'moderate', label: 'Moderate', description: '3-star hotels, casual dining, mix of transport', icon: '💵' },
  { value: 'luxury', label: 'Luxury', description: '5-star hotels, fine dining, private transfers', icon: '💎' },
];

const TRAVEL_METHODS = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'train', label: 'Train', icon: '🚂' },
  { value: 'car', label: 'Car/Road Trip', icon: '🚗' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'cruise', label: 'Cruise', icon: '🚢' },
];

const ACCOMMODATION_OPTIONS = [
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'airbnb', label: 'Airbnb/Rental', icon: '🏠' },
  { value: 'hostel', label: 'Hostel', icon: '🛏️' },
  { value: 'resort', label: 'Resort', icon: '🏝️' },
  { value: 'camping', label: 'Camping', icon: '⛺' },
];

export default function PreferencesStep() {
  const { requirements } = useTrip();
  const dispatch = useTripDispatch();

  const handleChange = (field, value) => {
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: { [field]: value }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Your preferences
      </h2>
      <p className="text-gray-600 mb-6">
        Tell us about your travel style
      </p>

      {/* Budget */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Budget Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('budget', option.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                requirements.budget === option.value
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="font-semibold text-gray-800 mt-2">{option.label}</p>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Method */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How do you want to travel?
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_METHODS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('travelMethod', option.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                requirements.travelMethod === option.value
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

      {/* Accommodation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Where do you want to stay?
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCOMMODATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('accommodation', option.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                requirements.accommodation === option.value
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
    </div>
  );
}
