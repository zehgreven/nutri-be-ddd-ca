import { GrantAndRevokeProfilePermission } from '@src/application/usecase/profile/GrantAndRevokeProfilePermission';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

describe('GrantAndRevokeProfilePermission', () => {
  const profilePermissionRepository = {
    save: jest.fn(),
    getByProfileIdAndFunctionalityId: jest.fn(),
    deleteByProfileIdAndFunctionalityId: jest.fn(),
  } as unknown as ProfilePermissionRepository;

  const grantAndRevokePermission = new GrantAndRevokeProfilePermission(profilePermissionRepository);

  it('should throw PermissionNotFoundError when profile does not exist', async () => {
    await expect(grantAndRevokePermission.execute('profileId', 'functionalityId')).rejects.toThrow(
      PermissionNotFoundError,
    );
  });
});
