import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { LANGUAGE_STORAGE_KEY, setRuntimeLanguage, speechLocales, translate, type Language, type TranslationKey, type TranslationParams } from '@/i18n';

type LanguageContextValue = {
  language: Language | null;
  isLanguageLoading: boolean;
  locale: 'tr-TR' | 'de-DE';
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then(storedLanguage => {
        if (storedLanguage === 'tr' || storedLanguage === 'de') {
          setRuntimeLanguage(storedLanguage);
          setLanguageState(storedLanguage);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLanguageLoading(false));
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setRuntimeLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const activeLanguage = language ?? 'tr';
  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(activeLanguage, key, params),
    [activeLanguage],
  );

  const value = useMemo(() => ({
    language,
    isLanguageLoading,
    locale: speechLocales[activeLanguage],
    setLanguage,
    t,
  }), [language, isLanguageLoading, activeLanguage, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
