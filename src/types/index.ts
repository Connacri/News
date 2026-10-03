export type Language = 'fr' | 'en' | 'es' | 'de' | 'ar' | 'ja';

export type CountryCode = 'all' | 'fr' | 'dz' | 'maghreb' | 'cn' | 'us' | 'de' | 'gb' | 'jp' | 'ca';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  nativeName: string;
  flag: string;
  techHubs: string[];
}

export type NewsCategory = 'all' | 'ai' | 'cyber' | 'opensource' | 'mobile' | 'cloud';

export interface NewsArticle {
  id: string;
  title: string;
  translatedTitle?: string;
  description: string;
  translatedDescription?: string;
  url: string;
  source: string;
  sourceType: 'hackernews' | 'devto' | 'github' | 'osint' | 'reddit' | 'opensource' | 'ai' | 'cloud';
  publishedAt: string;
  author?: string;
  country: CountryCode;
  category: NewsCategory;
  upvotes?: number;
  commentsCount?: number;
  tags: string[];
  osintSeverity?: 'low' | 'medium' | 'high' | 'critical';
  cveId?: string;
  fullContent?: string;
  translatedFullContent?: string;
  keyTakeaways?: string[];
  technicalCode?: string;
}

export interface OsintAlert {
  id: string;
  cveId: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystem: string;
  summary: string;
  publishedDate: string;
  sourceUrl: string;
  countryScope: string;
  mitigation?: string;
}

export interface FcmPayload {
  title: string;
  body: string;
  country: CountryCode;
  category: string;
  articleId?: string;
  timestamp: number;
  topic?: string;
}

export interface FlutterCodeFile {
  path: string;
  description: string;
  language: string;
  content: string;
}

export interface FreeApiResource {
  id: string;
  name: string;
  description: string;
  category: 'news' | 'osint' | 'code' | 'science';
  url: string;
  endpoint: string;
  requiresKey: boolean;
  rateLimit: string;
  documentationUrl: string;
  sampleCurl: string;
}
