import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IRequestUser } from 'src/interfaces/user.interface';

const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (isPublic) {
      if (authHeader) return this.decodeAuthToken(request);
      return true;
    }

    if (!authHeader) throw new UnauthorizedException();

    return this.decodeAuthToken(request);
  }

  decodeAuthToken(request: any): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = jwt.verify(token, secret) as IRequestUser;
      request.user = { id: decoded.id };

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
