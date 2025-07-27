import React, { useState, useRef, useEffect } from 'react';
import { X, Send, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import { learningService, generateSessionId, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';



const LearningWindow = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('not-selected');
  const [conversationStep, setConversationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId('learning'));
  const messagesEndRef = useRef(null);

  // Get user preferences
  const userGrades = user?.teachingGrades || [9];
  const curriculumType = user?.curriculumType || 'ncert';

  useEffect(() => {
    if (isOpen && conversationStep === 0) {
      setMessages([
        { 
          sender: 'ai', 
          text: '**Welcome to Learning Concepts, Respected Teacher!** 🎓\n\nType which topic you want to learn how to teach?',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { 
      sender: 'user', 
      text: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    if (conversationStep === 0) {
      // User entered a topic
      try {
        // Get user preferences for enhanced prompts
        const userGrades = user?.teachingGrades || [9];
        const curriculumType = user?.curriculumType || 'ncert';
        
        // Create enhanced prompt with user preferences
        let enhancedTopic = userInput;
        if (selectedGrade !== 'not-selected') {
          enhancedTopic = `${userInput} for Grade ${selectedGrade} following ${curriculumType.toUpperCase()} curriculum`;
        } else {
          enhancedTopic = `${userInput} for grades ${userGrades.join(', ')} following ${curriculumType.toUpperCase()} curriculum`;
        }
        
        // Try to get response from backend first
        const response = await learningService.explainConcept(
          enhancedTopic,
          selectedGrade !== 'not-selected' ? selectedGrade : userGrades[0], // Use selected grade or first user grade
          currentLanguage,
          user?.id || 'default_user',
          curriculumType // Pass curriculum type
        );
        
        const aiMsg = { 
          sender: 'ai', 
          text: response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setConversationStep(1);
        
      } catch (error) {
        console.error('Failed to get learning response:', error);
        
        const aiMsg = { 
          sender: 'ai', 
          text: `I apologize, but I'm unable to provide information about "${userInput}" at the moment. Please check your connection and try again, or contact support if the issue persists.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } else {
      // Handle any other conversation steps if needed
      const aiMsg = { 
        sender: 'ai', 
        text: "I'm here to help you with your teaching. Please ask me about any concept you'd like to learn how to teach.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) handleSend();
  };

  const handleClose = () => {
    onClose();
    setMessages([]);
    setConversationStep(0);
    setInput('');
    setSelectedGrade('not-selected');
    setSessionId(generateSessionId('learning'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Learning Concepts</h2>
              <p className="text-blue-100 text-sm">Teaching guidance for educators</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grade Selection */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Grade (Optional):</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="not-selected">Not Selected</option>
              {userGrades?.map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600">
              Curriculum: {curriculumType.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                  }`}>
                    {msg.text.includes('**') ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: msg.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br>')
                        }} 
                      />
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.sender === 'ai' && (
                  <div className="order-2 ml-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] order-1">
                  <div className="px-4 py-3 rounded-2xl bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
                <div className="order-2 ml-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={conversationStep === 0 ? "Type which topic you want to learn how to teach..." : "Type your response..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={conversationStep === 2 || isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <GraduationCap className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || conversationStep === 2 || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl p-3 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          {conversationStep === 2 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => {
                  setMessages([]);
                  setConversationStep(0);
                  setInput('');
                  setSelectedGrade('not-selected');
                  setSessionId(generateSessionId('learning'));
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start a new teaching session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningWindow; 