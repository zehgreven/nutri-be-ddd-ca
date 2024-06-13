import { MessagingConfig } from '@src/infra/messaging/MessagingStarter';
import amqplib, { Connection } from 'amqplib';
import config from 'config';

export interface Messaging {
  connect(): Promise<void>;
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

  async publish(topic: string, message: any): Promise<void> {
    if (!this.connection) {
      throw new Error('Missing connection');
    }
    const channel = await this.connection.createChannel();
    await channel.publish(topic, topic, Buffer.from(JSON.stringify(message)));
    await channel.close();
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    if (!this.connection) {
      throw new Error('Missing connection');
    }
    const channel = await this.connection.createConfirmChannel();
    await channel.consume(topic, message => {
      if (message) {
        callback(JSON.parse(message.content.toString()));
        channel.ack(message);
      }
    });
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}
