import { GetAccountById } from '../src/application/usecase/GetAccountById';
import { AccountNotFoundError } from '../src/domain/error/AccountNotFoundError';
import Account from '../src/domain/entity/Account';
import { AccountRepositoryMemoryDatabase } from '../src/infra/repository/AccountRepository';

const accountRepository = new AccountRepositoryMemoryDatabase();
const getAccountById = new GetAccountById(accountRepository);

describe('GetAccountById', () => {
  test('should be able to find an existing account', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);

    const user = await getAccountById.execute(account.id);
    expect(user.username).toBe(account.getUsername());
    expect(user.password).toBe(account.getPassword());
  });

  test("should throw an error when account doesn't exists", async () => {
    await expect(getAccountById.execute('invalid_id')).rejects.toThrow(AccountNotFoundError);
  });
});
