import { SignIn } from '@src/application/usecase/auth/SignIn';
import Account from '@src/domain/entity/Account';
import { IncorrectCredentialsError } from '@src/domain/error/IncorrectCredentialsError';
import sinon from 'sinon';

const accountRepository = {
  save: sinon.stub(),
  updatePassword: sinon.stub(),
  getById: sinon.stub(),
  getByUsername: sinon.stub(),
  existsById: sinon.stub(),
  deleteById: sinon.stub(),
};

const signIn = new SignIn(accountRepository);
const signUpInput = {
  username: 'johndoe@test.com',
  password: 'secret',
};

const account = Account.create(signUpInput.username, signUpInput.password);

describe('SignIn', () => {
  beforeEach(() => {
    accountRepository.getByUsername.resetBehavior();
  });

  it('should be able to sign in', async () => {
    accountRepository.getByUsername.resolves(account);
    const output = await signIn.execute(signUpInput);
    expect(output.token).toBeDefined();
    expect(output.refreshToken).toBeDefined();
  });

  it("should throw an error when account doesn't exists", async () => {
    await expect(signIn.execute(signUpInput)).rejects.toThrow(IncorrectCredentialsError);
  });

  it('should throw an error when password is incorrect', async () => {
    accountRepository.getByUsername.resolves(account);
    const signInInput = {
      username: 'johndoe@test.com',
      password: 'wrong_password',
    };
    await expect(signIn.execute(signInInput)).rejects.toThrow(IncorrectCredentialsError);
  });
});
