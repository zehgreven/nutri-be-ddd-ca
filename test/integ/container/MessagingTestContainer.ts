import logger from '@src/infra/logging/logger';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

const RABBITMQ_DEFAULT_USER = 'admin';
const RABBITMQ_DEFAULT_PASS = '123456';

export class MessagingTestContainer {
  private static instance: MessagingTestContainer;
  private container?: StartedTestContainer;

  private constructor() {}

  public static getInstance(): MessagingTestContainer {
    if (!MessagingTestContainer.instance) {
      MessagingTestContainer.instance = new MessagingTestContainer();
    }

    return MessagingTestContainer.instance;
  }

  public async start(): Promise<void> {
    if (!this.container) {
      logger.info('Starting RabbitMQ');
      this.container = await new GenericContainer('rabbitmq:3-management')
        .withEnvironment({
          RABBITMQ_DEFAULT_USER: RABBITMQ_DEFAULT_USER,
          RABBITMQ_DEFAULT_PASS: RABBITMQ_DEFAULT_PASS,
        })
        .withWaitStrategy(Wait.forAll([Wait.forListeningPorts()]))
        .withHealthCheck({ test: ['CMD', 'rabbitmqctl', 'status'] })
        .withExposedPorts(5672, 15672)
        .start();
      logger.info('RabbitMQ started');
    }
  }

  public async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop();
    }
  }

  public getConnectionUri(): string {
    if (this.container) {
      return `${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${this.container.getHost()}:${this.container.getMappedPort(5672)}`;
    }
    return '';
  }
}
