import { RefreshToken } from '@src/application/usecase/RefreshToken';
import { InvalidTokenError } from '@src/domain/error/InvalidTokenError';
import config from 'config';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

const refreshTokenUseCase = new RefreshToken();

describe('SignIn', () => {
  it('should be able to refresh token', async () => {
    const tokenKey = config.get<string>('auth.key');
    const token = jwt.sign({ id: 'valid_id' }, tokenKey, { expiresIn: '5m' });
    const output = await refreshTokenUseCase.execute({ token });
    expect(output.token).toBeDefined();
    expect(output.refreshToken).toBeDefined();
  });

  it('should throw an error when missing body', async () => {
    await expect(refreshTokenUseCase.execute(undefined)).rejects.toThrow(InvalidTokenError);
  });

  it('should throw an error when missing token', async () => {
    await expect(refreshTokenUseCase.execute({ token: '' })).rejects.toThrow(InvalidTokenError);
  });

  it('should throw an error when token is malformed', async () => {
    const tokenKey = config.get<string>('auth.key');
    const token = jwt.sign({}, tokenKey, { expiresIn: '5m' });
    await expect(refreshTokenUseCase.execute({ token })).rejects.toThrow(InvalidTokenError);
  });

  it('should throw an error when token is invalid', async () => {
    await expect(refreshTokenUseCase.execute({ token: 'invalid_refresh_token' })).rejects.toThrow(JsonWebTokenError);
  });

  it('should throw an error when token has wrong key', async () => {
    const token = jwt.sign({ id: 'id' }, 'invalid_key', { expiresIn: '5m' });
    await expect(refreshTokenUseCase.execute({ token })).rejects.toThrow(JsonWebTokenError);
  });
});
