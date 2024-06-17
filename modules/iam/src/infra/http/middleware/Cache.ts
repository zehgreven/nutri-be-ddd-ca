import apicache from 'apicache';
import { StatusCodes } from 'http-status-codes';

export default class Cache {
  private static instance: Cache;

  private constructor() {}

  static getInstance() {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public middleware(duration?: string | number) {
    return apicache.middleware(duration || '1 minute', undefined, {
      respectCacheControl: true,
      statusCodes: {
        exclude: [StatusCodes.NOT_FOUND, StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN],
      },
    });
  }
}
