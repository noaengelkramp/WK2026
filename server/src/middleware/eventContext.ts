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
      };
    }
  }
}

const getHostWithoutPort = (hostHeader?: string): string => {
  if (!hostHeader) return '';
  return hostHeader.split(':')[0].toLowerCase();
};

const getSubdomain = (host: string): string | null => {
  if (!host) return null;

  if (host === 'localhost' || host.endsWith('.localhost')) {
    const parts = host.split('.');
    return parts.length > 1 ? parts[0] : 'internal';
  }

  const parts = host.split('.');
  if (parts.length < 3) {
    return host === 'poules.kramp.com' ? null : 'internal';
  }

  return parts[0];
};

/**
 * Resolve active event from subdomain and attach it to req.event
 */
export const resolveEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const host = getHostWithoutPort(req.headers.host);
    const subdomain = getSubdomain(host);

    // Root domain splash (no event context)
    if (!subdomain) {
      next();
      return;
    }

    const event = await Event.findOne({ where: { subdomain, isActive: true } });

    if (!event) {
      res.status(404).json({
        error: 'Event not found for subdomain',
        subdomain,
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
    };

    next();
  } catch (error) {
    next(error);
  }
};
