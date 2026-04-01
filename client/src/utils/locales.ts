export interface LocaleOption {
  code: string;
  languageCode: string;
  label: string;
  flag: string;
}

const FALLBACK_LOCALE: LocaleOption = {
  code: 'en',
  languageCode: 'en',
  label: 'English',
  flag: '🇬🇧',
};

const LOCALE_MAP: Record<string, LocaleOption> = {
  en: { code: 'en', languageCode: 'en', label: 'English', flag: '🇬🇧' },
  'en-gb': { code: 'en-GB', languageCode: 'en', label: 'English (UK)', flag: '🇬🇧' },
  'en-us': { code: 'en-US', languageCode: 'en', label: 'English (US)', flag: '🇺🇸' },

  de: { code: 'de', languageCode: 'de', label: 'Deutsch', flag: '🇩🇪' },
  'de-de': { code: 'de-DE', languageCode: 'de', label: 'Deutsch (Deutschland)', flag: '🇩🇪' },

  nl: { code: 'nl', languageCode: 'en', label: 'Nederlands', flag: '🇳🇱' },
  'nl-nl': { code: 'nl-NL', languageCode: 'en', label: 'Nederlands (Nederland)', flag: '🇳🇱' },
  'nl-be': { code: 'nl-BE', languageCode: 'en', label: 'Nederlands (België)', flag: '🇧🇪' },

  fr: { code: 'fr', languageCode: 'en', label: 'Français', flag: '🇫🇷' },
  'fr-be': { code: 'fr-BE', languageCode: 'en', label: 'Français (Belgique)', flag: '🇧🇪' },

  es: { code: 'es', languageCode: 'en', label: 'Español', flag: '🇪🇸' },
  'es-es': { code: 'es-ES', languageCode: 'en', label: 'Español (España)', flag: '🇪🇸' },

  pt: { code: 'pt', languageCode: 'en', label: 'Português', flag: '🇵🇹' },
  'pt-pt': { code: 'pt-PT', languageCode: 'en', label: 'Português (Portugal)', flag: '🇵🇹' },

  'pl-pl': { code: 'pl-PL', languageCode: 'en', label: 'Polski', flag: '🇵🇱' },
  'cs-cz': { code: 'cs-CZ', languageCode: 'en', label: 'Čeština', flag: '🇨🇿' },
  'sk-sk': { code: 'sk-SK', languageCode: 'en', label: 'Slovenčina', flag: '🇸🇰' },
  'sl-si': { code: 'sl-SI', languageCode: 'en', label: 'Slovenščina', flag: '🇸🇮' },
  'hu-hu': { code: 'hu-HU', languageCode: 'en', label: 'Magyar', flag: '🇭🇺' },
  'hr-hr': { code: 'hr-HR', languageCode: 'en', label: 'Hrvatski', flag: '🇭🇷' },
  'nb-no': { code: 'nb-NO', languageCode: 'en', label: 'Norsk Bokmål', flag: '🇳🇴' },
  'sv-se': { code: 'sv-SE', languageCode: 'en', label: 'Svenska', flag: '🇸🇪' },
  'sv-fi': { code: 'sv-FI', languageCode: 'en', label: 'Svenska (Finland)', flag: '🇫🇮' },
  'fi-fi': { code: 'fi-FI', languageCode: 'en', label: 'Suomi', flag: '🇫🇮' },
  'da-dk': { code: 'da-DK', languageCode: 'en', label: 'Dansk', flag: '🇩🇰' },
};

export const resolveLocaleOption = (localeCode: string): LocaleOption => {
  const key = (localeCode || '').trim().toLowerCase();
  return LOCALE_MAP[key] || {
    code: localeCode,
    languageCode: 'en',
    label: localeCode,
    flag: '🌐',
  };
};

export const buildLocaleOptions = (allowedLocales: string[]): LocaleOption[] => {
  if (!allowedLocales?.length) return [FALLBACK_LOCALE];

  return allowedLocales.map((code) => resolveLocaleOption(code));
};
