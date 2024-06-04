import { DatabaseTestContainer } from '@test/DatabaseTestContainer';

afterAll(async () => {
  await DatabaseTestContainer.getInstance().stop();
});
