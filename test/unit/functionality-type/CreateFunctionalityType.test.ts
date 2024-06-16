import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import Registry from '@src/infra/dependency-injection/Registry';

describe('Create FunctionalityType', () => {
  const functionalityTypeRepository = {
    save: () => Promise.resolve(),
    update: () => Promise.resolve(),
    getById: () => Promise.resolve(undefined),
    deleteById: () => Promise.resolve(),
  };
  Registry.getInstance().register('FunctionalityTypeRepository', functionalityTypeRepository);

  const createFunctionalityType = new CreateFunctionalityType();

  it('should throw error when name is empty', async () => {
    await expect(
      createFunctionalityType.execute({
        name: '',
        description: 'My functionalityType description',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
