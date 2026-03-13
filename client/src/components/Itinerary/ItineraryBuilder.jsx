import { useState } from 'react';
import { useTrip, useTripDispatch } from '../../context/TripContext';
import { generateSlot } from '../../services/api';
import {
  getBuilderSteps,
  isSlotFilled,
  getSlotValue,
} from '../../utils/itinerarySkeleton';
import LoadingSpinner from '../LoadingSpinner';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function slotToDisplayValue(itinerary, dayIndex, slotType, slotIndex) {
  const value = getSlotValue(itinerary, dayIndex, slotType, slotIndex);
  if (!value) return null;
  if (slotType === 'accommodation') return value.name;
  if (slotType === 'activity') return value.title;
  if (slotType === 'meal') return value.suggestion;
  if (slotType === 'transportation') return value.method;
  return null;
}

export default function ItineraryBuilder() {
  const { requirements, itinerary } = useTrip();
  const dispatch = useTripDispatch();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] = useState(null);

  if (!itinerary?.days?.length) return null;

  const steps = getBuilderSteps(itinerary);
  const currentStep = steps[currentStepIndex];
  const filled = currentStep && isSlotFilled(itinerary, currentStep.dayIndex, currentStep.slotType, currentStep.slotIndex);
  const displayValue = currentStep && slotToDisplayValue(itinerary, currentStep.dayIndex, currentStep.slotType, currentStep.slotIndex);

  const buildManualValue = () => {
    const text = manualInput.trim();
    if (!text) return null;
    if (currentStep.slotType === 'accommodation') {
      return { name: text, type: 'hotel', estimatedCost: 0, notes: '' };
    }
    if (currentStep.slotType === 'activity') {
      return {
        time: '09:00',
        title: text,
        description: text,
        duration: '',
        estimatedCost: 0,
        location: '',
        tips: '',
      };
    }
    if (currentStep.slotType === 'meal') {
      return {
        type: MEAL_TYPES[currentStep.slotIndex],
        suggestion: text,
        cuisine: '',
        estimatedCost: 0,
      };
    }
    if (currentStep.slotType === 'transportation') {
      return { method: text, notes: '', estimatedCost: 0 };
    }
    return null;
  };

  const handleUseManual = () => {
    const value = buildManualValue();
    if (!value) return;
    dispatch({
      type: 'UPDATE_ITINERARY_SLOT',
      payload: {
        dayIndex: currentStep.dayIndex,
        slotType: currentStep.slotType,
        slotIndex: currentStep.slotIndex,
        value,
      },
    });
    setManualInput('');
    setShowManualInput(false);
    setGeneratedSuggestion(null);
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    setGeneratedSuggestion(null);
    try {
      const slot = await generateSlot(
        requirements,
        itinerary,
        currentStep.dayIndex,
        currentStep.slotType,
        currentStep.slotIndex
      );
      setGeneratedSuggestion(slot);
    } catch (err) {
      setGeneratedSuggestion({ _error: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleUseSuggestion = () => {
    if (!generatedSuggestion || generatedSuggestion._error) return;
    dispatch({
      type: 'UPDATE_ITINERARY_SLOT',
      payload: {
        dayIndex: currentStep.dayIndex,
        slotType: currentStep.slotType,
        slotIndex: currentStep.slotIndex,
        value: generatedSuggestion,
      },
    });
    setGeneratedSuggestion(null);
  };

  const handleClearSlot = () => {
    dispatch({
      type: 'UPDATE_ITINERARY_SLOT',
      payload: {
        dayIndex: currentStep.dayIndex,
        slotType: currentStep.slotType,
        slotIndex: currentStep.slotIndex,
        value: null,
      },
    });
    setManualInput('');
    setShowManualInput(false);
    setGeneratedSuggestion(null);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      setShowManualInput(false);
      setManualInput('');
      setGeneratedSuggestion(null);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      setShowManualInput(false);
      setManualInput('');
      setGeneratedSuggestion(null);
    }
  };

  const handleFinish = () => {
    dispatch({ type: 'SET_ITINERARY_BUILDING', payload: false });
  };

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
  };

  const canFinish = steps.every((s) =>
    isSlotFilled(itinerary, s.dayIndex, s.slotType, s.slotIndex)
  );
  const isLastStep = currentStepIndex === steps.length - 1;

  if (generating) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <LoadingSpinner message="Generating suggestion..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Build your itinerary
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={handleStartOver}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Start over
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Current step context */}
      {currentStep && (
        <div className="rounded-xl bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">
            Day {currentStep.day} · {formatDate(currentStep.date)} · {currentStep.location}
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {currentStep.label}
          </p>
        </div>
      )}

      {/* Filled state: show value and options to change or next */}
      {currentStep && filled && !generatedSuggestion && (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600 mb-1">Current choice</p>
            <p className="font-medium text-gray-800">{displayValue}</p>
          </div>
          <button
            type="button"
            onClick={handleClearSlot}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Unfilled: manual or AI */}
      {currentStep && !filled && (
        <div className="space-y-4">
          {!showManualInput && !generatedSuggestion && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                I'll decide
              </button>
              <button
                type="button"
                onClick={handleGenerateWithAI}
                className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Generate with AI
              </button>
            </div>
          )}

          {showManualInput && (
            <div className="space-y-3">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={
                  currentStep.slotType === 'activity'
                    ? 'e.g. Visit the Eiffel Tower'
                    : currentStep.slotType === 'meal'
                    ? 'e.g. Café de Flore'
                    : currentStep.slotType === 'accommodation'
                    ? 'e.g. Hotel name or area'
                    : 'e.g. Metro, walking, taxi'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseManual}
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use this
                </button>
                <button
                  type="button"
                  onClick={() => { setShowManualInput(false); setManualInput(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {generatedSuggestion && (
            <div className="space-y-3">
              {generatedSuggestion._error ? (
                <p className="text-sm text-red-600">{generatedSuggestion._error}</p>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                  {currentStep.slotType === 'accommodation' && (
                    <p className="font-medium">{generatedSuggestion.name}</p>
                  )}
                  {currentStep.slotType === 'activity' && (
                    <>
                      <p className="font-medium">{generatedSuggestion.title}</p>
                      <p className="mt-1 text-gray-600">{generatedSuggestion.description}</p>
                    </>
                  )}
                  {currentStep.slotType === 'meal' && (
                    <p className="font-medium">{generatedSuggestion.suggestion}</p>
                  )}
                  {currentStep.slotType === 'transportation' && (
                    <p className="font-medium">{generatedSuggestion.method}</p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {!generatedSuggestion._error && (
                  <>
                    <button
                      type="button"
                      onClick={handleUseSuggestion}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      Use this
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateWithAI}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Try again
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setGeneratedSuggestion(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {generatedSuggestion._error ? 'Back' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <div className="flex gap-2">
          {canFinish && (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Finish building
            </button>
          )}
          {!canFinish && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!filled}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
