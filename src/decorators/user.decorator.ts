import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestUser } from 'src/interfaces/user.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
