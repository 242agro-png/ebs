import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type AnalyticsEventType =
  | 'quote_whatsapp_click'
  | 'whatsapp_direct_click'
  | 'facebook_click'
  | 'simulator_interact'
  | 'tracking_lookup'
  | 'maps_click';

export interface GeoInfo {
  country: string;
  countryCode: string;
  city: string;
}

const VISITOR_STORAGE_KEY = 'ebs_visitor_id_v1';
const SESSION_STORAGE_KEY = 'ebs_session_id_v1';
const GEO_SESSION_KEY = 'ebs_geo_cache_v1';
const TRACKED_VIEW_KEY = 'ebs_tracked_view_v1';
const TRACKED_SIM_KEY = 'ebs_tracked_sim_v1';

function sanitizeId(raw: string, maxLen = 64): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return (cleaned || 'anon').slice(0, maxLen);
}

function clampString(raw: string | undefined | null, fallback: string, maxLen: number): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function generateRandomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return sanitizeId(`${prefix}_${crypto.randomUUID()}`, 64);
  }
  return sanitizeId(`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, 64);
}

export function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return sanitizeId(existing, 64);
    const created = generateRandomId('v');
    window.localStorage.setItem(VISITOR_STORAGE_KEY, created);
    return created;
  } catch {
    return generateRandomId('v');
  }
}

export function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return sanitizeId(existing, 64);
    const created = generateRandomId('s');
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return generateRandomId('s');
  }
}

export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua) || window.innerWidth < 768) {
    return 'mobile';
  }
  return 'desktop';
}

export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Autre';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Autre';
}

export function detectOS(): string {
  if (typeof navigator === 'undefined') return 'Autre';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Autre';
}

export function detectReferrerDomain(): string {
  try {
    if (!document.referrer) return 'direct';
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return 'direct';
    return clampString(url.hostname.replace(/^www\./, ''), 'direct', 120);
  } catch {
    return 'direct';
  }
}

export function detectUtmSource(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    return clampString(params.get('utm_source'), 'none', 64);
  } catch {
    return 'none';
  }
}

function inferGeoFromTimezone(): GeoInfo {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const map: Record<string, GeoInfo> = {
      'Europe/Paris': { country: 'France', countryCode: 'FR', city: 'Île-de-France / France' },
      'Africa/Brazzaville': { country: 'Congo-Brazzaville', countryCode: 'CG', city: 'Brazzaville / Pointe-Noire' },
      'Africa/Kinshasa': { country: 'RD Congo', countryCode: 'CD', city: 'Kinshasa' },
      'Africa/Lubumbashi': { country: 'RD Congo', countryCode: 'CD', city: 'Lubumbashi' },
      'Europe/Brussels': { country: 'Belgique', countryCode: 'BE', city: 'Bruxelles' },
      'Europe/Berlin': { country: 'Allemagne', countryCode: 'DE', city: 'Berlin' },
      'Europe/Zurich': { country: 'Suisse', countryCode: 'CH', city: 'Zurich / Genève' },
      'Europe/Amsterdam': { country: 'Pays-Bas', countryCode: 'NL', city: 'Amsterdam' },
      'Europe/London': { country: 'Royaume-Uni', countryCode: 'GB', city: 'Londres' },
      'Europe/Madrid': { country: 'Espagne', countryCode: 'ES', city: 'Madrid' },
      'Europe/Rome': { country: 'Italie', countryCode: 'IT', city: 'Rome' },
      'America/Toronto': { country: 'Canada', countryCode: 'CA', city: 'Toronto' },
      'America/Montreal': { country: 'Canada', countryCode: 'CA', city: 'Montréal' },
      'America/New_York': { country: 'États-Unis', countryCode: 'US', city: 'New York' },
      'America/Los_Angeles': { country: 'États-Unis', countryCode: 'US', city: 'Los Angeles' },
    };
    if (map[tz]) return map[tz];
    if (tz.startsWith('Europe/')) return { country: 'Europe', countryCode: 'EU', city: 'Inconnue' };
    if (tz.startsWith('Africa/')) return { country: 'Afrique', countryCode: 'AF', city: 'Inconnue' };
  } catch {
    // Ignore Intl errors
  }
  return { country: 'International', countryCode: 'XX', city: 'Inconnue' };
}

function normalizeCountryCode(code: string | undefined | null): string {
  const cleaned = (code || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length >= 2 && cleaned.length <= 8) return cleaned;
  return 'XX';
}

export async function detectGeoLocation(): Promise<GeoInfo> {
  try {
    const cached = window.sessionStorage.getItem(GEO_SESSION_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as GeoInfo;
      if (parsed?.country && parsed?.countryCode) return parsed;
    }
  } catch {
    // Ignore cache parse issues
  }

  const fetchWithTimeout = async (url: string, ms = 2500): Promise<Response> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  };

  let geo: GeoInfo | null = null;

  try {
    const res = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const data = (await res.json()) as {
        country?: string;
        country_code?: string;
        city?: string;
      };
      if (data.country) {
        geo = {
          country: clampString(data.country, 'International', 80),
          countryCode: normalizeCountryCode(data.country_code),
          city: clampString(data.city, 'Inconnue', 80),
        };
      }
    }
  } catch {
    // Fallback below
  }

  if (!geo) {
    try {
      const res = await fetchWithTimeout('https://ipwho.is/');
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          country?: string;
          country_code?: string;
          city?: string;
        };
        if (data.success !== false && data.country) {
          geo = {
            country: clampString(data.country, 'International', 80),
            countryCode: normalizeCountryCode(data.country_code),
            city: clampString(data.city, 'Inconnue', 80),
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  const finalGeo = geo ?? inferGeoFromTimezone();
  try {
    window.sessionStorage.setItem(GEO_SESSION_KEY, JSON.stringify(finalGeo));
  } catch {
    // Ignore storage errors
  }
  return finalGeo;
}

export async function trackPageView(path = '/'): Promise<void> {
  const safePath = clampString(path, '/', 120);
  try {
    const alreadyTracked = window.sessionStorage.getItem(TRACKED_VIEW_KEY);
    if (alreadyTracked === safePath) {
      return;
    }
    window.sessionStorage.setItem(TRACKED_VIEW_KEY, safePath);
  } catch {
    // Continue even if sessionStorage is unavailable
  }

  const geo = await detectGeoLocation();
  const timezone = clampString(
    (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return 'UTC';
      }
    })(),
    'UTC',
    64
  );
  const language = clampString(
    typeof navigator !== 'undefined' ? navigator.language : 'fr-FR',
    'fr-FR',
    20
  );
  const rawWidth = typeof window !== 'undefined' ? Math.round(window.innerWidth) : 1280;
  const screenWidth = Math.min(10000, Math.max(100, rawWidth));

  const newDocRef = doc(collection(db, 'page_views'));
  try {
    await setDoc(newDocRef, {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path: safePath,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      deviceType: detectDeviceType(),
      browser: detectBrowser(),
      os: detectOS(),
      referrerDomain: detectReferrerDomain(),
      utmSource: detectUtmSource(),
      language,
      timezone,
      screenWidth,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, `page_views/${newDocRef.id}`);
    } catch {
      // Telemetry errors are logged cleanly without interrupting public visitors
    }
  }
}

export interface TrackEventOptions {
  mode?: 'maritime' | 'air' | 'none';
  destination?: 'Pointe-Noire' | 'Brazzaville' | 'none';
  parcelCount?: number;
  estimatedAmountEur?: number;
  label?: string;
}

export async function trackEvent(
  eventType: AnalyticsEventType,
  options: TrackEventOptions = {}
): Promise<void> {
  if (eventType === 'simulator_interact') {
    const simKey = `${options.mode || 'none'}_${options.destination || 'none'}`;
    try {
      const prev = window.sessionStorage.getItem(TRACKED_SIM_KEY);
      if (prev === simKey) return;
      window.sessionStorage.setItem(TRACKED_SIM_KEY, simKey);
    } catch {
      // Ignore storage failures
    }
  }

  const geo = await detectGeoLocation();
  const newDocRef = doc(collection(db, 'analytics_events'));

  const parcelCount = Math.min(500, Math.max(0, Math.round(options.parcelCount ?? 0)));
  const estimatedAmountEur = Math.min(
    1000000,
    Math.max(0, Number((options.estimatedAmountEur ?? 0).toFixed(2)))
  );

  try {
    await setDoc(newDocRef, {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      eventType,
      mode: options.mode ?? 'none',
      destination: options.destination ?? 'none',
      parcelCount,
      estimatedAmountEur,
      country: geo.country,
      countryCode: geo.countryCode,
      deviceType: detectDeviceType(),
      label: clampString(options.label, '', 120),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, `analytics_events/${newDocRef.id}`);
    } catch {
      // Telemetry errors are logged cleanly without interrupting public visitors
    }
  }
}
