import { useTrip, useTripDispatch } from '../../context/TripContext';

export default function DatesStep() {
  const { requirements } = useTrip();
  const dispatch = useTripDispatch();

  const handleChange = (field, value) => {
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: { [field]: value }
    });
  };

  const today = new Date().toISOString().split('T')[0];
  
  const calculateDuration = () => {
    if (requirements.startDate && requirements.endDate) {
      const start = new Date(requirements.startDate);
      const end = new Date(requirements.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const duration = calculateDuration();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        When are you traveling?
      </h2>
      <p className="text-gray-600 mb-6">
        Select your travel dates
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={requirements.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            min={today}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={requirements.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            min={requirements.startDate || today}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {duration > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <p className="text-indigo-800 font-medium">
            Trip duration: {duration} {duration === 1 ? 'day' : 'days'}
          </p>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Quick select:
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { label: 'Weekend (3 days)', days: 3 },
            { label: '1 Week', days: 7 },
            { label: '2 Weeks', days: 14 },
            { label: '1 Month', days: 30 },
          ].map(({ label, days }) => (
            <button
              key={label}
              onClick={() => {
                const start = new Date();
                start.setDate(start.getDate() + 7);
                const end = new Date(start);
                end.setDate(end.getDate() + days);
                handleChange('startDate', start.toISOString().split('T')[0]);
                handleChange('endDate', end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
