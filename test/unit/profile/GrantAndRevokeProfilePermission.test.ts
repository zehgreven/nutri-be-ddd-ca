import { GrantAndRevokeProfilePermission } from '@src/application/usecase/profile/GrantAndRevokeProfilePermission';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import Registry from '@src/infra/dependency-injection/Registry';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';
import sinon from 'sinon';

describe('GrantAndRevokeProfilePermission', () => {
  const profilePermissionRepository: ProfilePermissionRepository = {
    save: () => Promise.resolve(),
    getByProfileIdAndFunctionalityId: () => Promise.resolve(undefined),
    deleteByProfileIdAndFunctionalityId: () => Promise.resolve(),
    updateAllowById: () => Promise.resolve(),
  };
  Registry.getInstance().register('ProfilePermissionRepository', profilePermissionRepository);

  const grantAndRevokePermission = new GrantAndRevokeProfilePermission();

  it('should throw PermissionNotFoundError when profile does not exist', async () => {
    sinon.stub(profilePermissionRepository, 'getByProfileIdAndFunctionalityId').resolves(undefined);

    await expect(grantAndRevokePermission.execute('profileId', 'functionalityId')).rejects.toThrow(
      PermissionNotFoundError,
    );
  });
});
