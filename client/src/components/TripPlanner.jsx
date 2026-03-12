import { useTrip } from '../context/TripContext';
import TripForm from './TripForm/TripForm';
import Chat from './Chat/Chat';
import Itinerary from './Itinerary/Itinerary';

export default function TripPlanner() {
  const { itinerary } = useTrip();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <header className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-4xl">✈️</span>
          AI Trip Assistant
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Plan your perfect trip with AI-powered recommendations
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {!itinerary ? (
            <TripForm />
          ) : (
            <Itinerary />
          )}
        </div>
        
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <Chat />
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>Powered by AI. Prices and availability are estimates only.</p>
      </footer>
    </div>
  );
}
