import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import logger from '@src/infra/logging/logger';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';

export class GrantAndRevokeAccountPermission {
  constructor(readonly accountPermissionRepository: AccountPermissionRepository) {}

  async execute(accountId: string, functionalityId: string): Promise<void> {
    logger.info(
      `GrantAndRevokeAccountPermission: granting or revoking permission for accountId=${accountId} and functionalityId=${functionalityId}`,
    );
    const permission = await this.accountPermissionRepository.getByAccountIdAndFunctionalityId(
      accountId,
      functionalityId,
    );
    if (!permission) {
      throw new PermissionNotFoundError(
        `Unable to find permissoin with accountId=${accountId} and functionalityId=${functionalityId}`,
      );
    }

    await this.accountPermissionRepository.updateAllowById(permission.id, !permission.allow);
  }
}
