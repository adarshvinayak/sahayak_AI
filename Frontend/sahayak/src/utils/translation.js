import { SUPPORTED_LANGUAGES } from '../context/LanguageContext';

// Translation utilities for enhanced language support

export class TranslationService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.baseURL = 'http://localhost:8000';
  }

  // Check if text needs translation
  needsTranslation(text, targetLanguage) {
    if (!text || !text.trim() || targetLanguage === 'en') {
      return false;
    }

    // Skip if text is mostly numbers, symbols, or already cached
    if (/^[\d\s.,;:!@#$%^&*()\-_=+[\]{}|\\/<>?~`'"]*$/.test(text.trim())) {
      return false;
    }

    return true;
  }

  // Translate single text
  async translateText(text, targetLanguage, sourceLanguage = 'en') {
    if (!this.needsTranslation(text, targetLanguage)) {
      return text;
    }

    const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
    
    // Return cached result
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Return pending request if exists
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create new translation request
    const promise = this._performTranslation(text, targetLanguage, sourceLanguage);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Internal translation method
  async _performTranslation(text, targetLanguage, sourceLanguage) {
    try {
      const response = await fetch(`${this.baseURL}/api/translate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          target_language: targetLanguage,
          source_language: sourceLanguage
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.translated_text || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  // Batch translation
  async translateBatch(texts, targetLanguage, sourceLanguage = 'en') {
    if (targetLanguage === 'en') {
      return texts;
    }

    const filteredTexts = texts.filter(text => this.needsTranslation(text, targetLanguage));
    
    if (filteredTexts.length === 0) {
      return texts;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/translate-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: filteredTexts,
          target_language: targetLanguage,
          source_language: sourceLanguage
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.translated_texts || texts;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

// Singleton instance
export const translationService = new TranslationService();

// Helper functions
export const isLanguageSupported = (languageCode) => {
  return languageCode in SUPPORTED_LANGUAGES;
};

export const getLanguageInfo = (languageCode) => {
  return SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES.en;
};

export const detectTextLanguage = (text) => {
  // Simple language detection based on character patterns
  if (!text) return 'en';

  // Check for common Devanagari scripts (Hindi, Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    return /[\u0901\u0902\u093C\u0941-\u0948\u094D\u0951-\u0954\u0962\u0963\u0972-\u097F]/.test(text) ? 'mr' : 'hi';
  }

  // Check for other Indian scripts
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia
  if (/[\u0980-\u09FF]/.test(text)) return 'as'; // Assamese

  // Check for other languages
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'; // Japanese
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'; // Korean
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'; // Arabic
  if (/[\u0400-\u04ff]/.test(text)) return 'ru'; // Russian

  return 'en'; // Default to English
}; 