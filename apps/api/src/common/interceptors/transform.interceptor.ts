import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '@/common/dto/response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data instanceof ResponseDto) {
          return data;
        }
        return ResponseDto.success(data);
      }),
    );
  }
}
