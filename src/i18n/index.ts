import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ur from './ur.json'

i18next.use(initReactI18next).init({
  resources: { en, ur },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18next

export type Lang = 'en' | 'ur'

export function toggleLang(current: Lang): Lang {
  return current === 'en' ? 'ur' : 'en'
}

export function isRtl(lang: Lang): boolean {
  return lang === 'ur'
}