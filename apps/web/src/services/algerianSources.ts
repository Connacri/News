import { NewsCategory } from '../types';

export type NewsSourceKind = 'rss' | 'web' | 'api' | 'specialized';

export interface NewsSourceDefinition {
  id: string;
  name: string;
  language: 'ar' | 'fr' | 'mixed';
  kind: NewsSourceKind;
  categories: NewsCategory[];
  country: 'dz' | 'maghreb' | 'world';
  domain?: string;
  enabled: boolean;
}

/**
 * Master registry of Algerian press sources.
 * "enabled" only means the source is part of the editorial registry; the
 * collector must verify an RSS/API endpoint before using it as a direct feed.
 */
export const ALGERIAN_NEWS_SOURCES: NewsSourceDefinition[] = [
  // Arabic — general / high-circulation
  ['elkhabar','El Khabar','ar','web','dz'],
  ['echorouk','Echourouk El Youmi','ar','web','dz'],
  ['ennahar','Ennahar El Djadid','ar','web','dz'],
  ['elbilad','El Bilad','ar','web','dz'],
  ['elhayat','El Hayat','ar','web','dz'],
  ['alfadjr','Al-Fadjr','ar','web','dz'],
  ['elwassat','El Wassat','ar','web','dz'],
  ['elmaouid','El Maouid','ar','web','dz'],
  ['elikbaria','El Ikhbaria','ar','web','dz'],
  // Arabic — public / regional
  ['echaab','Echaâb','ar','web','dz'],
  ['almassa','Al-Massa','ar','web','dz'],
  ['annasr','Annasr','ar','web','dz'],
  ['eldjoumhouria','El Djoumhouria','ar','web','dz'],
  ['akhersaâ','Akher Saâ','ar','web','dz'],
  // French — general / independent
  ['elwatan','El Watan','fr','rss','dz','elwatan.dz'],
  ['lesoir','Le Soir d’Algérie','fr','rss','dz','lesoirdalgerie.com'],
  ['lexpression','L’Expression','fr','rss','dz','lexpression.dz'],
  ['quotidienoran','Le Quotidien d’Oran','fr','web','dz'],
  ['reporters','Reporters','fr','web','dz'],
  ['depechekabylie','La Dépêche de Kabylie','fr','web','dz'],
  ['jeuneindependant','Le Jeune Indépendant','fr','web','dz','jeune-independant.net'],
  ['courrieralgerie','Le Courrier d’Algérie','fr','web','dz'],
  ['midilibre','Le Midi Libre','fr','web','dz'],
  // French — public
  ['elmoudjahid','El Moudjahid','fr','web','dz'],
  ['horizons','Horizons','fr','web','dz'],
  // Economic / specialized
  ['lemaghreb','Le Maghreb – Le quotidien de l’Économie','fr','web','dz'],
  ['journalaffaires','Le Journal d’Affaires','fr','web','dz'],
  // Sports
  ['elheddaf','El Heddaf','ar','web','dz'],
  ['competition','Compétition','fr','web','dz'],
  ['lebuteur','Le Buteur','fr','web','dz'],
  ['planetesport','Planète Sport','fr','web','dz'],
  // Digital / agencies
  ['aps','Algérie Presse Service (APS)','mixed','rss','dz','aps.dz'],
  ['tsa','TSA – Tout sur l’Algérie','fr','rss','dz','tsa-algerie.com'],
  ['algerie360','Algérie360','fr','rss','dz','algerie360.com'],
  ['matindalgerie','Le Matin d’Algérie','fr','web','dz'],
  ['dzfoot','DZFoot','fr','web','dz','dzfoot.com'],
];

const generalCategories: NewsCategory[] = [
  'world','politics','business','economy','society','local','sports','culture',
  'entertainment','science','health','environment','education','technology',
  'ai','cyber','travel','lifestyle'
];

export const ALGERIAN_EDITORIAL_SOURCES = ALGERIAN_NEWS_SOURCES.map((source) => ({
  id: source[0], name: source[1], language: source[2], kind: source[3],
  country: source[4], domain: source[5],
  categories: generalCategories,
  enabled: true
} as NewsSourceDefinition));
