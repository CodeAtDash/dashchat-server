import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { get, isArray } from 'lodash';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapter: AbstractHttpAdapter<any, any, any>,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    Logger.error(exception);
    console.trace(exception);

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = get(
      exception,
      ['errors', 0, 'message'],
      get(
        exception,
        ['response', 'message'],
        get(exception, 'message', 'Internal server error'),
      ),
    );

    message = isArray(message) ? message[0] : message;

    const code = get(
      exception,
      ['response', 'name'],
      get(exception, 'name', 'INTERNAL_SERVER_ERROR'),
    );

    const responseBody = {
      message: message,
      code,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: this.httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    this.httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
