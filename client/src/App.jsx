import { TripProvider } from './context/TripContext';
import TripPlanner from './components/TripPlanner';
import './index.css';

function App() {
  return (
    <TripProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <TripPlanner />
      </div>
    </TripProvider>
  );
}

export default App;
