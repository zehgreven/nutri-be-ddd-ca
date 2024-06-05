import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { FunctionalityRepositoryMemoryDatabase } from '@src/infra/repository/FunctionalityRepository';

describe('PatchFunctionality', () => {
  const functionalityRepository = new FunctionalityRepositoryMemoryDatabase();
  const createFunctionality = new CreateFunctionality(functionalityRepository);
  const patchFunctionality = new PatchFunctionality(functionalityRepository);

  beforeEach(async () => {
    await functionalityRepository.clear();
  });

  it('should be able to patch functionality', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
      path: 'My functionality path',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = {
      name: 'new functionality name',
      description: 'new description',
      path: 'new path',
      active: false,
    };
    await patchFunctionality.execute(createdFunctionality.id, patchInput);
    const updatedFunctionality = await functionalityRepository.getById(createdFunctionality.id);
    expect(updatedFunctionality?.getName()).toBe(patchInput.name);
    expect(updatedFunctionality?.getDescription()).toBe(patchInput.description);
    expect(updatedFunctionality?.isActive()).toBe(patchInput.active);
  });

  it('should be able to patch functionality with null description', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = {
      description: null,
    };
    await patchFunctionality.execute(createdFunctionality.id, patchInput);
    const updatedFunctionality = await functionalityRepository.getById(createdFunctionality.id);
    expect(updatedFunctionality?.getDescription()).toBeUndefined();
  });

  it('should be able to patch functionality with null path', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      path: 'My functionality path',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = {
      path: null,
    };
    await patchFunctionality.execute(createdFunctionality.id, patchInput);
    const updatedFunctionality = await functionalityRepository.getById(createdFunctionality.id);
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
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      path: 'My functionality path',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = {
      functionalityTypeId: null,
    };
    await expect(() => patchFunctionality.execute(createdFunctionality.id, patchInput)).rejects.toThrow(InvalidInputError);
  });



  it('should not be able to patch functionality with invalid input', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    await expect(() => patchFunctionality.execute(createdFunctionality.id, {})).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch functionality with invalid name', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = {
      name: '',
    };
    await expect(() => patchFunctionality.execute(createdFunctionality.id, patchInput)).rejects.toThrow(
      TextLengthError,
    );
  });

  it('should not be able to patch functionality with null name', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = { name: null };
    await expect(() => patchFunctionality.execute(createdFunctionality.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('should not be able to patch functionality with null active', async () => {
    const functionality = {
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
    };
    const createdFunctionality = await createFunctionality.execute(functionality);
    const patchInput = { active: null };
    await expect(() => patchFunctionality.execute(createdFunctionality.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });
});
