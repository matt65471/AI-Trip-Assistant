const Amadeus = require('amadeus');

function getAmadeusClient() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Amadeus API not configured. Add AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET to server/.env'
    );
  }
  return new Amadeus({
    clientId,
    clientSecret,
    hostname: process.env.AMADEUS_HOST || 'test',
  });
}

/**
 * Get IATA airport/city code from a location string (e.g. "Paris, France" -> "PAR")
 */
async function getAirportCode(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;
  const amadeus = getAmadeusClient();
  const keyword = locationStr.split(',')[0]?.trim() || locationStr;
  if (!keyword) return null;
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY',
    });
    const data = response.data;
    if (!data || !data.length) return null;
    const first = data[0];
    return first.iataCode || null;
  } catch (err) {
    console.error('Amadeus airport search error:', err);
    return null;
  }
}

/**
 * Search flight offers: origin, destination, departureDate, adults.
 * sortBy: 'price' (default) or 'duration'. For "find cheaper" use sortBy: 'price'.
 */
async function searchFlights({ originLocation, destinationLocation, departureDate, adults = 1, sortBy = 'price' }) {
  const amadeus = getAmadeusClient();
  const [originCode, destCode] = await Promise.all([
    getAirportCode(originLocation),
    getAirportCode(destinationLocation),
  ]);
  if (!originCode || !destCode) {
    throw new Error(`Could not find airport codes for ${originLocation} or ${destinationLocation}`);
  }
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destCode,
      departureDate,
      adults: String(adults),
    });
    let offers = response.data || [];
    if (sortBy === 'price') {
      offers = offers.sort((a, b) => {
        const priceA = parseFloat(a.price?.total || '999999');
        const priceB = parseFloat(b.price?.total || '999999');
        return priceA - priceB;
      });
    } else if (sortBy === 'duration') {
      offers = offers.sort((a, b) => {
        const durA = (a.itineraries || [{}])[0]?.duration || 'PT999H';
        const durB = (b.itineraries || [{}])[0]?.duration || 'PT999H';
        return parseDuration(durA) - parseDuration(durB);
      });
    }
    return { offers, originCode, destCode };
  } catch (err) {
    console.error('Amadeus flight search error:', err);
    throw err;
  }
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
  searchFlights,
};
