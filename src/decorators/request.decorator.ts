import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from 'src/interfaces/request.interface';

export const Request = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRequest => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request.ip,
      userAgent: request.headers['user-agent'] ?? null,
      user: request.user ?? null,
      hostname: request.hostname,
      params: request.params,
    }
  },
);
