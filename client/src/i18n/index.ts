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
        supportedLangs: LANGS,
        load: 'languageOnly',
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'accountant-lang',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
    });

export const currentLocale = (): string => (i18n.language === 'en' ? 'en-US' : 'ru-RU');

export default i18n;