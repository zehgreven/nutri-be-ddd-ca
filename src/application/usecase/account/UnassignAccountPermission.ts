import logger from '@src/infra/logging/logger';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';

export class UnassignAccountPermission {
  constructor(readonly accountPermissionRepository: AccountPermissionRepository) {}

  async execute(accountId: string, functionalityId: string): Promise<void> {
    logger.info(
      `UnassignAccountPermission: unassigning functionalityId=${functionalityId} from accountId=${accountId}`,
    );
    await this.accountPermissionRepository.deleteByAccountIdAndFunctionalityId(accountId, functionalityId);
  }
}
