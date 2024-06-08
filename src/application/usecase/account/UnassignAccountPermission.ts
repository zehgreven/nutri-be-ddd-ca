import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';

export class UnassignAccountPermission {
  constructor(readonly accountPermissionRepository: AccountPermissionRepository) {}

  async execute(accountId: string, functionalityId: string): Promise<void> {
    await this.accountPermissionRepository.deleteByAccountIdAndFunctionalityId(accountId, functionalityId);
  }
}
