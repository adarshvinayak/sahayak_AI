import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', code: 'en' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', code: 'hi' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', code: 'kn' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', code: 'te' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', code: 'ta' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', code: 'ml' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', code: 'bn' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', code: 'gu' },
  mr: { name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', code: 'mr' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', code: 'pa' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', code: 'or' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', code: 'as' },
  // Additional languages for robustness
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', code: 'fr' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', code: 'de' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', code: 'es' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', code: 'pt' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', code: 'ja' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷', code: 'ko' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', code: 'ar' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', code: 'ru' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', code: 'zh' }
};

// Translation cache for performance
const translationCache = new Map();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const translationQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('sahayak_language') || 'en';
    const savedState = localStorage.getItem('sahayak_page_state');
    
    setCurrentLanguage(savedLanguage);
    if (savedState) {
      try {
        setPageState(JSON.parse(savedState));
      } catch (error) {
        console.error('Failed to parse saved page state:', error);
      }
    }
  }, []);

  // Save page state for preservation
  const savePageState = useCallback((state) => {
    setPageState(prev => {
      const newState = { ...prev, ...state };
      localStorage.setItem('sahayak_page_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Real-time translation function
  const translateText = useCallback(async (text, targetLanguage = currentLanguage) => {
    if (!text || !text.trim() || targetLanguage === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const response = await fetch('http://localhost:8000/api/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          target_language: targetLanguage,
          source_language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.translated_text || text;
      
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }, [currentLanguage]);

  // Batch translation for better performance
  const translateBatch = useCallback(async (textArray, targetLanguage = currentLanguage) => {
    if (targetLanguage === 'en') {
      return textArray;
    }

    try {
      const response = await fetch('http://localhost:8000/api/translate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: textArray,
          target_language: targetLanguage,
          source_language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.translated_texts || textArray;
    } catch (error) {
      console.error('Batch translation error:', error);
      return textArray;
    }
  }, [currentLanguage]);

  // Change language with state preservation
  const changeLanguage = useCallback(async (languageCode) => {
    if (languageCode === currentLanguage) return;

    setIsLoading(true);
    setIsTranslating(true);

    try {
      // Save current state before switching
      const currentState = {
        scrollPosition: window.scrollY,
        activeElements: document.activeElement?.id || '',
        timestamp: Date.now()
      };
      savePageState({ [currentLanguage]: currentState });

      // Change language
      setCurrentLanguage(languageCode);
      localStorage.setItem('sahayak_language', languageCode);

      // Trigger page translation
      if (languageCode !== 'en') {
        await translatePage(languageCode);
      }

      // Restore state if available
      const restoredState = pageState[languageCode];
      if (restoredState) {
        setTimeout(() => {
          if (restoredState.scrollPosition) {
            window.scrollTo(0, restoredState.scrollPosition);
          }
          if (restoredState.activeElements) {
            const element = document.getElementById(restoredState.activeElements);
            if (element) {
              element.focus();
            }
          }
        }, 100);
      }

    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
      setIsTranslating(false);
    }
  }, [currentLanguage, pageState, savePageState]);

  // Translate entire page
  const translatePage = useCallback(async (targetLanguage = currentLanguage) => {
    if (targetLanguage === 'en') return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script and style elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip if text is empty or only whitespace
          const text = node.textContent.trim();
          if (!text) return NodeFilter.FILTER_REJECT;

          // Skip if text looks like code (contains lots of special characters)
          if (/^[{}[\]().,;:!@#$%^&*\-_=+|\\/<>?~`'"0-9\s]*$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // Group nodes for batch translation
    const batchSize = 20;
    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);
      const texts = batch.map(node => node.textContent.trim());
      
      try {
        const translatedTexts = await translateBatch(texts, targetLanguage);
        
        batch.forEach((node, index) => {
          if (translatedTexts[index] && translatedTexts[index] !== texts[index]) {
            node.textContent = translatedTexts[index];
          }
        });
      } catch (error) {
        console.error('Batch translation failed:', error);
      }
    }
  }, [currentLanguage, translateBatch]);

  // Legacy translation function for backward compatibility
  const t = useCallback((key, fallback = key) => {
    // For real-time translation, we'll translate the fallback text
    if (currentLanguage === 'en') return fallback;
    
    // This will be handled by automatic page translation
    return fallback;
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    translateText,
    translateBatch,
    translatePage,
    t, // Legacy support
    isLoading,
    isTranslating,
    pageState,
    savePageState,
    SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Custom hook for automatic page translation
export const usePageTranslation = () => {
  const { currentLanguage, translatePage, isTranslating } = useLanguage();

  useEffect(() => {
    if (currentLanguage !== 'en') {
      const timer = setTimeout(() => {
        translatePage(currentLanguage);
      }, 500); // Debounce to avoid excessive API calls

      return () => clearTimeout(timer);
    }
  }, [currentLanguage, translatePage]);

  return { isTranslating };
};

// Real-time text translation hook
export const useTextTranslation = (text, deps = []) => {
  const { translateText, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    let cancelled = false;
    
    translateText(text).then(translated => {
      if (!cancelled) {
        setTranslatedText(translated);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [text, currentLanguage, translateText, ...deps]);

  return translatedText;
}; 