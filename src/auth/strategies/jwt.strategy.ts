import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientContext } from '../interfaces/context.interface';
import { JwtPayload } from '../interfaces/jwt.interface';
import { ClientType } from '../constants/client-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<ClientContext> {
    if (payload.clientType === ClientType.USER) {
      return { clientType: ClientType.USER, clientId: payload.sub };
    } else if (payload.clientType === ClientType.DEVICE) {
      return { clientType: ClientType.DEVICE, clientId: payload.sub };
    } else {
      throw new UnauthorizedException('Invalid client type');
    }
  }
}
