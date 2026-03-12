export default function DayCard({ day, isExpanded, onToggle }) {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const dayTotal = [
    day.accommodation?.estimatedCost || 0,
    ...(day.activities?.map(a => a.estimatedCost || 0) || []),
    ...(day.meals?.map(m => m.estimatedCost || 0) || []),
    day.transportation?.estimatedCost || 0
  ].reduce((sum, cost) => sum + cost, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-indigo-600">{day.day}</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">
              Day {day.day}: {day.location}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(day.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            ~{formatCurrency(dayTotal)}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">🏨</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{day.accommodation.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{day.accommodation.type}</p>
                    </div>
                    {day.accommodation.estimatedCost && (
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(day.accommodation.estimatedCost)}/night
                      </span>
                    )}
                  </div>
                  {day.accommodation.notes && (
                    <p className="text-sm text-gray-500 mt-1">{day.accommodation.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activities */}
          {day.activities && day.activities.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>🎯</span> Activities
              </h4>
              <div className="space-y-3">
                {day.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                          {activity.time}
                        </span>
                        <h5 className="font-medium text-gray-800">{activity.title}</h5>
                      </div>
                      {activity.estimatedCost > 0 && (
                        <span className="text-sm text-gray-600">
                          {formatCurrency(activity.estimatedCost)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {activity.duration && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {activity.duration}
                        </span>
                      )}
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {activity.location}
                        </span>
                      )}
                    </div>
                    {activity.tips && (
                      <p className="text-xs text-indigo-600 mt-2 italic">💡 {activity.tips}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meals */}
          {day.meals && day.meals.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>🍽️</span> Meals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {day.meals.map((meal, index) => (
                  <div key={index} className="bg-orange-50 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-orange-600 uppercase">{meal.type}</span>
                      {meal.estimatedCost && (
                        <span className="text-xs text-gray-600">{formatCurrency(meal.estimatedCost)}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{meal.suggestion}</p>
                    {meal.cuisine && (
                      <p className="text-xs text-gray-500">{meal.cuisine}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transportation */}
          {day.transportation && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">🚌</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 capitalize">{day.transportation.method}</h4>
                      {day.transportation.notes && (
                        <p className="text-sm text-gray-600">{day.transportation.notes}</p>
                      )}
                    </div>
                    {day.transportation.estimatedCost > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(day.transportation.estimatedCost)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
