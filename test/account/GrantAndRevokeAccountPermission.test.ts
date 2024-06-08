import { GrantAndRevokeAccountPermission } from '@src/application/usecase/account/GrantAndRevokeAccountPermission';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import { AccountPermissionRepository } from '@src/infra/repository/AccountPermissionRepository';

describe('GrantAndRevokeAccountPermission', () => {
  const accountPermissionRepository = {
    save: jest.fn(),
    getByAccountIdAndFunctionalityId: jest.fn(),
    deleteByAccountIdAndFunctionalityId: jest.fn(),
  } as unknown as AccountPermissionRepository;

  const grantAndRevokePermission = new GrantAndRevokeAccountPermission(accountPermissionRepository);

  it('should throw PermissionNotFoundError when account does not exist', async () => {
    await expect(grantAndRevokePermission.execute('accountId', 'functionalityId')).rejects.toThrow(
      PermissionNotFoundError,
    );
  });
});
