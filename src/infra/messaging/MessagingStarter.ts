import amqplib, { Connection } from 'amqplib';
import config from 'config';

export interface MessagingStarter {
  connect(): Promise<void>;
  close(): Promise<void>;
}

export class RabbitMQStarter implements MessagingStarter {
  connection?: Connection;
  config?: MessagingConfig;

  constructor() {
    this.config = config.get<MessagingConfig>('messaging');
  }
  async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('Missing config');
    }
    const connectionString = `amqp://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}`;
    this.connection = await amqplib.connect(connectionString);
    if (!this.connection) {
      throw new Error('Failed to connect to RabbitMQ');
    }
  }

  async setup(): Promise<void> {
    if (!this.config) {
      throw new Error('Missing config');
    }

    if (!this.connection) {
      throw new Error('Missing connection');
    }

    const channel = await this.connection.createConfirmChannel();

    for (const [exchangeName, exchangeConfig] of Object.entries(this.config.exchanges)) {
      await channel.assertExchange(exchangeName, exchangeConfig.type, {
        durable: exchangeConfig.durable,
      });
    }

    for (const [queueName, queueConfig] of Object.entries(this.config.queues)) {
      await channel.assertQueue(queueName, { durable: queueConfig.durable });
      await channel.bindQueue(queueName, queueConfig.exchange, queueName);
    }

    await channel.close();
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export type MessagingConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
  exchanges: {
    [exchangeName: string]: ExchangeConfig;
  };
  queues: {
    [queueName: string]: QueueConfig;
  };
};

export type ExchangeConfig = {
  type: 'fanout';
  durable: boolean;
};

export type QueueConfig = {
  exchange: string;
  durable: boolean;
};
