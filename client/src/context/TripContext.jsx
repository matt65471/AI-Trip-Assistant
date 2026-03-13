import { createContext, useContext, useReducer } from 'react';

const TripContext = createContext(null);
const TripDispatchContext = createContext(null);

const initialState = {
  requirements: {
    startingLocation: '',
    destinations: [],
    startDate: '',
    endDate: '',
    budget: 'moderate',
    travelMethod: 'flight',
    accommodation: 'hotel',
    travelers: {
      count: 1,
      notes: ''
    }
  },
  itinerary: null,
  chatHistory: [],
  currentStep: 0,
  isLoading: false,
  error: null
};

function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_REQUIREMENTS':
      return {
        ...state,
        requirements: { ...state.requirements, ...action.payload }
      };
    case 'SET_ITINERARY':
      return {
        ...state,
        itinerary: action.payload,
        isLoading: false
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      };
    case 'SET_CHAT_HISTORY':
      return {
        ...state,
        chatHistory: action.payload
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  return (
    <TripContext.Provider value={state}>
      <TripDispatchContext.Provider value={dispatch}>
        {children}
      </TripDispatchContext.Provider>
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === null) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

export function useTripDispatch() {
  const context = useContext(TripDispatchContext);
  if (context === null) {
    throw new Error('useTripDispatch must be used within a TripProvider');
  }
  return context;
}
