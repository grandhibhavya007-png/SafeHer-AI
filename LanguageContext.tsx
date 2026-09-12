import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, Translations } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  // Aliases for compatibility if your components use 'language' & 'setLanguage'
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') as Language;
    if (savedLang && translations[savedLang]) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('appLang', newLang);
  };

  const t = translations[lang] || translations['en'];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, language: lang, setLanguage: setLang }}>
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