import logger from '@src/infra/logging/logger';
import { FunctionalityTypeRepository } from '@src/infra/repository/FunctionalityTypeRepository';

export class DeleteFunctionalityType {
  constructor(readonly functionalityTypeRepository: FunctionalityTypeRepository) {}

  async execute(id: string): Promise<void> {
    logger.info(`DeleteFunctionalityType: deleting functionality type with id=${id}`);
    await this.functionalityTypeRepository.deleteById(id);
  }
}
