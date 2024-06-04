import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { FunctionalityTypeRepositoryMemoryDatabase } from '@src/infra/repository/FunctionalityTypeRepository';

describe('PatchFunctionalityType', () => {
  const functionalityTypeRepository = new FunctionalityTypeRepositoryMemoryDatabase();
  const createFunctionalityType = new CreateFunctionalityType(functionalityTypeRepository);
  const patchFunctionalityType = new PatchFunctionalityType(functionalityTypeRepository);

  beforeEach(async () => {
    await functionalityTypeRepository.clear();
  });

  it('should be able to patch functionality type', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    const patchInput = {
      name: 'My new functionality type',
      description: '',
      active: false,
    };
    await patchFunctionalityType.execute(createdFunctionalityType.id, patchInput);
    const updatedFunctionalityType = await functionalityTypeRepository.getById(createdFunctionalityType.id);
    expect(updatedFunctionalityType?.getName()).toBe(patchInput.name);
    expect(updatedFunctionalityType?.getDescription()).toBe(patchInput.description);
    expect(updatedFunctionalityType?.isActive()).toBe(patchInput.active);
  });

  it('should be able to patch functionalityType with null description', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    const patchInput = {
      description: null,
    };
    await patchFunctionalityType.execute(createdFunctionalityType.id, patchInput);
    const updatedFunctionalityType = await functionalityTypeRepository.getById(createdFunctionalityType.id);
    expect(updatedFunctionalityType?.getDescription()).toBeUndefined();
  });

  it('should not be able to patch functionalityType with invalid id', async () => {
    const patchInput = {
      name: 'My new functionality type',
      description: 'My new functionalityType description',
    };
    const invalidId = '1826d74d-26c9-417d-ae91-0ecd8eb7a6ff';
    await expect(() => patchFunctionalityType.execute(invalidId, patchInput)).rejects.toThrow(
      FunctionalityTypeNotFoundError,
    );
  });

  it('should not be able to patch functionalityType with invalid input', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    await expect(() => patchFunctionalityType.execute(createdFunctionalityType.id, {})).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('should not be able to patch functionalityType with invalid name', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    const patchInput = {
      name: '',
      description: 'My new functionalityType description',
    };
    await expect(() => patchFunctionalityType.execute(createdFunctionalityType.id, patchInput)).rejects.toThrow(
      TextLengthError,
    );
  });

  it('should not be able to patch functionalityType with null name', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    const patchInput = { name: null };
    await expect(() => patchFunctionalityType.execute(createdFunctionalityType.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('should not be able to patch functionalityType with null active', async () => {
    const functionalityType = {
      name: 'My functionality type',
      description: 'My functionalityType description',
    };
    const createdFunctionalityType = await createFunctionalityType.execute(functionalityType);
    const patchInput = { active: null };
    await expect(() => patchFunctionalityType.execute(createdFunctionalityType.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });
});
