import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { ProfileRepositoryMemoryDatabase } from '@src/infra/repository/ProfileRepository';

describe('PatchProfile', () => {
  const profileRepository = new ProfileRepositoryMemoryDatabase();
  const createProfile = new CreateProfile(profileRepository);
  const patchProfile = new PatchProfile(profileRepository);

  beforeEach(async () => {
    await profileRepository.clear();
  });

  it('should be able to patch profile', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    const patchInput = {
      name: 'My new profile',
      description: '',
      active: false,
    };
    await patchProfile.execute(createdProfile.id, patchInput);
    const updatedProfile = await profileRepository.getById(createdProfile.id);
    expect(updatedProfile?.getName()).toBe(patchInput.name);
    expect(updatedProfile?.getDescription()).toBe(patchInput.description);
    expect(updatedProfile?.isActive()).toBe(patchInput.active);
  });

  it('should be able to patch profile with null description', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    const patchInput = {
      description: null,
    };
    await patchProfile.execute(createdProfile.id, patchInput);
    const updatedProfile = await profileRepository.getById(createdProfile.id);
    expect(updatedProfile?.getDescription()).toBeUndefined();
  });

  it('should not be able to patch profile with invalid id', async () => {
    const patchInput = {
      name: 'My new profile',
      description: 'My new profile description',
    };
    const invalidId = '1826d74d-26c9-417d-ae91-0ecd8eb7a6ff';
    await expect(() => patchProfile.execute(invalidId, patchInput)).rejects.toThrow(ProfileNotFoundError);
  });

  it('should not be able to patch profile with invalid input', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    await expect(() => patchProfile.execute(createdProfile.id, {})).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch profile with invalid name', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    const patchInput = {
      name: '',
      description: 'My new profile description',
    };
    await expect(() => patchProfile.execute(createdProfile.id, patchInput)).rejects.toThrow(TextLengthError);
  });

  it('should not be able to patch profile with null name', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    const patchInput = { name: null };
    await expect(() => patchProfile.execute(createdProfile.id, patchInput)).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch profile with null active', async () => {
    const profile = {
      name: 'My profile',
      description: 'My profile description',
    };
    const createdProfile = await createProfile.execute(profile);
    const patchInput = { active: null };
    await expect(() => patchProfile.execute(createdProfile.id, patchInput)).rejects.toThrow(InvalidInputError);
  });
});
