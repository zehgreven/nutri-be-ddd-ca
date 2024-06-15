import { RabbitMQMessagingAdapter } from '@src/infra/messaging/Messaging';
import crypto from 'crypto';
import { MessagingTestContainer } from './MessagingTestContainer';

it('should produce an event', async () => {
  const container = MessagingTestContainer.getInstance();
  await container.start();

  const messaging = new RabbitMQMessagingAdapter();
  await messaging.connect(container.getConnectionUri());
  await messaging.setup();

  const exchange = 'iam.account.created';
  const event = {
    id: crypto.randomUUID(),
    username: `john.doe+${Math.random()}@test.com`,
    password: 'MzQzNDM4MzgzMDYyMzQzMDJkNjEzMzMzNjYyZDM0NjY2MTM5MmQ',
  };
  await messaging.publish(exchange, event);

  const queue = 'mailer.account.created';

  const result = await new Promise<boolean>(resolve => {
    messaging.subscribe(queue, message => {
      if (message) {
        resolve(message.id === event.id);
      }
    });
  });
  expect(result).toBeTruthy();
  await messaging.close();
  await container.stop();
});
