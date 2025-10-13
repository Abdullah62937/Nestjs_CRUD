import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class DatabaseAuthGuard implements CanActivate {
  constructor(private configService:ConfigService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer ')){
      throw new UnauthorizedException('No Token Provided');
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if(!jwtSecret){
      throw new UnauthorizedException('JWT is not found');
    }
    try{
      const decode = jwt.verify(token,jwtSecret);
      request['user'] = decode;
      return true;
    } 
    catch(error){
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
