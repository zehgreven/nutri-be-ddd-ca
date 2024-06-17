import AccountPermission from '@src/domain/entity/AccountPermission';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';

export class AssignAccountPermission {
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;
  @inject('FunctionalityRepository')
  private functionalityRepository!: FunctionalityRepository;
  @inject('AccountPermissionRepository')
  private accountPermissionRepository!: AccountPermissionRepository;

  async execute(accountId: string, functionalityId: string): Promise<void> {
    logger.info(`AssignAccountPermission: assigning functionalityId=${functionalityId} to accountId=${accountId}`);
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
