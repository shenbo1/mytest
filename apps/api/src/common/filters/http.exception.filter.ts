import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType();
    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      let status: number;
      let message: string;
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exception.message;

        if (Array.isArray(message)) {
          message = message[0];
        }
      } else if (exception instanceof Error) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message || 'Error';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error';
      }

      response.status(status).json({
        code: status,
        message,
        path: request.url,
      });
    }
  }
}
