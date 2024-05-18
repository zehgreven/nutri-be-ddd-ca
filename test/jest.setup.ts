import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';

jest.setTimeout(60000);

afterAll(async () => {
  await DatabaseTestContainer.getInstance().stop();
});
