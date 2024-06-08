import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import Functionality from '@src/domain/entity/Functionality';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import sinon from 'sinon';

describe('PatchFunctionality', () => {
  const functionalityRepository = {
    save: sinon.stub(),
    update: sinon.stub(),
    getById: sinon.stub(),
    deleteById: sinon.stub(),
    existsById: sinon.stub(),
  };

  const patchFunctionality = new PatchFunctionality(functionalityRepository);

  const functionality = Functionality.create(
    'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
    'My functionality',
    'My functionality description',
    'My functionality path',
  );

  beforeEach(() => {
    functionalityRepository.save.resetBehavior();
    functionalityRepository.update.resetBehavior();
    functionalityRepository.getById.resetBehavior();
    functionalityRepository.deleteById.resetBehavior();
    functionalityRepository.existsById.resetBehavior();
  });

  it('should be able to patch functionality with null description', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = {
      description: null,
    };
    await patchFunctionality.execute(functionality.id, patchInput);
    const updatedFunctionality = await functionalityRepository.getById(functionality.id);
    expect(updatedFunctionality?.getDescription()).toBeUndefined();
  });

  it('should be able to patch functionality with null path', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = {
      path: null,
    };
    await patchFunctionality.execute(functionality.id, patchInput);
    const updatedFunctionality = await functionalityRepository.getById(functionality.id);
    expect(updatedFunctionality?.getPath()).toBeUndefined();
  });

  it('should not be able to patch functionality with invalid id', async () => {
    const patchInput = {
      name: 'My new functionality',
      description: 'My new functionality description',
    };
    const invalidId = '1826d74d-26c9-417d-ae91-0ecd8eb7a6ff';
    await expect(() => patchFunctionality.execute(invalidId, patchInput)).rejects.toThrow(FunctionalityNotFoundError);
  });

  it('should not be able to patch functionality with null functionality type', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = {
      functionalityTypeId: null,
    };
    await expect(() => patchFunctionality.execute(functionality.id, patchInput)).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch functionality with invalid input', async () => {
    functionalityRepository.getById.resolves(functionality);
    await expect(() => patchFunctionality.execute(functionality.id, {})).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch functionality with invalid name', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = {
      name: '',
    };
    await expect(() => patchFunctionality.execute(functionality.id, patchInput)).rejects.toThrow(TextLengthError);
  });

  it('should not be able to patch functionality with null name', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = { name: null };
    await expect(() => patchFunctionality.execute(functionality.id, patchInput)).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch functionality with null active', async () => {
    functionalityRepository.getById.resolves(functionality);
    const patchInput = { active: null };
    await expect(() => patchFunctionality.execute(functionality.id, patchInput)).rejects.toThrow(InvalidInputError);
  });
});
