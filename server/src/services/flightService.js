const https = require('https');

const SERPAPI_BASE = 'https://serpapi.com/search';
const SKYLINK_HOST = 'skylink-api.p.rapidapi.com';
const SKYLINK_TEXT_SEARCH_PATH = '/v3/airports/search/text';

/** Fallback when SkyLink is unavailable or returns no results. Keyword match is case-insensitive. */
const FALLBACK_AIRPORTS_BY_CITY = {
  paris: [
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport' },
    { iataCode: 'ORY', name: 'Orly Airport' },
    { iataCode: 'BVA', name: 'Paris Beauvais Tillé' },
  ],
  london: [
    { iataCode: 'LHR', name: 'Heathrow Airport' },
    { iataCode: 'LGW', name: 'Gatwick Airport' },
    { iataCode: 'STN', name: 'Stansted Airport' },
  ],
  'new york': [
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport' },
    { iataCode: 'EWR', name: 'Newark Liberty International Airport' },
    { iataCode: 'LGA', name: 'LaGuardia Airport' },
  ],
  'los angeles': [
    { iataCode: 'LAX', name: 'Los Angeles International Airport' },
    { iataCode: 'BUR', name: 'Hollywood Burbank Airport' },
  ],
  tokyo: [
    { iataCode: 'NRT', name: 'Narita International Airport' },
    { iataCode: 'HND', name: 'Haneda Airport' },
  ],
  austin: [{ iataCode: 'AUS', name: 'Austin-Bergstrom International Airport' }],
  chicago: [
    { iataCode: 'ORD', name: "O'Hare International Airport" },
    { iataCode: 'MDW', name: 'Midway International Airport' },
  ],
  miami: [{ iataCode: 'MIA', name: 'Miami International Airport' }],
  'san francisco': [
    { iataCode: 'SFO', name: 'San Francisco International Airport' },
    { iataCode: 'OAK', name: 'Oakland International Airport' },
  ],
  seattle: [
    { iataCode: 'SEA', name: 'Seattle-Tacoma International Airport' },
    { iataCode: 'BFI', name: 'Boeing Field' },
  ],
  boston: [{ iataCode: 'BOS', name: 'Boston Logan International Airport' }],
  washington: [
    { iataCode: 'DCA', name: 'Reagan National Airport' },
    { iataCode: 'IAD', name: 'Dulles International Airport' },
    { iataCode: 'BWI', name: 'Baltimore-Washington International' },
  ],
  denver: [{ iataCode: 'DEN', name: 'Denver International Airport' }],
  phoenix: [
    { iataCode: 'PHX', name: 'Phoenix Sky Harbor International Airport' },
  ],
  atlanta: [{ iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport' }],
  dallas: [
    { iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport' },
    { iataCode: 'DAL', name: 'Dallas Love Field' },
  ],
  houston: [
    { iataCode: 'IAH', name: 'George Bush Intercontinental Airport' },
    { iataCode: 'HOU', name: 'William P. Hobby Airport' },
  ],
  'las vegas': [{ iataCode: 'LAS', name: 'Harry Reid International Airport' }],
  'san diego': [{ iataCode: 'SAN', name: 'San Diego International Airport' }],
  orlando: [{ iataCode: 'MCO', name: 'Orlando International Airport' }],
  amsterdam: [{ iataCode: 'AMS', name: 'Amsterdam Schiphol Airport' }],
  dublin: [{ iataCode: 'DUB', name: 'Dublin Airport' }],
  berlin: [
    { iataCode: 'BER', name: 'Berlin Brandenburg Airport' },
    { iataCode: 'TXL', name: 'Berlin Tegel (closed)' },
  ],
  madrid: [{ iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport' }],
  barcelona: [{ iataCode: 'BCN', name: 'Barcelona-El Prat Airport' }],
  rome: [
    { iataCode: 'FCO', name: 'Rome Fiumicino Airport' },
    { iataCode: 'CIA', name: 'Rome Ciampino Airport' },
  ],
  sydney: [{ iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport' }],
  melbourne: [{ iataCode: 'MEL', name: 'Melbourne Airport' }],
  singapore: [{ iataCode: 'SIN', name: 'Singapore Changi Airport' }],
  'hong kong': [{ iataCode: 'HKG', name: 'Hong Kong International Airport' }],
  toronto: [
    { iataCode: 'YYZ', name: 'Toronto Pearson International Airport' },
    { iataCode: 'YTZ', name: 'Billy Bishop Toronto City Airport' },
  ],
  vancouver: [{ iataCode: 'YVR', name: 'Vancouver International Airport' }],
  montreal: [{ iataCode: 'YUL', name: 'Montréal-Trudeau International Airport' }],
  munich: [{ iataCode: 'MUC', name: 'Munich Airport' }],
  frankfurt: [{ iataCode: 'FRA', name: 'Frankfurt Airport' }],
  zurich: [{ iataCode: 'ZRH', name: 'Zurich Airport' }],
  brussels: [{ iataCode: 'BRU', name: 'Brussels Airport' }],
  lisbon: [{ iataCode: 'LIS', name: 'Lisbon Portela Airport' }],
  istanbul: [
    { iataCode: 'IST', name: 'Istanbul Airport' },
    { iataCode: 'SAW', name: 'Sabiha Gökçen Airport' },
  ],
  dubai: [{ iataCode: 'DXB', name: 'Dubai International Airport' }],
  bangkok: [{ iataCode: 'BKK', name: 'Suvarnabhumi Airport' }],
  seoul: [
    { iataCode: 'ICN', name: 'Incheon International Airport' },
    { iataCode: 'GMP', name: 'Gimpo International Airport' },
  ],
};

function getSerpApiKey() {
  const key = process.env.SERPAPI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      'SerpAPI not configured. Add SERPAPI_API_KEY to server/.env (get a key at serpapi.com)'
    );
  }
  return key.trim();
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      })
      .on('error', reject);
  });
}

function httpsGetWithHeaders(host, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        path,
        method: 'GET',
        headers: { ...headers },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function getSkyLinkApiKey() {
  return (process.env.SKYLINK_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '').trim();
}

/**
 * Fetch airports from SkyLink API (RapidAPI) text search. Returns [{ iataCode, name }].
 * Uses large_airport filter. Returns [] if key missing or request fails.
 */
async function fetchAirportsFromSkyLink(keyword) {
  const apiKey = getSkyLinkApiKey();
  if (!apiKey) return [];
  const q = (keyword || '').toString().trim().split(',')[0]?.trim() || (keyword || '').toString().trim();
  if (!q || q.length < 2) return [];
  try {
    const path = `${SKYLINK_TEXT_SEARCH_PATH}?${new URLSearchParams({
      q,
      limit: '20',
      type: 'large_airport',
    })}`;
    const data = await httpsGetWithHeaders(SKYLINK_HOST, path, {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': SKYLINK_HOST,
    });
    const list = data.airports || [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((a) => a.iata_code && String(a.iata_code).length === 3)
      .map((a) => ({
        iataCode: String(a.iata_code).toUpperCase(),
        name: a.name || a.iata_code || '',
      }));
  } catch (err) {
    console.error('SkyLink airport search error:', err.message);
    return [];
  }
}

function getAirportsByCity(keyword) {
  const k = (keyword || '').toString().toLowerCase().trim();
  if (!k) return [];
  for (const [city, airports] of Object.entries(FALLBACK_AIRPORTS_BY_CITY)) {
    if (k.includes(city)) return airports;
  }
  return [];
}

/**
 * Get list of airports for a location (e.g. "Paris, France" -> CDG, ORY, ...).
 * Tries SkyLink text search first; falls back to built-in list if unavailable or no results.
 */
async function getAirportsNearLocation(locationStr) {
  const keyword = (locationStr.split(',')[0]?.trim() || locationStr).trim();
  const fromSkyLink = await fetchAirportsFromSkyLink(keyword);
  if (fromSkyLink.length > 0) return fromSkyLink;
  return getAirportsByCity(keyword);
}

/**
 * Get IATA airport code from a location string (e.g. "Paris, France" -> "CDG").
 * Tries SkyLink text search first; falls back to built-in list if unavailable or no results.
 */
async function getAirportCode(locationStr) {
  const keyword = (locationStr.split(',')[0]?.trim() || locationStr).trim();
  const fromSkyLink = await fetchAirportsFromSkyLink(keyword);
  if (fromSkyLink.length > 0){
    console.log('fromSkyLink', fromSkyLink);
    return fromSkyLink[0].iataCode;
  }
  console.log('keyword', fromSkyLink);
  const airports = getAirportsByCity(keyword);
  console.log('airports', airports);
  return airports.length > 0 ? airports[0].iataCode : null;
}

/**
 * Convert SerpAPI flight item to Amadeus-like offer for frontend compatibility.
 */
function serpFlightToOffer(serpItem, index, originCode, destCode) {
  const flights = serpItem.flights || [];
  const first = flights[0];
  const last = flights[flights.length - 1];
  const totalDurationMin = serpItem.total_duration || 0;
  const durationIso = `PT${Math.floor(totalDurationMin / 60)}H${totalDurationMin % 60}M`;

  const segments = flights.map((f) => ({
    departure: {
      iataCode: f.departure_airport?.id || originCode,
      at: f.departure_airport?.time ? `${f.departure_airport.time}:00.000Z` : undefined,
    },
    arrival: {
      iataCode: f.arrival_airport?.id || destCode,
      at: f.arrival_airport?.time ? `${f.arrival_airport.time}:00.000Z` : undefined,
    },
    duration: `PT${f.duration || 0}M`,
  }));

  const price = serpItem.price != null ? String(serpItem.price) : '0';
  return {
    id: `serp-${index}-${Date.now()}`,
    price: { total: price, currency: 'USD' },
    itineraries: [
      {
        duration: durationIso,
        segments,
      },
    ],
  };
}

/**
 * Search flight offers using SerpAPI Google Flights.
 * Returns { offers, originCode, destCode } in same shape as before for frontend compatibility.
 * sortBy: 'price' (default) or 'duration'. Optional destinationAirportCode skips resolving destination.
 */
async function searchFlights({
  originLocation,
  destinationLocation,
  departureDate,
  adults = 1,
  sortBy = 'price',
  destinationAirportCode,
}) {
  const apiKey = getSerpApiKey();
  const originCode = await getAirportCode(originLocation);
  const destCode = destinationAirportCode || (await getAirportCode(destinationLocation));
  if (!originCode || !destCode) {
    throw new Error(`Could not find airport codes for ${originLocation} or ${destinationLocation}`);
  }

  const params = new URLSearchParams({
    engine: 'google_flights',
    api_key: apiKey,
    departure_id: originCode,
    arrival_id: destCode,
    outbound_date: departureDate,
    type: '2',
    adults: String(adults),
    currency: 'USD',
    sort_by: sortBy === 'duration' ? '5' : '2',
  });

  const url = `${SERPAPI_BASE}?${params.toString()}`;
  let data;
  try {
    data = await httpsGet(url);
  } catch (err) {
    console.error('SerpAPI flight search error:', err);
    throw new Error('Flight search failed. Check SERPAPI_API_KEY and try again.');
  }

  if (data.error) {
    throw new Error(data.error || 'SerpAPI returned an error');
  }

  const best = data.best_flights || [];
  const other = data.other_flights || [];
  const allSerp = [...best, ...other];
  let offers = allSerp.map((item, i) => serpFlightToOffer(item, i, originCode, destCode));

  if (sortBy === 'price') {
    offers = offers.sort((a, b) => {
      const pa = parseFloat(a.price?.total || '999999');
      const pb = parseFloat(b.price?.total || '999999');
      return pa - pb;
    });
  } else if (sortBy === 'duration') {
    offers = offers.sort((a, b) => {
      const durA = parseDuration((a.itineraries || [{}])[0]?.duration || 'PT999H');
      const durB = parseDuration((b.itineraries || [{}])[0]?.duration || 'PT999H');
      return durA - durB;
    });
  }

  return { offers, originCode, destCode };
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 999 * 60;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  return h * 60 + m;
}

module.exports = {
  getAirportCode,
  getAirportsNearLocation,
  searchFlights,
};
