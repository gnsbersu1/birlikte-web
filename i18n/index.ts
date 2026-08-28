import { de, tr, type TranslationKey } from '@/i18n/translations';

export type Language = 'tr' | 'de';
export type TranslationParams = Record<string, string | number>;

export const LANGUAGE_STORAGE_KEY = '@birlikte/language';
export const speechLocales: Record<Language, 'tr-TR' | 'de-DE'> = { tr: 'tr-TR', de: 'de-DE' };

let runtimeLanguage: Language = 'tr';

export function setRuntimeLanguage(language: Language) {
  runtimeLanguage = language;
}

export function translate(language: Language, key: TranslationKey, params?: TranslationParams) {
  const template = (language === 'de' ? de : tr)[key];
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function translateCurrent(key: TranslationKey, params?: TranslationParams) {
  return translate(runtimeLanguage, key, params);
}

export type { TranslationKey };
