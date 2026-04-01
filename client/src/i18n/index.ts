import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import de from './locales/de/common.json';

export const normalizeLocaleToLanguage = (locale?: string): 'en' | 'de' => {
  const value = (locale || '').toLowerCase();
  if (value.startsWith('de')) return 'de';
  if (value.startsWith('en')) return 'en';

  // Not translated yet in app; fallback to English until locale packs are added.
  return 'en';
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        de: { translation: de },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;
