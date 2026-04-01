import { Request, Response, NextFunction } from 'express';
import { Event } from '../models';

declare global {
  namespace Express {
    interface Request {
      event?: {
        id: string;
        code: string;
        name: string;
        subdomain: string;
      defaultLocale: string;
      allowedLocales: string[];
      customerPrefix: string;
      legalPrivacyUrl?: string;
      legalTermsUrl?: string;
      legalCookieUrl?: string;
    };
  }
}
}

const getHostWithoutPort = (hostHeader?: string): string => {
  if (!hostHeader) return '';
  return hostHeader.split(':')[0].toLowerCase();
};

const getRootSelectorHosts = (): Set<string> => {
  const defaults = ['poules.kramp.com', 'www.poules.kramp.com'];
  const fromEnv = (process.env.ROOT_SELECTOR_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...defaults, ...fromEnv]);
};

const getSubdomain = (host: string): string | null => {
  if (!host) return null;

  const rootSelectorHosts = getRootSelectorHosts();
  if (rootSelectorHosts.has(host)) {
    return null;
  }

  if (host === 'localhost' || host.endsWith('.localhost')) {
    const parts = host.split('.');
    return parts.length > 1 ? parts[0] : 'internal';
  }

  const parts = host.split('.');
  if (parts.length < 3) {
    return 'internal';
  }

  return parts[0];
};

const getEventCodeFromPath = (path: string): string | null => {
  const parts = (path || '/').split('/').filter(Boolean);
  return parts.length ? parts[0].toLowerCase() : null;
};

/**
 * Resolve active event from subdomain and attach it to req.event
 */
export const resolveEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventCodeHeader = (req.headers['x-event-code'] as string | undefined)?.toLowerCase();
    const pathEventCode = getEventCodeFromPath(req.path);
    const host = getHostWithoutPort(req.headers.host);
    const subdomain = getSubdomain(host);
    const requestedEventCode = eventCodeHeader || pathEventCode || subdomain;

    // Root domain splash (no event context)
    if (!requestedEventCode) {
      next();
      return;
    }

    const event = await Event.findOne({
      where: {
        isActive: true,
        ...(requestedEventCode === subdomain
          ? { subdomain: requestedEventCode }
          : { code: requestedEventCode }),
      },
    });

    if (!event) {
      res.status(404).json({
        error: 'Event not found for requested context',
        requestedEventCode,
      });
      return;
    }

    req.event = {
      id: event.id,
      code: event.code,
      name: event.name,
      subdomain: event.subdomain,
      defaultLocale: event.defaultLocale,
      allowedLocales: event.allowedLocales,
      customerPrefix: (event as any).customerPrefix,
      legalPrivacyUrl: (event as any).legalPrivacyUrl || undefined,
      legalTermsUrl: (event as any).legalTermsUrl || undefined,
      legalCookieUrl: (event as any).legalCookieUrl || undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
};
