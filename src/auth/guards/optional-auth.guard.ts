import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // If no JWT is provided, return null user instead of throwing an error
    if (err || !user) {
      return null;
    }
    return user;
  }
}