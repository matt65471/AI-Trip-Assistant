import { useTrip, useTripDispatch } from '../../context/TripContext';

const AI_HELP_OPTIONS = [
  {
    value: 'minimal',
    label: 'I\'ll lead',
    description: 'I want to choose most things myself. Use AI only when I ask.',
    icon: '🎯',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of my choices and AI suggestions. I\'ll decide slot by slot.',
    icon: '⚖️',
  },
  {
    value: 'maximum',
    label: 'AI takes the lead',
    description: 'AI suggests most of the plan; I\'ll tweak what I want.',
    icon: '🤖',
  },
];

export default function AIHelpStep() {
  const { requirements } = useTrip();
  const dispatch = useTripDispatch();
  const selected = requirements.aiHelpLevel || 'balanced';

  const handleChange = (value) => {
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: { aiHelpLevel: value },
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        How much should AI help?
      </h2>
      <p className="text-gray-600 mb-6">
        Choose how much you want suggestions vs deciding yourself
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AI_HELP_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={`p-5 rounded-xl border-2 text-left transition-all ${
              selected === option.value
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{option.icon}</span>
            <p className="font-semibold text-gray-800 mt-3">{option.label}</p>
            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
