import logger from '@src/infra/logging/logger';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';

export class DeleteFunctionality {
  constructor(readonly functionalityRepository: FunctionalityRepository) {}

  async execute(id: string): Promise<void> {
    logger.info(`DeleteFunctionality: deleting functionality with id=${id}`);
    await this.functionalityRepository.deleteById(id);
  }
}
