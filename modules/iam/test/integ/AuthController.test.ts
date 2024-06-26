import { SignUp } from '@src/application/usecase/account/SignUp';
import { StatusCodes } from 'http-status-codes';

describe('Auth Controller', () => {
  const account = { username: 'johndoe@test.com', password: 'secret' };

  beforeAll(async () => {
    const signUp = new SignUp();
    await signUp.execute(account);
  });

  it('should be able to sign in', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    expect(status).toBe(StatusCodes.CREATED);
    expect(body.token).toBeDefined();
  });

  it('should return unauthorized when credentials are wrong', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send({
        username: 'johndoe@test.com',
        password: 'wrong-password',
      });

    expect(status).toBe(StatusCodes.UNAUTHORIZED);
    expect(body.message).toBe('Your credentials are incorrect');
  });

  it('should return unauthorized when username does not exist', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send({
        username: 'wrog-account@test.com',
        password: 'secret',
      });

    expect(status).toBe(StatusCodes.UNAUTHORIZED);
    expect(body.message).toBe('Your credentials are incorrect');
  });

  it('should be able to refresh the token', async () => {
    const { body: loginBody } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    const { status, body } = await global.testRequest
      .post('/auth/v1/refresh')
      .set({ 'Content-Type': 'application/json' })
      .send({ token: loginBody.refreshToken });

    expect(status).toBe(StatusCodes.CREATED);
    expect(body.token).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
