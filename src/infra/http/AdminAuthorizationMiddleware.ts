//Implement API security based on Account Profile (admin routes)

import { ForbiddenError } from '@src/domain/error/ForbiddenError';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';
import config from 'config';
import { Request, Response } from 'express';

export class AdminAuthorizationMiddleware {
  constructor(readonly profileRepository: ProfileRepository) {}

  async execute(request: Request & { accountId?: string }, _: Response): Promise<void> {
    const accountId = request.accountId;
    if (!accountId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const profiles = await this.profileRepository.listByAccountId(accountId);
    if (profiles.length === 0) {
      throw new UnauthorizedError('Unauthorized');
    }

    const adminProfileId = config.get<string>('default.adminProfileId');
    const userHasAdminProfile = profiles.some(p => p.id === adminProfileId);
    if (!userHasAdminProfile) {
      throw new ForbiddenError('You do not have access rights to this content');
    }
  }
}
