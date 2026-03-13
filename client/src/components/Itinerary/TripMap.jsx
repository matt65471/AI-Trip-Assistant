import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getPlaceCoordinates } from '../../services/api';
import 'leaflet/dist/leaflet.css';

const startIcon = L.divIcon({
  className: 'trip-marker start-marker',
  html: '<span style="background:#22c55e;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)">S</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});
const destIcon = L.divIcon({
  className: 'trip-marker dest-marker',
  html: '<span style="background:#3b82f6;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)">D</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const valid = points.filter((p) => p.lat != null && p.lng != null);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 10);
      return;
    }
    const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function TripMap({ startingLocation, destinations, height = 280 }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const places = useMemo(() => {
    const list = [];
    if (startingLocation?.trim()) list.push({ place: startingLocation.trim(), type: 'start' });
    (destinations || []).filter(Boolean).forEach((d) => list.push({ place: d, type: 'dest' }));
    return list;
  }, [startingLocation, destinations]);

  useEffect(() => {
    if (places.length === 0) {
      setPoints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPlaceCoordinates(places.map((p) => p.place))
      .then((results) => {
        const withType = results.map((r, i) => ({
          ...r,
          type: places[i]?.type || 'dest',
        }));
        setPoints(withType.filter((p) => p.lat != null && p.lng != null));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [places]);

  const heightClass = height === 200 ? 'h-[200px]' : 'h-[280px]';

  if (loading) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-gray-100 ${heightClass} flex items-center justify-center`}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-gray-100 ${heightClass} flex items-center justify-center`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-gray-100 ${heightClass} flex items-center justify-center`}>
        <p className="text-gray-500">No locations to show on map</p>
      </div>
    );
  }

  const center = points.length === 1
    ? [points[0].lat, points[0].lng]
    : [
        points.reduce((s, p) => s + p.lat, 0) / points.length,
        points.reduce((s, p) => s + p.lng, 0) / points.length,
      ];

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-lg ${heightClass}`}>
      <MapContainer
        center={center}
        zoom={3}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((p, i) => (
          <Marker
            key={`${p.place}-${i}`}
            position={[p.lat, p.lng]}
            icon={p.type === 'start' ? startIcon : destIcon}
          >
            <Popup>
              {p.type === 'start' ? (
                <span className="font-medium text-green-700">Start: {p.place}</span>
              ) : (
                <span className="font-medium text-blue-700">{p.place}</span>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
