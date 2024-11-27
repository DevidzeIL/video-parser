import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from 'src/langs/en/en.json';

import ruCommon from 'src/langs/ru/ru.json';

const mergeTranslations = (...translations: any[]) => {
  return translations.reduce((acc, curr) => ({ ...acc, ...curr }), {});
};

const resources = {
  en: {
    translation: mergeTranslations(enCommon),
  },
  ru: {
    translation: mergeTranslations(ruCommon),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
