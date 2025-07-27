import { useEffect, useRef, useCallback, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translationService } from '../utils/translation';

// Custom hook for automatic page translation
export const useAutoTranslation = (options = {}) => {
  const { currentLanguage, isTranslating } = useLanguage();
  const {
    enableAutoTranslation = true,
    excludeSelectors = ['script', 'style', 'noscript', '.no-translate'],
    debounceDelay = 1000,
    batchSize = 15
  } = options;

  const translationTimeoutRef = useRef(null);
  const observerRef = useRef(null);
  const isTranslatingRef = useRef(false);

  // Translate page content
  const translatePageContent = useCallback(async () => {
    if (!enableAutoTranslation || currentLanguage === 'en' || isTranslatingRef.current) {
      return;
    }

    isTranslatingRef.current = true;

    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;

            // Skip excluded elements
            for (const selector of excludeSelectors) {
              if (selector.startsWith('.') || selector.startsWith('#')) {
                if (parent.matches(selector)) {
                  return NodeFilter.FILTER_REJECT;
                }
              } else if (parent.tagName.toLowerCase() === selector) {
                return NodeFilter.FILTER_REJECT;
              }
            }

            // Skip if already translated or marked as no-translate
            if (parent.hasAttribute('data-translated') || 
                parent.hasAttribute('data-no-translate') ||
                parent.closest('[data-no-translate]')) {
              return NodeFilter.FILTER_REJECT;
            }

            // Skip empty or whitespace-only text
            const text = node.textContent.trim();
            if (!text || text.length < 2) {
              return NodeFilter.FILTER_REJECT;
            }

            // Skip if text appears to be code or structured data
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

      // Process in batches for better performance
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        const texts = batch.map(node => node.textContent.trim());

        try {
          const translatedTexts = await translationService.translateBatch(
            texts, 
            currentLanguage
          );

          // Apply translations
          batch.forEach((node, index) => {
            if (translatedTexts[index] && 
                translatedTexts[index] !== texts[index] &&
                node.parentElement) {
              
              // Store original text as data attribute
              if (!node.parentElement.hasAttribute('data-original-text')) {
                node.parentElement.setAttribute('data-original-text', texts[index]);
              }
              
              node.textContent = translatedTexts[index];
              node.parentElement.setAttribute('data-translated', currentLanguage);
            }
          });

          // Small delay between batches to avoid overwhelming the API
          if (i + batchSize < textNodes.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error('Batch translation failed:', error);
        }
      }
    } catch (error) {
      console.error('Page translation error:', error);
    } finally {
      isTranslatingRef.current = false;
    }
  }, [currentLanguage, enableAutoTranslation, excludeSelectors, batchSize]);

  // Restore original text when switching back to English
  const restoreOriginalText = useCallback(() => {
    const translatedElements = document.querySelectorAll('[data-translated]');
    
    translatedElements.forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        // Find text nodes and restore original content
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let textNode;
        while (textNode = walker.nextNode()) {
          if (textNode.textContent.trim()) {
            textNode.textContent = originalText;
            break;
          }
        }
      }
      
      element.removeAttribute('data-translated');
      element.removeAttribute('data-original-text');
    });
  }, []);

  // Debounced translation trigger
  const triggerTranslation = useCallback(() => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    translationTimeoutRef.current = setTimeout(() => {
      if (currentLanguage === 'en') {
        restoreOriginalText();
      } else {
        translatePageContent();
      }
    }, debounceDelay);
  }, [currentLanguage, translatePageContent, restoreOriginalText, debounceDelay]);

  // Set up DOM mutation observer for dynamic content
  useEffect(() => {
    if (!enableAutoTranslation) return;

    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || 
                node.nodeType === Node.TEXT_NODE) {
              shouldTranslate = true;
            }
          });
        } else if (mutation.type === 'characterData') {
          shouldTranslate = true;
        }
      });

      if (shouldTranslate && !isTranslatingRef.current) {
        triggerTranslation();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [triggerTranslation, enableAutoTranslation]);

  // Trigger translation on language change
  useEffect(() => {
    if (enableAutoTranslation) {
      triggerTranslation();
    }
  }, [currentLanguage, triggerTranslation, enableAutoTranslation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isTranslating: isTranslatingRef.current,
    triggerTranslation,
    restoreOriginalText
  };
};

// Hook for translating specific text content
export const useTextTranslation = (text, deps = []) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text || currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translationService.translateText(text, currentLanguage)
      .then(translated => {
        if (!cancelled) {
          setTranslatedText(translated);
        }
      })
      .catch(error => {
        console.error('Text translation error:', error);
        if (!cancelled) {
          setTranslatedText(text);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, currentLanguage, ...deps]);

  return { translatedText, isLoading };
}; 