import React, { useRef, useEffect, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import SahayakImg from '../../sahayak.png';
import { aiService, generateSessionId, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';



const AIAssistantFloating = ({ open, setOpen }) => {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Respected Teacher, I am your AI Assistant. How can I help you with your teaching today?' }
  ]);
  const [input, setInput] = useState('');
  const [lastContext, setLastContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId('ai_assistant'));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Get user preferences for enhanced prompts
      const userGrades = user?.teachingGrades || [9];
      const curriculumType = user?.curriculumType || 'ncert';
      
      // Create enhanced prompt with user preferences and mentor context
      const enhancedInput = `As a friendly mentor and subject expert for a teacher who teaches grades ${userGrades.join(', ')} following ${curriculumType.toUpperCase()} curriculum, please provide warm, encouraging, and practical guidance or an appropriate response for ${input}`;
      
      console.log('Sending request to backend:', enhancedInput);
      
      // Try to get response from backend first
      const response = await aiService.chat(
        enhancedInput,
        user?.id || 'default_user',
        sessionId,
        currentLanguage
      );
      
      console.log('Backend response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      
      // Check if response has the expected structure
      let responseText = '';
      if (response && typeof response === 'object') {
        responseText = response.response || response.text || response.message || JSON.stringify(response);
        console.log('Extracted response text:', responseText);
      } else if (typeof response === 'string') {
        responseText = response;
        console.log('Response is string:', responseText);
      } else {
        responseText = 'I apologize, but I received an unexpected response format. Please try again.';
        console.log('Unexpected response format');
      }
      
      const aiMsg = { sender: 'ai', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
      setLastContext('');
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const aiMsg = { 
        sender: 'ai', 
        text: 'I apologize, but I\'m unable to respond at the moment. Please check your connection and try again, or contact support if the issue persists.' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) handleSend();
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([
      { sender: 'ai', text: 'Respected Teacher, I am your AI Assistant. How can I help you with your teaching today?' }
    ]);
    setLastContext('');
    setSessionId(generateSessionId('ai_assistant'));
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-1 flex items-center justify-center transition-all duration-200"
        onClick={() => setOpen(true)}
        style={{ display: open ? 'none' : 'flex', width: 64, height: 64 }}
        aria-label="Open AI Assistant"
      >
        <img src={SahayakImg} alt="AI Assistant" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
      </button>

      {/* Chat Modal */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
            <span className="text-white font-semibold text-lg">{t('teaching_assistant', 'Teaching Assistant')}</span>
            <button onClick={handleClose} className="text-white hover:text-gray-200" aria-label="Close">
              <X size={22} />
            </button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50" style={{ maxHeight: '320px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                  {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-900 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={t('ask_question', 'Ask about teaching...')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Type your question"
            />
            <button
              className={`rounded-full p-2 flex items-center justify-center transition-all duration-200 ${
                isLoading || !input.trim() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantFloating; 