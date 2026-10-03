import { useEffect, useState } from 'react';
import { NewsArticle } from '../types';

const LAST_VIEWED_KEY = 'flutternews_last_viewed_articles_v1';
const GENERAL_CACHE_KEY = 'flutternews_general_articles_cache_v1';
const MAX_LAST_VIEWED = 50;

/**
 * Enregistre un article consulté dans le cache local (LocalStorage).
 * Garantit que les détails complets (titre, contenu, brevets, takeaways) restent accessibles hors-ligne.
 */
export function saveLastViewedArticle(article: NewsArticle): void {
  try {
    const existing = getLastViewedArticles();
    // Supprimer si déjà présent pour le replacer en tête
    const filtered = existing.filter((item) => item.id !== article.id);
    
    // Insérer l'article consulté avec un horodatage de consultation
    const updated = [
      {
        ...article,
        // On conserve tout le contenu pour lecture hors-ligne
        savedOfflineAt: Date.now()
      },
      ...filtered
    ].slice(0, MAX_LAST_VIEWED);

    localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('offline_cache_updated', { detail: { articleId: article.id } }));
  } catch (err) {
    console.warn('Impossible de sauvegarder l\'article dans le cache local:', err);
  }
}

/**
 * Récupère la liste des derniers articles consultés en cache local.
 */
export function getLastViewedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(LAST_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Erreur lors de la lecture des articles consultés:', err);
    return [];
  }
}

/**
 * Enregistre le flux complet d'actualités dans le cache général hors-ligne.
 */
export function saveCachedArticles(articles: NewsArticle[]): void {
  try {
    if (!articles || articles.length === 0) return;
    // On conserve au maximum les 100 articles les plus récents
    const subset = articles.slice(0, 100);
    localStorage.setItem(GENERAL_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      articles: subset
    }));
  } catch (err) {
    console.warn('Erreur de mise en cache du flux général:', err);
  }
}

/**
 * Récupère le flux d'actualités sauvegardé localement en cas d'absence de réseau.
 */
export function getCachedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(GENERAL_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.articles) ? parsed.articles : [];
  } catch (err) {
    console.warn('Erreur lors de la lecture du cache général:', err);
    return [];
  }
}

/**
 * Hook React détectant en temps réel l'état de la connexion Internet.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Enregistre le Service Worker PWA pour la mise en cache réseau & shell hors-ligne.
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker enregistré avec succès pour le mode hors-ligne:', reg.scope);
        })
        .catch((err) => {
          console.warn('Enregistrement du Service Worker ignoré ou non supporté:', err);
        });
    });
  }
}
