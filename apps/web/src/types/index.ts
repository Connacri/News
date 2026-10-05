export type Language = 'fr' | 'en' | 'es' | 'de' | 'ar' | 'ja';

export type CountryCode = 'all' | 'fr' | 'dz' | 'maghreb' | 'cn' | 'us' | 'de' | 'gb' | 'jp' | 'ca';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  nativeName: string;
  flag: string;
  techHubs: string[];
}

export type NewsCategory = 'all' | 'world' | 'politics' | 'business' | 'economy' | 'society' | 'local' | 'sports' | 'culture' | 'entertainment' | 'science' | 'health' | 'environment' | 'education' | 'technology' | 'ai' | 'cyber' | 'opensource' | 'mobile' | 'cloud' | 'patents' | 'blueprints' | 'travel' | 'lifestyle' | 'offline';

export interface NewsArticle {
  id: string;
  title: string;
  translatedTitle?: string;
  description: string;
  translatedDescription?: string;
  url: string;
  source: string;
  sourceType: 'hackernews' | 'devto' | 'github' | 'rss' | 'gdelt' | 'osint' | 'reddit' | 'opensource' | 'ai' | 'cloud' | 'patents' | 'blueprint' | 'arxiv';
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
  savedOfflineAt?: number;

  // Expert Patent & Architectural Blueprint Metadata
  publicationType?: 'patent' | 'blueprint' | 'rfc' | 'arxiv' | 'news';
  patentNumber?: string;
  googlePatentsUrl?: string;
  assignee?: string;
  inventors?: string[];
  filingDate?: string;
  grantDate?: string;
  blueprintArchitecture?: string;
  claimsSummary?: string[];
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

export type FlutterPlatform = 'android' | 'ios' | 'web' | 'desktop';

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
