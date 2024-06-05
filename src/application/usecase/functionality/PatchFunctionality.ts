import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import logger from '@src/infra/logging/logger';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';

export class PatchFunctionality {
  constructor(readonly functionalityRepository: FunctionalityRepository) {}
  async execute(id: string, input: Input): Promise<void> {
    logger.info(`PatchFunctionality: patching functionality with id=${id} with input=${JSON.stringify(input)}`);
    const functionality = await this.functionalityRepository.getById(id);
    if (!functionality) {
      throw new FunctionalityNotFoundError(`Unable to find functionality with id=${id}`);
    }
    const patchInput = {
      functionalityTypeId: input.functionalityTypeId,
      name: input.name,
      description: input.description,
      path: input.path,
      active: input.active,
    };
    functionality.patch(patchInput);
    await this.functionalityRepository.update(functionality);
  }
}

type Input = {
  functionalityTypeId?: string | null;
  name?: string | null;
  description?: string | null;
  path?: string | null;
  active?: boolean | null;
};
