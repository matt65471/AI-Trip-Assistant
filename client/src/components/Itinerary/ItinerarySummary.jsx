export default function ItinerarySummary({ itinerary }) {
  const { totalEstimatedCost, days } = itinerary;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: totalEstimatedCost?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalDays = days?.length || 0;
  const locations = [...new Set(days?.map(d => d.location) || [])];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-indigo-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-indigo-600">{totalDays}</p>
        <p className="text-sm text-gray-600">Days</p>
      </div>

      <div className="bg-green-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{locations.length}</p>
        <p className="text-sm text-gray-600">Destinations</p>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 text-center">
        <p className="text-lg font-bold text-amber-600">
          {totalEstimatedCost ? formatCurrency(totalEstimatedCost.min) : 'N/A'}
        </p>
        <p className="text-sm text-gray-600">Min Budget</p>
      </div>

      <div className="bg-rose-50 rounded-xl p-4 text-center">
        <p className="text-lg font-bold text-rose-600">
          {totalEstimatedCost ? formatCurrency(totalEstimatedCost.max) : 'N/A'}
        </p>
        <p className="text-sm text-gray-600">Max Budget</p>
      </div>
    </div>
  );
}
