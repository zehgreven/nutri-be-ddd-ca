import { GrantAndRevokeAccountPermission } from '@src/application/usecase/account/GrantAndRevokeAccountPermission';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import Registry from '@src/infra/dependency-injection/Registry';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';
import sinon from 'sinon';

describe('GrantAndRevokeAccountPermission', () => {
  const accountPermissionRepository: AccountPermissionRepository = {
    save: () => Promise.resolve(),
    deleteByAccountIdAndFunctionalityId: () => Promise.resolve(),
    getByAccountIdAndFunctionalityId: () => Promise.resolve(undefined),
    updateAllowById: () => Promise.resolve(),
  };
  Registry.getInstance().register('AccountPermissionRepository', accountPermissionRepository);

  const grantAndRevokePermission = new GrantAndRevokeAccountPermission();

  afterEach(() => {
    sinon.restore();
  });

  it('should throw PermissionNotFoundError when account does not exist', async () => {
    sinon.stub(accountPermissionRepository, 'getByAccountIdAndFunctionalityId').resolves(undefined);
    await expect(grantAndRevokePermission.execute('accountId', 'functionalityId')).rejects.toThrow(
      PermissionNotFoundError,
    );
  });
});
