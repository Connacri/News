import { CountryCode } from '../types';

const IP_COUNTRY_MAP: Record<string, CountryCode> = {
  FR: 'fr',
  DZ: 'dz',
  CN: 'cn',
  US: 'us',
  DE: 'de',
  GB: 'gb',
  JP: 'jp',
  CA: 'ca',
};

export async function detectCountryFromNetwork(): Promise<CountryCode> {
  try {
    const res = await fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } });
    if (!res.ok) return 'all';
    const data = await res.json();
    return IP_COUNTRY_MAP[String(data.country_code || '').toUpperCase()] || 'all';
  } catch {
    return 'all';
  }
}
