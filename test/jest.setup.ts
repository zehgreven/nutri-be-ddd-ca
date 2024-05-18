import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';

afterAll(async () => {
  await DatabaseTestContainer.getInstance().stop();
});
