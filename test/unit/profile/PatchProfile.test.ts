import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import Profile from '@src/domain/entity/Profile';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import sinon from 'sinon';

describe('PatchProfile', () => {
  const profileRepository = {
    save: sinon.stub(),
    update: sinon.stub(),
    getById: sinon.stub(),
    deleteById: sinon.stub(),
    existsById: sinon.stub(),
    listByAccountId: sinon.stub(),
  };
  const patchProfile = new PatchProfile(profileRepository);
  const profile = Profile.create('My profile', 'My profile description');

  beforeEach(async () => {
    profileRepository.save.resetBehavior();
    profileRepository.update.resetBehavior();
    profileRepository.getById.resetBehavior();
    profileRepository.deleteById.resetBehavior();
    profileRepository.existsById.resetBehavior();
  });

  it('should be able to patch profile with null description', async () => {
    profileRepository.getById.resolves(profile);
    const patchInput = {
      description: null,
    };
    await patchProfile.execute(profile.id, patchInput);
    const updatedProfile = await profileRepository.getById(profile.id);
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
    profileRepository.getById.resolves(profile);
    await expect(() => patchProfile.execute(profile.id, {})).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch profile with invalid name', async () => {
    profileRepository.getById.resolves(profile);
    const patchInput = {
      name: '',
      description: 'My new profile description',
    };
    await expect(() => patchProfile.execute(profile.id, patchInput)).rejects.toThrow(TextLengthError);
  });

  it('should not be able to patch profile with null name', async () => {
    profileRepository.getById.resolves(profile);
    const patchInput = { name: null };
    await expect(() => patchProfile.execute(profile.id, patchInput)).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch profile with null active', async () => {
    profileRepository.getById.resolves(profile);
    const patchInput = { active: null };
    await expect(() => patchProfile.execute(profile.id, patchInput)).rejects.toThrow(InvalidInputError);
  });
});
