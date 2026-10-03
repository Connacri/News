import { CountryCode, CountryInfo } from '../types';

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'all',
    name: 'Global Feed',
    nativeName: 'Monde Entier',
    flag: '🌐',
    techHubs: ['Silicon Valley', 'Paris', 'Berlin', 'London', 'Tokyo']
  },
  {
    code: 'fr',
    name: 'France',
    nativeName: 'France',
    flag: '🇫🇷',
    techHubs: ['Station F (Paris)', 'Grenoble Silicon', 'Toulouse IoT', 'Lyon Tech']
  },
  {
    code: 'dz',
    name: 'Algérie',
    nativeName: 'الجزائر',
    flag: '🇩🇿',
    techHubs: ['Cyberparc Sidi Abdellah (Alger)', 'Pôle Tech Oran', 'USTHB Alger', 'Constantine Innovation']
  },
  {
    code: 'maghreb',
    name: 'Maghreb',
    nativeName: 'المغرب العربي',
    flag: '🌍',
    techHubs: ['Alger Sidi Abdellah', 'Casablanca Technopark', 'Tunis Elgazala', 'Rabat Technopolis']
  },
  {
    code: 'cn',
    name: 'Chine',
    nativeName: '中国',
    flag: '🇨🇳',
    techHubs: ['Shenzhen Hardware Valley', 'Zhongguancun (Beijing)', 'Hangzhou AI', 'Shanghai Silicon']
  },
  {
    code: 'us',
    name: 'United States',
    nativeName: 'United States',
    flag: '🇺🇸',
    techHubs: ['San Francisco', 'Austin', 'Seattle', 'New York', 'Boston']
  },
  {
    code: 'de',
    name: 'Germany',
    nativeName: 'Deutschland',
    flag: '🇩🇪',
    techHubs: ['Berlin Silicon Allee', 'Munich Hardware', 'Frankfurt Cloud']
  },
  {
    code: 'gb',
    name: 'United Kingdom',
    nativeName: 'United Kingdom',
    flag: '🇬🇧',
    techHubs: ['London Silicon Roundabout', 'Cambridge AI', 'Oxford BioTech']
  },
  {
    code: 'jp',
    name: 'Japan',
    nativeName: '日本',
    flag: '🇯🇵',
    techHubs: ['Tokyo Shibuya', 'Kyoto Tech', 'Tsukuba Science City']
  },
  {
    code: 'ca',
    name: 'Canada',
    nativeName: 'Canada',
    flag: '🇨🇦',
    techHubs: ['Toronto Vector AI', 'Montreal Mila', 'Vancouver Tech']
  }
];
