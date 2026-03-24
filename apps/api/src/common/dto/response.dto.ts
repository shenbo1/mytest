export class ResponseDto<T = any> {
  code: number;

  message: string;

  data?: T;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data?: T, message = 'success'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }

  static error(message: string, code = 500): ResponseDto {
    return new ResponseDto(code, message);
  }
}
