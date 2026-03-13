import { useTrip, useTripDispatch } from '../../context/TripContext';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', description: 'Hostels, street food, public transport', icon: '💰' },
  { value: 'moderate', label: 'Moderate', description: '3-star hotels, casual dining, mix of transport', icon: '💵' },
  { value: 'luxury', label: 'Luxury', description: '5-star hotels, fine dining, private transfers', icon: '💎' },
];

const TRAVEL_TO_DESTINATION = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'train', label: 'Train', icon: '🚂' },
  { value: 'car', label: 'Car/Road Trip', icon: '🚗' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'cruise', label: 'Cruise', icon: '🚢' },
];

const TRAVEL_AT_DESTINATION = [
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'public_transit', label: 'Public transit', icon: '🚇' },
  { value: 'taxi_rideshare', label: 'Taxi / Rideshare', icon: '🚕' },
  { value: 'rental_car', label: 'Rental car', icon: '🚗' },
  { value: 'bike', label: 'Bike / Scooter', icon: '🚲' },
  { value: 'tour_bus', label: 'Tour bus / Guided', icon: '🚌' },
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

      {/* How to get to destination (multi-select) */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How will you get to your destination(s)? (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_TO_DESTINATION.map((option) => {
            const selected = (requirements.travelToDestination || []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const current = requirements.travelToDestination || [];
                  const next = selected
                    ? current.filter((v) => v !== option.value)
                    : [...current, option.value];
                  handleChange('travelToDestination', next.length ? next : current);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span>{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* How to get around at destination (multi-select) */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How do you want to get around at the destination? (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_AT_DESTINATION.map((option) => {
            const selected = (requirements.travelAtDestination || []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const current = requirements.travelAtDestination || [];
                  const next = selected
                    ? current.filter((v) => v !== option.value)
                    : [...current, option.value];
                  handleChange('travelAtDestination', next.length ? next : current);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span>{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accommodations (multi-select) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Where do you want to stay? (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCOMMODATION_OPTIONS.map((option) => {
            const selected = (requirements.accommodations || []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const current = requirements.accommodations || [];
                  const next = selected
                    ? current.filter((v) => v !== option.value)
                    : [...current, option.value];
                  handleChange('accommodations', next.length ? next : current);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span>{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
