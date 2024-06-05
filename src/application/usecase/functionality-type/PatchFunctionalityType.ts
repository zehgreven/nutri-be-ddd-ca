import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import logger from '@src/infra/logging/logger';
import { FunctionalityTypeRepository } from '@src/infra/repository/FunctionalityTypeRepository';

export class PatchFunctionalityType {
  constructor(readonly functionalityTypeRepository: FunctionalityTypeRepository) {}
  async execute(id: string, input: Input): Promise<void> {
    logger.info(
      `PatchFunctionalityType: patching functionality type with id=${id} with input=${JSON.stringify(input)}`,
    );
    const functionalityType = await this.functionalityTypeRepository.getById(id);
    if (!functionalityType) {
      throw new FunctionalityTypeNotFoundError(`Unable to find functionality type with id=${id}`);
    }
    const patchInput = {
      name: input.name,
      description: input.description,
      active: input.active,
    };
    functionalityType.patch(patchInput);
    await this.functionalityTypeRepository.update(functionalityType);
  }
}

type Input = {
  name?: string | null;
  description?: string | null;
  active?: boolean | null;
};
