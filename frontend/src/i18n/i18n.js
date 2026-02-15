import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import it from './locales/it.json';

const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  caches: ['localStorage'],
  lookupLocalStorage: 'language',
  checkWhitelist: true
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      ru: { translation: ru },
      ar: { translation: ar },
      zh: { translation: zh },
      ja: { translation: ja },
      it: { translation: it }
    },
    detection: detectionOptions,
    fallbackLng: 'tr',
    supportedLngs: ['tr', 'en', 'de', 'fr', 'es', 'ru', 'ar', 'zh', 'ja', 'it'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

console.log('🌐 Detected language:', i18n.language);

export default i18n;