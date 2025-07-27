import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode) => {
    setIsOpen(false);
    await changeLanguage(languageCode);
  };

  const currentLang = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 transition-colors disabled:opacity-50"
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentLang.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.nativeName}</span>
              </div>
              {currentLanguage === code && <Check size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 