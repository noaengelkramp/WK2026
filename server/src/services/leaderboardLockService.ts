import { Event } from '../models';

export const isLeaderboardLocked = async (eventId: string): Promise<boolean> => {
  const event = await Event.findByPk(eventId, { attributes: ['id', 'leaderboardLockedAt'] });
  return !!(event as any)?.leaderboardLockedAt;
};
