import { NewsCategory } from '../types';

export interface NewsCategoryInfo {
  id: NewsCategory;
  icon: string;
  fr: string;
  en: string;
}

export const NEWS_CATEGORIES: NewsCategoryInfo[] = [
  { id: 'all', icon: '🌐', fr: 'À la une', en: 'Top stories' },
  { id: 'world', icon: '🌍', fr: 'Monde', en: 'World' },
  { id: 'local', icon: '📍', fr: 'Local', en: 'Local' },
  { id: 'politics', icon: '🏛️', fr: 'Politique', en: 'Politics' },
  { id: 'business', icon: '💼', fr: 'Entreprises', en: 'Business' },
  { id: 'economy', icon: '📈', fr: 'Économie', en: 'Economy' },
  { id: 'society', icon: '👥', fr: 'Société', en: 'Society' },
  { id: 'sports', icon: '⚽', fr: 'Sports', en: 'Sports' },
  { id: 'culture', icon: '🎭', fr: 'Culture', en: 'Culture' },
  { id: 'entertainment', icon: '🎬', fr: 'Divertissement', en: 'Entertainment' },
  { id: 'science', icon: '🔬', fr: 'Science', en: 'Science' },
  { id: 'health', icon: '🩺', fr: 'Santé', en: 'Health' },
  { id: 'environment', icon: '🌱', fr: 'Environnement', en: 'Environment' },
  { id: 'education', icon: '🎓', fr: 'Éducation', en: 'Education' },
  { id: 'technology', icon: '💻', fr: 'Technologie', en: 'Technology' },
  { id: 'ai', icon: '🤖', fr: 'IA', en: 'AI' },
  { id: 'cyber', icon: '🛡️', fr: 'Cybersécurité', en: 'Cybersecurity' },
  { id: 'travel', icon: '✈️', fr: 'Voyage', en: 'Travel' },
  { id: 'lifestyle', icon: '✨', fr: 'Lifestyle', en: 'Lifestyle' },
  { id: 'opensource', icon: '⭐', fr: 'Open Source', en: 'Open Source' },
  { id: 'mobile', icon: '📱', fr: 'Mobile', en: 'Mobile' },
  { id: 'cloud', icon: '☁️', fr: 'Cloud', en: 'Cloud' },
  { id: 'patents', icon: '📜', fr: 'Brevets', en: 'Patents' },
  { id: 'blueprints', icon: '📐', fr: 'Blueprints', en: 'Blueprints' },
];
