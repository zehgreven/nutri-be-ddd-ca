import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import FunctionalityType from '@src/domain/entity/FunctionalityType';
import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import sinon from 'sinon';

describe('PatchFunctionalityType', () => {
  const functionalityTypeRepository = {
    save: sinon.stub(),
    update: sinon.stub(),
    getById: sinon.stub(),
    deleteById: sinon.stub(),
  };

  const patchFunctionalityType = new PatchFunctionalityType(functionalityTypeRepository);

  const functionalityType = FunctionalityType.create('My functionality type', 'My functionality type description');

  beforeEach(async () => {
    functionalityTypeRepository.save.resetBehavior();
    functionalityTypeRepository.update.resetBehavior();
    functionalityTypeRepository.getById.resetBehavior();
    functionalityTypeRepository.deleteById.resetBehavior();
  });

  it('should be able to patch functionalityType with null description', async () => {
    functionalityTypeRepository.getById.resolves(functionalityType);
    const patchInput = {
      description: null,
    };
    await patchFunctionalityType.execute(functionalityType.id, patchInput);
    const updatedFunctionalityType = await functionalityTypeRepository.getById(functionalityType.id);
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
    functionalityTypeRepository.getById.resolves(functionalityType);
    await expect(() => patchFunctionalityType.execute(functionalityType.id, {})).rejects.toThrow(InvalidInputError);
  });

  it('should not be able to patch functionalityType with invalid name', async () => {
    functionalityTypeRepository.getById.resolves(functionalityType);
    const patchInput = {
      name: '',
      description: 'My new functionalityType description',
    };
    await expect(() => patchFunctionalityType.execute(functionalityType.id, patchInput)).rejects.toThrow(
      TextLengthError,
    );
  });

  it('should not be able to patch functionalityType with null name', async () => {
    functionalityTypeRepository.getById.resolves(functionalityType);
    const patchInput = { name: null };
    await expect(() => patchFunctionalityType.execute(functionalityType.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('should not be able to patch functionalityType with null active', async () => {
    functionalityTypeRepository.getById.resolves(functionalityType);
    const patchInput = { active: null };
    await expect(() => patchFunctionalityType.execute(functionalityType.id, patchInput)).rejects.toThrow(
      InvalidInputError,
    );
  });
});
