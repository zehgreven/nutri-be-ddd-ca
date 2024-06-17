import { TextLengthError } from '@src/domain/error/TextLengthError';
import String from '@src/domain/vo/String';

describe('StringVO', () => {
  it('should be able to create a string', () => {
    const string = new String('test', 'test');
    expect(string.getValue()).toBe('test');
  });

  it('should not be able to create a string with less than 4 characters', () => {
    expect(() => {
      new String('test', 'te');
    }).toThrow(new TextLengthError('test must be between 4 and 255 characters long'));
  });

  it('should not be able to create a string with more than 255 characters', () => {
    expect(() => {
      new String('test', 'a'.repeat(256));
    }).toThrow(new TextLengthError('test must be between 4 and 255 characters long'));
  });
});
