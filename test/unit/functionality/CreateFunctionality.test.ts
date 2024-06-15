import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { TextLengthError } from '@src/domain/error/TextLengthError';

describe('Create Functionality', () => {
  const functionalityRepository = {
    save: () => Promise.resolve(),
    update: () => Promise.resolve(),
    getById: () => Promise.resolve(undefined),
    deleteById: () => Promise.resolve(),
    existsById: () => Promise.resolve(true),
  };
  const createFunctionality = new CreateFunctionality(functionalityRepository);

  it('should throw error when name is empty', async () => {
    await expect(
      createFunctionality.execute({
        functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
        name: '',
        description: 'My functionality description',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
