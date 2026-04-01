export const getEventCodeFromPath = (path: string = window.location.pathname): string | null => {
  const normalized = (path || '/').split('?')[0].split('#')[0];
  const parts = normalized.split('/').filter(Boolean);
  return parts.length > 0 ? parts[0].toLowerCase() : null;
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
