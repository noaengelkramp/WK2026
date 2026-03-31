import { Router, Request, Response } from 'express';
import { Event } from '../models';

const router = Router();

/**
 * GET /api/event/current
 * Returns current event context resolved from subdomain.
 * - On event subdomain: { mode: 'event', event: {...} }
 * - On root domain: { mode: 'selector', availableEvents: [...] }
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    if (req.event) {
      res.json({
        mode: 'event',
        event: req.event,
      });
      return;
    }

    const availableEvents = await Event.findAll({
      where: { isActive: true },
      attributes: ['id', 'code', 'name', 'subdomain', 'defaultLocale', 'allowedLocales'],
      order: [['name', 'ASC']],
    });

    res.json({
      mode: 'selector',
      availableEvents,
    });
  } catch (error: any) {
    res.status(500).json({
      mode: 'error',
      message: error?.message || 'Failed to resolve event context',
    });
  }
});

export default router;
