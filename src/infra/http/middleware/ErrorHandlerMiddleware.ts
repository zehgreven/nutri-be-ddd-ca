import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { ForbiddenError } from '@src/domain/error/ForbiddenError';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import { IncorrectCredentialsError } from '@src/domain/error/IncorrectCredentialsError';
import { InvalidEmailError } from '@src/domain/error/InvalidEmailError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const ErrorHandlerMiddleware: ErrorRequestHandler = (err: any, _: any, res: any, __: any) => {
  if (err) {
    const statusCode = mapErrorToStatusCode(err);
    res.status(statusCode).json({
      message: err.message,
    });
  }
};

const mapErrorToStatusCode = (error: Error): number => {
  const statusCodeMap = {
    [AccountNotFoundError.name]: StatusCodes.NOT_FOUND,
    [FunctionalityNotFoundError.name]: StatusCodes.NOT_FOUND,
    [FunctionalityTypeNotFoundError.name]: StatusCodes.NOT_FOUND,
    [IncorrectCredentialsError.name]: StatusCodes.UNAUTHORIZED,
    [InvalidEmailError.name]: StatusCodes.BAD_REQUEST,
    [InvalidInputError.name]: StatusCodes.BAD_REQUEST,
    [PasswordCreationError.name]: StatusCodes.BAD_REQUEST,
    [PermissionNotFoundError.name]: StatusCodes.NOT_FOUND,
    [ProfileNotFoundError.name]: StatusCodes.NOT_FOUND,
    [TextLengthError.name]: StatusCodes.BAD_REQUEST,
    [UnauthorizedError.name]: StatusCodes.UNAUTHORIZED,
    [ForbiddenError.name]: StatusCodes.FORBIDDEN,
  };

  return statusCodeMap[error.name] || StatusCodes.INTERNAL_SERVER_ERROR;
};
