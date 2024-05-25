import { DatabaseTestContainer } from '@test/helpers/DatabaseTestContainer';

afterAll(async () => {
  await DatabaseTestContainer.getInstance().stop();
});
