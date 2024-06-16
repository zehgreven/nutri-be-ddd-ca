import Functionality from '@src/domain/entity/Functionality';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';

export class CreateFunctionality {
  @inject('FunctionalityRepository')
  private functionalityRepository!: FunctionalityRepository;
  async execute(input: Input): Promise<Output> {
    logger.info(`CreateFunctionality: creating functionality with input=${JSON.stringify(input)}`);
    const functionality = Functionality.create(input.functionalityTypeId, input.name, input.description, input.path);
    await this.functionalityRepository.save(functionality);
    return {
      id: functionality.id,
    };
  }
}

type Input = {
  functionalityTypeId: string;
  name: string;
  description?: string;
  path?: string;
};

type Output = {
  id: string;
};
