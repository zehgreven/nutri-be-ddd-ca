import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { FunctionalityRepositoryMemoryDatabase } from '@src/infra/repository/FunctionalityRepository';

describe('Create Functionality', () => {
  const functionalityRepository = new FunctionalityRepositoryMemoryDatabase();
  const createFunctionality = new CreateFunctionality(functionalityRepository);

  it('should create a new functionality', async () => {
    const output = await createFunctionality.execute({
      functionalityTypeId: 'cb80feb7-72ca-4c35-9856-a0a4c0e3f53e',
      name: 'My functionality',
      description: 'My functionality description',
      path: 'My functionality path',
    });
    expect(output.id).toBeDefined();

    const functionality = await functionalityRepository.getById(output.id);
    expect(functionality).toBeDefined();
    expect(functionality?.getName()).toBe('My functionality');
    expect(functionality?.getDescription()).toBe('My functionality description');
    expect(functionality?.getPath()).toBe('My functionality path');
    expect(functionality?.isActive()).toBe(true);
  });

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
