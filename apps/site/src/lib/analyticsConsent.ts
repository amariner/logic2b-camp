export const CONSENT_VERSION = '1.0.0';
export const CONSENT_KEY = 'l2b-consent';

export interface AnalyticsConsent {
  essential: true;
  analytics: boolean;
  timestamp: string;
  version: string;
}

function readConsent(): AnalyticsConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AnalyticsConsent>;
    if (
      value.version !== CONSENT_VERSION ||
      value.essential !== true ||
      typeof value.analytics !== 'boolean' ||
      typeof value.timestamp !== 'string'
    ) {
      return null;
    }
    return value as AnalyticsConsent;
  } catch {
    return null;
  }
}

export function getConsent(): AnalyticsConsent | null {
  return readConsent();
}

export function setConsent(analytics: boolean): AnalyticsConsent {
  const consent: AnalyticsConsent = {
    essential: true,
    analytics,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // El consentimiento sigue siendo válido para esta navegación aunque el
    // navegador no permita persistirlo.
  }
  if (analytics) window.l2bLoadGTM?.();
  window.dispatchEvent(new CustomEvent('l2b:consent-updated', { detail: consent }));
  return consent;
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // La interfaz se reabre igualmente para que la persona pueda decidir.
  }
  clearAnalyticsCookies();
  window.dispatchEvent(new CustomEvent('l2b:consent-cleared'));
}

export function initializeConsent(): void {
  const consent = readConsent();
  if (consent?.analytics) window.l2bLoadGTM?.();
}

export function trackAnalyticsEvent(
  event: 'camp_open_lead_form' | 'camp_view_demo' | 'camp_open_manager' | 'camp_submit_lead',
  attributes: Record<string, string | boolean> = {},
): void {
  if (!readConsent()?.analytics) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...attributes });
}

function clearAnalyticsCookies(): void {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=', 1)[0]?.trim())
    .filter((name): name is string => Boolean(name))
    .filter((name) => name === '_gid' || name === '_gat' || name.startsWith('_ga'));
  const domains = ['', location.hostname, '.logic2b.com'];
  for (const name of names) {
    for (const domain of domains) {
      const suffix = domain ? `;domain=${domain}` : '';
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${suffix};SameSite=Lax`;
    }
  }
}

declare global {
  interface Window {
    l2bLoadGTM?: () => void;
    l2bGtmLoaded?: boolean;
    l2bTrackEvent?: typeof trackAnalyticsEvent;
    dataLayer?: Record<string, unknown>[];
  }
}
