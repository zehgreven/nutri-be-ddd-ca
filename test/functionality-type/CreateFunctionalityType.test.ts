import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { TextLengthError } from '@src/domain/error/TextLengthError';

describe('Create FunctionalityType', () => {
  const functionalityTypeRepository = {
    save: () => Promise.resolve(),
    update: () => Promise.resolve(),
    getById: () => Promise.resolve(undefined),
    deleteById: () => Promise.resolve(),
  };

  const createFunctionalityType = new CreateFunctionalityType(functionalityTypeRepository);

  it('should throw error when name is empty', async () => {
    await expect(
      createFunctionalityType.execute({
        name: '',
        description: 'My functionalityType description',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
