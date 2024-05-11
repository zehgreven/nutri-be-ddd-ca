import { AccountNotFoundError } from '../src/domain/error/AccountNotFoundError';
import { SignIn } from '../src/application/usecase/SignIn';
import { IncorrectCredentialsError } from '../src/domain/error/IncorrectCredentialsError';
import { SignUp } from '../src/application/usecase/SignUp';
import { AccountRepositoryMemoryDatabase } from '../src/infra/repository/AccountRepository';

const accountRepository = new AccountRepositoryMemoryDatabase();
const signUp = new SignUp(accountRepository);
const signIn = new SignIn(accountRepository);
const signUpInput = {
  username: 'johndoe@test.com',
  password: 'secret',
};

describe('SignIn', () => {
  beforeEach(() => {
    accountRepository.clear();
  });

  it('should be able to sign in', async () => {
    await signUp.execute(signUpInput);
    const output = await signIn.execute(signUpInput);
    expect(output.token).toBeDefined();
  });

  it("should throw an error when account doesn't exists", async () => {
    await expect(signIn.execute(signUpInput)).rejects.toThrow(AccountNotFoundError);
  });

  it('should throw an error when password is incorrect', async () => {
    await signUp.execute(signUpInput);
    const signInInput = {
      username: 'johndoe@test.com',
      password: 'wrong_password',
    };
    await expect(signIn.execute(signInInput)).rejects.toThrow(IncorrectCredentialsError);
  });
});
