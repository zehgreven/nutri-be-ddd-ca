import amqplib, { Connection } from 'amqplib';
import config from 'config';

export interface Messaging {
  connect(connectionString: string): Promise<void>;
  setup(): Promise<void>;
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, callback: (message: any) => void): Promise<void>;
  close(): Promise<void>;
}

export class RabbitMQMessagingAdapter implements Messaging {
  private connection?: Connection;
  private config?: MessagingConfig;

  constructor() {
    this.config = config.get<MessagingConfig>('messaging');
  }

  async connect(connectionString: string): Promise<void> {
    if (!this.config) {
      throw new Error('Missing config');
    }
    this.connection = await amqplib.connect(`amqp://${connectionString}`);
    if (!this.connection) {
      throw new Error('Failed to connect to RabbitMQ');
    }
  }

  async publish(exchange: string, message: any): Promise<void> {
    if (!this.connection) {
      throw new Error('Missing connection');
    }
    const channel = await this.connection.createChannel();
    await channel.publish(exchange, exchange, Buffer.from(JSON.stringify(message)));
    await channel.close();
  }

  async subscribe(queue: string, callback: (message: any) => void): Promise<void> {
    if (!this.connection) {
      throw new Error('Missing connection');
    }
    const channel = await this.connection.createConfirmChannel();
    await channel.consume(queue, message => {
      if (message) {
        callback(JSON.parse(message.content.toString()));
        channel.ack(message);
      }
    });
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
