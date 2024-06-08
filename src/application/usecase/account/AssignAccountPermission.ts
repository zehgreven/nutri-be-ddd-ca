import AccountPermission from '@src/domain/entity/AccountPermission';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';

export class AssignAccountPermission {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly functionalityRepository: FunctionalityRepository,
    readonly accountPermissionRepository: AccountPermissionRepository,
  ) {}

  async execute(accountId: string, functionalityId: string): Promise<void> {
    const account = await this.accountRepository.existsById(accountId);
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${accountId}`);
    }

    const functionality = await this.functionalityRepository.existsById(functionalityId);
    if (!functionality) {
      throw new FunctionalityNotFoundError(`Unable to find functionality with id=${functionalityId}`);
    }

    const permission = AccountPermission.create(accountId, functionalityId);
    await this.accountPermissionRepository.save(permission);
  }
}
