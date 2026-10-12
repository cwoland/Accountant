import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './locales/ru.json';
import en from './locales/en.json';

export const LANGS = ['ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { ru: { translation: ru }, en: { translation: en } },
        fallbackLng: 'ru',
        supportedLngs: [...LANGS],
        load: 'languageOnly',
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'accountant-lang',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export const currentLocale = (): string => (i18n.language === 'en' ? 'en-US' : 'ru-RU');

export default i18n;
type LooseTranslate = (key: string, params?: Record<string, unknown>) => string;

export function translateCode(
  code: string,
  params?: Record<string, string | number>,
  fallback?: string,
): string {
  if (!i18n.exists(code)) return fallback ?? code;
  const translate = i18n.t.bind(i18n) as unknown as LooseTranslate;
  return translate(code, params ?? {});
}
