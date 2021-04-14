import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  timeToLive: parseInt(process.env.CACHE_TIME_TO_LIVE, 10) || 1800, // in seconds
  maxResponsesStored:
    parseInt(process.env.CACHE_MAX_RESPONSES_STORED, 10) || 100, // unities
}));
