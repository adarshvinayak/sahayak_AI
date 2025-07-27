import { VOICE_MAPPING, SUPPORTED_LANGUAGES } from './constants';

// Text-to-Speech utility
export const speakText = (text, language = 'en') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_MAPPING[language] || 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
    
    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
    });
  } else {
    console.warn('Speech synthesis not supported');
    return Promise.reject(new Error('Speech synthesis not supported'));
  }
};

// Get language name by code
export const getLanguageName = (code) => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  return language ? language.nativeName : 'Unknown';
};

// Format date for Indian locale
export const formatDate = (date, language = 'en') => {
  const dateObj = new Date(date);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get greeting based on time of day
export const getTimeBasedGreeting = (language = 'en') => {
  const hour = new Date().getHours();
  
  const greetings = {
    en: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night'
    },
    hi: {
      morning: 'सुप्रभात',
      afternoon: 'नमस्कार',
      evening: 'शुभ संध्या',
      night: 'शुभ रात्रि'
    }
  };
  
  const langGreetings = greetings[language] || greetings.en;
  
  if (hour < 12) return langGreetings.morning;
  if (hour < 17) return langGreetings.afternoon;
  if (hour < 21) return langGreetings.evening;
  return langGreetings.night;
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substr(0, 2);
};

// Generate color from string (for avatars)
export const getColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#f59332', '#0ea5e9', '#22c55e', '#ef4444', '#8b5cf6',
    '#f97316', '#06b6d4', '#84cc16', '#f43f5e', '#6366f1'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Mock AI response generator
export const generateMockAIResponse = (prompt, context = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        "I understand you're looking for help with your teaching. Let me provide you with some relevant information and suggestions for your multi-grade classroom.",
        "Based on your curriculum and grade level, here are some teaching strategies that might be helpful for managing different grade levels simultaneously.",
        "For rural teaching scenarios, I recommend focusing on practical examples that students can relate to from their daily lives and local environment.",
        "Let me help you prepare engaging content for your students. Here are some interactive activities you can try with limited resources."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      resolve({
        text: randomResponse,
        suggestions: [
          "Create visual aids using local materials",
          "Use storytelling to explain concepts",
          "Encourage peer learning among different grades",
          "Incorporate local language examples",
          "Use group activities for mixed-grade learning"
        ]
      });
    }, 1500);
  });
};

// Validate phone number (Indian format)
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};