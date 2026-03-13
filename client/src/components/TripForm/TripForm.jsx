import { useState } from 'react';
import { useTrip, useTripDispatch } from '../../context/TripContext';
import { buildItinerarySkeleton } from '../../utils/itinerarySkeleton';
import { validateLocation } from '../../services/api';
import DestinationStep from './DestinationStep';
import DatesStep from './DatesStep';
import PreferencesStep from './PreferencesStep';
import TravelersStep from './TravelersStep';
import AIHelpStep from './AIHelpStep';
import ErrorMessage from '../ErrorMessage';
import LoadingSpinner from '../LoadingSpinner';

const STEPS = [
  { id: 'destinations', title: 'Destinations', component: DestinationStep },
  { id: 'dates', title: 'Travel Dates', component: DatesStep },
  { id: 'preferences', title: 'Preferences', component: PreferencesStep },
  { id: 'travelers', title: 'Travelers', component: TravelersStep },
  { id: 'aiHelp', title: 'AI Help', component: AIHelpStep },
];

export default function TripForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requirements, isLoading, error } = useTrip();
  const dispatch = useTripDispatch();

  const StepComponent = STEPS[currentStep].component;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    const start = (requirements.startingLocation || '').trim();
    if (!start) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your starting location.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { valid, formattedAddress } = await validateLocation(start);
      if (!valid || !formattedAddress) {
        dispatch({ type: 'SET_ERROR', payload: 'We couldn\'t find that starting location. Please check the name.' });
        return;
      }
      dispatch({ type: 'SET_REQUIREMENTS', payload: { startingLocation: formattedAddress } });
      const skeleton = buildItinerarySkeleton({
        ...requirements,
        startingLocation: formattedAddress
      });
      if (!skeleton) {
        dispatch({ type: 'SET_ERROR', payload: 'Please check your dates and destinations.' });
        return;
      }
      dispatch({ type: 'SET_ITINERARY', payload: skeleton });
      dispatch({ type: 'SET_ITINERARY_BUILDING', payload: true });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to validate starting location.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  if (isLoading || isSubmitting) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <LoadingSpinner message="Creating your perfect itinerary..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onRetry={() => dispatch({ type: 'SET_ERROR', payload: null })}
          />
        </div>
      )}

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  index <= currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <span
              key={step.id}
              className={`text-xs font-medium ${
                index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
              }`}
              style={{ width: index < STEPS.length - 1 ? `${100 / STEPS.length}%` : 'auto' }}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        <StepComponent />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Back
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Itinerary...
              </>
            ) : (
              'Create Itinerary'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
