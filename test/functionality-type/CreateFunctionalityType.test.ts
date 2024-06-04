import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { FunctionalityTypeRepositoryMemoryDatabase } from '@src/infra/repository/FunctionalityTypeRepository';

describe('Create FunctionalityType', () => {
  const functionalityTypeRepository = new FunctionalityTypeRepositoryMemoryDatabase();
  const createFunctionalityType = new CreateFunctionalityType(functionalityTypeRepository);

  it('should create a new functionality type', async () => {
    const output = await createFunctionalityType.execute({
      name: 'My functionality type',
      description: 'My functionalityType description',
    });
    expect(output.id).toBeDefined();

    const functionalityType = await functionalityTypeRepository.getById(output.id);
    expect(functionalityType).toBeDefined();
    expect(functionalityType?.getName()).toBe('My functionality type');
    expect(functionalityType?.getDescription()).toBe('My functionalityType description');
    expect(functionalityType?.isActive()).toBe(true);
  });

  it('should throw error when name is empty', async () => {
    await expect(
      createFunctionalityType.execute({
        name: '',
        description: 'My functionalityType description',
      }),
    ).rejects.toThrow(TextLengthError);
  });
});
