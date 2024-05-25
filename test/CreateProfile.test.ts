import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { ProfileRepositoryMemoryDatabase } from '@src/infra/repository/ProfileRepository';

describe('Create Profile', () => {
  const profileRepository = new ProfileRepositoryMemoryDatabase();
  const createProfile = new CreateProfile(profileRepository);

  it('should create a new profile', async () => {
    const output = await createProfile.execute({
      name: 'My profile',
      description: 'My profile description',
    });
    expect(output.id).toBeDefined();

    const profile = await profileRepository.getById(output.id);
    expect(profile).toBeDefined();
    expect(profile?.getName()).toBe('My profile');
    expect(profile?.getDescription()).toBe('My profile description');
    expect(profile?.isActive()).toBe(true);
  });

  it('should throw error when name is empty', async () => {
    await expect(
      createProfile.execute({
        name: '',
        description: 'My profile description',
      }),
    ).rejects.toThrow(TextLengthError);
  });

  it('should throw error when description is empty', async () => {
    await expect(
      createProfile.execute({
        name: 'My profile',
        description: '',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
