import { useState, useRef, useEffect } from 'react';
import { useTrip, useTripDispatch } from '../../context/TripContext';
import { sendChatMessage, refineItinerary } from '../../services/api';
import ChatMessage from './ChatMessage';

const REFINEMENT_KEYWORDS = [
  'change', 'modify', 'update', 'replace', 'swap', 'remove', 'add',
  'more', 'less', 'cheaper', 'expensive', 'different', 'instead',
  'skip', 'extend', 'shorten', 'move', 'reschedule'
];

export default function Chat() {
  const { chatHistory, requirements, itinerary } = useTrip();
  const dispatch = useTripDispatch();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const isRefinementRequest = (message) => {
    if (!itinerary) return false;
    const lowerMessage = message.toLowerCase();
    return REFINEMENT_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'user', content: userMessage }
    });

    try {
      const tripContext = {
        requirements,
        itinerary
      };

      if (isRefinementRequest(userMessage) && itinerary) {
        const refinedItinerary = await refineItinerary(itinerary, userMessage);
        dispatch({ type: 'SET_ITINERARY', payload: refinedItinerary });
        dispatch({
          type: 'ADD_CHAT_MESSAGE',
          payload: {
            role: 'assistant',
            content: "I've updated your itinerary based on your request. Take a look at the changes on the left! Let me know if you'd like any other modifications."
          }
        });
      } else {
        const response = await sendChatMessage(
          userMessage,
          tripContext,
          [...chatHistory, { role: 'user', content: userMessage }]
        );

        dispatch({
          type: 'ADD_CHAT_MESSAGE',
          payload: response
        });
      }
    } catch (error) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = itinerary ? [
    "Make day 1 more relaxed",
    "Add more local food experiences",
    "Find cheaper accommodation options",
    "What should I pack for this trip?",
  ] : [
    "What's the best time to visit?",
    "What should I pack?",
    "Any local food recommendations?",
    "What are must-see attractions?",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Travel Assistant
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Ask questions or request changes to your trip
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-2">How can I help?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ask me anything about your trip!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInputValue(question)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
