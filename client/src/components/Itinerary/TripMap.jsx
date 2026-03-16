import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getPlaceCoordinates, getRoute } from '../../services/api';
import 'leaflet/dist/leaflet.css';

const ROUTE_COLOR = '#3b82f6';
const ROUTE_WEIGHT = 4;

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

function FitBounds({ points, routeCoordinates }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p.lat != null && p.lng != null);
    if (valid.length === 0) return;
    let bounds;
    if (routeCoordinates?.length) {
      bounds = L.latLngBounds([...valid.map((p) => [p.lat, p.lng]), ...routeCoordinates]);
    } else {
      bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng]));
    }
    if (valid.length === 1 && !routeCoordinates?.length) {
      map.setView([valid[0].lat, valid[0].lng], 10);
      return;
    }
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [map, points, routeCoordinates]);
  return null;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default function TripMap({ startingLocation, destinations, height = 420 }) {
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState(null);
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
      setRoute(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setRoute(null);
    (async () => {
      try {
        const results = await getPlaceCoordinates(places.map((p) => p.place));
        const withType = results.map((r, i) => ({
          ...r,
          type: places[i]?.type || 'dest',
          place: places[i]?.place ?? r.place,
        }));
        const valid = withType.filter((p) => p.lat != null && p.lng != null);
        setPoints(valid);
        if (valid.length >= 2) {
          const waypoints = valid.map((p) => ({ lat: p.lat, lng: p.lng, place: p.place }));
          const routeData = await getRoute(waypoints).catch(() => null);
          if (routeData?.coordinates?.length) setRoute(routeData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [places]);

  const heightClass = height === 200 ? 'h-[200px]' : height === 380 ? 'h-[380px]' : height === 420 ? 'h-[420px]' : 'h-[420px]';

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
    <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-lg ${heightClass} relative`}>
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
        <FitBounds points={points} routeCoordinates={route?.coordinates} />
        {route?.coordinates?.length > 0 && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: ROUTE_COLOR, weight: ROUTE_WEIGHT, opacity: 0.8 }}
          />
        )}
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
      {route && (route.totalDurationSeconds > 0 || route.legs?.length) && (
        <div className="absolute bottom-3 left-3 right-3 z-1000 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200 p-3 text-sm">
          <p className="font-semibold text-gray-800 mb-1.5">
            🚗 Driving time: {formatDuration(route.totalDurationSeconds)} total
          </p>
          {route.legs?.length > 0 && (
            <ul className="space-y-0.5 text-gray-600">
              {route.legs.map((leg, i) => (
                <li key={i}>
                  {leg.fromPlace && leg.toPlace ? (
                    <span>{leg.fromPlace} → {leg.toPlace}: {formatDuration(leg.durationSeconds)}</span>
                  ) : (
                    <span>Leg {i + 1}: {formatDuration(leg.durationSeconds)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
