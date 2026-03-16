import { useState, useEffect } from 'react';
import { searchFlights } from '../../services/api';

function parseDuration(iso) {
  const match = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return '';
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function FlightSearch({ originLocation, destinationLocation, departureDate, adults = 1 }) {
  const [offers, setOffers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');

  const canSearch = originLocation && destinationLocation && departureDate;

  const doSearch = async (sortBy = 'price') => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchFlights({
        originLocation,
        destinationLocation,
        departureDate,
        adults,
        sortBy,
      });
      setOffers(result.offers || []);
      setOriginCode(result.originCode || '');
      setDestCode(result.destCode || '');
      setSelectedId(null);
    } catch (err) {
      setError(err.message || 'Failed to search flights');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFindCheaper = () => {
    doSearch('price');
  };

  useEffect(() => {
    if (canSearch) doSearch('price');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originLocation, destinationLocation, departureDate, adults]);

  if (!canSearch) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
        Add your trip details (starting location, destination, dates) to search for flights.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">
          Flights: {originLocation} → {destinationLocation}
        </h4>
        <button
          type="button"
          onClick={handleFindCheaper}
          disabled={loading || offers.length === 0}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Find cheaper flights'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading && offers.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
          Searching for flights...
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
          No flights found. Try different dates or locations.
        </div>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {offers.map((offer) => {
            const itinerary = offer.itineraries?.[0];
            const segment = itinerary?.segments?.[0];
            const lastSegment = itinerary?.segments?.[itinerary.segments?.length - 1];
            const price = offer.price?.total;
            const currency = offer.price?.currency || 'USD';
            const isSelected = selectedId === offer.id;

            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : offer.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800">
                      {segment?.departure?.iataCode || originCode} → {lastSegment?.arrival?.iataCode || destCode}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTime(segment?.departure?.at)} - {formatTime(lastSegment?.arrival?.at)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {parseDuration(itinerary?.duration)}
                    </span>
                    {itinerary?.segments?.length > 1 && (
                      <span className="text-xs text-gray-400">
                        {itinerary.segments.length} stop{itinerary.segments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-indigo-600">
                    {currency} {price}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedId && (
        <p className="text-sm text-gray-600">
          Selected flight. You can click &quot;Find cheaper flights&quot; to search again.
        </p>
      )}
    </div>
  );
}
