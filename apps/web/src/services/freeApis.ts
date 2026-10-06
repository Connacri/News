import { FreeApiResource } from '../types';

export const FREE_APIS_DIRECTORY: FreeApiResource[] = [
  {
    id: 'api-hackernews',
    name: 'Hacker News Algolia Search & Items API',
    description: 'API publique sans clé ni inscription pour rechercher en temps réel les actualités tech, discussions, métriques de votes et commentaires.',
    category: 'news',
    url: 'https://hn.algolia.com/api',
    endpoint: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=25',
    requiresKey: false,
    rateLimit: '10 000 requêtes / heure gratuites',
    documentationUrl: 'https://hn.algolia.com/api',
    sampleCurl: `curl -s "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=flutter" | jq .hits[0]`
  },
  {
    id: 'api-devto',
    name: 'Dev.to Community Articles & Tags REST API',
    description: 'Accès libre et sans authentification aux articles de développement, tutoriels, et analyses d\'architecture logicielle rédigés par la communauté.',
    category: 'news',
    url: 'https://developers.forem.com/api/v1',
    endpoint: 'https://dev.to/api/articles?per_page=20&top=1',
    requiresKey: false,
    rateLimit: 'Illimité (usage équitable public)',
    documentationUrl: 'https://developers.forem.com/api/v1',
    sampleCurl: `curl -s "https://dev.to/api/articles?tag=flutter&per_page=5" | jq '.[0] | {title, url}'`
  },
  {
    id: 'api-github-rest',
    name: 'GitHub Public REST Search & Releases API',
    description: 'Recherche publique de dépôts open-source, releases de binaires APK/AAB, étoiles, forks et commits récents sans token d\'accès.',
    category: 'code',
    url: 'https://docs.github.com/en/rest',
    endpoint: 'https://api.github.com/search/repositories?q=stars:>1000+topic:security&sort=updated',
    requiresKey: false,
    rateLimit: '60 requêtes / heure sans token (5 000 avec token gratuit)',
    documentationUrl: 'https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories',
    sampleCurl: `curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/search/repositories?q=language:dart+stars:>500" | jq .items[0].full_name`
  },
  {
    id: 'api-cisa-kev',
    name: 'CISA Known Exploited Vulnerabilities (KEV) Catalog',
    description: 'Flux officiel en direct du gouvernement américain (CISA) listant les vulnérabilités CVE activement exploitées dans le monde avec correctifs requis.',
    category: 'osint',
    url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    endpoint: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    requiresKey: false,
    rateLimit: 'Illimité (Open Data fédéral américain)',
    documentationUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    sampleCurl: `curl -s "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json" | jq '.vulnerabilities[0:3]'`
  },
  {
    id: 'api-reddit-json',
    name: 'Reddit Public JSON Endpoints (r/technology, r/netsec, r/osint)',
    description: 'Flux JSON public natif de Reddit sans besoin de compte développeur ni token OAuth en ajoutant simplement .json à n\'importe quelle URL de subreddit.',
    category: 'osint',
    url: 'https://www.reddit.com/r/technology.json',
    endpoint: 'https://www.reddit.com/r/netsec/hot.json?limit=15',
    requiresKey: false,
    rateLimit: '60 requêtes / minute (User-Agent personnalisé requis)',
    documentationUrl: 'https://www.reddit.com/dev/api/',
    sampleCurl: `curl -s -A "DZ NewsApp/1.0" "https://www.reddit.com/r/netsec/hot.json?limit=3" | jq '.data.children[].data.title'`
  },
  {
    id: 'api-arxiv',
    name: 'ArXiv Open Access AI & Computer Science API',
    description: 'Accès sans frais aux prépublications de recherche scientifique mondiales en intelligence artificielle, cryptographie et informatique distribuée.',
    category: 'science',
    url: 'https://arxiv.org/help/api',
    endpoint: 'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=lastUpdatedDate&max_results=5',
    requiresKey: false,
    rateLimit: '1 requête toutes les 3 secondes',
    documentationUrl: 'https://arxiv.org/help/api/user-manual',
    sampleCurl: `curl -s "https://export.arxiv.org/api/query?search_query=cat:cs.CR&max_results=2"`
  },
  {
    id: 'api-restcountries',
    name: 'REST Countries API v3.1',
    description: 'Données ouvertes sur tous les pays (drapeaux, indicatifs téléphoniques, devises, frontières, capitales) pour la localisation des news.',
    category: 'news',
    url: 'https://restcountries.com/',
    endpoint: 'https://restcountries.com/v3.1/name/algeria',
    requiresKey: false,
    rateLimit: 'Illimité (Open Data)',
    documentationUrl: 'https://restcountries.com/',
    sampleCurl: `curl -s "https://restcountries.com/v3.1/alpha/dz" | jq .[0].name.official`
  }
];
