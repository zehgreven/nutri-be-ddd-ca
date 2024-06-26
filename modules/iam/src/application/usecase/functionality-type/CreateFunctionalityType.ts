import FunctionalityType from '@src/domain/entity/FunctionalityType';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { FunctionalityTypeRepository } from '@src/infra/repository/FunctionalityTypeRepository';

export class CreateFunctionalityType {
  @inject('FunctionalityTypeRepository')
  private functionalityTypeRepository!: FunctionalityTypeRepository;

  async execute(input: Input): Promise<Output> {
    logger.info(`CreateFunctionalityType: creating functionality type with input=${JSON.stringify(input)}`);
    const functionalityType = FunctionalityType.create(input.name, input.description);
    await this.functionalityTypeRepository.save(functionalityType);
    return {
      id: functionalityType.id,
    };
  }
}

type Input = {
  name: string;
  description: string;
};

type Output = {
  id: string;
};
