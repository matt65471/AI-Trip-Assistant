import { useTrip } from '../context/TripContext';
import TripForm from './TripForm/TripForm';
import Itinerary from './Itinerary/Itinerary';
import ItineraryBuilder from './Itinerary/ItineraryBuilder';

export default function TripPlanner() {
  const { itinerary, itineraryBuildingMode } = useTrip();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <header className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-4xl">✈️</span>
          AI Trip Assistant
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Plan your perfect trip with AI-powered recommendations
        </p>
      </header>

      <div>
        {!itinerary ? (
          <TripForm />
        ) : itineraryBuildingMode ? (
          <ItineraryBuilder />
        ) : (
          <Itinerary />
        )}
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>Powered by AI. Prices and availability are estimates only.</p>
      </footer>
    </div>
  );
}
