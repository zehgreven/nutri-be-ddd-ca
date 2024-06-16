import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import Registry from '@src/infra/dependency-injection/Registry';

describe('Create Profile', () => {
  const profileRepository = {
    save: () => Promise.resolve(),
    update: () => Promise.resolve(),
    getById: () => Promise.resolve(undefined),
    deleteById: () => Promise.resolve(),
    existsById: () => Promise.resolve(true),
    listByAccountId: () => Promise.resolve([]),
  };
  Registry.getInstance().register('ProfileRepository', profileRepository);
  const createProfile = new CreateProfile();

  it('should throw error when name is empty', async () => {
    await expect(
      createProfile.execute({
        name: '',
        description: 'My profile description',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
