const NON_EVENT_PREFIXES = new Set([
  'login',
  'register',
  'verify-email',
  'matches',
  'groups',
  'statistics',
  'prizes',
  'rules',
  'admin',
  'standings',
  'my-prediction',
  'api',
  'assets',
  'static',
]);

export const getEventCodeFromPath = (path: string = window.location.pathname): string | null => {
  const normalized = (path || '/').split('?')[0].split('#')[0];
  const parts = normalized.split('/').filter(Boolean);
  if (!parts.length) return null;

  const first = parts[0].toLowerCase();
  if (NON_EVENT_PREFIXES.has(first)) {
    return null;
  }

  return first;
};

export const stripEventPrefix = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  const rest = parts.slice(1);
  return rest.length ? `/${rest.join('/')}` : '/';
};

export const withEventPrefix = (eventCode: string | null | undefined, path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!eventCode) return normalizedPath;
  if (normalizedPath === '/') return `/${eventCode}`;
  return `/${eventCode}${normalizedPath}`;
};

export const isPublicEventRoute = (pathWithoutPrefix: string): boolean => {
  return ['/login', '/register', '/verify-email'].includes(pathWithoutPrefix);
};
