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
    travelToDestination: [''],
    travelAtDestination: [''],
    accommodations: [''],
    travelers: {
      count: 1,
      notes: ''
    }
  },
  itinerary: null,
  itineraryBuildingMode: false,
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
    case 'SET_ITINERARY_BUILDING':
      return {
        ...state,
        itineraryBuildingMode: action.payload
      };
    case 'UPDATE_ITINERARY_SLOT': {
      const { dayIndex, slotType, slotIndex, value } = action.payload;
      const days = [...(state.itinerary?.days || [])];
      const day = { ...days[dayIndex] };
      if (slotType === 'accommodation') day.accommodation = value;
      else if (slotType === 'transportation') day.transportation = value;
      else if (slotType === 'activity') {
        const activities = [...(day.activities || [])];
        activities[slotIndex] = value;
        day.activities = activities;
      } else if (slotType === 'meal') {
        const meals = [...(day.meals || [])];
        meals[slotIndex] = value;
        day.meals = meals;
      }
      days[dayIndex] = day;
      return {
        ...state,
        itinerary: { ...state.itinerary, days }
      };
    }
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
      return { ...initialState };
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
